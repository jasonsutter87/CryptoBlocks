/**
 * Brick tree → Blockly workspace JSON.
 *
 * A "brick tree" is the program shape emitted by werbos's composer
 * (`werbos/compose/bricks.py`). Bricks are CryptoBlocks BlockDefinitions,
 * so a brick named `hash_text` is the block `cb_hash_text` and its args are
 * the block's inputs by the same names.
 *
 * Value nodes:
 *   {"brick": name, "args": {input: value}}   a block call
 *   {"var": name}                             a variable read
 *   {"raw": "<js literal>"}                   a literal escape
 *   "text" | 42 | true                        a plain literal
 *
 * Statement nodes (a program is a list of these):
 *   {"set": var, "to": value}
 *   {"print": value}
 *   {"if": cond, "then": [...], "else": [...]}
 *   {"while": cond, "do": [...]}
 *   {"repeat": n, "do": [...]}
 *   {"for": var, "in": list, "do": [...]}
 *   {"break": true} | {"continue": true}
 *   {"brick": ...}                            a statement block
 *
 * A bare value tree (not a program) is what werbos prints, so it's wrapped in
 * a print block.
 *
 * Anything that can't be expressed as real blocks throws BrickTreeError —
 * loading an unknown block type would crash Blockly, so we abstain instead.
 */

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

export type BrickTree = unknown

type BlockNode = ReturnType<typeof block>

export class BrickTreeError extends Error {}

export interface BrickTreeConversion {
  workspace: Record<string, unknown>
  warnings: string[]
}

const STMT_KEYS = ['set', 'print', 'if', 'while', 'repeat', 'for', 'return', 'break', 'continue', 'do']

function isObj(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node)
}

function isProgram(tree: unknown): boolean {
  return Array.isArray(tree) || (isObj(tree) && STMT_KEYS.some((k) => k in tree))
}

export function brickTreeToWorkspace(tree: BrickTree): BrickTreeConversion {
  resetIds()
  const warnings: string[] = []

  const stmts = isProgram(tree)
    ? convertStatements(tree, warnings)
    : [block('cb_print', undefined, { message: convertValue(tree, warnings) })]

  if (stmts.length === 0) throw new BrickTreeError('The program is empty')

  const top = chain(...stmts)
  top.x = 30
  top.y = 30
  return { workspace: workspace(top), warnings }
}

// ---- Values ----

function literal(v: unknown): BlockNode {
  if (typeof v === 'number') return numVal(v)
  if (typeof v === 'boolean') return boolVal(v)
  if (typeof v === 'string') return textVal(v)
  if (v === null || v === undefined) return textVal('')
  throw new BrickTreeError(`Can't turn ${JSON.stringify(v)} into a block`)
}

function convertValue(node: unknown, warnings: string[]): BlockNode {
  if (!isObj(node)) return literal(node)

  if ('var' in node) {
    return block('cb_get_global', undefined, { name: textVal(String(node.var)) })
  }

  if ('raw' in node) {
    // werbos only emits JSON-shaped literals here ("\"hello\"", 42, true)
    try {
      return literal(JSON.parse(String(node.raw)))
    } catch {
      throw new BrickTreeError(`Raw code has no block form: ${String(node.raw)}`)
    }
  }

  if ('brick' in node) return convertBrick(node, warnings)

  if ('lambda' in node) throw new BrickTreeError('Custom functions (lambdas) have no block form yet')

  throw new BrickTreeError(`Unknown value: ${Object.keys(node).join(', ')}`)
}

function convertBrick(node: Record<string, unknown>, warnings: string[]): BlockNode {
  const name = String(node.brick)
  const def = registry.get(name)
  if (!def) throw new BrickTreeError(`No block named "${name}" in the Brick Bin`)

  const args = isObj(node.args) ? node.args : {}
  const fields: Record<string, string> = {}
  const inputs: Record<string, BlockNode> = {}

  for (const input of def.inputs) {
    if (!(input.name in args)) continue
    const arg = args[input.name]
    if (input.choices && input.choices.length > 0) {
      // Dropdown inputs are fields, not sockets — they only take literals
      const choice = String(arg)
      if (!input.choices.includes(choice)) {
        warnings.push(`"${choice}" isn't an option for ${name}.${input.name}; using the default`)
        continue
      }
      fields[input.name] = choice
    } else {
      inputs[input.name] = convertValue(arg, warnings)
    }
  }

  for (const key of Object.keys(args)) {
    if (!def.inputs.some((i) => i.name === key)) warnings.push(`${name} has no input "${key}" — ignored`)
  }

  return block(`cb_${name}`, Object.keys(fields).length ? fields : undefined, inputs)
}

// ---- Statements ----

function convertStatements(node: unknown, warnings: string[]): BlockNode[] {
  if (Array.isArray(node)) return node.flatMap((s) => convertStatements(s, warnings))
  if (!isObj(node)) throw new BrickTreeError(`A statement can't be ${JSON.stringify(node)}`)

  if ('do' in node && Object.keys(node).length === 1) return convertStatements(node.do, warnings)

  if ('set' in node) {
    return [block('cb_set_global', undefined, {
      name: textVal(String(node.set)),
      value: convertValue(node.to, warnings),
    })]
  }

  if ('print' in node) {
    return [block('cb_print', undefined, { message: convertValue(node.print, warnings) })]
  }

  if ('if' in node) {
    const stmtInputs = body({ DO: node.then, ELSE: node.else }, warnings)
    const type = 'ELSE' in stmtInputs ? 'cb_if_else' : 'cb_if'
    return [blockWithStatements(type, undefined, { CONDITION: convertValue(node.if, warnings) }, stmtInputs)]
  }

  if ('while' in node) {
    return [blockWithStatements('cb_while', undefined,
      { CONDITION: convertValue(node.while, warnings) }, body({ DO: node.do }, warnings))]
  }

  if ('repeat' in node) {
    return [blockWithStatements('cb_repeat', undefined,
      { TIMES: convertValue(node.repeat, warnings) }, body({ DO: node.do }, warnings))]
  }

  if ('for' in node) return convertForOf(node, warnings)

  if (node.break) return [block('cb_break')]
  if (node.continue) return [block('cb_continue')]

  if ('return' in node) {
    // cb_return takes no value, so the value would silently vanish
    throw new BrickTreeError('Returning a value has no block form yet')
  }

  if ('brick' in node) return [convertBrick(node, warnings)]

  throw new BrickTreeError(`Unknown statement: ${Object.keys(node).join(', ')}`)
}

/** Build statement inputs, dropping empty bodies (Blockly wants them absent, not null). */
function body(slots: Record<string, unknown>, warnings: string[]): Record<string, BlockNode> {
  const out: Record<string, BlockNode> = {}
  for (const [key, stmts] of Object.entries(slots)) {
    if (stmts === undefined) continue
    const blocks = convertStatements(stmts, warnings)
    if (blocks.length > 0) out[key] = chain(...blocks)
  }
  return out
}

/**
 * for (item of list) — there's no for-each block, so this uses the same
 * index-walk pattern as the JS converter's .forEach():
 *   set __list = <list>; set __idx = 0
 *   repeat (length of __list):
 *     set item = __list[__idx]; <body>; set __idx = __idx + 1
 */
function convertForOf(node: Record<string, unknown>, warnings: string[]): BlockNode[] {
  const item = String(node.for)
  const src = node.in
  const listName = isObj(src) && 'var' in src ? String(src.var) : '__list'
  const idx = '__idx'

  const setup: BlockNode[] = []
  if (listName === '__list') {
    setup.push(block('cb_set_global', undefined, { name: textVal(listName), value: convertValue(src, warnings) }))
  }
  setup.push(block('cb_set_global', undefined, { name: textVal(idx), value: numVal(0) }))

  const loopBody = chain(
    block('cb_set_global', undefined, {
      name: textVal(item),
      value: block('cb_get_from_list', undefined, {
        name: textVal(listName),
        index: block('cb_get_global', undefined, { name: textVal(idx) }),
      }),
    }),
    ...convertStatements(node.do ?? [], warnings),
    block('cb_set_global', undefined, {
      name: textVal(idx),
      value: block('cb_add', undefined, {
        a: block('cb_get_global', undefined, { name: textVal(idx) }),
        b: numVal(1),
      }),
    }),
  )

  return [
    ...setup,
    blockWithStatements('cb_repeat', undefined,
      { TIMES: block('cb_list_length', undefined, { name: textVal(listName) }) },
      { DO: loopBody }),
  ]
}
