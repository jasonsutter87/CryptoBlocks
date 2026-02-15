import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks, getToolboxXml } from '../blocks/blockly-register'
import { registry } from '../blocks/registry'
import type { BlockDefinition } from '../types/block'

interface BlockEditorProps {
  onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void
  onEditBlock?: (block: BlockDefinition) => void
}

// Register blocks once at module level
let blocksRegistered = false

export default function BlockEditor({ onWorkspaceChange, onEditBlock }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const callbackRef = useRef(onWorkspaceChange)
  const editCallbackRef = useRef(onEditBlock)

  // Keep callback refs up to date without triggering workspace rebuild
  callbackRef.current = onWorkspaceChange
  editCallbackRef.current = onEditBlock

  useEffect(() => {
    if (!containerRef.current) return

    if (!blocksRegistered) {
      registerCustomBlocks()
      blocksRegistered = true
    }

    const toolboxXml = getToolboxXml()

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: toolboxXml,
      theme: Blockly.Themes.Classic,
      grid: {
        spacing: 25,
        length: 3,
        colour: '#2a2a3d',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      renderer: 'zelos',
    })

    workspaceRef.current = workspace

    // Register "Edit Block" context menu for user-created blocks
    const editOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: 'Edit Block',
      preconditionFn(scope) {
        const block = scope.block
        if (!block) return 'hidden'
        const name = block.type.replace('cb_', '')
        const def = registry.get(name)
        if (def && def.author === 'User') return 'enabled'
        return 'hidden'
      },
      callback(scope) {
        const block = scope.block
        if (!block) return
        const name = block.type.replace('cb_', '')
        const def = registry.get(name)
        if (def && editCallbackRef.current) {
          editCallbackRef.current(def)
        }
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'edit_user_block',
      weight: 0,
    }
    Blockly.ContextMenuRegistry.registry.register(editOption)

    const listener = () => {
      callbackRef.current(workspace)
    }
    workspace.addChangeListener(listener)
    listener()

    return () => {
      workspace.removeChangeListener(listener)
      Blockly.ContextMenuRegistry.registry.unregister('edit_user_block')
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current)
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}
