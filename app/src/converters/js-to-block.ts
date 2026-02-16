import type { BlockDefinition, BlockCategory, BlockInput } from '../types/block'

interface ConvertOptions {
  category?: BlockCategory
  author?: string
  color?: string
  description?: string
  shape?: 'value' | 'statement'
}

/**
 * Convert raw JavaScript source code into a CryptoBlocks BlockDefinition.
 *
 * Parses the function signature, infers input types from defaults,
 * generates a Python equivalent stub, and builds the full definition.
 */
export function jsToBlock(jsCode: string, options: ConvertOptions = {}): BlockDefinition {
  const cleaned = jsCode.trim()

  // Extract function name and params
  const fnMatch = cleaned.match(/(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/)
  if (!fnMatch) {
    throw new Error('Could not find a function declaration. Expected: function name(params) { ... }')
  }

  const fnName = fnMatch[1]
  const paramStr = fnMatch[2].trim()
  const params = paramStr ? paramStr.split(',').map((p) => p.trim()) : []

  // Extract function body (everything between first { and last })
  const bodyStart = cleaned.indexOf('{')
  const bodyEnd = cleaned.lastIndexOf('}')
  if (bodyStart === -1 || bodyEnd === -1) {
    throw new Error('Could not find function body')
  }
  const body = cleaned.slice(bodyStart + 1, bodyEnd).replace(/^\n/, '')

  // Infer input types from defaults and usage patterns
  const inputs: BlockInput[] = params.map((param) => {
    // Check for default values in the body (param = param || default)
    const ep = param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const defaultMatch = body.match(
      new RegExp(`${ep}\\s*=\\s*${ep}\\s*\\|\\|\\s*([^;\\n]+)`)
    )
    const type = inferParamType(param, body, defaultMatch?.[1])
    const defaultVal = parseDefault(defaultMatch?.[1], type)

    const input: BlockInput = {
      name: param,
      type,
      description: humanize(param),
    }
    if (defaultVal !== undefined) input.default = defaultVal

    return input
  })

  // Detect if function returns something
  const hasReturn = /\breturn\b/.test(body)
  const isAsync = cleaned.trimStart().startsWith('async ')

  // Extract just the function (strip trailing example code like console.log)
  const fnOnly = extractFunction(cleaned)

  // Generate Python equivalent
  const pythonCode = jsToPython(fnName, params, body)

  // Determine block name (snake_case)
  const blockName = fnName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')

  // Infer shape
  const shape = options.shape ?? (hasReturn ? 'value' : 'statement')

  return {
    name: blockName,
    author: options.author ?? 'CryptoBlocks',
    version: '1.0.0',
    description: options.description ?? `${humanize(blockName)} block`,
    category: options.category ?? 'Math',
    inputs,
    outputs: hasReturn ? [{ name: 'result', type: 'any' }] : [],
    implementations: {
      javascript: fnOnly,
      python: pythonCode,
    },
    tests: [],
    color: options.color ?? '#5B80A5',
    ...(shape === 'statement' ? { shape: 'statement' } : {}),
  }
}

/** Extract just the function declaration from source that may include example usage */
function extractFunction(source: string): string {
  const lines = source.split('\n')
  let depth = 0
  let started = false
  const fnLines: string[] = []

  for (const line of lines) {
    if (!started && /(?:async\s+)?function\s+\w+/.test(line)) {
      started = true
    }

    if (started) {
      fnLines.push(line)
      depth += (line.match(/\{/g) || []).length
      depth -= (line.match(/\}/g) || []).length
      if (depth <= 0 && started) break
    }
  }

  return fnLines.join('\n')
}

/** Escape a string for safe use in a RegExp constructor */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Infer parameter type from usage patterns in the function body */
function inferParamType(
  param: string,
  body: string,
  defaultStr?: string
): 'string' | 'number' | 'boolean' | 'any' {
  // Check default value type
  if (defaultStr) {
    const trimmed = defaultStr.trim()
    if (trimmed === 'true' || trimmed === 'false') return 'boolean'
    if (/^['"`]/.test(trimmed)) return 'string'
    if (!isNaN(Number(trimmed))) return 'number'
  }

  const p = escapeRegex(param)

  // Check comparison patterns
  if (new RegExp(`${p}\\s*[<>]=?\\s*\\d`).test(body)) return 'number'
  if (new RegExp(`${p}\\s*===?\\s*\\d`).test(body)) return 'number'

  // Check math operations
  if (new RegExp(`${p}\\s*[+\\-*/]\\s*\\d`).test(body)) return 'number'
  if (new RegExp(`\\d\\s*[+\\-*/]\\s*${p}`).test(body)) return 'number'

  // Check string methods
  if (new RegExp(`${p}\\.(length|split|trim|slice|charAt|includes|replace)`).test(body)) return 'string'

  // Check array index usage (likely number)
  if (new RegExp(`\\[${p}`).test(body)) return 'number'

  return 'any'
}

/** Parse a default value string into a typed value */
function parseDefault(
  str: string | undefined,
  type: string
): string | number | boolean | undefined {
  if (!str) return undefined
  const trimmed = str.trim()

  if (type === 'number') {
    const num = Number(trimmed)
    return isNaN(num) ? undefined : num
  }
  if (type === 'boolean') {
    return trimmed === 'true'
  }
  if (type === 'string') {
    return trimmed.replace(/^['"`]|['"`]$/g, '')
  }
  return undefined
}

interface PyLine {
  indent: number
  text: string
}

/** Convert JS function body to Python (best-effort) */
function jsToPython(fnName: string, params: string[], jsBody: string): string {
  const pyName = fnName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
  const pyParams = params.map((p) =>
    p.replace(/([A-Z])/g, '_$1').toLowerCase()
  )

  // Normalize: strip common leading whitespace so all lines have consistent indent
  const rawLines = jsBody.split('\n').filter((l) => l.trim().length > 0)
  const minLeading = rawLines.length > 0
    ? Math.min(...rawLines.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0))
    : 0
  const srcLines = rawLines.map((l) => l.slice(minLeading))

  // Process line-by-line for better control
  const outLines: PyLine[] = []

  for (const line of srcLines) {
    let trimmed = line.trim()
    if (!trimmed) continue

    const indent = getIndent(line)

    // const/let/var declarations
    trimmed = trimmed.replace(/\b(const|let|var)\s+/g, '')
    // === and !==
    trimmed = trimmed.replace(/===/g, '==').replace(/!==/g, '!=')
    // true/false/null
    trimmed = trimmed.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')
    // console.log → print
    trimmed = trimmed.replace(/console\.log\(/g, 'print(')
    // .push( → .append(
    trimmed = trimmed.replace(/\.push\(/g, '.append(')
    // .length → len()
    trimmed = trimmed.replace(/(\w+)\.length/g, 'len($1)')
    // Math builtins
    trimmed = trimmed.replace(/Math\.floor\(([^)]+)\)/g, 'int($1)')
    trimmed = trimmed.replace(/Math\.round\(([^)]+)\)/g, 'round($1)')
    trimmed = trimmed.replace(/Math\.random\(\)/g, 'random.random()')
    trimmed = trimmed.replace(/Math\.pow\(([^,]+),\s*([^)]+)\)/g, '$1 ** $2')
    // Remove semicolons at end
    trimmed = trimmed.replace(/;$/, '')

    // for (let i = start; i < end; i++) { → for i in range(start, end):
    const forMatch = trimmed.match(
      /^for\s*\(\s*(\w+)\s*=\s*(\w+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\+\+\s*\)\s*\{?$/
    )
    if (forMatch) {
      outLines.push({ indent, text: `for ${forMatch[1]} in range(${forMatch[2]}, ${forMatch[3]}):` })
      continue
    }

    // Single-line if: if (cond) return val → if cond:\n    return val
    const ifReturnMatch = trimmed.match(/^if\s*\((.+?)\)\s+return\s+(.+)$/)
    if (ifReturnMatch) {
      outLines.push({ indent, text: `if ${ifReturnMatch[1]}:` })
      outLines.push({ indent: indent + 1, text: `return ${ifReturnMatch[2]}` })
      continue
    }

    // Block-opening if/else: if (cond) { → if cond:
    const ifMatch = trimmed.match(/^(else\s+)?if\s*\((.+?)\)\s*\{?$/)
    if (ifMatch) {
      const prefix = ifMatch[1] ? 'elif' : 'if'
      outLines.push({ indent, text: `${prefix} ${ifMatch[2]}:` })
      continue
    }

    // else {
    if (/^else\s*\{?$/.test(trimmed)) {
      outLines.push({ indent, text: 'else:' })
      continue
    }

    // Skip lone closing braces
    if (trimmed === '}') continue

    // Remove trailing brace from line
    trimmed = trimmed.replace(/\s*\{$/, ':').replace(/\s*\}$/, '')

    outLines.push({ indent, text: trimmed })
  }

  // Normalize indentation — subtract minimum indent so body starts at level 0
  const minIndent = outLines.length > 0 ? Math.min(...outLines.map((l) => l.indent)) : 0
  const result = outLines
    .map((l) => '    ' + '    '.repeat(l.indent - minIndent) + l.text)
    .join('\n')

  return `def ${pyName}(${pyParams.join(', ')}):\n${result}`
}

/** Count indent level from leading spaces (2-space or 4-space) */
function getIndent(line: string): number {
  const spaces = line.match(/^(\s*)/)?.[1].length ?? 0
  return Math.floor(spaces / 2)
}

/** Convert snake_case or camelCase to human-readable label */
function humanize(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}
