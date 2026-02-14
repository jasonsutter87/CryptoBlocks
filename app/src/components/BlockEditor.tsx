import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks, getToolboxXml } from '../blocks/blockly-register'

interface BlockEditorProps {
  onWorkspaceChange: (workspace: Blockly.Workspace) => void
}

// Register blocks once at module level
let blocksRegistered = false

export default function BlockEditor({ onWorkspaceChange }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const callbackRef = useRef(onWorkspaceChange)

  // Keep callback ref up to date without triggering workspace rebuild
  callbackRef.current = onWorkspaceChange

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

    const listener = () => {
      callbackRef.current(workspace)
    }
    workspace.addChangeListener(listener)
    listener()

    return () => {
      workspace.removeChangeListener(listener)
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
