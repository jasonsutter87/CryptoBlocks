/**
 * Builder helpers for constructing valid Blockly workspace JSON
 * without hand-writing the serialization format.
 */

interface BlockNode {
  type: string
  id?: string
  x?: number
  y?: number
  fields?: Record<string, string | number | boolean>
  inputs?: Record<string, { block: BlockNode; shadow?: BlockNode } | { shadow: BlockNode }>
  next?: { block: BlockNode }
}

let _idCounter = 0
function nextId(): string {
  return `ex_${++_idCounter}`
}

/** Reset ID counter (called before building each workspace). */
export function resetIds(): void {
  _idCounter = 0
}

/** Create a block node with optional fields and value inputs. */
export function block(
  type: string,
  fields?: Record<string, string | number | boolean>,
  inputs?: Record<string, BlockNode>,
  x?: number,
  y?: number,
): BlockNode {
  const node: BlockNode = { type, id: nextId() }
  if (x !== undefined) node.x = x
  if (y !== undefined) node.y = y
  if (fields) node.fields = fields
  if (inputs) {
    node.inputs = {}
    for (const [key, val] of Object.entries(inputs)) {
      node.inputs[key] = { block: val }
    }
  }
  return node
}

/** Create a block with both value and statement inputs. */
export function blockWithStatements(
  type: string,
  fields: Record<string, string | number | boolean> | undefined,
  valueInputs: Record<string, BlockNode>,
  statementInputs: Record<string, BlockNode>,
  x?: number,
  y?: number,
): BlockNode {
  const node: BlockNode = { type, id: nextId() }
  if (x !== undefined) node.x = x
  if (y !== undefined) node.y = y
  if (fields) node.fields = fields
  node.inputs = {}
  for (const [key, val] of Object.entries(valueInputs)) {
    node.inputs[key] = { block: val }
  }
  for (const [key, val] of Object.entries(statementInputs)) {
    node.inputs[key] = { block: val }
  }
  return node
}

/** Shortcut for a text value block. */
export function textVal(text: string): BlockNode {
  return { type: 'text', id: nextId(), fields: { TEXT: text } }
}

/** Shortcut for a math_number value block. */
export function numVal(n: number): BlockNode {
  return { type: 'math_number', id: nextId(), fields: { NUM: n } }
}

/** Shortcut for a cb_color value block. */
export function colorVal(hex: string): BlockNode {
  return { type: 'cb_color', id: nextId(), fields: { COLOR: hex } }
}

/** Shortcut for a logic_boolean value block. */
export function boolVal(val: boolean): BlockNode {
  return { type: 'logic_boolean', id: nextId(), fields: { BOOL: val ? 'TRUE' : 'FALSE' } }
}

/** Chain multiple statement blocks via their `next` pointers. Returns the first block. */
export function chain(...blocks: BlockNode[]): BlockNode {
  for (let i = 0; i < blocks.length - 1; i++) {
    blocks[i].next = { block: blocks[i + 1] }
  }
  return blocks[0]
}

/** Wrap top-level blocks into a valid workspace serialization object. */
export function workspace(...topBlocks: BlockNode[]): Record<string, unknown> {
  return {
    blocks: {
      languageVersion: 0,
      blocks: topBlocks,
    },
  }
}
