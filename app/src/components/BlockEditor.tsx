import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks, getToolboxXml, generateBlockTreeCode, getBlockSourceMap } from '../blocks/blockly-register'
import { registry } from '../blocks/registry'
import { recordBlockCreated } from '../stats/tracker'
import type { BlockDefinition } from '../types/block'
import { useCollabDoc, useCollabAwareness } from '../collab/CollabPage'
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
  const collabAwareness = useCollabAwareness()

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

    // Register "Show Line Number" context menu option
    if (!Blockly.ContextMenuRegistry.registry.getItem('showLineNumber')) {
      Blockly.ContextMenuRegistry.registry.register({
        id: 'showLineNumber',
        weight: 200,
        displayText: () => '📍 Show Line Number',
        preconditionFn: (scope) => scope.block ? 'enabled' : 'hidden',
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        callback: (scope) => {
          if (!scope.block) return
          const sourceMap = getBlockSourceMap()
          const range = sourceMap.get(scope.block.id)
          if (range) {
            alert(`Lines ${range.startLine}–${range.endLine}`)
          } else {
            alert('No line mapping found — run the program first')
          }
        },
      })
    }

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
      // Track block creation — only manual user drags from the toolbox,
      // NOT workspace loads (examples, Open in Editor, history rollback).
      // recordUndo is false during programmatic loads.
      if (event &&
          event.type === Blockly.Events.BLOCK_CREATE &&
          event.recordUndo === true &&
          !event.isUiEvent) {
        recordBlockCreated()
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
      if (collabAwareness) {
        presenceBinding = bindPresence(workspace, collabAwareness)
      }
    }

    // Multi-select: Cmd/Ctrl+Click to toggle block selection
    const selectedBlocks = new Set<string>()
    const handleMultiSelect = (e: PointerEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        // Regular click — clear multi-selection
        if (selectedBlocks.size > 0) {
          for (const id of selectedBlocks) {
            const b = workspace.getBlockById(id)
            if (b) (b as Blockly.BlockSvg).removeSelect()
          }
          selectedBlocks.clear()
        }
        return
      }

      // Find the block that was clicked
      const target = e.target as SVGElement
      let el: SVGElement | null = target
      let blockId: string | null = null
      while (el) {
        if (el.getAttribute?.('data-id')) {
          blockId = el.getAttribute('data-id')
          break
        }
        el = el.parentElement as SVGElement | null
      }
      if (!blockId) return

      e.stopPropagation()
      e.preventDefault()

      const block = workspace.getBlockById(blockId) as Blockly.BlockSvg | null
      if (!block) return

      if (selectedBlocks.has(blockId)) {
        selectedBlocks.delete(blockId)
        block.removeSelect()
      } else {
        selectedBlocks.add(blockId)
        block.addSelect()
      }
    }

    const svgEl = workspace.getParentSvg()
    if (svgEl) {
      svgEl.addEventListener('pointerdown', handleMultiSelect, true)
    }

    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      const ws = workspaceRef.current
      if (!ws) return
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd+G — snap all blocks to grid
      if (isMod && (e.key === 'g' || e.key === 'G') && !e.shiftKey) {
        e.preventDefault()
        const blocks = ws.getTopBlocks(false)
        const gridSpacing = 25
        for (const block of blocks) {
          const pos = block.getRelativeToSurfaceXY()
          const snappedX = Math.round(pos.x / gridSpacing) * gridSpacing
          const snappedY = Math.round(pos.y / gridSpacing) * gridSpacing
          block.moveBy(snappedX - pos.x, snappedY - pos.y)
        }
      }

      // Ctrl/Cmd+A — select all blocks (highlight)
      if (isMod && (e.key === 'a' || e.key === 'A') && !e.shiftKey) {
        // Only intercept when workspace is focused (not in a text input)
        const active = document.activeElement
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
        e.preventDefault()
        const blocks = ws.getTopBlocks(false)
        // Blockly doesn't have native multi-select, so we highlight all
        // by selecting each and fitting the view
        ws.highlightBlock('')
        for (const block of blocks) {
          block.select()
          block.addSelect()
        }
        ws.zoomToFit()
      }

      // Ctrl/Cmd+Shift+A — deselect all
      if (isMod && (e.key === 'a' || e.key === 'A') && e.shiftKey) {
        e.preventDefault()
        const blocks = ws.getAllBlocks(false)
        for (const block of blocks) {
          block.unselect()
        }
      }

      // Ctrl/Cmd+L — tidy/auto-layout in two columns (functions left, chains right)
      if (isMod && (e.key === 'l' || e.key === 'L') && !e.shiftKey) {
        e.preventDefault()
        const blocks = ws.getTopBlocks(true)

        // Split into functions (standalone) and chains (connected blocks like globals)
        const functions: Blockly.BlockSvg[] = []
        const chains: Blockly.BlockSvg[] = []

        for (const block of blocks) {
          const b = block as Blockly.BlockSvg
          // Function blocks or standalone blocks without next connections go left
          if (b.type === 'cb_create_function' || b.type === 'cb_callout') {
            functions.push(b)
          } else {
            chains.push(b)
          }
        }

        // Left column — functions
        let leftY = 50
        for (const block of functions) {
          const pos = block.getRelativeToSurfaceXY()
          block.moveBy(50 - pos.x, leftY - pos.y)
          leftY += block.getHeightWidth().height + 30
        }

        // Right column — chains (globals, comments, etc.)
        let rightY = 50
        const rightX = 500
        for (const block of chains) {
          const pos = block.getRelativeToSurfaceXY()
          block.moveBy(rightX - pos.x, rightY - pos.y)
          rightY += block.getHeightWidth().height + 30
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)

    return () => {
      if (svgEl) svgEl.removeEventListener('pointerdown', handleMultiSelect, true)
      document.removeEventListener('keydown', handleKeyboard)
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
