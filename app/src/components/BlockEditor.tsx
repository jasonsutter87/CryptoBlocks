import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks, getToolboxXml, generateBlockTreeCode } from '../blocks/blockly-register'
import { registry } from '../blocks/registry'
import type { BlockDefinition } from '../types/block'

interface BlockEditorProps {
  onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void
  onEditBlock?: (block: BlockDefinition) => void
  onDeleteBlock?: (block: BlockDefinition) => void
  onSaveAsBlock?: (jsCode: string, pyCode: string) => void
  initialWorkspaceState?: Record<string, unknown> | null
}

// Register blocks once at module level
let blocksRegistered = false

export default function BlockEditor({ onWorkspaceChange, onEditBlock, onDeleteBlock, onSaveAsBlock, initialWorkspaceState }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const callbackRef = useRef(onWorkspaceChange)
  const editCallbackRef = useRef(onEditBlock)
  const deleteCallbackRef = useRef(onDeleteBlock)
  const saveAsBlockRef = useRef(onSaveAsBlock)

  // Keep callback refs up to date without triggering workspace rebuild
  callbackRef.current = onWorkspaceChange
  editCallbackRef.current = onEditBlock
  deleteCallbackRef.current = onDeleteBlock
  saveAsBlockRef.current = onSaveAsBlock

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

    // Restore saved workspace state
    if (initialWorkspaceState) {
      try {
        Blockly.serialization.workspaces.load(initialWorkspaceState, workspace)
      } catch {
        // corrupted state, start fresh
      }
    }

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

    // Register "Save as Block" context menu for any block
    const saveAsBlockOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: 'Save as Block',
      preconditionFn(scope) {
        const block = scope.block
        if (!block) return 'hidden'
        // Show on any statement block (has previous/next connections)
        if (block.previousConnection || block.nextConnection) return 'enabled'
        return 'hidden'
      },
      callback(scope) {
        const block = scope.block
        if (!block || !saveAsBlockRef.current) return
        const jsCode = generateBlockTreeCode(block, 'javascript')
        const pyCode = generateBlockTreeCode(block, 'python')
        saveAsBlockRef.current(jsCode, pyCode)
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'save_as_block',
      weight: 1,
    }
    Blockly.ContextMenuRegistry.registry.register(saveAsBlockOption)

    // Register "Delete Block" context menu for user-created blocks
    const deleteOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: 'Delete Block',
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
        if (def && deleteCallbackRef.current) {
          deleteCallbackRef.current(def)
        }
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'delete_user_block',
      weight: 2,
    }
    Blockly.ContextMenuRegistry.registry.register(deleteOption)

    const listener = () => {
      callbackRef.current(workspace)
    }
    workspace.addChangeListener(listener)
    listener()

    return () => {
      workspace.removeChangeListener(listener)
      Blockly.ContextMenuRegistry.registry.unregister('edit_user_block')
      Blockly.ContextMenuRegistry.registry.unregister('delete_user_block')
      Blockly.ContextMenuRegistry.registry.unregister('save_as_block')
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  // Refresh toolbox when hacker mode toggles (shows/hides ??? category)
  useEffect(() => {
    const handleHackerMode = () => {
      if (workspaceRef.current) {
        workspaceRef.current.updateToolbox(getToolboxXml())
      }
    }
    window.addEventListener('cb:hacker-mode-changed', handleHackerMode)
    return () => window.removeEventListener('cb:hacker-mode-changed', handleHackerMode)
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
