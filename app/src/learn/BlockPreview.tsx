import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerCustomBlocks } from '../blocks/blockly-register'

interface BlockPreviewProps {
  workspaceJson: Record<string, unknown>
}

export default function BlockPreview({ workspaceJson }: BlockPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Ensure custom blocks are registered before injection
    registerCustomBlocks()

    // Create a read-only workspace with no toolbox and no scrollbars
    const ws = Blockly.inject(containerRef.current, {
      readOnly: true,
      scrollbars: false,
      zoom: { controls: false, wheel: false, startScale: 0.9 },
      theme: Blockly.Theme.defineTheme('cryptoblocks_preview', {
        name: 'cryptoblocks_preview',
        base: Blockly.Themes.Zelos,
        componentStyles: {
          workspaceBackgroundColour: '#11111b',
          toolboxBackgroundColour: 'transparent',
        },
      }),
    })
    workspaceRef.current = ws

    try {
      Blockly.serialization.workspaces.load(workspaceJson, ws)
    } catch (err) {
      console.warn('[BlockPreview] Failed to load workspace JSON:', err)
    }

    return () => {
      ws.dispose()
      workspaceRef.current = null
    }
  // workspaceJson is a stable object reference from lesson data — intentionally not a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-lg border border-[#313244] overflow-hidden bg-[#11111b]">
      <div className="flex items-center px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <span className="text-[10px] font-mono text-[#6c7086] uppercase tracking-wider select-none">
          Blocks
        </span>
      </div>
      <div
        ref={containerRef}
        style={{ height: '180px', width: '100%' }}
      />
    </div>
  )
}
