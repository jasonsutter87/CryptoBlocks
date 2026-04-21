/**
 * Block Warnings — scan the workspace after execution and attach yellow
 * triangle warnings to blocks that have common issues.
 *
 * Checks:
 *  1. Value inputs with no connected block (empty required inputs)
 *  2. cb_call_function blocks whose NAME field doesn't match any defined function
 *  3. Blocks with type starting with `cb_` that aren't registered in the registry
 *
 * Call clearBlockWarnings(workspace) before a run and
 * checkBlockWarnings(workspace) after execution completes.
 */

import * as Blockly from 'blockly'
import { registry } from './registry'

// Collect all function definition names from the workspace
function getDefinedFunctions(workspace: Blockly.WorkspaceSvg): Set<string> {
  const names = new Set<string>()
  const allBlocks = workspace.getAllBlocks(false)
  for (const block of allBlocks) {
    if (block.type === 'cb_create_function') {
      const name = block.getFieldValue('NAME')
      if (name) names.add(name)
    }
  }
  return names
}

export function clearBlockWarnings(workspace: Blockly.WorkspaceSvg): void {
  const allBlocks = workspace.getAllBlocks(false)
  for (const block of allBlocks) {
    block.setWarningText(null)
  }
}

export function checkBlockWarnings(workspace: Blockly.WorkspaceSvg): void {
  const allBlocks = workspace.getAllBlocks(false)
  const definedFns = getDefinedFunctions(workspace)

  for (const block of allBlocks) {
    const warnings: string[] = []

    // 1. Check for empty value inputs (required but not connected)
    for (const input of block.inputList) {
      if (input.connection && input.connection.type === Blockly.ConnectionType.INPUT_VALUE && !input.connection.targetBlock()) {
        // Only warn if the input has a name (i.e. it's a real required slot, not decorative)
        if (input.name) {
          warnings.push(`Input "${input.name}" is not connected`)
        }
      }
    }

    // 2. Check call_function blocks reference a defined function
    if (block.type === 'cb_call_function' || block.type === 'cb_call_function_return') {
      const name = block.getFieldValue('NAME')
      if (name && !definedFns.has(name)) {
        warnings.push(`Function "${name}" is not defined`)
      }
    }

    // 3. Check cb_ blocks are in the registry
    if (block.type.startsWith('cb_')) {
      const registryName = block.type.replace(/^cb_/, '')
      const def = registry.get(registryName)
      if (!def) {
        // Could be a native cb_ block (control flow, html etc.) — only warn
        // if the block type looks user-defined (contains double underscores or
        // doesn't match known native prefixes)
        const isLikelyNative = /^cb_(if|if_else|repeat|count_from|loop_index|while|break|continue|container|row|column|div|heading|paragraph|image|button|link|set_|get_|clicked_|scss|callout|inline_comment|frame|import_|when_|game_loop|animation_loop|create_function|call_function|true|false)/.test(block.type)
        if (!isLikelyNative) {
          warnings.push(`Block type "${block.type}" is not registered`)
        }
      }
    }

    if (warnings.length > 0) {
      block.setWarningText(warnings.join('\n'))
    }
  }
}
