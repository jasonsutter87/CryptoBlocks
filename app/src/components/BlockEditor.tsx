import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks, getToolboxXml, generateBlockTreeCode } from '../blocks/blockly-register'
import { registry } from '../blocks/registry'
import { recordBlockCreated } from '../stats/tracker'
import type { BlockDefinition } from '../types/block'
import { useCollabDoc } from '../collab/CollabPage'
import { bindWorkspaceToYDoc } from '../collab/yjs-blockly-binding'
import { bindPresence } from '../collab/presence'

const ScssEditorModal = lazy(() => import('./ScssEditorModal'))

interface BlockEditorProps {
  onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void
  onEditBlock?: (block: BlockDefinition) => void
  onDeleteBlock?: (block: BlockDefinition) => void
  onSaveAsBlock?: (jsCode: string, pyCode: string) => void
  onBlockSelected?: (blockId: string | null) => void
  initialWorkspaceState?: Record<string, unknown> | null
}

// Register blocks once at module level
let blocksRegistered = false

export default function BlockEditor({ onWorkspaceChange, onEditBlock, onDeleteBlock, onSaveAsBlock, onBlockSelected: _onBlockSelected, initialWorkspaceState }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const callbackRef = useRef(onWorkspaceChange)
  const editCallbackRef = useRef(onEditBlock)
  const deleteCallbackRef = useRef(onDeleteBlock)
  const saveAsBlockRef = useRef(onSaveAsBlock)

  // Collab — bind Yjs if we're in a collab room
  const collabDoc = useCollabDoc()

  // SCSS editor modal state
  const [scssModal, setScssModal] = useState<{ blockId: string; code: string } | null>(null)

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

    // Register "Duplicate Stack" context menu for chains of connected blocks
    const duplicateStackOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: 'Duplicate Stack',
      preconditionFn(scope) {
        const block = scope.block
        if (!block) return 'hidden'
        // Show when the block has at least one next-connected block
        if (block.nextConnection && block.nextConnection.targetBlock()) return 'enabled'
        return 'hidden'
      },
      callback(scope) {
        const block = scope.block
        if (!block) return
        // Serialize the block + entire chain below it
        const state = Blockly.serialization.blocks.save(block)
        if (!state) return
        // Offset so it doesn't land directly on top
        if (state.x != null) state.x += 30
        if (state.y != null) state.y += 30
        // Append the duplicated stack to the workspace
        Blockly.serialization.blocks.append(state, block.workspace)
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'duplicate_stack',
      weight: -1,
    }
    Blockly.ContextMenuRegistry.registry.register(duplicateStackOption)

    // Register "Edit SCSS" context menu for cb_scss_style blocks
    const editScssOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: 'Edit SCSS',
      preconditionFn(scope) {
        return scope.block?.type === 'cb_scss_style' ? 'enabled' : 'hidden'
      },
      callback(scope) {
        const block = scope.block
        if (!block) return
        const code = block.getFieldValue('CODE') || ''
        setScssModal({ blockId: block.id, code })
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'edit_scss',
      weight: -2,
    }
    Blockly.ContextMenuRegistry.registry.register(editScssOption)

    // Register "Lock Block" / "Unlock Block" context menu
    const lockBlockOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText(scope) {
        const block = scope.block
        return block && !block.isMovable() ? 'Unlock Block' : 'Lock Block'
      },
      preconditionFn(scope) {
        return scope.block ? 'enabled' : 'hidden'
      },
      callback(scope) {
        const block = scope.block
        if (!block) return
        block.setMovable(!block.isMovable())
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'lock_block',
      weight: 3,
    }
    Blockly.ContextMenuRegistry.registry.register(lockBlockOption)

    const listener = (event?: Blockly.Events.Abstract) => {
      // Track block creation (only user actions, not workspace load)
      if (event && event.type === Blockly.Events.BLOCK_CREATE && !event.recordUndo === false) {
        const createEvent = event as Blockly.Events.BlockCreate
        // Only count if it's from a user drag, not a load
        if (createEvent.group !== '' && !createEvent.isUiEvent) {
          recordBlockCreated()
        }
      }
      callbackRef.current(workspace)
    }
    workspace.addChangeListener(listener)
    listener()

    // Collab: bind Yjs sync + presence if in a collab room
    let collabBinding: ReturnType<typeof bindWorkspaceToYDoc> | null = null
    let presenceBinding: ReturnType<typeof bindPresence> | null = null
    if (collabDoc) {
      collabBinding = bindWorkspaceToYDoc(workspace, collabDoc)
      // Presence requires the awareness from the WebSocket provider,
      // which is set up in use-collab-room. We access it via the doc's
      // awareness if available (y-partykit attaches it).
      const provider = (collabDoc as unknown as { wsProvider?: { awareness: import('y-protocols/awareness').Awareness } }).wsProvider
      if (provider?.awareness) {
        presenceBinding = bindPresence(workspace, provider.awareness)
      }
    }

    return () => {
      collabBinding?.destroy()
      presenceBinding?.destroy()
      workspace.removeChangeListener(listener)
      Blockly.ContextMenuRegistry.registry.unregister('edit_user_block')
      Blockly.ContextMenuRegistry.registry.unregister('delete_user_block')
      Blockly.ContextMenuRegistry.registry.unregister('save_as_block')
      Blockly.ContextMenuRegistry.registry.unregister('duplicate_stack')
      Blockly.ContextMenuRegistry.registry.unregister('edit_scss')
      Blockly.ContextMenuRegistry.registry.unregister('lock_block')
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

  const handleScssSave = (newCode: string) => {
    if (!scssModal || !workspaceRef.current) return
    const block = workspaceRef.current.getBlockById(scssModal.blockId)
    if (block) block.setFieldValue(newCode, 'CODE')
    setScssModal(null)
  }

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      {scssModal && (
        <Suspense fallback={null}>
          <ScssEditorModal
            initialCode={scssModal.code}
            onSave={handleScssSave}
            onClose={() => setScssModal(null)}
          />
        </Suspense>
      )}
    </>
  )
}
