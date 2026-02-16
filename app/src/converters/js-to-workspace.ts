import * as acorn from 'acorn'
import type { BlockDefinition } from '../types/block'
import { jsToBlock } from './js-to-block'
import { registry } from '../blocks/registry'
import {
  block,
  blockWithStatements,
  textVal,
  numVal,
  boolVal,
  chain,
  workspace,
  resetIds,
} from '../examples/workspaces'

type Node = acorn.Node & Record<string, unknown>

export interface ConversionResult {
  workspace: Record<string, unknown>
  newBlocks: BlockDefinition[]
  warnings: string[]
}

/**
 * Convert JavaScript source code to a Blockly workspace JSON.
 *
 * Pass 1: Extract FunctionDeclarations → register as custom blocks via jsToBlock().
 * Pass 2: Convert remaining top-level statements → workspace blocks.
 */
export function jsToWorkspace(code: string): ConversionResult {
  const warnings: string[] = []
  const newBlocks: BlockDefinition[] = []

  // Parse with acorn
  const ast = acorn.parse(code, {
    ecmaVersion: 2020,
    sourceType: 'script',
  }) as unknown as Node

  const body = ast.body as Node[]

  // --- Pass 1: Extract functions ---
  const functionMap = new Map<string, string>() // JS name → block name (e.g. "fibonacci" → "fibonacci")

  for (const node of body) {
    if (node.type === 'FunctionDeclaration') {
      const id = node.id as Node | null
      if (!id) continue
      const fnName = id.name as string

      // Convert camelCase to snake_case for registry lookup
      const blockName = fnName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')

      // Check if already registered
      if (registry.get(blockName)) {
        functionMap.set(fnName, blockName)
        continue
      }

      // Extract the function source and convert to BlockDefinition
      const fnSource = code.slice(node.start as number, node.end as number)
      try {
        const blockDef = jsToBlock(fnSource, { category: 'My Blocks', color: '#F59E0B' })
        newBlocks.push(blockDef)
        functionMap.set(fnName, blockDef.name)
      } catch (err) {
        warnings.push(`Could not convert function "${fnName}": ${(err as Error).message}`)
      }
    }
  }

  // --- Pass 2: Convert calling code ---
  resetIds()
  const topBlocks: ReturnType<typeof block>[] = []
  let yOffset = 30

  for (const node of body) {
    if (node.type === 'FunctionDeclaration') continue // Skip functions, already handled

    // Arrow functions / classes: warn and skip
    if (node.type === 'ClassDeclaration') {
      warnings.push('Class declarations are not supported — skipped')
      continue
    }

    try {
      const stmts = convertStatement(node, warnings, functionMap)
      if (stmts.length > 0) {
        const chained = stmts.length === 1 ? stmts[0] : chain(...stmts)
        chained.x = 30
        chained.y = yOffset
        topBlocks.push(chained)
        yOffset += stmts.length * 60 + 40
      }
    } catch {
      warnings.push(`Skipped unsupported statement: ${node.type}`)
    }
  }

  return {
    workspace: workspace(...topBlocks),
    newBlocks,
    warnings,
  }
}

// ---- Statement Converters ----

function convertStatement(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  switch (node.type) {
    case 'ExpressionStatement':
      return convertExpressionStatement(node, warnings, fnMap)

    case 'VariableDeclaration':
      return convertVariableDeclaration(node, warnings, fnMap)

    case 'IfStatement':
      return [convertIfStatement(node, warnings, fnMap)]

    case 'ForStatement':
      return [convertForStatement(node, warnings, fnMap)]

    case 'WhileStatement':
      return [convertWhileStatement(node, warnings, fnMap)]

    default:
      warnings.push(`Unsupported statement type: ${node.type}`)
      return []
  }
}

function convertExpressionStatement(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  const expr = node.expression as Node

  // console.log(expr)
  if (isConsoleLog(expr)) {
    const args = expr.arguments as Node[]
    const val = args.length > 0
      ? convertExpression(args[0], warnings, fnMap)
      : textVal('')
    return [block('cb_print', undefined, { message: val })]
  }

  // Assignment: x = expr
  if (expr.type === 'AssignmentExpression') {
    return convertAssignment(expr, warnings, fnMap)
  }

  // .forEach() / .map() as statement
  if (expr.type === 'CallExpression') {
    const forEach = tryConvertForEach(expr, warnings, fnMap)
    if (forEach) return forEach

    const callBlock = convertCallExpression(expr, warnings, fnMap)
    if (callBlock) return [callBlock]
  }

  warnings.push(`Unsupported expression statement`)
  return []
}

/** Check if a CallExpression is arr.forEach(cb) and convert it. */
function tryConvertForEach(
  expr: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] | null {
  const callee = expr.callee as Node
  if (callee.type !== 'MemberExpression') return null
  const prop = callee.property as Node
  const propName = prop.name as string | undefined
  if (propName !== 'forEach') return null

  const args = expr.arguments as Node[]
  if (args.length === 0) return null

  return convertForEach(callee.object as Node, args[0], warnings, fnMap)
}

/** Convert a standalone function call to a statement block. */
function convertCallExpression(
  expr: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> | null {
  const result = convertCallOrMember(expr, warnings, fnMap)
  // Check it didn't fall through to unsupported
  if (result.type === 'text' && result.fields?.TEXT === '...') return null
  return result
}

function convertAssignment(
  expr: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  const left = expr.left as Node
  if (left.type === 'Identifier') {
    const name = left.name as string
    const value = convertExpression(expr.right as Node, warnings, fnMap)
    return [block('cb_set_global', undefined, { name: textVal(name), value })]
  }
  warnings.push('Unsupported assignment target')
  return []
}

function convertVariableDeclaration(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  const declarations = node.declarations as Node[]
  const results: ReturnType<typeof block>[] = []

  for (const decl of declarations) {
    const id = decl.id as Node
    if (id.type !== 'Identifier') {
      warnings.push('Destructuring not supported — skipped')
      continue
    }
    const name = id.name as string

    // Arrow functions as variable declarations → treat as function
    const init = decl.init as Node | null
    if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
      warnings.push(`Arrow/function expressions ("${name}") are not supported as block definitions — skipped`)
      continue
    }

    // Array literal → create_list + add_to_list chain
    if (init && init.type === 'ArrayExpression') {
      results.push(...convertArrayInit(name, init, warnings, fnMap))
      continue
    }

    const value = init
      ? convertExpression(init, warnings, fnMap)
      : textVal('')
    results.push(block('cb_set_global', undefined, { name: textVal(name), value }))
  }

  return results
}

/** Convert `let name = [a, b, c]` → create_list + add_to_list chain */
function convertArrayInit(
  name: string,
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  const elements = node.elements as (Node | null)[]
  const results: ReturnType<typeof block>[] = []

  results.push(block('cb_create_list', undefined, { name: textVal(name) }))

  for (const el of elements) {
    if (!el) continue
    const val = convertExpression(el, warnings, fnMap)
    results.push(block('cb_add_to_list', undefined, { name: textVal(name), item: val }))
  }

  return results
}

/** Convert `arr.forEach(i => body)` → set index, repeat(list_length), get item + body */
function convertForEach(
  objNode: Node,
  callbackNode: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block>[] {
  // The object should be an identifier (the list name)
  if (objNode.type !== 'Identifier') {
    warnings.push('forEach on non-identifier not supported')
    return []
  }
  const listName = objNode.name as string

  // Extract callback param name and body
  let paramName = '_item'
  let bodyNode: Node | null = null

  if (callbackNode.type === 'ArrowFunctionExpression' || callbackNode.type === 'FunctionExpression') {
    const params = callbackNode.params as Node[]
    if (params.length > 0 && params[0].type === 'Identifier') {
      paramName = params[0].name as string
    }
    bodyNode = callbackNode.body as Node
  }

  if (!bodyNode) {
    warnings.push('forEach callback could not be parsed')
    return []
  }

  const results: ReturnType<typeof block>[] = []

  // set __idx = 0
  const idxVar = `__idx`
  results.push(block('cb_set_global', undefined, { name: textVal(idxVar), value: numVal(0) }))

  // Build the loop body:
  //   set paramName = get_from_list(listName, __idx)
  //   <callback body>
  //   set __idx = __idx + 1
  const bodyBlocks: ReturnType<typeof block>[] = []

  // Set the iteration variable
  bodyBlocks.push(block('cb_set_global', undefined, {
    name: textVal(paramName),
    value: block('cb_get_from_list', undefined, {
      name: textVal(listName),
      index: block('cb_get_global', undefined, { name: textVal(idxVar) }),
    }),
  }))

  // Convert callback body
  if (bodyNode.type === 'BlockStatement') {
    const stmts = bodyNode.body as Node[]
    for (const stmt of stmts) {
      bodyBlocks.push(...convertStatement(stmt, warnings, fnMap))
    }
  } else {
    // Arrow with expression body: e.g. i => console.log(i)
    // Wrap as expression statement
    const exprStmt: Node = { type: 'ExpressionStatement', expression: bodyNode } as unknown as Node
    bodyBlocks.push(...convertStatement(exprStmt, warnings, fnMap))
  }

  // Increment index
  bodyBlocks.push(block('cb_set_global', undefined, {
    name: textVal(idxVar),
    value: block('cb_add', undefined, {
      a: block('cb_get_global', undefined, { name: textVal(idxVar) }),
      b: numVal(1),
    }),
  }))

  const bodyChain = bodyBlocks.length === 1 ? bodyBlocks[0] : chain(...bodyBlocks)

  // repeat(list_length(listName))
  const repeatBlock = blockWithStatements(
    'cb_repeat',
    undefined,
    { TIMES: block('cb_list_length', undefined, { name: textVal(listName) }) },
    { DO: bodyChain },
  )

  results.push(repeatBlock)
  return results
}

function convertIfStatement(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const condition = convertExpression(node.test as Node, warnings, fnMap)
  const doBody = convertBody(node.consequent as Node, warnings, fnMap)
  const alternate = node.alternate as Node | null

  if (alternate) {
    const elseBody = convertBody(alternate, warnings, fnMap)
    const inputs: Record<string, ReturnType<typeof block>> = { CONDITION: condition }
    const stmtInputs: Record<string, ReturnType<typeof block>> = {}
    if (doBody) stmtInputs.DO = doBody
    if (elseBody) stmtInputs.ELSE = elseBody
    return blockWithStatements('cb_if_else', undefined, inputs, stmtInputs)
  }

  const inputs: Record<string, ReturnType<typeof block>> = { CONDITION: condition }
  const stmtInputs: Record<string, ReturnType<typeof block>> = {}
  if (doBody) stmtInputs.DO = doBody
  return blockWithStatements('cb_if', undefined, inputs, stmtInputs)
}

function convertForStatement(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  // Try to match: for (i = 0; i < n; i++) or for (let i = 0; i < n; i++)
  const init = node.init as Node | null
  const test = node.test as Node | null
  // node.update intentionally unused — we only need init/test for block count

  let count: ReturnType<typeof block> | null = null

  if (test && test.type === 'BinaryExpression' && (test.operator === '<' || test.operator === '<=')) {
    // Extract the upper bound
    const right = test.right as Node
    count = convertExpression(right, warnings, fnMap)

    // Check if init starts at 0
    if (init) {
      let startVal: number | null = null
      if (init.type === 'AssignmentExpression') {
        const r = (init as Node).right as Node
        if (r.type === 'Literal' && typeof r.value === 'number') startVal = r.value as number
      } else if (init.type === 'VariableDeclaration') {
        const decls = init.declarations as Node[]
        if (decls.length > 0) {
          const declInit = decls[0].init as Node | null
          if (declInit && declInit.type === 'Literal' && typeof declInit.value === 'number') {
            startVal = declInit.value as number
          }
        }
      }
      if (startVal !== null && startVal !== 0) {
        // Non-zero start — adjust count: count = upper - start
        count = block('cb_subtract', undefined, {
          a: count,
          b: numVal(startVal),
        })
      }
    }
  }

  if (!count) {
    warnings.push('Complex for loop — converted with best effort')
    count = numVal(10)
  }

  const doBody = convertBody(node.body as Node, warnings, fnMap)
  const stmtInputs: Record<string, ReturnType<typeof block>> = {}
  if (doBody) stmtInputs.DO = doBody
  return blockWithStatements('cb_repeat', undefined, { TIMES: count }, stmtInputs)
}

function convertWhileStatement(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  // while(condition) { body } → cb_repeat with a large count + cb_if(not condition) break pattern
  // Simplest mapping: repeat(1000) with if(!condition) break via body
  // For simple while(i < n) patterns, try to extract the count
  warnings.push('while loop converted to repeat(1000) — adjust the count if needed')

  const doBody = convertBody(node.body as Node, warnings, fnMap)
  const stmtInputs: Record<string, ReturnType<typeof block>> = {}
  if (doBody) stmtInputs.DO = doBody
  return blockWithStatements('cb_repeat', undefined, { TIMES: numVal(1000) }, stmtInputs)
}

// ---- Expression Converters ----

function convertExpression(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  switch (node.type) {
    case 'Literal':
      return convertLiteral(node)

    case 'TemplateLiteral':
      return convertTemplateLiteral(node, warnings, fnMap)

    case 'Identifier':
      return convertIdentifier(node)

    case 'BinaryExpression':
    case 'LogicalExpression':
      return convertBinaryExpression(node, warnings, fnMap)

    case 'UnaryExpression':
      return convertUnaryExpression(node, warnings, fnMap)

    case 'CallExpression':
    case 'MemberExpression':
      return convertCallOrMember(node, warnings, fnMap)

    case 'ArrayExpression':
      return convertArrayExpression(node, warnings, fnMap)

    case 'ConditionalExpression':
      return convertConditionalExpression(node, warnings, fnMap)

    default:
      warnings.push(`Unsupported expression: ${node.type}`)
      return textVal('...')
  }
}

function convertLiteral(node: Node): ReturnType<typeof block> {
  const val = node.value
  if (typeof val === 'number') return numVal(val)
  if (typeof val === 'string') return textVal(val)
  if (typeof val === 'boolean') return boolVal(val)
  return textVal(String(val))
}

function convertTemplateLiteral(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const quasis = node.quasis as Node[]
  const expressions = node.expressions as Node[]

  // Simple case: no expressions — just a string
  if (expressions.length === 0) {
    return textVal((quasis[0].value as { raw: string }).raw)
  }

  // Build a chain of join_text blocks
  let result: ReturnType<typeof block> = textVal((quasis[0].value as { cooked: string }).cooked)
  for (let i = 0; i < expressions.length; i++) {
    const expr = convertExpression(expressions[i], warnings, fnMap)
    result = block('cb_join_text', undefined, { first: result, second: expr })
    const nextQuasi = (quasis[i + 1].value as { cooked: string }).cooked
    if (nextQuasi) {
      result = block('cb_join_text', undefined, { first: result, second: textVal(nextQuasi) })
    }
  }
  return result
}

function convertIdentifier(node: Node): ReturnType<typeof block> {
  const name = node.name as string
  if (name === 'true') return boolVal(true)
  if (name === 'false') return boolVal(false)
  if (name === 'undefined') return textVal('undefined')
  return block('cb_get_global', undefined, { name: textVal(name) })
}

function convertBinaryExpression(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const left = convertExpression(node.left as Node, warnings, fnMap)
  const right = convertExpression(node.right as Node, warnings, fnMap)
  const op = node.operator as string

  // Check if + is string concatenation
  if (op === '+' && isStringContext(node.left as Node, node.right as Node)) {
    return block('cb_join_text', undefined, { first: left, second: right })
  }

  switch (op) {
    case '+': return block('cb_add', undefined, { a: left, b: right })
    case '-': return block('cb_subtract', undefined, { a: left, b: right })
    case '*': return block('cb_multiply', undefined, { a: left, b: right })
    case '/': return block('cb_divide', undefined, { a: left, b: right })
    case '>': return block('cb_greater_than', undefined, { a: left, b: right })
    case '<': return block('cb_less_than', undefined, { a: left, b: right })
    case '===':
    case '==': return block('cb_equals', undefined, { a: left, b: right })
    case '!==':
    case '!=': return block('cb_not', undefined, { value: block('cb_equals', undefined, { a: left, b: right }) })
    case '>=': return block('cb_or', undefined, {
      a: block('cb_greater_than', undefined, { a: left, b: right }),
      b: block('cb_equals', undefined, { a: left, b: right }),
    })
    case '<=': return block('cb_or', undefined, {
      a: block('cb_less_than', undefined, { a: left, b: right }),
      b: block('cb_equals', undefined, { a: left, b: right }),
    })
    case '&&': return block('cb_and', undefined, { a: left, b: right })
    case '||': return block('cb_or', undefined, { a: left, b: right })
    case '**': return block('cb_power', undefined, { base: left, exponent: right })
    case '%': {
      warnings.push('Modulo operator (%) has no direct block — used subtract(a, multiply(divide(a,b), b))')
      return block('cb_subtract', undefined, {
        a: left,
        b: block('cb_multiply', undefined, {
          a: block('cb_divide', undefined, { a: left, b: right }),
          b: right,
        }),
      })
    }
    default:
      warnings.push(`Unsupported operator: ${op}`)
      return textVal('...')
  }
}

function convertUnaryExpression(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const op = node.operator as string
  const arg = convertExpression(node.argument as Node, warnings, fnMap)

  if (op === '!') return block('cb_not', undefined, { value: arg })
  if (op === '-') return block('cb_subtract', undefined, { a: numVal(0), b: arg })

  warnings.push(`Unsupported unary operator: ${op}`)
  return textVal('...')
}

function convertCallOrMember(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  // Handle MemberExpression that isn't a call (e.g., x.length)
  if (node.type === 'MemberExpression') {
    return convertMemberAccess(node, warnings, fnMap)
  }

  // CallExpression
  const callee = node.callee as Node
  const args = node.arguments as Node[]

  // console.log → cb_print
  if (isConsoleLog(node)) {
    const val = args.length > 0
      ? convertExpression(args[0], warnings, fnMap)
      : textVal('')
    return block('cb_print', undefined, { message: val })
  }

  // Math.random()
  if (isMathCall(callee, 'random')) {
    return block('cb_random_number', undefined, { min: numVal(1), max: numVal(100) })
  }

  // Math.floor(x)
  if (isMathCall(callee, 'floor') || isMathCall(callee, 'round')) {
    const val = args.length > 0
      ? convertExpression(args[0], warnings, fnMap)
      : numVal(0)
    return block('cb_round', undefined, { value: val })
  }

  // Math.pow(a, b)
  if (isMathCall(callee, 'pow')) {
    const a = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
    const b = args.length > 1 ? convertExpression(args[1], warnings, fnMap) : numVal(2)
    return block('cb_power', undefined, { base: a, exponent: b })
  }

  // Math.min(a, b)
  if (isMathCall(callee, 'min')) {
    const a = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
    const b = args.length > 1 ? convertExpression(args[1], warnings, fnMap) : numVal(0)
    return block('cb_min', undefined, { a, b })
  }

  // Math.max(a, b)
  if (isMathCall(callee, 'max')) {
    const a = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
    const b = args.length > 1 ? convertExpression(args[1], warnings, fnMap) : numVal(0)
    return block('cb_max', undefined, { a, b })
  }

  // Math.sqrt(x)
  if (isMathCall(callee, 'sqrt')) {
    const val = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
    return block('cb_power', undefined, { base: val, exponent: numVal(0.5) })
  }

  // Math.abs(x)
  if (isMathCall(callee, 'abs')) {
    const val = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
    // abs(x) = if_then(x >= 0, x, -x)
    return block('cb_if_then', undefined, {
      condition: block('cb_greater_than', undefined, { a: val, b: numVal(0) }),
      then_value: val,
      else_value: block('cb_subtract', undefined, { a: numVal(0), b: val }),
    })
  }

  // Method calls: .toUpperCase(), .toLowerCase(), .includes(), .length (via call)
  if (callee.type === 'MemberExpression') {
    const prop = callee.property as Node
    const propName = prop.name as string | undefined
    const obj = callee.object as Node

    if (propName === 'toUpperCase') {
      return block('cb_uppercase', undefined, { text: convertExpression(obj, warnings, fnMap) })
    }
    if (propName === 'toLowerCase') {
      return block('cb_lowercase', undefined, { text: convertExpression(obj, warnings, fnMap) })
    }
    if (propName === 'includes') {
      const search = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : textVal('')
      return block('cb_contains', undefined, {
        text: convertExpression(obj, warnings, fnMap),
        search,
      })
    }
    if (propName === 'replace') {
      const search = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : textVal('')
      const replacement = args.length > 1 ? convertExpression(args[1], warnings, fnMap) : textVal('')
      return block('cb_replace_text', undefined, {
        text: convertExpression(obj, warnings, fnMap),
        search,
        replace: replacement,
      })
    }
    if (propName === 'trim') {
      return block('cb_trim', undefined, { text: convertExpression(obj, warnings, fnMap) })
    }
    if (propName === 'slice' || propName === 'substring') {
      const start = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : numVal(0)
      const end = args.length > 1 ? convertExpression(args[1], warnings, fnMap) : block('cb_text_length', undefined, { text: convertExpression(obj, warnings, fnMap) })
      return block('cb_slice_text', undefined, {
        text: convertExpression(obj, warnings, fnMap),
        start,
        end,
      })
    }
    if (propName === 'toString') {
      return convertExpression(obj, warnings, fnMap)
    }
    // .push(item) → add_to_list
    if (propName === 'push' && obj.type === 'Identifier') {
      const listName = obj.name as string
      const item = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : textVal('')
      return block('cb_add_to_list', undefined, { name: textVal(listName), item })
    }
  }

  // alert(msg) → cb_print
  if (callee.type === 'Identifier' && (callee.name as string) === 'alert') {
    const val = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : textVal('')
    return block('cb_print', undefined, { message: val })
  }

  // prompt(msg) → cb_ask
  if (callee.type === 'Identifier' && (callee.name as string) === 'prompt') {
    const val = args.length > 0 ? convertExpression(args[0], warnings, fnMap) : textVal('?')
    return block('cb_ask', undefined, { question: val })
  }

  // Named function call: check function map and registry
  if (callee.type === 'Identifier') {
    const fnName = callee.name as string
    return convertNamedCall(fnName, args, warnings, fnMap)
  }

  warnings.push(`Unsupported call expression`)
  return textVal('...')
}

function convertMemberAccess(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const prop = node.property as Node
  const obj = node.object as Node

  // x.length → cb_list_length (for identifiers) or cb_text_length
  if (!node.computed && (prop.name as string) === 'length') {
    if (obj.type === 'Identifier') {
      return block('cb_list_length', undefined, { name: textVal(obj.name as string) })
    }
    return block('cb_text_length', undefined, { text: convertExpression(obj, warnings, fnMap) })
  }

  warnings.push(`Unsupported member access: .${(prop.name as string) || '?'}`)
  return textVal('...')
}

function convertNamedCall(
  fnName: string,
  args: Node[],
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  // Check function map (user-defined functions parsed in Pass 1)
  const blockName = fnMap.get(fnName)
  if (blockName) {
    return buildCallBlock(blockName, args, warnings, fnMap)
  }

  // Check registry by converting name to snake_case
  const snakeName = fnName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
  if (registry.get(snakeName)) {
    return buildCallBlock(snakeName, args, warnings, fnMap)
  }

  warnings.push(`Unknown function "${fnName}" — no matching block found`)
  return textVal('...')
}

function buildCallBlock(
  blockName: string,
  args: Node[],
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const def = registry.get(blockName)
  if (!def) {
    // It's a newly created block not yet in registry — build with positional inputs
    return block(`cb_${blockName}`)
  }

  const inputs: Record<string, ReturnType<typeof block>> = {}
  for (let i = 0; i < def.inputs.length && i < args.length; i++) {
    inputs[def.inputs[i].name] = convertExpression(args[i], warnings, fnMap)
  }

  return block(`cb_${blockName}`, undefined, inputs)
}

/** Convert [a, b, c] used as a value expression → list_value fallback with warning. */
function convertArrayExpression(
  node: Node,
  warnings: string[],
  _fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const elements = node.elements as (Node | null)[]
  // When used as a value (not variable init), we can't easily create a named list inline.
  // Return a textVal representation and warn.
  const items = elements.map((el) => {
    if (!el) return 'null'
    if (el.type === 'Literal') return JSON.stringify(el.value)
    return '...'
  })
  warnings.push('Array literal used as value — converted to text representation')
  return textVal('[' + items.join(', ') + ']')
}

function convertConditionalExpression(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> {
  const condition = convertExpression(node.test as Node, warnings, fnMap)
  const thenVal = convertExpression(node.consequent as Node, warnings, fnMap)
  const elseVal = convertExpression(node.alternate as Node, warnings, fnMap)
  return block('cb_if_then', undefined, {
    condition,
    then_value: thenVal,
    else_value: elseVal,
  })
}

// ---- Helpers ----

/** Convert a BlockStatement or single statement into a chained block. */
function convertBody(
  node: Node,
  warnings: string[],
  fnMap: Map<string, string>,
): ReturnType<typeof block> | null {
  let stmts: ReturnType<typeof block>[] = []

  if (node.type === 'BlockStatement') {
    const body = node.body as Node[]
    for (const stmt of body) {
      stmts.push(...convertStatement(stmt, warnings, fnMap))
    }
  } else if (node.type === 'IfStatement') {
    // else if (...) — it's another if statement, not a block
    stmts = [convertIfStatement(node, warnings, fnMap)]
  } else {
    stmts = convertStatement(node, warnings, fnMap)
  }

  if (stmts.length === 0) return null
  if (stmts.length === 1) return stmts[0]
  return chain(...stmts)
}

function isConsoleLog(node: Node): boolean {
  if (node.type !== 'CallExpression') return false
  const callee = node.callee as Node
  if (callee.type !== 'MemberExpression') return false
  const obj = callee.object as Node
  const prop = callee.property as Node
  return obj.type === 'Identifier' && (obj.name as string) === 'console' && (prop.name as string) === 'log'
}

function isMathCall(callee: Node, method: string): boolean {
  if (callee.type !== 'MemberExpression') return false
  const obj = callee.object as Node
  const prop = callee.property as Node
  return obj.type === 'Identifier' && (obj.name as string) === 'Math' && (prop.name as string) === method
}

/** Heuristic: if either side is a string literal, treat + as concatenation. */
function isStringContext(left: Node, right: Node): boolean {
  if (left.type === 'Literal' && typeof left.value === 'string') return true
  if (right.type === 'Literal' && typeof right.value === 'string') return true
  if (left.type === 'TemplateLiteral' || right.type === 'TemplateLiteral') return true
  return false
}
