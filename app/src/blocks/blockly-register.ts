import * as Blockly from 'blockly'
import type { BlockDefinition, Language } from '../types/block'
import { registry } from './registry'
import { isHackerModeActive } from '../easter-eggs/hacker-mode'

function typeToBlocklyField(type: string): string {
  switch (type) {
    case 'number':
      return 'NUM'
    case 'boolean':
      return 'BOOL'
    default:
      return 'TEXT'
  }
}

function typeToBlocklyCheck(type: string): string | null {
  switch (type) {
    case 'number':
      return 'Number'
    case 'boolean':
      return 'Boolean'
    case 'string':
      return 'String'
    default:
      return null
  }
}

// --- Control flow block types ---
const CONTROL_FLOW_BLOCKS = new Set(['cb_if', 'cb_if_else', 'cb_repeat'])

// --- HTML/CSS block types (native Blockly, not registry) ---
const HTML_BLOCKS = new Set([
  'cb_container', 'cb_row', 'cb_column', 'cb_div',
  'cb_heading', 'cb_paragraph', 'cb_image', 'cb_button', 'cb_link',
  'cb_set_style', 'cb_set_color', 'cb_set_background', 'cb_set_size',
  'cb_set_text', 'cb_get_text',
])

function isNativeBlock(type: string): boolean {
  return CONTROL_FLOW_BLOCKS.has(type) || HTML_BLOCKS.has(type)
}

/** Register control flow blocks (IF, IF-ELSE, REPEAT) as native Blockly blocks with statement inputs. */
function registerControlFlowBlocks() {
  // IF (no else)
  Blockly.Blocks['cb_if'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('if')
      this.appendStatementInput('DO')
        .appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks only if the condition is true')
    },
  }

  // IF-ELSE
  Blockly.Blocks['cb_if_else'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('if')
      this.appendStatementInput('DO')
        .appendField('do')
      this.appendStatementInput('ELSE')
        .appendField('else')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks if condition is true, otherwise run else blocks')
    },
  }

  // REPEAT N times
  Blockly.Blocks['cb_repeat'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField('repeat')
      this.appendStatementInput('DO')
        .appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Repeat blocks a number of times')
    },
  }
}

const HTML_COLOR = '#e64553'

/** Register HTML structure + CSS style blocks as native Blockly blocks. */
function registerHtmlBlocks() {
  // --- Container blocks (with CHILDREN statement input) ---

  Blockly.Blocks['cb_container'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Container')
      this.appendValueInput('COLOR').setCheck('String').appendField('background')
      this.appendValueInput('PADDING').setCheck('Number').appendField('padding')
      this.appendStatementInput('CHILDREN').appendField('children')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A div container with background color and padding')
    },
  }

  Blockly.Blocks['cb_row'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Row')
      this.appendValueInput('GAP').setCheck('Number').appendField('gap')
      this.appendStatementInput('CHILDREN').appendField('children')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A flexbox row layout with gap')
    },
  }

  Blockly.Blocks['cb_column'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Column')
      this.appendValueInput('GAP').setCheck('Number').appendField('gap')
      this.appendStatementInput('CHILDREN').appendField('children')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A flexbox column layout with gap')
    },
  }

  Blockly.Blocks['cb_div'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Div')
      this.appendValueInput('CLASS').setCheck('String').appendField('class')
      this.appendStatementInput('CHILDREN').appendField('children')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A div element with a CSS class name')
    },
  }

  // --- Element blocks (statement blocks inside containers) ---

  Blockly.Blocks['cb_heading'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput()
        .appendField('Heading')
        .appendField(new Blockly.FieldDropdown([
          ['H1', '1'], ['H2', '2'], ['H3', '3'],
          ['H4', '4'], ['H5', '5'], ['H6', '6'],
        ]), 'LEVEL')
      this.appendValueInput('TEXT').setCheck('String').appendField('text')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A heading element (H1-H6)')
    },
  }

  Blockly.Blocks['cb_paragraph'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Paragraph')
      this.appendValueInput('TEXT').setCheck('String').appendField('text')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A paragraph element')
    },
  }

  Blockly.Blocks['cb_image'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Image')
      this.appendValueInput('URL').setCheck('String').appendField('url')
      this.appendValueInput('WIDTH').setCheck('Number').appendField('width')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('An image element')
    },
  }

  Blockly.Blocks['cb_button'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Button')
      this.appendValueInput('TEXT').setCheck('String').appendField('text')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A button element — action blocks stacked below become the click handler')
    },
  }

  Blockly.Blocks['cb_link'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Link')
      this.appendValueInput('TEXT').setCheck('String').appendField('text')
      this.appendValueInput('URL').setCheck('String').appendField('url')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('A link that opens in a new tab (target="_blank")')
    },
  }

  // --- CSS/Style blocks ---

  Blockly.Blocks['cb_set_style'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Style')
      this.appendValueInput('PROPERTY').setCheck('String').appendField('property')
      this.appendValueInput('VALUE').setCheck('String').appendField('value')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set any CSS property on the last created element')
    },
  }

  Blockly.Blocks['cb_set_color'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Color')
      this.appendValueInput('COLOR').setCheck('String').appendField('color')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set text color on the last created element')
    },
  }

  Blockly.Blocks['cb_set_background'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Background')
      this.appendValueInput('COLOR').setCheck('String').appendField('color')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set background color on the last created element')
    },
  }

  Blockly.Blocks['cb_set_size'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Size')
      this.appendValueInput('WIDTH').setCheck('Number').appendField('width')
      this.appendValueInput('HEIGHT').setCheck('Number').appendField('height')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set width and height on the last created element')
    },
  }

  // --- Element manipulation blocks ---

  Blockly.Blocks['cb_set_text'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Text')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.appendValueInput('TEXT').setCheck('String').appendField('text')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set the text content of an element by its ID')
    },
  }

  Blockly.Blocks['cb_get_text'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Get Text')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.setOutput(true, 'String')
      this.setTooltip('Get the text content of an element by its ID')
    },
  }
}

// Kid-friendly color palette
const COLOR_PALETTE: [string, string][] = [
  ['Red', '#EF4444'],
  ['Orange', '#F97316'],
  ['Yellow', '#EAB308'],
  ['Green', '#22C55E'],
  ['Blue', '#3B82F6'],
  ['Purple', '#A855F7'],
  ['Pink', '#EC4899'],
  ['Teal', '#14B8A6'],
  ['Sky', '#38BDF8'],
  ['Lime', '#84CC16'],
  ['Coral', '#FB7185'],
  ['Gold', '#FBBF24'],
  ['Brown', '#A16207'],
  ['Gray', '#6B7280'],
  ['Black', '#000000'],
  ['White', '#FFFFFF'],
]

/** Compute relative luminance and return true if the color is light. */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 0.6
}

/** Update text fill on the color block's dropdown to contrast against block color. */
function updateColorBlockText(block: Blockly.Block, hex: string) {
  const textFill = isLightColor(hex) ? '#000' : '#fff'
  const svgRoot = (block as unknown as { getSvgRoot(): SVGGElement | null }).getSvgRoot()
  if (!svgRoot) return
  const texts = svgRoot.querySelectorAll<SVGTextElement>('text.blocklyDropdownText')
  for (const t of texts) {
    t.style.fill = textFill
  }
}

/** Register the color picker value block. */
function registerColorBlock() {
  Blockly.Blocks['cb_color'] = {
    init: function (this: Blockly.Block) {
      this.setColour(0)
      const block = this
      const dropdown = new Blockly.FieldDropdown(
        COLOR_PALETTE.map(([name, hex]) => [name, hex]),
        function (this: Blockly.FieldDropdown, newValue: string) {
          const src = this.getSourceBlock()
          if (src) {
            src.setColour(newValue)
            setTimeout(() => updateColorBlockText(src, newValue), 0)
          }
          return newValue
        }
      )
      this.appendDummyInput().appendField(dropdown, 'COLOR')
      this.setOutput(true, 'String')
      this.setTooltip('Pick a color')
      // Set initial color to match default value
      const initialColor = COLOR_PALETTE[0][1]
      this.setColour(initialColor)
      setTimeout(() => updateColorBlockText(block, initialColor), 0)

      // Re-apply text contrast after workspace loads saved state
      this.setOnChange(function (this: Blockly.Block) {
        const val = this.getFieldValue('COLOR')
        if (val) {
          this.setColour(val)
          updateColorBlockText(this, val)
          // Also defer in case SVG isn't rendered yet
          const self = this
          setTimeout(() => updateColorBlockText(self, val), 50)
        }
      })
    },
  }
}

export function registerCustomBlocks() {
  // Register control flow blocks first
  registerControlFlowBlocks()

  // Register HTML/CSS blocks
  registerHtmlBlocks()

  // Register color picker block
  registerColorBlock()

  const allBlocks = registry.getAll()

  for (const block of allBlocks) {
    const blockType = `cb_${block.name}`

    // Don't overwrite native block definitions (control flow, HTML, color)
    if (isNativeBlock(blockType) || blockType === 'cb_color') continue

    Blockly.Blocks[blockType] = {
      init: function (this: Blockly.Block) {
        this.setColour(block.color)
        this.setTooltip(block.description)

        // Add block name as label
        this.appendDummyInput().appendField(
          block.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        )

        // Add inputs
        for (const input of block.inputs) {
          if (input.choices && input.choices.length > 0) {
            // Dropdown field — value is built into the block
            const options: [string, string][] = input.choices.map((c) => [c, c])
            this.appendDummyInput()
              .appendField(input.name.replace(/_/g, ' '))
              .appendField(new Blockly.FieldDropdown(options), input.name)
          } else {
            const check = typeToBlocklyCheck(input.type)
            const inputObj = this.appendValueInput(input.name)
            inputObj.appendField(input.name.replace(/_/g, ' '))
            if (check) inputObj.setCheck(check)
          }
        }

        // Add output or set as statement based on shape override or outputs
        const isValue = block.shape === 'value' || (!block.shape && block.outputs.length > 0)
        if (isValue) {
          const outCheck = block.outputs.length > 0 ? typeToBlocklyCheck(block.outputs[0].type) : null
          this.setOutput(true, outCheck)
        } else {
          this.setPreviousStatement(true, null)
          this.setNextStatement(true, null)
        }
      },
    }
  }
}

export function registerSingleBlock(block: BlockDefinition) {
  const blockType = `cb_${block.name}`

  Blockly.Blocks[blockType] = {
    init: function (this: Blockly.Block) {
      this.setColour(block.color)
      this.setTooltip(block.description)

      this.appendDummyInput().appendField(
        block.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      )

      for (const input of block.inputs) {
        if (input.choices && input.choices.length > 0) {
          const options: [string, string][] = input.choices.map((c) => [c, c])
          this.appendDummyInput()
            .appendField(input.name.replace(/_/g, ' '))
            .appendField(new Blockly.FieldDropdown(options), input.name)
        } else {
          const check = typeToBlocklyCheck(input.type)
          const inputObj = this.appendValueInput(input.name)
          inputObj.appendField(input.name.replace(/_/g, ' '))
          if (check) inputObj.setCheck(check)
        }
      }

      const isValue = block.shape === 'value' || (!block.shape && block.outputs.length > 0)
      if (isValue) {
        const outCheck = block.outputs.length > 0 ? typeToBlocklyCheck(block.outputs[0].type) : null
        this.setOutput(true, outCheck)
      } else {
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
      }
    },
  }
}

export function unregisterBlock(name: string) {
  const blockType = `cb_${name}`
  delete Blockly.Blocks[blockType]
}

export function generateCode(workspace: Blockly.Workspace, language: Language): string {
  const topBlocks = workspace.getTopBlocks(true)
  const lines: string[] = []

  if (language === 'javascript') {
    lines.push('// Generated by CryptoBlocks')
    lines.push('')
  } else {
    lines.push('# Generated by CryptoBlocks')
    lines.push('')
  }

  // Collect all used block definitions and detect HTML blocks
  const usedBlocks = new Set<string>()
  let usesHtml = false
  function collectBlocks(block: Blockly.Block) {
    if (HTML_BLOCKS.has(block.type)) usesHtml = true
    // Skip builtins and native blocks — they don't have registry defs
    if (!isBuiltinBlock(block.type) && !isNativeBlock(block.type)) {
      const name = block.type.replace('cb_', '')
      usedBlocks.add(name)
    }
    // Recurse into all inputs (value + statement inputs)
    for (const input of block.inputList) {
      if (input.connection) {
        const connected = input.connection.targetBlock()
        if (connected) collectBlocks(connected)
      }
    }
    const next = block.getNextBlock()
    if (next) collectBlocks(next)
  }
  topBlocks.forEach(collectBlocks)

  // Add HTML runtime preamble if any HTML blocks are used
  if (usesHtml && language === 'javascript') {
    lines.push('// --- HTML Setup ---')
    lines.push('// Wait for DOM to be ready (script runs in <head>)')
    lines.push('await new Promise(function(r) { setTimeout(r, 0); });')
    lines.push('var __page = document.getElementById(\'cb-page\');')
    lines.push('if (!__page) { __page = document.createElement(\'div\'); __page.id = \'cb-page\'; document.body.appendChild(__page); }')
    lines.push('__page.style.display = \'block\';')
    lines.push('var __parentStack = [__page];')
    lines.push('var __currentParent = function() { return __parentStack[__parentStack.length - 1]; };')
    lines.push('var __lastEl = null;')
    lines.push('')
  }

  // Add function definitions for used blocks
  if (language === 'javascript') {
    lines.push('// --- Block Definitions ---')
  } else {
    lines.push('# --- Block Definitions ---')
  }

  for (const name of usedBlocks) {
    const def = registry.get(name)
    if (def) {
      lines.push(def.implementations[language as 'javascript' | 'python'])
      lines.push('')
    }
  }

  // Generate the execution code
  if (language === 'javascript') {
    lines.push('// --- Program ---')
  } else {
    lines.push('# --- Program ---')
  }

  for (const topBlock of topBlocks) {
    lines.push(generateBlockCode(topBlock, language))
  }

  return lines.join('\n')
}

function generateBuiltinCode(block: Blockly.Block, language: Language): string | null {
  switch (block.type) {
    case 'text':
      return JSON.stringify(block.getFieldValue('TEXT') ?? '')
    case 'math_number':
      return String(block.getFieldValue('NUM') ?? 0)
    case 'logic_boolean':
      const val = block.getFieldValue('BOOL') === 'TRUE'
      return language === 'javascript' ? String(val) : (val ? 'True' : 'False')
    case 'cb_color':
      return JSON.stringify(block.getFieldValue('COLOR') ?? '#EF4444')
    default:
      return null
  }
}

function isBuiltinBlock(type: string): boolean {
  return ['text', 'math_number', 'logic_boolean', 'cb_color'].includes(type)
}

/** Indent every line of code by a given amount. */
function indent(code: string, language: Language): string {
  const pad = language === 'javascript' ? '  ' : '    '
  return code.split('\n').map(l => pad + l).join('\n')
}

/** Generate code for all blocks inside a statement input. */
function generateStatementCode(block: Blockly.Block, inputName: string, language: Language): string {
  const first = block.getInputTargetBlock(inputName)
  if (!first) return ''
  return generateBlockCode(first, language)
}

/**
 * Generate code for control flow blocks (if, if-else, repeat).
 * These use Blockly statement inputs instead of value-based function calls.
 * Returns null if the block is not a control flow block.
 */
function generateControlFlowCode(block: Blockly.Block, language: Language): string | null {
  switch (block.type) {
    case 'cb_if': {
      const condBlock = block.getInputTargetBlock('CONDITION')
      const condition = condBlock
        ? generateBlockCode(condBlock, language)
        : (language === 'javascript' ? 'false' : 'False')
      const body = generateStatementCode(block, 'DO', language)

      if (language === 'javascript') {
        if (!body) return `if (${condition}) {}`
        return `if (${condition}) {\n${indent(body, language)}\n}`
      } else {
        if (!body) return `if ${condition}:\n    pass`
        return `if ${condition}:\n${indent(body, language)}`
      }
    }

    case 'cb_if_else': {
      const condBlock = block.getInputTargetBlock('CONDITION')
      const condition = condBlock
        ? generateBlockCode(condBlock, language)
        : (language === 'javascript' ? 'false' : 'False')
      const doBody = generateStatementCode(block, 'DO', language)
      const elseBody = generateStatementCode(block, 'ELSE', language)

      if (language === 'javascript') {
        const doPart = doBody ? indent(doBody, language) : '  // ...'
        const elsePart = elseBody ? indent(elseBody, language) : '  // ...'
        return `if (${condition}) {\n${doPart}\n} else {\n${elsePart}\n}`
      } else {
        const doPart = doBody ? indent(doBody, language) : '    pass'
        const elsePart = elseBody ? indent(elseBody, language) : '    pass'
        return `if ${condition}:\n${doPart}\nelse:\n${elsePart}`
      }
    }

    case 'cb_repeat': {
      const timesBlock = block.getInputTargetBlock('TIMES')
      const times = timesBlock
        ? generateBlockCode(timesBlock, language)
        : '0'
      const body = generateStatementCode(block, 'DO', language)

      if (language === 'javascript') {
        if (!body) return `for (var __i = 0; __i < ${times}; __i++) {}`
        return `for (var __i = 0; __i < ${times}; __i++) {\n${indent(body, language)}\n}`
      } else {
        if (!body) return `for _ in range(int(${times})):\n    pass`
        return `for _ in range(int(${times})):\n${indent(body, language)}`
      }
    }

    default:
      return null
  }
}

/** Helper to get a value input or a default string for HTML code gen. */
function htmlVal(block: Blockly.Block, inputName: string, fallback: string, language: Language): string {
  const target = block.getInputTargetBlock(inputName)
  return target ? generateBlockCode(target, language) : fallback
}

/**
 * Generate code for HTML structure and CSS style blocks.
 * Returns null if the block is not an HTML/CSS block.
 */
function generateHtmlCode(block: Blockly.Block, language: Language): string | null {
  if (!HTML_BLOCKS.has(block.type)) return null

  // HTML blocks only work in JavaScript
  if (language !== 'javascript') {
    const label = block.type.replace('cb_', '').replace(/_/g, ' ')
    return `# HTML block "${label}" is only available in JavaScript mode`
  }

  switch (block.type) {
    // --- Container blocks ---
    case 'cb_container': {
      const color = htmlVal(block, 'COLOR', '"transparent"', language)
      const padding = htmlVal(block, 'PADDING', '8', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.background = ${color};\n  __el.style.padding = ${padding} + 'px';\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_row': {
      const gap = htmlVal(block, 'GAP', '8', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.display = 'flex';\n  __el.style.flexDirection = 'row';\n  __el.style.gap = ${gap} + 'px';\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_column': {
      const gap = htmlVal(block, 'GAP', '8', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.display = 'flex';\n  __el.style.flexDirection = 'column';\n  __el.style.gap = ${gap} + 'px';\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_div': {
      const cls = htmlVal(block, 'CLASS', '""', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  if (${cls}) __el.className = ${cls};\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    // --- Element blocks ---
    case 'cb_heading': {
      const level = block.getFieldValue('LEVEL') ?? '1'
      const text = htmlVal(block, 'TEXT', '"Heading"', language)
      const id = htmlVal(block, 'ID', '""', language)
      let code = `(function() {\n  var __el = document.createElement('h${level}');\n  __el.textContent = ${text};`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
      return code
    }

    case 'cb_paragraph': {
      const text = htmlVal(block, 'TEXT', '"Paragraph text"', language)
      const id = htmlVal(block, 'ID', '""', language)
      let code = `(function() {\n  var __el = document.createElement('p');\n  __el.textContent = ${text};`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
      return code
    }

    case 'cb_image': {
      const url = htmlVal(block, 'URL', '"https://picsum.photos/200/300"', language)
      const width = htmlVal(block, 'WIDTH', '150', language)
      return `(function() {\n  var __el = document.createElement('img');\n  __el.src = ${url};\n  __el.style.width = ${width} + 'px';\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
    }

    case 'cb_button': {
      const text = htmlVal(block, 'TEXT', '"Click me"', language)
      const id = htmlVal(block, 'ID', '""', language)
      let code = `(function() {\n  var __el = document.createElement('button');\n  __el.textContent = ${text};\n  __el.style.padding = '8px 16px';\n  __el.style.cursor = 'pointer';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
      return code
    }

    case 'cb_link': {
      const text = htmlVal(block, 'TEXT', '"Link"', language)
      const url = htmlVal(block, 'URL', '"#"', language)
      return `(function() {\n  var __el = document.createElement('a');\n  __el.textContent = ${text};\n  __el.href = ${url};\n  __el.target = '_blank';\n  __el.rel = 'noopener noreferrer';\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
    }

    // --- CSS/Style blocks ---
    case 'cb_set_style': {
      const prop = htmlVal(block, 'PROPERTY', '"color"', language)
      const val = htmlVal(block, 'VALUE', '"black"', language)
      return `if (__lastEl) { __lastEl.style[${prop}] = ${val}; }`
    }

    case 'cb_set_color': {
      const color = htmlVal(block, 'COLOR', '"black"', language)
      return `if (__lastEl) { __lastEl.style.color = ${color}; }`
    }

    case 'cb_set_background': {
      const color = htmlVal(block, 'COLOR', '"white"', language)
      return `if (__lastEl) { __lastEl.style.background = ${color}; }`
    }

    case 'cb_set_size': {
      const w = htmlVal(block, 'WIDTH', '100', language)
      const h = htmlVal(block, 'HEIGHT', '100', language)
      return `if (__lastEl) { __lastEl.style.width = ${w} + 'px'; __lastEl.style.height = ${h} + 'px'; }`
    }

    // --- Element manipulation by ID ---
    case 'cb_set_text': {
      const id = htmlVal(block, 'ID', '""', language)
      const text = htmlVal(block, 'TEXT', '""', language)
      return `(function() { var __target = document.getElementById(${id}); if (__target) __target.textContent = ${text}; })()`
    }

    case 'cb_get_text': {
      const id = htmlVal(block, 'ID', '""', language)
      return `(function() { var __target = document.getElementById(${id}); return __target ? __target.textContent : ""; })()`
    }

    default:
      return null
  }
}

/** Blocks consumed by a button's onclick — skip them in the normal chain. */
const _consumedByButton = new WeakSet<Blockly.Block>()

function generateBlockCode(block: Blockly.Block, language: Language): string {
  // Skip blocks already consumed as a button onclick handler
  if (_consumedByButton.has(block)) {
    const nextBlock = block.getNextBlock()
    return nextBlock ? generateBlockCode(nextBlock, language) : ''
  }

  // Handle built-in Blockly value blocks first
  const builtin = generateBuiltinCode(block, language)
  if (builtin !== null) return builtin

  // Handle control flow blocks (if, if-else, repeat)
  const controlFlow = generateControlFlowCode(block, language)
  if (controlFlow !== null) {
    let code = controlFlow
    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle HTML/CSS blocks
  const htmlCode = generateHtmlCode(block, language)
  if (htmlCode !== null) {
    let code = htmlCode
    // Make IIFEs async when they contain await calls
    if (code.includes('await ') && code.includes('(function()')) {
      code = code.replace(/\(function\(\)/g, '(async function()')
    }
    code = code.endsWith(')') ? code + ';' : code
    let nextBlock = block.getNextBlock()

    // Button auto-onclick: absorb all consecutive action (registry) blocks
    // into the button's onclick handler instead of running them inline.
    if (block.type === 'cb_button' && nextBlock && !isNativeBlock(nextBlock.type) && !isBuiltinBlock(nextBlock.type)) {
      const calls: string[] = []
      let hasAsync = false
      let cursor: Blockly.Block | null = nextBlock

      while (cursor && !HTML_BLOCKS.has(cursor.type) && !isBuiltinBlock(cursor.type)) {
        // Handle control flow blocks (if, if-else, repeat) inside onclick
        if (CONTROL_FLOW_BLOCKS.has(cursor.type)) {
          _consumedByButton.add(cursor)
          const cfCode = generateControlFlowCode(cursor, language)
          if (cfCode) {
            for (const line of cfCode.split('\n')) {
              calls.push(`    ${line}`)
            }
          }
          cursor = cursor.getNextBlock()
          continue
        }

        const actionName = cursor.type.replace('cb_', '')
        const actionDef = registry.get(actionName)
        if (!actionDef) break

        _consumedByButton.add(cursor)

        const fnName = extractFunctionName(actionDef, language)
        const args: string[] = []
        for (const input of actionDef.inputs) {
          if (input.choices && input.choices.length > 0) {
            const val = cursor.getFieldValue(input.name) ?? input.choices[0]
            args.push(`"${val}"`)
            continue
          }
          const inputBlock = cursor.getInputTargetBlock(input.name)
          if (inputBlock) {
            args.push(generateBlockCode(inputBlock, language))
          } else {
            const defaultVal = input.default
            if (defaultVal !== undefined) {
              args.push(typeof defaultVal === 'string' ? `"${defaultVal}"` : String(defaultVal))
            } else {
              switch (input.type) {
                case 'string': args.push('""'); break
                case 'number': args.push('0'); break
                case 'boolean': args.push(language === 'javascript' ? 'false' : 'False'); break
                default: args.push(language === 'javascript' ? 'null' : 'None')
              }
            }
          }
        }

        const actionIsAsync = actionDef.implementations[language as 'javascript' | 'python'].trimStart().startsWith('async ')
        // Also check if any argument code contains await (nested async calls)
        const argsHaveAwait = args.some(a => a.includes('await '))
        if (actionIsAsync || argsHaveAwait) hasAsync = true
        const call = actionIsAsync ? `await ${fnName}(${args.join(', ')})` : `${fnName}(${args.join(', ')})`
        calls.push(`    ${call};`)

        cursor = cursor.getNextBlock()
      }

      if (calls.length > 0) {
        const fnKeyword = hasAsync ? 'async function' : 'function'
        const body = calls.join('\n')
        code = code.replace(
          `__lastEl = __el;\n})();`,
          `__el.onclick = ${fnKeyword}() {\n${body}\n  };\n  __lastEl = __el;\n})();`
        )
        nextBlock = cursor
      }
    }

    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Registry-based blocks
  const name = block.type.replace('cb_', '')
  const def = registry.get(name)

  if (!def) {
    const comment = language === 'javascript' ? '//' : '#'
    return `${comment} Unknown block: ${name}`
  }

  // Get the function name from the implementation
  const fnName = extractFunctionName(def, language)

  // Build arguments from connected inputs
  const args: string[] = []
  for (const input of def.inputs) {
    // Dropdown fields — read value directly from the block field
    if (input.choices && input.choices.length > 0) {
      const val = block.getFieldValue(input.name) ?? input.choices[0]
      args.push(`"${val}"`)
      continue
    }

    const inputBlock = block.getInputTargetBlock(input.name)
    if (inputBlock) {
      args.push(generateBlockCode(inputBlock, language))
    } else {
      // Use default or placeholder
      const defaultVal = input.default
      if (defaultVal !== undefined) {
        args.push(typeof defaultVal === 'string' ? `"${defaultVal}"` : String(defaultVal))
      } else {
        switch (input.type) {
          case 'string':
            args.push('""')
            break
          case 'number':
            args.push('0')
            break
          case 'boolean':
            args.push(language === 'javascript' ? 'false' : 'False')
            break
          default:
            args.push(language === 'javascript' ? 'null' : 'None')
        }
      }
    }
  }

  const isAsync = def.implementations[language as 'javascript' | 'python'].trimStart().startsWith('async ')
  let code = isAsync ? `await ${fnName}(${args.join(', ')})` : `${fnName}(${args.join(', ')})`

  // If this is a statement block, make it a standalone call
  const isStatement = def.shape === 'statement' || (!def.shape && def.outputs.length === 0)
  if (isStatement) {
    code += language === 'javascript' ? ';' : ''
  }

  // Handle chained (next) blocks
  const nextBlock = block.getNextBlock()
  if (nextBlock) {
    code += '\n' + generateBlockCode(nextBlock, language)
  }

  return code
}

function extractFunctionName(def: BlockDefinition, language: Language): string {
  const code = def.implementations[language as 'javascript' | 'python']
  if (language === 'javascript') {
    const match = code.match(/function\s+(\w+)/)
    return match ? match[1] : def.name
  } else {
    const match = code.match(/def\s+(\w+)/)
    return match ? match[1] : def.name
  }
}

/** Inject control flow blocks into a toolbox category XML string. */
function controlFlowToolboxXml(cat: string): string {
  if (cat !== 'Logic') return ''
  return (
    '<block type="cb_if"></block>' +
    '<block type="cb_if_else"></block>' +
    '<block type="cb_repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>' +
    '<sep gap="20"></sep>'
  )
}

/** Generate shadow XML for a block input. Uses cb_color for color-named inputs. */
function inputShadowXml(input: { name: string; type: string; default?: string | number | boolean; choices?: string[] }): string {
  // Dropdown fields don't need shadow blocks — value is built into the block
  if (input.choices && input.choices.length > 0) return ''
  if (input.default === undefined) return ''
  const fieldType = typeToBlocklyField(input.type)
  let shadow = `<value name="${input.name}">`
  if (input.type === 'string' && input.name.toLowerCase() === 'color') {
    // Use color picker for inputs named "color"
    shadow += `<shadow type="cb_color"><field name="COLOR">#EF4444</field></shadow>`
  } else if (input.type === 'number') {
    shadow += `<shadow type="math_number"><field name="${fieldType}">${input.default}</field></shadow>`
  } else if (input.type === 'string') {
    shadow += `<shadow type="text"><field name="${fieldType}">${input.default}</field></shadow>`
  }
  shadow += '</value>'
  return shadow
}

/** Generate the HTML toolbox category with structure + CSS blocks. */
function htmlToolboxXml(): string {
  const hue = hexToHue(HTML_COLOR)
  let xml = `<category name="HTML" colour="${hue}">`

  // Structure blocks
  xml += '<block type="cb_container">'
  xml += '<value name="COLOR"><shadow type="cb_color"><field name="COLOR">#FFFFFF</field></shadow></value>'
  xml += '<value name="PADDING"><shadow type="math_number"><field name="NUM">16</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_row">'
  xml += '<value name="GAP"><shadow type="math_number"><field name="NUM">8</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_column">'
  xml += '<value name="GAP"><shadow type="math_number"><field name="NUM">8</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_div">'
  xml += '<value name="CLASS"><shadow type="text"><field name="TEXT">my-class</field></shadow></value>'
  xml += '</block>'

  xml += '<sep gap="12"></sep>'

  // Element blocks
  xml += '<block type="cb_heading">'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">Hello World</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_paragraph">'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">Some text here</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_image">'
  xml += '<value name="URL"><shadow type="text"><field name="TEXT">https://picsum.photos/200/300</field></shadow></value>'
  xml += '<value name="WIDTH"><shadow type="math_number"><field name="NUM">150</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_button">'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">Click me</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_link">'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">Visit site</field></shadow></value>'
  xml += '<value name="URL"><shadow type="text"><field name="TEXT">https://example.com</field></shadow></value>'
  xml += '</block>'

  xml += '<sep gap="12"></sep>'

  // CSS/Style blocks
  xml += '<block type="cb_set_style">'
  xml += '<value name="PROPERTY"><shadow type="text"><field name="TEXT">color</field></shadow></value>'
  xml += '<value name="VALUE"><shadow type="text"><field name="TEXT">red</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_set_color">'
  xml += '<value name="COLOR"><shadow type="cb_color"><field name="COLOR">#000000</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_set_background">'
  xml += '<value name="COLOR"><shadow type="cb_color"><field name="COLOR">#3B82F6</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_set_size">'
  xml += '<value name="WIDTH"><shadow type="math_number"><field name="NUM">200</field></shadow></value>'
  xml += '<value name="HEIGHT"><shadow type="math_number"><field name="NUM">100</field></shadow></value>'
  xml += '</block>'

  xml += '<sep gap="20"></sep>'

  xml += '<block type="cb_set_text">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-id</field></shadow></value>'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">New text</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_get_text">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-id</field></shadow></value>'
  xml += '</block>'

  xml += '</category>'
  return xml
}

export function getToolboxXml(): string {
  const categories = registry.getCategories()
  let xml = '<xml>'

  for (const cat of categories) {
    // Hide ??? category unless hacker mode is active
    if (cat === '???' && !isHackerModeActive()) continue

    const blocks = registry.getByCategory(cat)
    const color = registry.getCategoryColor(cat)
    // Convert hex color to Blockly hue (0-360)
    const hue = hexToHue(color)
    xml += `<category name="${cat}" colour="${hue}">`

    // Add control flow blocks at the top of the Logic category
    xml += controlFlowToolboxXml(cat)

    for (const block of blocks) {
      xml += `<block type="cb_${block.name}">`
      for (const input of block.inputs) {
        xml += inputShadowXml(input)
      }
      xml += `</block>`
    }

    xml += '</category>'
  }

  // Add HTML category
  xml += htmlToolboxXml()

  // Add built-in Blockly blocks for values
  xml += '<sep></sep>'
  xml += '<category name="Values" colour="230">'
  xml += '<block type="math_number"><field name="NUM">0</field></block>'
  xml += '<block type="text"><field name="TEXT">hello</field></block>'
  xml += '<block type="logic_boolean"><field name="BOOL">TRUE</field></block>'
  xml += '<block type="cb_color"><field name="COLOR">#EF4444</field></block>'
  xml += '</category>'

  xml += '</xml>'
  return xml
}

export function getFilteredToolboxXml(allowedCategories: string[]): string {
  const categories = registry.getCategories()
  let xml = '<xml>'

  for (const cat of categories) {
    if (!allowedCategories.includes(cat)) continue

    const blocks = registry.getByCategory(cat)
    const color = registry.getCategoryColor(cat)
    const hue = hexToHue(color)
    xml += `<category name="${cat}" colour="${hue}">`

    // Add control flow blocks at the top of the Logic category
    xml += controlFlowToolboxXml(cat)

    for (const block of blocks) {
      xml += `<block type="cb_${block.name}">`
      for (const input of block.inputs) {
        xml += inputShadowXml(input)
      }
      xml += `</block>`
    }

    xml += '</category>'
  }

  // Add HTML category if allowed
  if (allowedCategories.includes('HTML')) {
    xml += htmlToolboxXml()
  }

  // Always include Values category
  xml += '<sep></sep>'
  xml += '<category name="Values" colour="230">'
  xml += '<block type="math_number"><field name="NUM">0</field></block>'
  xml += '<block type="text"><field name="TEXT">hello</field></block>'
  xml += '<block type="logic_boolean"><field name="BOOL">TRUE</field></block>'
  xml += '<block type="cb_color"><field name="COLOR">#EF4444</field></block>'
  xml += '</category>'

  xml += '</xml>'
  return xml
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0

  if (max !== min) {
    const d = max - min
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return Math.round(h * 360)
}

/**
 * Generate HTML markup from workspace blocks.
 * Only renders HTML/CSS blocks; non-HTML blocks are shown as comments.
 */
export function generateHtmlMarkup(workspace: Blockly.Workspace): string {
  const topBlocks = workspace.getTopBlocks(true)
  const lines: string[] = []
  lines.push('<!-- Generated by CryptoBlocks -->')

  for (const topBlock of topBlocks) {
    lines.push(generateHtmlMarkupForBlock(topBlock))
  }

  return lines.join('\n')
}

/** Escape HTML entities to prevent XSS in generated markup. */
function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function getTextValue(block: Blockly.Block, inputName: string, fallback: string): string {
  const target = block.getInputTargetBlock(inputName)
  if (!target) return escapeHtmlAttr(fallback)
  if (target.type === 'text') return escapeHtmlAttr(target.getFieldValue('TEXT') ?? fallback)
  if (target.type === 'math_number') return escapeHtmlAttr(String(target.getFieldValue('NUM') ?? fallback))
  if (target.type === 'cb_color') return escapeHtmlAttr(target.getFieldValue('COLOR') ?? fallback)
  return escapeHtmlAttr(fallback)
}

function generateHtmlMarkupForBlock(block: Blockly.Block): string {
  const childMarkup = (inputName: string): string => {
    const first = block.getInputTargetBlock(inputName)
    if (!first) return ''
    return generateHtmlMarkupForBlock(first)
  }

  const indentHtml = (html: string): string =>
    html.split('\n').map(l => '  ' + l).join('\n')

  let result = ''

  switch (block.type) {
    case 'cb_container': {
      const bg = getTextValue(block, 'COLOR', 'transparent')
      const pad = getTextValue(block, 'PADDING', '8')
      const children = childMarkup('CHILDREN')
      result = `<div style="background: ${bg}; padding: ${pad}px;">`
      if (children) result += '\n' + indentHtml(children) + '\n'
      result += '</div>'
      break
    }
    case 'cb_row': {
      const gap = getTextValue(block, 'GAP', '8')
      const children = childMarkup('CHILDREN')
      result = `<div style="display: flex; flex-direction: row; gap: ${gap}px;">`
      if (children) result += '\n' + indentHtml(children) + '\n'
      result += '</div>'
      break
    }
    case 'cb_column': {
      const gap = getTextValue(block, 'GAP', '8')
      const children = childMarkup('CHILDREN')
      result = `<div style="display: flex; flex-direction: column; gap: ${gap}px;">`
      if (children) result += '\n' + indentHtml(children) + '\n'
      result += '</div>'
      break
    }
    case 'cb_div': {
      const cls = getTextValue(block, 'CLASS', '')
      const children = childMarkup('CHILDREN')
      result = cls ? `<div class="${cls}">` : '<div>'
      if (children) result += '\n' + indentHtml(children) + '\n'
      result += '</div>'
      break
    }
    case 'cb_heading': {
      const level = block.getFieldValue('LEVEL') ?? '1'
      const text = getTextValue(block, 'TEXT', 'Heading')
      result = `<h${level}>${text}</h${level}>`
      break
    }
    case 'cb_paragraph': {
      const text = getTextValue(block, 'TEXT', 'Paragraph text')
      result = `<p>${text}</p>`
      break
    }
    case 'cb_image': {
      const url = getTextValue(block, 'URL', '')
      const width = getTextValue(block, 'WIDTH', '150')
      result = `<img src="${url}" style="width: ${width}px;" />`
      break
    }
    case 'cb_button': {
      const text = getTextValue(block, 'TEXT', 'Click me')
      result = `<button>${text}</button>`
      break
    }
    case 'cb_link': {
      const text = getTextValue(block, 'TEXT', 'Link')
      const url = getTextValue(block, 'URL', '#')
      result = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      break
    }
    case 'cb_set_style': {
      const prop = getTextValue(block, 'PROPERTY', 'color')
      const val = getTextValue(block, 'VALUE', 'black')
      result = `<!-- set-style: ${prop}: ${val} -->`
      break
    }
    case 'cb_set_color': {
      const color = getTextValue(block, 'COLOR', 'black')
      result = `<!-- set-color: ${color} -->`
      break
    }
    case 'cb_set_background': {
      const color = getTextValue(block, 'COLOR', 'white')
      result = `<!-- set-background: ${color} -->`
      break
    }
    case 'cb_set_size': {
      const w = getTextValue(block, 'WIDTH', '100')
      const h = getTextValue(block, 'HEIGHT', '100')
      result = `<!-- set-size: ${w}x${h} -->`
      break
    }
    case 'cb_set_text': {
      const id = getTextValue(block, 'ID', '')
      const text = getTextValue(block, 'TEXT', '')
      result = `<!-- set-text #${id}: "${text}" -->`
      break
    }
    case 'cb_get_text': {
      const id = getTextValue(block, 'ID', '')
      result = `<!-- get-text #${id} -->`
      break
    }
    default: {
      const name = block.type.replace('cb_', '').replace(/_/g, ' ')
      result = `<!-- ${name} (non-HTML block) -->`
    }
  }

  const next = block.getNextBlock()
  if (next) {
    result += '\n' + generateHtmlMarkupForBlock(next)
  }

  return result
}

/**
 * Generate code for a single block tree (block + all children/next).
 * Used by "Save as Block" to generate the implementation code.
 */
export function generateBlockTreeCode(block: Blockly.Block, language: Language): string {
  const lines: string[] = []

  // Collect used registry blocks
  const usedBlocks = new Set<string>()
  function collectUsed(b: Blockly.Block) {
    if (!isBuiltinBlock(b.type) && !isNativeBlock(b.type)) {
      usedBlocks.add(b.type.replace('cb_', ''))
    }
    for (const input of b.inputList) {
      if (input.connection) {
        const connected = input.connection.targetBlock()
        if (connected) collectUsed(connected)
      }
    }
    const next = b.getNextBlock()
    if (next) collectUsed(next)
  }
  collectUsed(block)

  // Add function definitions
  for (const name of usedBlocks) {
    const def = registry.get(name)
    if (def) {
      lines.push(def.implementations[language as 'javascript' | 'python'])
      lines.push('')
    }
  }

  // Generate the block code
  lines.push(generateBlockCode(block, language))

  return lines.join('\n')
}
