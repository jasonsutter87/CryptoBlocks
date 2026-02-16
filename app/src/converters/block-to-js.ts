import type { BlockDefinition } from '../types/block'

interface ConvertOptions {
  /** Include example usage with console.log (default: true) */
  includeExample?: boolean
  /** Include header comment (default: true) */
  includeHeader?: boolean
  /** Language to output (default: 'javascript') */
  language?: 'javascript' | 'python'
}

/**
 * Convert a CryptoBlocks BlockDefinition back into standalone source code.
 *
 * Outputs a clean, runnable file with the function implementation
 * and optional example usage.
 */
export function blockToJs(block: BlockDefinition, options: ConvertOptions = {}): string {
  const {
    includeExample = true,
    includeHeader = true,
    language = 'javascript',
  } = options

  const impl = block.implementations[language]
  if (!impl) {
    throw new Error(`No ${language} implementation found for block "${block.name}"`)
  }

  const lines: string[] = []
  const comment = language === 'javascript' ? '//' : '#'

  // Header
  if (includeHeader) {
    lines.push(`${comment} ${block.description}`)
    lines.push(`${comment} Block: ${block.name} | Category: ${block.category} | v${block.version}`)
    lines.push('')
  }

  // Function implementation
  lines.push(impl)
  lines.push('')

  // Example usage
  if (includeExample && block.inputs.length > 0) {
    lines.push(`${comment} Example usage`)

    // Extract function name from implementation
    const fnName = extractFnName(impl, language)

    // Build example args from defaults or sensible fallbacks
    const args = block.inputs.map((input) => {
      if (input.default !== undefined) {
        return formatValue(input.default, language)
      }
      // Fallback based on type
      switch (input.type) {
        case 'number': return '1'
        case 'string': return '"hello"'
        case 'boolean': return language === 'javascript' ? 'true' : 'True'
        default: return language === 'javascript' ? 'null' : 'None'
      }
    })

    const call = `${fnName}(${args.join(', ')})`

    if (block.outputs.length > 0) {
      if (language === 'javascript') {
        lines.push(`console.log(${call});`)
      } else {
        lines.push(`print(${call})`)
      }
    } else {
      lines.push(language === 'javascript' ? `${call};` : call)
    }

    // If we have test data, show expected output
    if (block.tests.length > 0) {
      const first = block.tests[0]
      if (first.expected && Object.keys(first.expected).length > 0) {
        const expectedVal = Object.values(first.expected)[0]
        lines.push(`${comment} Output: ${JSON.stringify(expectedVal)}`)
      }
    }
  }

  lines.push('')
  return lines.join('\n')
}

/** Extract function name from implementation code */
function extractFnName(code: string, language: string): string {
  if (language === 'javascript') {
    const match = code.match(/function\s+(\w+)/)
    return match ? match[1] : 'unknown'
  } else {
    const match = code.match(/def\s+(\w+)/)
    return match ? match[1] : 'unknown'
  }
}

/** Format a value for the target language */
function formatValue(val: string | number | boolean, language: string): string {
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'boolean') {
    return language === 'javascript' ? String(val) : (val ? 'True' : 'False')
  }
  return String(val)
}
