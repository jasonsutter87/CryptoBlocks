/**
 * Scratch .sb3 Importer
 *
 * Parses a .sb3 ZIP file, extracts project.json, and converts
 * Scratch blocks to CryptoBlocks workspace state.
 *
 * Not every Scratch block has a 1:1 mapping — sprite-based blocks
 * (motion, looks, cloning) don't translate directly. We focus on
 * logic, math, operators, variables, lists, and control flow.
 */

import JSZip from 'jszip'

// --- Scratch project.json types ---

interface ScratchProject {
  targets: ScratchTarget[]
  meta?: { semver?: string }
}

interface ScratchTarget {
  isStage: boolean
  name: string
  variables: Record<string, [string, string | number]>
  lists: Record<string, [string, unknown[]]>
  blocks: Record<string, ScratchBlock>
}

interface ScratchBlock {
  opcode: string
  next: string | null
  parent: string | null
  inputs: Record<string, unknown[]>
  fields: Record<string, [string, string | null]>
  topLevel: boolean
  x?: number
  y?: number
  shadow?: boolean
  mutation?: Record<string, unknown>
}

// --- CryptoBlocks workspace state (Blockly JSON format) ---

interface CBBlock {
  type: string
  id?: string
  x?: number
  y?: number
  fields?: Record<string, unknown>
  inputs?: Record<string, { block: CBBlock | null; shadow?: CBBlock }>
  next?: { block: CBBlock | null }
}

interface ImportResult {
  workspace: { blocks: { blocks: CBBlock[] } }
  stats: {
    totalScratchBlocks: number
    converted: number
    skipped: number
    skippedOpcodes: string[]
  }
  variables: Array<{ name: string; value: string | number }>
  lists: Array<{ name: string; items: unknown[] }>
}

// --- Opcode mapping ---

const OPCODE_MAP: Record<string, (block: ScratchBlock, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext) => CBBlock | null> = {
  // --- Control ---
  'control_wait': (block, all, ctx) => ({
    type: 'cb_wait',
    ...pos(block),
    inputs: { SECONDS: shadowNum(getInputValue(block, 'DURATION', all, ctx), 1) },
    next: convertNext(block, all, ctx),
  }),
  'control_repeat': (block, all, ctx) => ({
    type: 'cb_repeat',
    ...pos(block),
    inputs: {
      TIMES: shadowNum(getInputValue(block, 'TIMES', all, ctx), 10),
      ...statementsInput('SUBSTACK', block, all, ctx),
    },
    next: convertNext(block, all, ctx),
  }),
  'control_if': (block, all, ctx) => ({
    type: 'cb_if',
    ...pos(block),
    inputs: {
      ...conditionInput(block, 'CONDITION', all, ctx),
      ...statementsInput('SUBSTACK', block, all, ctx),
    },
    next: convertNext(block, all, ctx),
  }),
  'control_if_else': (block, all, ctx) => ({
    type: 'cb_if_else',
    ...pos(block),
    inputs: {
      ...conditionInput(block, 'CONDITION', all, ctx),
      ...statementsInput('SUBSTACK', block, all, ctx),
      ...statementsInput('SUBSTACK2', block, all, ctx),
    },
    next: convertNext(block, all, ctx),
  }),
  'control_forever': (block, all, ctx) => ({
    type: 'cb_while',
    ...pos(block),
    inputs: {
      ...statementsInput('SUBSTACK', block, all, ctx),
    },
    next: convertNext(block, all, ctx),
  }),

  // --- Operators ---
  'operator_add': (block, all, ctx) => ({
    type: 'cb_add',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'NUM1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'NUM2', all, ctx), 0),
    },
  }),
  'operator_subtract': (block, all, ctx) => ({
    type: 'cb_subtract',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'NUM1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'NUM2', all, ctx), 0),
    },
  }),
  'operator_multiply': (block, all, ctx) => ({
    type: 'cb_multiply',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'NUM1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'NUM2', all, ctx), 0),
    },
  }),
  'operator_divide': (block, all, ctx) => ({
    type: 'cb_divide',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'NUM1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'NUM2', all, ctx), 0),
    },
  }),
  'operator_mod': (block, all, ctx) => ({
    type: 'cb_modulo',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'NUM1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'NUM2', all, ctx), 0),
    },
  }),
  'operator_round': (block, all, ctx) => ({
    type: 'cb_round',
    ...pos(block),
    inputs: { VALUE: shadowNum(getInputValue(block, 'NUM', all, ctx), 0) },
  }),
  'operator_random': (block, all, ctx) => ({
    type: 'cb_random_number',
    ...pos(block),
    inputs: {
      MIN: shadowNum(getInputValue(block, 'FROM', all, ctx), 1),
      MAX: shadowNum(getInputValue(block, 'TO', all, ctx), 10),
    },
  }),
  'operator_gt': (block, all, ctx) => ({
    type: 'cb_greater_than',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'OPERAND1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'OPERAND2', all, ctx), 0),
    },
  }),
  'operator_lt': (block, all, ctx) => ({
    type: 'cb_less_than',
    ...pos(block),
    inputs: {
      A: shadowNum(getInputValue(block, 'OPERAND1', all, ctx), 0),
      B: shadowNum(getInputValue(block, 'OPERAND2', all, ctx), 0),
    },
  }),
  'operator_equals': (block, all, ctx) => ({
    type: 'cb_equals',
    ...pos(block),
    inputs: {
      A: shadowText(getInputValue(block, 'OPERAND1', all, ctx), ''),
      B: shadowText(getInputValue(block, 'OPERAND2', all, ctx), ''),
    },
  }),
  'operator_and': (block, all, ctx) => ({
    type: 'cb_and',
    ...pos(block),
    inputs: {
      A: conditionInput(block, 'OPERAND1', all, ctx),
      B: conditionInput(block, 'OPERAND2', all, ctx),
    },
  }),
  'operator_or': (block, all, ctx) => ({
    type: 'cb_or',
    ...pos(block),
    inputs: {
      A: conditionInput(block, 'OPERAND1', all, ctx),
      B: conditionInput(block, 'OPERAND2', all, ctx),
    },
  }),
  'operator_not': (block, all, ctx) => ({
    type: 'cb_not',
    ...pos(block),
    inputs: {
      VALUE: conditionInput(block, 'OPERAND', all, ctx),
    },
  }),
  'operator_join': (block, all, ctx) => ({
    type: 'cb_join_text',
    ...pos(block),
    inputs: {
      FIRST: shadowText(getInputValue(block, 'STRING1', all, ctx), ''),
      SECOND: shadowText(getInputValue(block, 'STRING2', all, ctx), ''),
    },
  }),
  'operator_length': (block, all, ctx) => ({
    type: 'cb_text_length',
    ...pos(block),
    inputs: {
      TEXT: shadowText(getInputValue(block, 'STRING', all, ctx), ''),
    },
  }),
  'operator_contains': (block, all, ctx) => ({
    type: 'cb_contains',
    ...pos(block),
    inputs: {
      TEXT: shadowText(getInputValue(block, 'STRING1', all, ctx), ''),
      SEARCH: shadowText(getInputValue(block, 'STRING2', all, ctx), ''),
    },
  }),

  // --- Variables ---
  'data_setvariableto': (block, all, ctx) => {
    const varName = block.fields?.VARIABLE?.[0] || 'x'
    return {
      type: 'cb_set_global',
      ...pos(block),
      inputs: {
        NAME: shadowText(varName, 'x'),
        VALUE: shadowText(getInputValue(block, 'VALUE', all, ctx), '0'),
      },
      next: convertNext(block, all, ctx),
    }
  },

  // --- Looks (say = print) ---
  'looks_say': (block, all, ctx) => ({
    type: 'cb_print',
    ...pos(block),
    inputs: {
      VALUE: shadowText(getInputValue(block, 'MESSAGE', all, ctx), 'Hello!'),
    },
    next: convertNext(block, all, ctx),
  }),
  'looks_sayforsecs': (block, all, ctx) => ({
    type: 'cb_print',
    ...pos(block),
    inputs: {
      VALUE: shadowText(getInputValue(block, 'MESSAGE', all, ctx), 'Hello!'),
    },
    next: convertNext(block, all, ctx),
  }),

  // --- Sensing ---
  'sensing_askandwait': (block, all, ctx) => ({
    type: 'cb_ask',
    ...pos(block),
    inputs: {
      QUESTION: shadowText(getInputValue(block, 'QUESTION', all, ctx), 'What is your name?'),
    },
    next: convertNext(block, all, ctx),
  }),

  // --- Lists ---
  'data_addtolist': (block, all, ctx) => {
    const listName = block.fields?.LIST?.[0] || 'myList'
    return {
      type: 'cb_push',
      ...pos(block),
      inputs: {
        NAME: shadowText(listName, 'myList'),
        ITEM: shadowText(getInputValue(block, 'ITEM', all, ctx), ''),
      },
      next: convertNext(block, all, ctx),
    }
  },
  'data_lengthoflist': (block) => {
    const listName = block.fields?.LIST?.[0] || 'myList'
    return {
      type: 'cb_list_length',
      ...pos(block),
      inputs: { NAME: shadowText(listName, 'myList') },
    }
  },
  'data_listcontainsitem': (block, all, ctx) => {
    const listName = block.fields?.LIST?.[0] || 'myList'
    return {
      type: 'cb_list_contains',
      ...pos(block),
      inputs: {
        NAME: shadowText(listName, 'myList'),
        VALUE: shadowText(getInputValue(block, 'ITEM', all, ctx), ''),
      },
    }
  },

  // --- Events (converted to comments since we don't have hat blocks) ---
  'event_whenflagclicked': (block, all, ctx) => ({
    type: 'cb_do',
    ...pos(block),
    inputs: {
      CODE: shadowText('// When green flag clicked', ''),
    },
    next: convertNext(block, all, ctx),
  }),
}

// --- Helpers ---

interface ConvertContext {
  converted: number
  skipped: number
  skippedOpcodes: Set<string>
}

function pos(block: ScratchBlock): { x?: number; y?: number } {
  if (block.topLevel && block.x != null && block.y != null) {
    return { x: block.x, y: block.y }
  }
  return {}
}

function shadowNum(value: unknown, fallback: number): { shadow: CBBlock } {
  const num = typeof value === 'number' ? value : (typeof value === 'string' ? Number(value) || fallback : fallback)
  return { shadow: { type: 'math_number', fields: { NUM: num } } }
}

function shadowText(value: unknown, fallback: string): { shadow: CBBlock } {
  const text = value != null ? String(value) : fallback
  return { shadow: { type: 'text', fields: { TEXT: text } } }
}

function getInputValue(block: ScratchBlock, inputName: string, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext): unknown {
  const input = block.inputs?.[inputName]
  if (!input) return undefined

  // input format: [shadowType, value_or_blockId, ...]
  const val = input[1]

  // Literal value array: [type, value]
  if (Array.isArray(val)) {
    return val[1] // the literal value
  }

  // Block reference (string ID)
  if (typeof val === 'string' && allBlocks[val]) {
    const refBlock = allBlocks[val]
    // If it's a shadow/literal, extract its value
    if (refBlock.shadow) {
      const firstField = Object.values(refBlock.fields || {})[0]
      return firstField?.[0]
    }
    // Otherwise it's a real block — try to convert it
    const converted = convertBlock(val, allBlocks, ctx)
    if (converted) return converted
  }

  return undefined
}

function conditionInput(block: ScratchBlock, inputName: string, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext): Record<string, unknown> {
  const input = block.inputs?.[inputName]
  if (!input) return {}

  const val = input[1]
  if (typeof val === 'string' && allBlocks[val]) {
    const converted = convertBlock(val, allBlocks, ctx)
    if (converted) return { block: converted }
  }
  return {}
}

function statementsInput(inputName: string, block: ScratchBlock, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext): Record<string, { block: CBBlock | null }> {
  const input = block.inputs?.[inputName]
  if (!input) return {}

  const firstBlockId = input[1]
  if (typeof firstBlockId === 'string' && allBlocks[firstBlockId]) {
    const converted = convertBlock(firstBlockId, allBlocks, ctx)
    if (converted) return { [inputName]: { block: converted } }
  }
  return {}
}

function convertNext(block: ScratchBlock, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext): { block: CBBlock | null } | undefined {
  if (!block.next) return undefined
  const nextBlock = convertBlock(block.next, allBlocks, ctx)
  if (nextBlock) return { block: nextBlock }
  return undefined
}

function convertBlock(blockId: string, allBlocks: Record<string, ScratchBlock>, ctx: ConvertContext): CBBlock | null {
  const block = allBlocks[blockId]
  if (!block || block.shadow) return null

  const converter = OPCODE_MAP[block.opcode]
  if (converter) {
    ctx.converted++
    return converter(block, allBlocks, ctx)
  }

  ctx.skipped++
  ctx.skippedOpcodes.add(block.opcode)

  // For unmapped statement blocks, create a comment showing the original opcode
  // and continue the chain
  if (block.next) {
    return {
      type: 'cb_do',
      ...pos(block),
      inputs: {
        CODE: shadowText(`// Scratch: ${block.opcode} (not converted)`, ''),
      },
      next: convertNext(block, allBlocks, ctx),
    }
  }

  return null
}

// --- Main export ---

export async function importScratchFile(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file)
  const projectJson = zip.file('project.json')

  if (!projectJson) {
    throw new Error('Not a valid .sb3 file — missing project.json')
  }

  const projectText = await projectJson.async('text')
  const project: ScratchProject = JSON.parse(projectText)

  const ctx: ConvertContext = {
    converted: 0,
    skipped: 0,
    skippedOpcodes: new Set(),
  }

  const cbBlocks: CBBlock[] = []
  const variables: Array<{ name: string; value: string | number }> = []
  const lists: Array<{ name: string; items: unknown[] }> = []

  let totalScratchBlocks = 0

  for (const target of project.targets) {
    // Extract variables
    for (const [, [name, value]] of Object.entries(target.variables)) {
      variables.push({ name, value: value as string | number })
    }

    // Extract lists
    for (const [, [name, items]] of Object.entries(target.lists)) {
      lists.push({ name, items: items as unknown[] })
    }

    // Count and convert blocks
    const blockEntries = Object.entries(target.blocks)
    totalScratchBlocks += blockEntries.length

    // Only convert top-level blocks (chains start here)
    for (const [id, block] of blockEntries) {
      if (!block.topLevel || block.shadow) continue
      const converted = convertBlock(id, target.blocks, ctx)
      if (converted) {
        cbBlocks.push(converted)
      }
    }
  }

  // Add variable initialization blocks at the top
  let yOffset = 50
  for (const v of variables) {
    cbBlocks.unshift({
      type: 'cb_set_global',
      x: 50,
      y: yOffset,
      inputs: {
        NAME: shadowText(v.name, 'x'),
        VALUE: shadowText(String(v.value), '0'),
      },
    })
    yOffset += 60
  }

  // Add list creation blocks
  for (const l of lists) {
    cbBlocks.unshift({
      type: 'cb_create_list',
      x: 50,
      y: yOffset,
      inputs: {
        NAME: shadowText(l.name, 'myList'),
      },
    })
    yOffset += 60
  }

  return {
    workspace: { blocks: { blocks: cbBlocks } },
    stats: {
      totalScratchBlocks,
      converted: ctx.converted,
      skipped: ctx.skipped,
      skippedOpcodes: Array.from(ctx.skippedOpcodes),
    },
    variables,
    lists,
  }
}
