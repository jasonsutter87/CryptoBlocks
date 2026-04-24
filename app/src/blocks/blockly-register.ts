import * as Blockly from 'blockly'
import { FieldMultilineInput } from '@blockly/field-multilineinput'
import { compileString } from 'sass'
import type { BlockDefinition, Language } from '../types/block'
import { registry } from './registry'
import { blockLabel, t } from '../i18n'
import { isHackerModeActive } from '../easter-eggs/hacker-mode'
import { loadSettings, BLOCK_TIERS } from '../settings'

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
const CONTROL_FLOW_BLOCKS = new Set(['cb_if', 'cb_if_else', 'cb_repeat', 'cb_count_from', 'cb_loop_index', 'cb_while', 'cb_break', 'cb_continue'])

// --- HTML/CSS block types (native Blockly, not registry) ---
const HTML_BLOCKS = new Set([
  'cb_container', 'cb_row', 'cb_column', 'cb_div',
  'cb_heading', 'cb_paragraph', 'cb_image', 'cb_button', 'cb_link',
  'cb_set_style', 'cb_set_color', 'cb_set_background', 'cb_set_size',
  'cb_set_attribute', 'cb_set_attribute_by_id',
  'cb_set_text', 'cb_get_text', 'cb_clicked_id',
  'cb_scss_style',
])

// --- Function block types ---
const FUNCTION_BLOCKS = new Set(['cb_create_function', 'cb_call_function', 'cb_call_function_return'])

// --- Event block types ---
const EVENT_BLOCKS = new Set(['cb_when_key_pressed', 'cb_when_clicked', 'cb_game_loop'])

// --- Annotation block types ---
const ANNOTATION_BLOCKS = new Set(['cb_callout', 'cb_inline_comment', 'cb_frame'])

// --- Library block types ---
const LIBRARY_BLOCKS = new Set(['cb_import_library', 'cb_import_prank'])

// --- Vision block types ---
const VISION_BLOCKS = new Set(['cb_animation_loop'])

// --- Logic block types (native, with mutators) ---
const LOGIC_BLOCKS = new Set(['cb_switch_value'])

function isNativeBlock(type: string): boolean {
  return CONTROL_FLOW_BLOCKS.has(type) || HTML_BLOCKS.has(type) || FUNCTION_BLOCKS.has(type) || EVENT_BLOCKS.has(type) || ANNOTATION_BLOCKS.has(type) || LIBRARY_BLOCKS.has(type) || VISION_BLOCKS.has(type) || LOGIC_BLOCKS.has(type)
}

/** Register control flow blocks (IF, IF-ELSE, REPEAT) as native Blockly blocks with statement inputs. */
function registerControlFlowBlocks() {
  // IF (no else)
  Blockly.Blocks['cb_if'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(t('if'))
      this.appendStatementInput('DO')
        .appendField(t('do'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip(t('Run blocks only if the condition is true'))
    },
  }

  // IF-ELSE
  Blockly.Blocks['cb_if_else'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(t('if'))
      this.appendStatementInput('DO')
        .appendField(t('do'))
      this.appendStatementInput('ELSE')
        .appendField(t('else'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip(t('Run blocks if condition is true, otherwise run else blocks'))
    },
  }

  // REPEAT N times
  Blockly.Blocks['cb_repeat'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField(t('repeat'))
      this.appendStatementInput('DO')
        .appendField(t('do'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip(t('Repeat blocks a number of times'))
    },
  }

  // COUNT FROM / TO / BY — custom for loop with start, end, step
  Blockly.Blocks['cb_count_from'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('FROM')
        .setCheck('Number')
        .appendField(t('count from'))
      this.appendValueInput('TO')
        .setCheck('Number')
        .appendField(t('to'))
      this.appendValueInput('BY')
        .setCheck('Number')
        .appendField(t('by'))
      this.appendStatementInput('DO')
        .appendField(t('do'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip(t('Count from a start to an end value with a custom step. Use negative step to count backwards.'))
    },
  }

  // WHILE loop
  Blockly.Blocks['cb_while'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(t('while'))
      this.appendStatementInput('DO')
        .appendField(t('do'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip(t('Keep running blocks while the condition is true'))
    },
  }

  // BREAK
  Blockly.Blocks['cb_break'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendDummyInput().appendField(t('break'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(false, null)
      this.setTooltip(t('Exit the loop immediately'))
    },
  }

  // CONTINUE
  Blockly.Blocks['cb_continue'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendDummyInput().appendField(t('continue'))
      this.setPreviousStatement(true, null)
      this.setNextStatement(false, null)
      this.setTooltip(t('Skip to the next iteration of the loop'))
    },
  }

  // LOOP INDEX (value block — returns current iteration number)
  Blockly.Blocks['cb_loop_index'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#059669')
      this.appendDummyInput().appendField('loop index')
      this.setOutput(true, 'Number')
      this.setTooltip('Get the current loop iteration number (starts at 0)')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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
      this.appendValueInput('ID').setCheck('String').appendField('id')
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

  Blockly.Blocks['cb_set_attribute'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Attribute')
      this.appendValueInput('NAME').setCheck('String').appendField('name')
      this.appendValueInput('VALUE').setCheck('String').appendField('value')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set an attribute (like data-value) on the last created element')
    },
  }

  Blockly.Blocks['cb_set_attribute_by_id'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Set Attribute by ID')
      this.appendValueInput('ID').setCheck('String').appendField('id')
      this.appendValueInput('NAME').setCheck('String').appendField('name')
      this.appendValueInput('VALUE').setCheck('String').appendField('value')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Set an attribute on an element by its ID')
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

  Blockly.Blocks['cb_clicked_id'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput().appendField('Clicked ID')
      this.setOutput(true, 'String')
      this.setTooltip('Returns the ID of the clicked element — use inside a button onclick')
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

  Blockly.Blocks['cb_scss_style'] = {
    init: function (this: Blockly.Block) {
      this.setColour(HTML_COLOR)
      this.appendDummyInput()
        .appendField('SCSS')
        .appendField(new Blockly.FieldTextInput('.example { color: red; }'), 'CODE')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Write SCSS styles — click "Edit SCSS" to open the full editor')
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

const FUNCTION_COLOR = '#3B82F6'
const EVENT_COLOR = '#F59E0B'

// SVG data URIs for + / - FieldImage buttons used in function/call blocks.
// Two sizes: 16px (create_function) and 14px (call_function variants).
const SVG_ADD_16 = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#22c55e"/><path d="M8 4v8M4 8h8" stroke="#fff" stroke-width="2"/></svg>')
const SVG_REM_16 = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#ef4444"/><path d="M4 8h8" stroke="#fff" stroke-width="2"/></svg>')
const SVG_ADD_14 = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><circle cx="7" cy="7" r="6" fill="#22c55e"/><path d="M7 3v8M3 7h8" stroke="#fff" stroke-width="2"/></svg>')
const SVG_REM_14 = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"><circle cx="7" cy="7" r="6" fill="#ef4444"/><path d="M3 7h8" stroke="#fff" stroke-width="2"/></svg>')

/** Register function definition and call blocks. */
function registerFunctionBlocks() {
  Blockly.Blocks['cb_create_function'] = {
    init: function (this: Blockly.Block & { paramCount_: number; addParam_: () => void; removeParam_: () => void }) {
      this.paramCount_ = 3
      this.setColour(FUNCTION_COLOR)
      this.setInputsInline(false)
      this.appendDummyInput('HEADER')
        .appendField('function')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
      for (let i = 1; i <= this.paramCount_; i++) {
        this.appendValueInput(`PARAM${i}`).setCheck('String').appendField(`param ${i}`)
      }
      this.appendDummyInput('BUTTONS')
        .appendField(new Blockly.FieldImage(SVG_ADD_16, 16, 16, '+', () => this.addParam_()))
        .appendField(new Blockly.FieldImage(SVG_REM_16, 16, 16, '-', () => this.removeParam_()))
      this.appendStatementInput('BODY').appendField('do')
      this.setTooltip('Create a reusable function. Click + / - to add or remove parameters.')

      this.addParam_ = function () {
        this.paramCount_++
        this.removeInput('BUTTONS')
        this.removeInput('BODY')
        this.appendValueInput(`PARAM${this.paramCount_}`).setCheck('String').appendField(`param ${this.paramCount_}`)
        this.appendDummyInput('BUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_16, 16, 16, '+', () => this.addParam_()))
          .appendField(new Blockly.FieldImage(SVG_REM_16, 16, 16, '-', () => this.removeParam_()))
        this.appendStatementInput('BODY').appendField('do')
      }

      this.removeParam_ = function () {
        if (this.paramCount_ <= 0) return
        this.removeInput('BUTTONS')
        this.removeInput('BODY')
        this.removeInput(`PARAM${this.paramCount_}`)
        this.paramCount_--
        this.appendDummyInput('BUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_16, 16, 16, '+', () => this.addParam_()))
          .appendField(new Blockly.FieldImage(SVG_REM_16, 16, 16, '-', () => this.removeParam_()))
        this.appendStatementInput('BODY').appendField('do')
      };

      // Serialization — preserve paramCount across save/load/duplicate
      (this as unknown as Record<string, unknown>).saveExtraState = () => {
        return { paramCount: this.paramCount_ }
      };
      (this as unknown as Record<string, unknown>).loadExtraState = (state: { paramCount?: number }) => {
        const target = state?.paramCount ?? 3
        while (this.paramCount_ < target) this.addParam_()
        while (this.paramCount_ > target) this.removeParam_()
      }
    },
  }

  Blockly.Blocks['cb_call_function'] = {
    init: function (this: Blockly.Block & { argCount_: number; addArg_: () => void; removeArg_: () => void }) {
      this.argCount_ = 3
      this.setColour(FUNCTION_COLOR)
      this.appendDummyInput()
        .appendField('call')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
      this.appendValueInput('ARG1').appendField('with')
      for (let i = 2; i <= this.argCount_; i++) {
        this.appendValueInput(`ARG${i}`).appendField('and')
      }
      this.appendDummyInput('ARGBUTTONS')
        .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
        .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Call a function by name. Click + / - to add or remove arguments.');

      (this as unknown as Record<string, unknown>).saveExtraState = () => {
        return { argCount: this.argCount_ }
      };
      (this as unknown as Record<string, unknown>).loadExtraState = (state: { argCount?: number }) => {
        const target = state?.argCount ?? 3
        while (this.argCount_ < target) this.addArg_()
        while (this.argCount_ > target) this.removeArg_()
      }

      this.addArg_ = function () {
        this.argCount_++
        this.removeInput('ARGBUTTONS')
        this.appendValueInput(`ARG${this.argCount_}`).appendField('and')
        this.appendDummyInput('ARGBUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
          .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      }
      this.removeArg_ = function () {
        if (this.argCount_ <= 0) return
        this.removeInput('ARGBUTTONS')
        this.removeInput(`ARG${this.argCount_}`)
        this.argCount_--
        this.appendDummyInput('ARGBUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
          .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      }
    },
  }

  Blockly.Blocks['cb_call_function_return'] = {
    init: function (this: Blockly.Block & { argCount_: number; addArg_: () => void; removeArg_: () => void }) {
      this.argCount_ = 3
      this.setColour(FUNCTION_COLOR)
      this.appendDummyInput()
        .appendField('call')
        .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME')
        .appendField('=')
      this.appendValueInput('ARG1').appendField('with')
      for (let i = 2; i <= this.argCount_; i++) {
        this.appendValueInput(`ARG${i}`).appendField('and')
      }
      this.appendDummyInput('ARGBUTTONS')
        .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
        .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      this.setOutput(true, null)
      this.setTooltip('Call a function and use its return value. Click + / - to add or remove arguments.');

      (this as unknown as Record<string, unknown>).saveExtraState = () => {
        return { argCount: this.argCount_ }
      };
      (this as unknown as Record<string, unknown>).loadExtraState = (state: { argCount?: number }) => {
        const target = state?.argCount ?? 3
        while (this.argCount_ < target) this.addArg_()
        while (this.argCount_ > target) this.removeArg_()
      }

      this.addArg_ = function () {
        this.argCount_++
        this.removeInput('ARGBUTTONS')
        this.appendValueInput(`ARG${this.argCount_}`).appendField('and')
        this.appendDummyInput('ARGBUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
          .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      }
      this.removeArg_ = function () {
        if (this.argCount_ <= 0) return
        this.removeInput('ARGBUTTONS')
        this.removeInput(`ARG${this.argCount_}`)
        this.argCount_--
        this.appendDummyInput('ARGBUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_14, 14, 14, '+', () => this.addArg_()))
          .appendField(new Blockly.FieldImage(SVG_REM_14, 14, 14, '-', () => this.removeArg_()))
      }
    },
  }
}

/** Register event blocks (key press, click). */
function registerEventBlocks() {
  const keyOptions: [string, string][] = [
    ['Up Arrow', 'ArrowUp'],
    ['Down Arrow', 'ArrowDown'],
    ['Left Arrow', 'ArrowLeft'],
    ['Right Arrow', 'ArrowRight'],
    ['Space', ' '],
    ['Enter', 'Enter'],
    ['Escape', 'Escape'],
    ...('abcdefghijklmnopqrstuvwxyz'.split('').map(c => [c, c] as [string, string])),
    ...('0123456789'.split('').map(c => [c, c] as [string, string])),
  ]

  Blockly.Blocks['cb_when_key_pressed'] = {
    init: function (this: Blockly.Block) {
      this.setColour(EVENT_COLOR)
      this.appendDummyInput()
        .appendField('when key')
        .appendField(new Blockly.FieldDropdown(keyOptions), 'KEY')
        .appendField('pressed')
      this.appendStatementInput('DO').appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks when a key is pressed')
    },
  }

  Blockly.Blocks['cb_when_clicked'] = {
    init: function (this: Blockly.Block) {
      this.setColour(EVENT_COLOR)
      this.appendValueInput('ID').setCheck('String').appendField('when')
      this.appendDummyInput().appendField('clicked')
      this.appendStatementInput('DO').appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks when an element is clicked')
    },
  }

  Blockly.Blocks['cb_game_loop'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#EA580C')
      this.appendDummyInput().appendField('game loop — every frame')
      this.appendStatementInput('DO').appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks once per frame using requestAnimationFrame (~60fps). Auto-cancels on next Run.')
    },
  }
}

const CALLOUT_COLOR = '#eab308'

/** Register annotation/callout blocks for workspace documentation. */
function registerAnnotationBlocks() {
  Blockly.Blocks['cb_callout'] = {
    init: function (this: Blockly.Block) {
      this.setColour(CALLOUT_COLOR)
      this.appendDummyInput()
        .appendField('📌 Set Comment')
      this.appendDummyInput()
        .appendField(new FieldMultilineInput('Note:\n'), 'TEXT')
      this.setTooltip('A visual callout — add notes to your workspace')
      // No connections — standalone floating block
    },
  }

  // Frame block — Figma-style visual grouping with sticky drag and color coding
  const FRAME_COLORS: Record<string, { stroke: string; fill: string; label: string }> = {
    grey:   { stroke: '#585b70', fill: 'rgba(49, 50, 68, 0.15)', label: 'Grey' },
    blue:   { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.08)', label: 'Blue' },
    green:  { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.08)', label: 'Green' },
    orange: { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.08)', label: 'Orange' },
    purple: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.08)', label: 'Purple' },
    red:    { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.08)', label: 'Red' },
  }

  Blockly.Blocks['cb_frame'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#313244')
      this.appendDummyInput()
        .appendField('📁')
        .appendField(new Blockly.FieldTextInput('Section'), 'NAME')
        .appendField(' ')
        .appendField(new Blockly.FieldDropdown(
          Object.entries(FRAME_COLORS).map(([key, val]) => [val.label, key])
        ), 'COLOR')
      this.appendDummyInput()
        .appendField('w')
        .appendField(new Blockly.FieldNumber(500, 100, 2000, 50), 'WIDTH')
        .appendField('h')
        .appendField(new Blockly.FieldNumber(350, 80, 2000, 50), 'HEIGHT')
      this.setTooltip('Visual frame — group related blocks. Drag to move all blocks inside. Does not generate code.')
      this.setMovable(true)
      this.setDeletable(true)
      this.setEditable(true)

      const block = this as unknown as Blockly.BlockSvg
      let frameRect: SVGRectElement | null = null
      let lastX = 0
      let lastY = 0

      const updateFrame = () => {
        if (!frameRect) return
        const colorKey = block.getFieldValue('COLOR') || 'grey'
        const colors = FRAME_COLORS[colorKey] || FRAME_COLORS.grey
        frameRect.setAttribute('fill', colors.fill)
        frameRect.setAttribute('stroke', colors.stroke)
        frameRect.setAttribute('width', String(block.getFieldValue('WIDTH') || 500))
        frameRect.setAttribute('height', String(block.getFieldValue('HEIGHT') || 350))
      }

      // Render the frame rect
      setTimeout(() => {
        const svgRoot = block.getSvgRoot()
        if (!svgRoot) return

        frameRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        frameRect.setAttribute('x', '-10')
        frameRect.setAttribute('y', '40')
        frameRect.setAttribute('width', '500')
        frameRect.setAttribute('height', '350')
        frameRect.setAttribute('rx', '12')
        frameRect.setAttribute('ry', '12')
        frameRect.setAttribute('stroke-width', '2')
        frameRect.setAttribute('stroke-dasharray', '8 4')
        frameRect.style.pointerEvents = 'none'
        svgRoot.insertBefore(frameRect, svgRoot.firstChild)
        updateFrame()

        const pos = block.getRelativeToSurfaceXY()
        lastX = pos.x
        lastY = pos.y
      }, 100)

      // Listen for block moves to implement sticky grouping
      const onMove = () => {
        const pos = block.getRelativeToSurfaceXY()
        const dx = pos.x - lastX
        const dy = pos.y - lastY
        if (dx === 0 && dy === 0) return

        // Find all blocks inside the frame bounds and move them too
        const ws = block.workspace as Blockly.WorkspaceSvg
        if (!ws) { lastX = pos.x; lastY = pos.y; return }

        const fw = Number(block.getFieldValue('WIDTH') || 500)
        const fh = Number(block.getFieldValue('HEIGHT') || 350)
        const frameLeft = lastX - 10
        const frameTop = lastY + 40
        const frameRight = frameLeft + fw
        const frameBottom = frameTop + fh

        const allBlocks = ws.getTopBlocks(false) as Blockly.BlockSvg[]
        for (const b of allBlocks) {
          if (b.id === block.id) continue
          const bPos = b.getRelativeToSurfaceXY()
          if (bPos.x >= frameLeft && bPos.x <= frameRight &&
              bPos.y >= frameTop && bPos.y <= frameBottom) {
            b.moveBy(dx, dy)
          }
        }

        lastX = pos.x
        lastY = pos.y
        updateFrame()
      }

      // Register move listener after workspace is ready
      setTimeout(() => {
        const ws = block.workspace
        if (ws) {
          ws.addChangeListener((e: Blockly.Events.Abstract) => {
            if (e.type === Blockly.Events.BLOCK_MOVE && (e as Blockly.Events.BlockMove).blockId === block.id) {
              onMove()
            }
            if (e.type === Blockly.Events.BLOCK_CHANGE && (e as Blockly.Events.BlockChange).blockId === block.id) {
              updateFrame()
            }
          })
        }
      }, 200)
    },
  }

  Blockly.Blocks['cb_inline_comment'] = {
    init: function (this: Blockly.Block) {
      this.setColour(CALLOUT_COLOR)
      this.appendDummyInput()
        .appendField('💬')
      this.appendDummyInput()
        .appendField(new FieldMultilineInput('comment\n'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('An inline comment — place between blocks')
    },
  }
}

const LIBRARY_COLOR = '#7c3aed'

const LIBRARY_CDNS: Record<string, string> = {
  tonejs: 'https://cdn.jsdelivr.net/npm/tone',
  animejs: 'https://cdn.jsdelivr.net/npm/animejs',
  confetti: 'https://cdn.jsdelivr.net/npm/canvas-confetti',
}

/** Register the Import Library block as a native Blockly block with a dropdown. */
function registerLibraryBlocks() {
  const libraryOptions: [string, string][] = [
    ['Confetti', 'confetti'],
    ['Anime.js', 'animejs'],
    ['Tone.js', 'tonejs'],
  ]

  const prankOptions: [string, string][] = [
    ['Rickroll', 'theRickroll'],
    ['Matrix', 'theMatrix'],
    ['Nyan Cat', 'theNyan'],
    ['DVD Logo', 'theDVD'],
    ['Confetti', 'theConfetti'],
    ['Sans', 'theSans'],
    ['Cage', 'theCage'],
    ['Drift', 'theDrift'],
    ['Gravity', 'theGravity'],
    ['Blur', 'theBlur'],
    ['Rotate', 'theRotate'],
    ['Swap', 'theSwap'],
    ['Clipper', 'theClipper'],
    ['Void', 'theVoid'],
    ['Flip', 'theFlip'],
    ['Earthquake', 'theEarthquake'],
    ['Crash', 'theCrash'],
    ['Update', 'theUpdate'],
    ['Coloring', 'theColoring'],
    ['UwU', 'theUwU'],
    ['Zoom', 'theZoom'],
    ['Cursor', 'theCursor'],
    ['Doge', 'theDoge'],
    ['Ads', 'theAds'],
    ['3D', 'the3D'],
    ['Sound', 'theSound'],
    ['Snow', 'theSnow'],
    ['Delay', 'theDelay'],
    ['Trail', 'theTrail'],
    ['Snake', 'theSnake'],
    ['Invaders', 'theInvaders'],
    ['Pong', 'thePong'],
  ]

  Blockly.Blocks['cb_import_library'] = {
    init: function (this: Blockly.Block) {
      this.setColour(LIBRARY_COLOR)
      this.appendDummyInput()
        .appendField('Import Library')
        .appendField(new Blockly.FieldDropdown(libraryOptions), 'LIBRARY')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Load a JavaScript library from CDN into the sandbox')
    },
  }

  Blockly.Blocks['cb_import_prank'] = {
    init: function (this: Blockly.Block) {
      this.setColour('#f38ba8')
      this.appendDummyInput()
        .appendField('🎭 Prank')
        .appendField(new Blockly.FieldDropdown(prankOptions), 'PRANK')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Load a fun prank effect — use responsibly!')
    },
  }
}

const VISION_COLOR = '#06B6D4'

/** Register vision blocks (animation loop) as native Blockly blocks. */
function registerVisionBlocks() {
  Blockly.Blocks['cb_animation_loop'] = {
    init: function (this: Blockly.Block) {
      this.setColour(VISION_COLOR)
      this.appendDummyInput().appendField('repeat each frame')
      this.appendStatementInput('DO').appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Run blocks on every animation frame (~60fps) using requestAnimationFrame')
    },
  }
}

const LOGIC_COLOR = '#059669'

function registerLogicBlocks() {
  Blockly.Blocks['cb_switch_value'] = {
    init: function (this: Blockly.Block & { caseCount_: number; addCase_: () => void; removeCase_: () => void; rebuildTail_: () => void }) {
      this.caseCount_ = 2
      this.setColour(LOGIC_COLOR)
      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setTooltip('Match a value against cases and return the matching result. Click + / - to add or remove cases.')

      this.appendValueInput('VALUE').appendField('switch')
      for (let i = 1; i <= this.caseCount_; i++) {
        this.appendValueInput(`CASE${i}`).appendField(`case ${i}`)
        this.appendValueInput(`RESULT${i}`).appendField('→')
      }
      this.appendDummyInput('BUTTONS')
        .appendField(new Blockly.FieldImage(SVG_ADD_16, 16, 16, '+', () => this.addCase_()))
        .appendField(new Blockly.FieldImage(SVG_REM_16, 16, 16, '-', () => this.removeCase_()))
      this.appendValueInput('DEFAULT').appendField('else →')

      this.rebuildTail_ = function () {
        if (this.getInput('BUTTONS')) this.removeInput('BUTTONS')
        if (this.getInput('DEFAULT')) this.removeInput('DEFAULT')
        this.appendDummyInput('BUTTONS')
          .appendField(new Blockly.FieldImage(SVG_ADD_16, 16, 16, '+', () => this.addCase_()))
          .appendField(new Blockly.FieldImage(SVG_REM_16, 16, 16, '-', () => this.removeCase_()))
        this.appendValueInput('DEFAULT').appendField('else →')
      }

      this.addCase_ = function () {
        this.caseCount_++
        if (this.getInput('BUTTONS')) this.removeInput('BUTTONS')
        if (this.getInput('DEFAULT')) this.removeInput('DEFAULT')
        this.appendValueInput(`CASE${this.caseCount_}`).appendField(`case ${this.caseCount_}`)
        this.appendValueInput(`RESULT${this.caseCount_}`).appendField('→')
        this.rebuildTail_()
      }

      this.removeCase_ = function () {
        if (this.caseCount_ <= 1) return
        if (this.getInput(`RESULT${this.caseCount_}`)) this.removeInput(`RESULT${this.caseCount_}`)
        if (this.getInput(`CASE${this.caseCount_}`)) this.removeInput(`CASE${this.caseCount_}`)
        this.caseCount_--
        this.rebuildTail_()
      };

      (this as unknown as Record<string, unknown>).saveExtraState = () => {
        return { caseCount: this.caseCount_ }
      };
      (this as unknown as Record<string, unknown>).loadExtraState = (state: { caseCount?: number }) => {
        const target = state?.caseCount ?? 2
        while (this.caseCount_ < target) this.addCase_()
        while (this.caseCount_ > target) this.removeCase_()
      }
    },
  }
}

export function registerCustomBlocks() {
  // Register control flow blocks first
  registerControlFlowBlocks()

  // Register HTML/CSS blocks
  registerHtmlBlocks()

  // Register function blocks
  registerFunctionBlocks()

  // Register event blocks
  registerEventBlocks()

  // Register color picker block
  registerColorBlock()

  // Register annotation blocks
  registerAnnotationBlocks()

  // Register library blocks
  registerLibraryBlocks()

  // Register vision blocks
  registerVisionBlocks()

  // Register logic blocks with mutators (switch_value)
  registerLogicBlocks()

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
          blockLabel(block.name)
        )

        // Add inputs
        for (const input of block.inputs) {
          if (input.choices && input.choices.length > 0) {
            // Dropdown field — value is built into the block
            const options: [string, string][] = input.choices.map((c) => [c, c])
            this.appendDummyInput()
              .appendField(t(input.name.replace(/_/g, ' ')))
              .appendField(new Blockly.FieldDropdown(options), input.name)
          } else {
            const check = typeToBlocklyCheck(input.type)
            const inputObj = this.appendValueInput(input.name)
            inputObj.appendField(t(input.name.replace(/_/g, ' ')))
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

// --- Block Source Map ---
// Maps block IDs to { startLine, endLine } in the last generated code string.
// Line numbers are 1-based to match Monaco's convention.
const _blockSourceMap = new Map<string, { startLine: number; endLine: number }>()

export function getBlockSourceMap(): Map<string, { startLine: number; endLine: number }> {
  return _blockSourceMap
}

export function clearBlockSourceMap(): void {
  _blockSourceMap.clear()
}

/** Parse marker comments from a generated code string and populate _blockSourceMap.
 *  Markers look like: /*__cb:BLOCKID*\/
 *  Each marker's range extends from that line until the line before the next marker (or end of code).
 *  The marker line itself is not counted — only the lines of actual code after it.
 */
function buildBlockSourceMapFromCode(code: string): string {
  _blockSourceMap.clear()
  const markerRegex = /\/\*__cb:([^*]+)\*\//g
  const rawLines = code.split('\n')

  // Find all markers: { blockId, lineIndex (0-based) }
  const markers: Array<{ blockId: string; lineIndex: number }> = []
  for (let i = 0; i < rawLines.length; i++) {
    const match = markerRegex.exec(rawLines[i])
    if (match) {
      markers.push({ blockId: match[1], lineIndex: i })
    }
    markerRegex.lastIndex = 0
  }

  // Strip marker lines to produce the final code
  const markerLineSet = new Set(markers.map((m) => m.lineIndex))
  const cleanLines: string[] = []
  const lineMapping: number[] = [] // cleanLines[i] came from rawLines[lineMapping[i]]
  for (let i = 0; i < rawLines.length; i++) {
    if (!markerLineSet.has(i)) {
      lineMapping.push(i)
      cleanLines.push(rawLines[i])
    }
  }

  // For each marker, find the range of clean lines that follow it
  for (let m = 0; m < markers.length; m++) {
    const markerRawLine = markers[m].lineIndex
    const nextMarkerRawLine = m + 1 < markers.length ? markers[m + 1].lineIndex : rawLines.length

    // Clean line indices (0-based) that fall between this marker and the next
    const start = lineMapping.findIndex((rawIdx) => rawIdx > markerRawLine)
    const endExclusive = lineMapping.findIndex((rawIdx) => rawIdx >= nextMarkerRawLine)

    const startClean = start === -1 ? cleanLines.length : start
    const endClean = endExclusive === -1 ? cleanLines.length : endExclusive

    if (startClean < endClean) {
      // Convert to 1-based Monaco line numbers
      _blockSourceMap.set(markers[m].blockId, {
        startLine: startClean + 1,
        endLine: endClean, // endClean is exclusive (0-based) = last inclusive 1-based line
      })
    }
  }

  return cleanLines.join('\n')
}

export function generateCode(workspace: Blockly.Workspace, language: Language, traceMode?: boolean): string {
  _loopVarCounter = 0
  _traceMode = !!(traceMode && language === 'javascript')
  const topBlocks = workspace.getTopBlocks(true)
  const lines: string[] = []

  if (language === 'javascript') {
    lines.push('// Generated by CryptoBlocks')
    lines.push('')
  } else {
    lines.push('# Generated by CryptoBlocks')
    lines.push('')
  }

  // Trace mode preamble — only for JavaScript (iframe strategy)
  if (_traceMode) {
    lines.push('// --- Slow-Mo Trace ---')
    lines.push('var __trace = function(id) {')
    lines.push('  if (typeof __sendMsg === "function") { __sendMsg("trace", id); }')
    lines.push('};')
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
    lines.push(`/*__cb:${topBlock.id}*/`)
    lines.push(generateBlockCode(topBlock, language))
  }

  const rawCode = lines.join('\n')
  return buildBlockSourceMapFromCode(rawCode)
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
      const loopVar = `__i${_loopVarCounter++}`
      const savedVar = `__savedIndex${_loopVarCounter}`

      if (language === 'javascript') {
        const safeLimit = `Math.min(${times}, 10000)`
        if (!body) return `for (var ${loopVar} = 0; ${loopVar} < ${safeLimit}; ${loopVar}++) {}`
        const indexSetup = `var ${savedVar} = typeof __loopIndex !== 'undefined' ? __loopIndex : 0;\n  var __loopIndex = ${loopVar};`
        const indexRestore = `__loopIndex = ${savedVar};`
        return `for (var ${loopVar} = 0; ${loopVar} < ${safeLimit}; ${loopVar}++) {\n${indent(indexSetup, language)}\n${indent(body, language)}\n${indent(indexRestore, language)}\n}`
      } else {
        if (!body) return `for __loopIndex in range(min(int(${times}), 10000)):\n    pass`
        return `for __loopIndex in range(min(int(${times}), 10000)):\n${indent(body, language)}`
      }
    }

    case 'cb_count_from': {
      const fromBlock = block.getInputTargetBlock('FROM')
      const toBlock = block.getInputTargetBlock('TO')
      const byBlock = block.getInputTargetBlock('BY')
      const from = fromBlock ? generateBlockCode(fromBlock, language) : '0'
      const to = toBlock ? generateBlockCode(toBlock, language) : '10'
      const by = byBlock ? generateBlockCode(byBlock, language) : '1'
      const body = generateStatementCode(block, 'DO', language)
      const loopVar = `__i${_loopVarCounter++}`
      const savedVar = `__savedIndex${_loopVarCounter}`

      if (language === 'javascript') {
        // Direction-aware: if step is negative, use >=; if positive, use <=
        const countVar = `__c${_loopVarCounter}`
        const cond = `(${by}) > 0 ? ${loopVar} <= ${to} : ${loopVar} >= ${to}`
        const guard = `if (++${countVar} > 10000) { console.error("Loop limit reached"); break; }`
        if (!body) return `for (var ${loopVar} = ${from}, ${countVar} = 0; ${cond}; ${loopVar} += ${by}) { ${guard} }`
        const indexSetup = `var ${savedVar} = typeof __loopIndex !== 'undefined' ? __loopIndex : 0;\n  var __loopIndex = ${loopVar};`
        const indexRestore = `__loopIndex = ${savedVar};`
        return `for (var ${loopVar} = ${from}, ${countVar} = 0; ${cond}; ${loopVar} += ${by}) {\n${indent(guard, language)}\n${indent(indexSetup, language)}\n${indent(body, language)}\n${indent(indexRestore, language)}\n}`
      } else {
        if (!body) return `for __loopIndex in range(int(${from}), int(${to}), int(${by})):\n    pass`
        return `for __loopIndex in range(int(${from}), int(${to}), int(${by})):\n${indent(body, language)}`
      }
    }

    case 'cb_while': {
      const condBlock = block.getInputTargetBlock('CONDITION')
      const condition = condBlock
        ? generateBlockCode(condBlock, language)
        : (language === 'javascript' ? 'false' : 'False')
      const body = generateStatementCode(block, 'DO', language)
      const countVar = `__whileCount${block.id.substring(0, 4).replace(/[^a-zA-Z0-9]/g, '')}`

      if (language === 'javascript') {
        if (!body) return `var ${countVar} = 0;\nwhile (${condition}) {\n  if (++${countVar} > 10000) { console.error("Loop limit reached"); break; }\n}`
        return `var ${countVar} = 0;\nwhile (${condition}) {\n  if (++${countVar} > 10000) { console.error("Loop limit reached"); break; }\n${indent(body, language)}\n}`
      } else {
        if (!body) return `${countVar} = 0\nwhile ${condition}:\n    ${countVar} += 1\n    if ${countVar} > 10000:\n        print("Loop limit reached")\n        break`
        return `${countVar} = 0\nwhile ${condition}:\n    ${countVar} += 1\n    if ${countVar} > 10000:\n        print("Loop limit reached")\n        break\n${indent(body, language)}`
      }
    }

    case 'cb_loop_index': {
      return language === 'javascript' ? '__loopIndex' : '__loopIndex'
    }

    case 'cb_break': {
      return 'break'
    }

    case 'cb_continue': {
      return 'continue'
    }

    default:
      return null
  }
}

/**
 * Generate code for the switch_value expression block (hex/value, dynamic N cases).
 * Emits a chained ternary so it can plug into any value input.
 */
function generateSwitchValueCode(block: Blockly.Block, language: Language): string {
  const caseCount = (block as unknown as { caseCount_?: number }).caseCount_ ?? 2
  const nullLit = language === 'javascript' ? 'null' : 'None'
  const eq = language === 'javascript' ? '===' : '=='

  const valueBlock = block.getInputTargetBlock('VALUE')
  const value = valueBlock ? generateBlockCode(valueBlock, language) : nullLit
  const defaultBlock = block.getInputTargetBlock('DEFAULT')
  let expr = defaultBlock ? generateBlockCode(defaultBlock, language) : nullLit

  for (let i = caseCount; i >= 1; i--) {
    const caseBlock = block.getInputTargetBlock(`CASE${i}`)
    const resultBlock = block.getInputTargetBlock(`RESULT${i}`)
    const caseVal = caseBlock ? generateBlockCode(caseBlock, language) : nullLit
    const resultVal = resultBlock ? generateBlockCode(resultBlock, language) : nullLit
    if (language === 'javascript') {
      expr = `(${value} ${eq} ${caseVal} ? ${resultVal} : ${expr})`
    } else {
      expr = `(${resultVal} if ${value} ${eq} ${caseVal} else ${expr})`
    }
  }
  return expr
}

/**
 * Generate code for vision blocks (animation_loop).
 * Returns null if the block is not a vision block.
 */
function generateVisionCode(block: Blockly.Block, language: Language): string | null {
  switch (block.type) {
    case 'cb_animation_loop': {
      const body = generateStatementCode(block, 'DO', language)
      if (language !== 'javascript') return '# animation_loop is only supported in JavaScript'
      const loopName = `__cbLoop_${block.id.substring(0, 4).replace(/[^a-zA-Z0-9]/g, '')}`
      const stream = `var __cv = document.getElementById('cb-canvas');\n  if (__cv && __cv.width > 0 && __cv.style.display !== 'none') {\n    try { parent.postMessage({ __cryptoblocks: true, type: 'canvas', data: __cv.toDataURL('image/png') }, '*'); } catch(e) {}\n  }`
      const killCheck = `if (window.__cbStopLoop) return;`
      const localScope = `window.__localStack = window.__localStack || []; window.__localStack.push({});`
      const popScope = `window.__localStack.pop();`
      // Use setTimeout only — requestAnimationFrame doesn't fire for hidden
      // iframes (the sandbox iframe is display:none). ~15fps throttle.
      const next = `setTimeout(${loopName}, 60);`
      if (!body) {
        return `(async function ${loopName}() {\n  ${killCheck}\n  ${stream}\n  ${next}\n})()`
      }
      return `(async function ${loopName}() {\n  ${killCheck}\n  ${localScope}\n  try {\n${indent(body, language)}\n  } catch(__e) { console.error('Loop error: ' + __e.message); }\n  ${popScope}\n  ${stream}\n  ${next}\n})()`
    }

    default:
      return null
  }
}

/**
 * Generate code for function definition and call blocks.
 * Returns null if the block is not a function block.
 */
function generateFunctionCode(block: Blockly.Block, language: Language): string | null {
  switch (block.type) {
    case 'cb_create_function': {
      const name = block.getFieldValue('NAME') ?? 'myFunction'
      // Read param names from value inputs (text blocks)
      const paramList: string[] = []
      const paramCount = (block as unknown as { paramCount_?: number }).paramCount_ ?? 5
      for (let pi = 1; pi <= paramCount; pi++) {
        const inputName = `PARAM${pi}`
        const paramBlock = block.getInputTargetBlock(inputName)
        if (paramBlock) {
          const val = generateBlockCode(paramBlock, language)
          // Strip quotes from string literals to get the param name
          const paramName = val.replace(/^["']|["']$/g, '')
          if (paramName) paramList.push(paramName)
        }
      }
      const params = paramList.join(', ')
      const body = generateStatementCode(block, 'BODY', language)

      // Inject local scope push + param sync so params are accessible via Get Local blocks
      const paramSync = paramList
        .map((p: string) => language === 'javascript'
          ? `  setLocal("${p}", ${p});`
          : `    set_local("${p}", ${p})`)
        .join('\n')

      if (language === 'javascript') {
        const isAsync = body.includes('await ')
        const fnKeyword = isAsync ? 'async function' : 'function'
        const scopePush = '  window.__localStack = window.__localStack || []; window.__localStack.push({});'
        const scopePop = '  window.__localStack.pop();'
        const hasReturn = body.includes('returnValue(')
        if (!body && !paramSync) return `${fnKeyword} ${name}(${params}) {\n${scopePush}\n${scopePop}\n}`
        if (hasReturn) {
          const tryBody = [paramSync, body ? indent(body, language) : ''].filter(Boolean).join('\n')
          return `${fnKeyword} ${name}(${params}) {\n${scopePush}\n  try {\n${indent(tryBody, language)}\n  } catch(__e) { if (__e && __e.__cbReturn) return __e.value; throw __e; }\n${scopePop}\n}`
        }
        const fullBody = [scopePush, paramSync, body ? indent(body, language) : '', scopePop].filter(Boolean).join('\n')
        return `${fnKeyword} ${name}(${params}) {\n${fullBody}\n}`
      } else {
        // Python: snake_case the function name
        const pyName = name.replace(/([A-Z])/g, (m: string) => '_' + m.toLowerCase()).replace(/^_/, '')
        const pyScopePush = `    if not hasattr(set_local, '_stack'): set_local._stack = []\n    set_local._stack.append({})`
        const pyScopePop = '    set_local._stack.pop()'
        if (!body && !paramSync) return `def ${pyName}(${params}):\n${pyScopePush}\n${pyScopePop}`
        const hasReturn = body.includes('return_value(')
        if (hasReturn) {
          const tryBody = [paramSync, body ? indent(body, language) : ''].filter(Boolean).join('\n')
          return `def ${pyName}(${params}):\n${pyScopePush}\n    try:\n${indent(tryBody, language)}\n    except _CBReturn as __e:\n        return __e.value\n    finally:\n${pyScopePop}`
        }
        const pyFullBody = [pyScopePush, paramSync, body ? indent(body, language) : '', pyScopePop].filter(Boolean).join('\n')
        return `def ${pyName}(${params}):\n${pyFullBody}`
      }
    }

    case 'cb_call_function':
    case 'cb_call_function_return': {
      const name = block.getFieldValue('NAME') ?? 'myFunction'
      const args: string[] = []
      const argCount = (block as unknown as { argCount_?: number }).argCount_ ?? 5
      for (let ai = 1; ai <= argCount; ai++) {
        const argName = `ARG${ai}`
        const argBlock = block.getInputTargetBlock(argName)
        if (argBlock && !argBlock.isShadow()) args.push(generateBlockCode(argBlock, language))
      }

      if (language === 'javascript') {
        // Value block (return) omits semicolon so it can be used as expression
        if (block.type === 'cb_call_function_return') return `${name}(${args.join(', ')})`
        return `${name}(${args.join(', ')});`
      } else {
        const pyName = name.replace(/([A-Z])/g, (m: string) => '_' + m.toLowerCase()).replace(/^_/, '')
        return `${pyName}(${args.join(', ')})`
      }
    }

    default:
      return null
  }
}

/**
 * Generate code for event blocks (key press, click).
 * Returns null if the block is not an event block.
 */
function generateEventCode(block: Blockly.Block, language: Language): string | null {
  switch (block.type) {
    case 'cb_when_key_pressed': {
      if (language !== 'javascript') {
        return `# Key press events are only available in JavaScript mode`
      }
      const key = block.getFieldValue('KEY') ?? 'ArrowUp'
      const body = generateStatementCode(block, 'DO', language)
      const isAsync = body.includes('await ')
      const fnKeyword = isAsync ? 'async function' : 'function'
      const bodyIndented = body ? `\n${indent(body, language)}\n` : ''
      return `document.addEventListener('keydown', ${fnKeyword}(e) {\n  if (e.key === ${JSON.stringify(key)}) {${bodyIndented}  }\n});`
    }

    case 'cb_game_loop': {
      if (language !== 'javascript') {
        return `# Game loop is only available in JavaScript mode`
      }
      const body = generateStatementCode(block, 'DO', language)
      const indented = body ? indent(body, language) : ''
      // Cancels any previous loop first so clicking Run twice doesn't pile
      // them up. __cbGameLoopId is shared parent-window state.
      return [
        `(function() {`,
        `  if (window.__cbGameLoopId) { cancelAnimationFrame(window.__cbGameLoopId); window.__cbGameLoopId = 0; }`,
        `  var __cbLoopActive = true;`,
        `  var __cbLoop = async function() {`,
        `    if (!__cbLoopActive) return;`,
        `    try {`,
        indented || '      // (empty loop body)',
        `    } catch (e) { console.error('game loop error:', e && e.message ? e.message : e); __cbLoopActive = false; return; }`,
        `    if (__cbLoopActive) { window.__cbGameLoopId = requestAnimationFrame(__cbLoop); }`,
        `  };`,
        `  window.__cbGameLoopId = requestAnimationFrame(__cbLoop);`,
        `})();`,
      ].join('\n')
    }

    case 'cb_when_clicked': {
      if (language !== 'javascript') {
        return `# Click events are only available in JavaScript mode`
      }
      const idBlock = block.getInputTargetBlock('ID')
      const idCode = idBlock ? generateBlockCode(idBlock, language) : '""'
      const body = generateStatementCode(block, 'DO', language)
      const isAsync = body.includes('await ')
      const fnKeyword = isAsync ? 'async function' : 'function'
      const bodyIndented = body ? `\n${indent(body, language)}\n    ` : ''

      // When inside a button (or any HTML element), attach to __lastEl directly
      // instead of getElementById which may reference undefined variables like __clickedId
      const parentBlock = block.getSurroundParent()
      const insideHtmlElement = parentBlock && HTML_BLOCKS.has(parentBlock.type)
      if (insideHtmlElement) {
        return `__lastEl.addEventListener('click', ${fnKeyword}() {\n      var __clickedId = this.id || "";${bodyIndented}});`
      }

      return `(${isAsync ? 'async ' : ''}function() {\n  var __target = document.getElementById(${idCode});\n  if (__target) {\n    __target.addEventListener('click', ${fnKeyword}() {\n      var __clickedId = this.id || "";${bodyIndented}});\n  }\n})()`
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
      const id = htmlVal(block, 'ID', '""', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.background = ${color};\n  __el.style.padding = ${padding} + 'px';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_row': {
      const gap = htmlVal(block, 'GAP', '8', language)
      const id = htmlVal(block, 'ID', '""', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.display = 'flex';\n  __el.style.flexDirection = 'row';\n  __el.style.gap = ${gap} + 'px';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_column': {
      const gap = htmlVal(block, 'GAP', '8', language)
      const id = htmlVal(block, 'ID', '""', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  __el.style.display = 'flex';\n  __el.style.flexDirection = 'column';\n  __el.style.gap = ${gap} + 'px';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
      if (children) code += `\n${indent(children, language)}`
      code += `\n  __parentStack.pop();\n})()`
      return code
    }

    case 'cb_div': {
      const cls = htmlVal(block, 'CLASS', '""', language)
      const id = htmlVal(block, 'ID', '""', language)
      const children = generateStatementCode(block, 'CHILDREN', language)
      let code = `(function() {\n  var __el = document.createElement('div');\n  if (${cls}) __el.className = ${cls};`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n  __parentStack.push(__el);`
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
      const id = htmlVal(block, 'ID', '""', language)
      let code = `(function() {\n  var __el = document.createElement('img');\n  __el.src = ${url};\n  __el.style.width = ${width} + 'px';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
      return code
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
      const id = htmlVal(block, 'ID', '""', language)
      let code = `(function() {\n  var __el = document.createElement('a');\n  __el.textContent = ${text};\n  __el.href = ${url};\n  __el.target = '_blank';\n  __el.rel = 'noopener noreferrer';`
      if (id !== '""') code += `\n  if (${id}) __el.id = ${id};`
      code += `\n  __currentParent().appendChild(__el);\n  __lastEl = __el;\n})()`
      return code
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

    case 'cb_set_attribute': {
      const attrName = htmlVal(block, 'NAME', '"data-value"', language)
      const attrVal = htmlVal(block, 'VALUE', '""', language)
      return `if (__lastEl) { __lastEl.setAttribute(${attrName}, ${attrVal}); }`
    }

    case 'cb_set_attribute_by_id': {
      const id = htmlVal(block, 'ID', '""', language)
      const attrName = htmlVal(block, 'NAME', '"data-value"', language)
      const attrVal = htmlVal(block, 'VALUE', '""', language)
      return `(function() { var __target = document.getElementById(${id}); if (__target) __target.setAttribute(${attrName}, ${attrVal}); })()`
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

    case 'cb_clicked_id': {
      return `__clickedId`
    }

    case 'cb_scss_style': {
      const scss = block.getFieldValue('CODE') || ''
      try {
        const compiled = compileString(scss).css
        return `(function() {\n  var __style = document.createElement('style');\n  __style.textContent = ${JSON.stringify(compiled)};\n  document.head.appendChild(__style);\n})()`
      } catch (e) {
        return `console.error("SCSS compilation error: " + ${JSON.stringify(String(e))})`
      }
    }

    default:
      return null
  }
}

/**
 * Generate code for library import blocks.
 * Returns null if the block is not a library block.
 */
function generateLibraryCode(block: Blockly.Block, language: Language): string | null {
  if (!LIBRARY_BLOCKS.has(block.type)) return null

  if (language !== 'javascript') {
    return `# Import Library block is only available in JavaScript mode`
  }

  if (block.type === 'cb_import_library') {
    const lib = block.getFieldValue('LIBRARY') ?? 'p5'
    const url = LIBRARY_CDNS[lib] ?? ''
    // After loading confetti, bind it to the game canvas so it renders
    // visibly (the sandbox iframe is hidden — a default confetti overlay
    // would be invisible to the user).
    const postLoad = lib === 'confetti'
      ? `\nif (typeof confetti === 'function' && confetti.create) {\n  var __cbCanvas = document.getElementById('cb-canvas');\n  if (__cbCanvas) { __cbCanvas.style.display = 'block'; confetti = confetti.create(__cbCanvas, { resize: true }); }\n}`
      : ''
    return [
      `await new Promise(function(resolve, reject) {`,
      `  var s = document.createElement('script');`,
      `  s.src = ${JSON.stringify(url)};`,
      `  s.onload = resolve;`,
      `  s.onerror = function() { console.error('Failed to load ${lib}'); resolve(); };`,
      `  document.head.appendChild(s);`,
      `});${postLoad}`,
    ].join('\n')
  }

  if (block.type === 'cb_import_prank') {
    const prank = block.getFieldValue('PRANK') ?? 'theRickroll'
    const url = `https://jasonsutter87.github.io/jumpscare/hacks/${prank}.js`
    return [
      `await new Promise(function(resolve, reject) {`,
      `  var s = document.createElement('script');`,
      `  s.src = ${JSON.stringify(url)};`,
      `  s.onload = resolve;`,
      `  s.onerror = function() { console.error('Failed to load prank'); resolve(); };`,
      `  document.head.appendChild(s);`,
      `});`,
    ].join('\n')
  }

  return null
}

/** Blocks consumed by a button's onclick — skip them in the normal chain. */
const _consumedByButton = new WeakSet<Blockly.Block>()
let _loopVarCounter = 0
let _traceMode = false

function traceCall(block: Blockly.Block): string {
  if (!_traceMode) return ''
  return `__trace("${block.id}");\n`
}

function generateBlockCode(block: Blockly.Block, language: Language): string {
  // Inject source map marker for statement blocks (blocks with connections)
  // so click-to-highlight works for blocks inside functions, not just top-level
  const needsMarker = block.previousConnection || block.nextConnection
  const marker = needsMarker ? `/*__cb:${block.id}*/\n` : ''

  // Skip blocks already consumed as a button onclick handler
  if (_consumedByButton.has(block)) {
    const nextBlock = block.getNextBlock()
    return nextBlock ? generateBlockCode(nextBlock, language) : ''
  }

  // Handle built-in Blockly value blocks first
  const builtin = generateBuiltinCode(block, language)
  if (builtin !== null) return builtin

  // Handle logic value blocks with mutators (switch_value)
  if (block.type === 'cb_switch_value') {
    return generateSwitchValueCode(block, language)
  }

  // Handle control flow blocks (if, if-else, repeat)
  const controlFlow = generateControlFlowCode(block, language)
  if (controlFlow !== null) {
    let code = marker + traceCall(block) + controlFlow
    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle vision blocks (animation_loop)
  const visionCode = generateVisionCode(block, language)
  if (visionCode !== null) {
    let code = marker + traceCall(block) + visionCode
    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle function blocks (create_function, call_function)
  const functionCode = generateFunctionCode(block, language)
  if (functionCode !== null) {
    let code = marker + traceCall(block) + functionCode
    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle annotation blocks (callout — generates comment only)
  // Frame blocks — no code output
  if (block.type === 'cb_frame') {
    const nextBlock = block.getNextBlock()
    return nextBlock ? generateBlockCode(nextBlock, language) : ''
  }

  if (block.type === 'cb_callout' || block.type === 'cb_inline_comment') {
    const text = block.getFieldValue('TEXT') || ''
    const comment = language === 'javascript'
      ? `/* ${text.replace(/\*\//g, '* /')} */`
      : text.split('\n').map((line: string) => `# ${line}`).join('\n')
    const nextBlock = block.getNextBlock()
    if (nextBlock) return marker + comment + '\n' + generateBlockCode(nextBlock, language)
    return marker + comment
  }

  // Handle event blocks (when_key_pressed, when_clicked)
  const eventCode = generateEventCode(block, language)
  if (eventCode !== null) {
    let code = marker + traceCall(block) + eventCode
    // Make outer IIFEs async when they contain await calls
    if (code.includes('await ') && code.includes('(function()')) {
      code = code.replace(/\(function\(\)/g, '(async function()')
    }
    if (block.type === 'cb_when_clicked') {
      code = code.endsWith(')') ? code + ';' : code
    }
    const nextBlock = block.getNextBlock()
    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle HTML/CSS blocks
  const htmlCode = generateHtmlCode(block, language)
  if (htmlCode !== null) {
    const isValueBlock = block.outputConnection !== null
    let code = (!isValueBlock ? traceCall(block) : '') + htmlCode
    // Make IIFEs async when they contain await calls
    if (code.includes('await ') && code.includes('(function()')) {
      code = code.replace(/\(function\(\)/g, '(async function()')
    }
    // Only add semicolons to statement blocks, not value blocks
    if (!isValueBlock) {
      code = code.endsWith(')') ? code + ';' : code
    }
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
        const needsClickedId = calls.some(c => c.includes('__clickedId'))
        const idCapture = needsClickedId ? '\n    var __clickedId = this.id || "";' : ''
        const body = calls.join('\n')
        code = code.replace(
          `__lastEl = __el;\n})();`,
          `__el.onclick = ${fnKeyword}() {${idCapture}\n${body}\n  };\n  __lastEl = __el;\n})();`
        )
        nextBlock = cursor
      }
    }

    if (nextBlock) {
      code += '\n' + generateBlockCode(nextBlock, language)
    }
    return code
  }

  // Handle library import blocks
  const libraryCode = generateLibraryCode(block, language)
  if (libraryCode !== null) {
    let code = marker + traceCall(block) + libraryCode
    const nextBlock = block.getNextBlock()
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
    code = marker + traceCall(block) + code
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
    '<block type="cb_count_from"><value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value><value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>' +
    '<block type="cb_loop_index"></block>' +
    '<block type="cb_while"></block>' +
    '<block type="cb_break"></block>' +
    '<block type="cb_continue"></block>' +
    '<block type="cb_switch_value"></block>' +
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

/** Generate the Functions toolbox category. */
function functionsToolboxXml(): string {
  const hue = hexToHue(FUNCTION_COLOR)
  let xml = `<category name="${t('Functions')}" colour="${hue}">`

  xml += '<block type="cb_create_function">'
  xml += '<value name="PARAM1"><shadow type="text"><field name="TEXT"></field></shadow></value>'
  xml += '<value name="PARAM2"><shadow type="text"><field name="TEXT"></field></shadow></value>'
  xml += '<value name="PARAM3"><shadow type="text"><field name="TEXT"></field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_call_function"></block>'
  xml += '<block type="cb_call_function_return"></block>'

  xml += '</category>'
  return xml
}

/** Generate the Events toolbox category. */
function eventsToolboxXml(): string {
  const hue = hexToHue(EVENT_COLOR)
  let xml = `<category name="${t('Events')}" colour="${hue}">`

  xml += '<block type="cb_when_key_pressed"></block>'

  xml += '<block type="cb_when_clicked">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-button</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_game_loop"></block>'

  xml += '</category>'
  return xml
}

/** Generate the HTML toolbox category with structure + CSS blocks. */
function htmlToolboxXml(): string {
  const hue = hexToHue(HTML_COLOR)
  let xml = `<category name="${t('HTML')}" colour="${hue}">`

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

  xml += '<block type="cb_set_attribute">'
  xml += '<value name="NAME"><shadow type="text"><field name="TEXT">data-value</field></shadow></value>'
  xml += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_set_attribute_by_id">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-id</field></shadow></value>'
  xml += '<value name="NAME"><shadow type="text"><field name="TEXT">data-value</field></shadow></value>'
  xml += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow></value>'
  xml += '</block>'

  xml += '<sep gap="20"></sep>'

  xml += '<block type="cb_set_text">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-id</field></shadow></value>'
  xml += '<value name="TEXT"><shadow type="text"><field name="TEXT">New text</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_get_text">'
  xml += '<value name="ID"><shadow type="text"><field name="TEXT">my-id</field></shadow></value>'
  xml += '</block>'

  xml += '<block type="cb_clicked_id"></block>'

  xml += '<sep gap="12"></sep>'

  // SCSS block
  xml += '<block type="cb_scss_style"></block>'

  xml += '</category>'
  return xml
}

export function getToolboxXml(): string {
  const tier = loadSettings().blockTier
  const tierConfig = BLOCK_TIERS[tier]
  const allowedCategories = tierConfig.categories // empty = show all

  const categories = registry.getCategories()
  let xml = '<xml>'

  for (const cat of categories) {
    // Hide ??? category unless hacker mode is active
    if (cat === '???' && !isHackerModeActive()) continue

    // Tier filter — skip categories not in the active tier (tier 3 = show all)
    if (allowedCategories.length > 0 && !allowedCategories.includes(cat)) continue

    const blocks = registry.getByCategory(cat)
    const color = registry.getCategoryColor(cat)
    // Convert hex color to Blockly hue (0-360)
    const hue = hexToHue(color)
    xml += `<category name="${t(cat)}" colour="${hue}">`

    // Add control flow blocks at the top of the Logic category
    xml += controlFlowToolboxXml(cat)

    // Add vision native blocks at the top of the Vision category
    xml += visionToolboxXml(cat)

    for (const block of blocks) {
      if (block.hidden) continue
      xml += `<block type="cb_${block.name}">`
      for (const input of block.inputs) {
        xml += inputShadowXml(input)
      }
      xml += `</block>`
    }

    xml += '</category>'
  }

  // Add special categories (tier-gated)
  const showAll = allowedCategories.length === 0
  if (showAll || allowedCategories.includes('Functions')) xml += functionsToolboxXml()
  if (showAll || allowedCategories.includes('Events')) xml += eventsToolboxXml()
  if (showAll) xml += htmlToolboxXml()
  if (showAll) xml += librariesToolboxXml()

  // Add built-in Blockly blocks for values
  xml += '<sep></sep>'
  xml += `<category name="${t('Values')}" colour="230">`
  xml += '<block type="math_number"><field name="NUM">0</field></block>'
  xml += '<block type="text"><field name="TEXT">hello</field></block>'
  xml += '<block type="logic_boolean"><field name="BOOL">TRUE</field></block>'
  xml += '<block type="cb_color"><field name="COLOR">#EF4444</field></block>'
  xml += '<sep gap="12"></sep>'
  xml += '<block type="cb_callout"><field name="TEXT">Note: </field></block>'
  xml += '<block type="cb_inline_comment"><field name="TEXT">comment</field></block>'
  xml += '<block type="cb_frame"><field name="NAME">Section</field></block>'
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
    xml += `<category name="${t(cat)}" colour="${hue}">`

    // Add control flow blocks at the top of the Logic category
    xml += controlFlowToolboxXml(cat)

    // Add vision native blocks at the top of the Vision category
    xml += visionToolboxXml(cat)

    for (const block of blocks) {
      if (block.hidden) continue
      xml += `<block type="cb_${block.name}">`
      for (const input of block.inputs) {
        xml += inputShadowXml(input)
      }
      xml += `</block>`
    }

    xml += '</category>'
  }

  // Add Functions category if allowed
  if (allowedCategories.includes('Functions')) {
    xml += functionsToolboxXml()
  }

  // Add Events category if allowed
  if (allowedCategories.includes('Events')) {
    xml += eventsToolboxXml()
  }

  // Add HTML category if allowed
  if (allowedCategories.includes('HTML')) {
    xml += htmlToolboxXml()
  }

  // Add Libraries category if allowed
  if (allowedCategories.includes('Libraries')) {
    xml += librariesToolboxXml()
  }

  // Always include Values category
  xml += '<sep></sep>'
  xml += `<category name="${t('Values')}" colour="230">`
  xml += '<block type="math_number"><field name="NUM">0</field></block>'
  xml += '<block type="text"><field name="TEXT">hello</field></block>'
  xml += '<block type="logic_boolean"><field name="BOOL">TRUE</field></block>'
  xml += '<block type="cb_color"><field name="COLOR">#EF4444</field></block>'
  xml += '<sep gap="12"></sep>'
  xml += '<block type="cb_callout"><field name="TEXT">Note: </field></block>'
  xml += '<block type="cb_inline_comment"><field name="TEXT">comment</field></block>'
  xml += '<block type="cb_frame"><field name="NAME">Section</field></block>'
  xml += '</category>'

  xml += '</xml>'
  return xml
}

/** Inject animation_loop block into the Vision category toolbox. */
function visionToolboxXml(cat: string): string {
  if (cat !== 'Vision') return ''
  return (
    '<block type="cb_animation_loop"></block>' +
    '<sep gap="20"></sep>'
  )
}

function librariesToolboxXml(): string {
  const hue = hexToHue(LIBRARY_COLOR)
  let xml = `<category name="${t('Libraries')}" colour="${hue}">`
  xml += '<block type="cb_import_library"><field name="LIBRARY">p5</field></block>'
  xml += '<sep gap="12"></sep>'
  xml += '<block type="cb_import_prank"><field name="PRANK">theRickroll</field></block>'
  xml += '</category>'
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
    case 'cb_clicked_id': {
      result = `<!-- clicked-id -->`
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
