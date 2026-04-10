/**
 * ScratchImportModal — import a .sb3 file and convert to CryptoBlocks.
 *
 * Shows conversion stats: how many blocks converted, which were skipped,
 * and the real JS/Python code behind the imported project.
 */

import { useState, useRef } from 'react'
import { importScratchFile } from '../converters/scratch-import'

interface ScratchImportModalProps {
  onClose: () => void
  onImport: (workspaceState: Record<string, unknown>) => void
}

interface ImportStats {
  totalScratchBlocks: number
  converted: number
  skipped: number
  skippedOpcodes: string[]
  variables: Array<{ name: string; value: string | number }>
  lists: Array<{ name: string; items: unknown[] }>
}

export default function ScratchImportModal({ onClose, onImport }: ScratchImportModalProps) {
  const [stage, setStage] = useState<'pick' | 'loading' | 'preview' | 'error'>('pick')
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [workspace, setWorkspace] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.sb3')) {
      setError('Please select a .sb3 file (Scratch 3.0 project)')
      setStage('error')
      return
    }

    setStage('loading')

    try {
      const result = await importScratchFile(file)
      setWorkspace(result.workspace as unknown as Record<string, unknown>)
      setStats({
        totalScratchBlocks: result.stats.totalScratchBlocks,
        converted: result.stats.converted,
        skipped: result.stats.skipped,
        skippedOpcodes: result.stats.skippedOpcodes,
        variables: result.variables,
        lists: result.lists,
      })
      setStage('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse .sb3 file')
      setStage('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const conversionRate = stats ? Math.round((stats.converted / Math.max(stats.totalScratchBlocks, 1)) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#cdd6f4] flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            Import from Scratch
          </h2>
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pick file */}
        {stage === 'pick' && (
          <div>
            <div
              className="border-2 border-dashed border-[#45475a] rounded-xl p-8 text-center cursor-pointer hover:border-[#89b4fa] transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-[#cdd6f4] font-medium mb-1">
                Drop a .sb3 file here
              </p>
              <p className="text-xs text-[#6c7086]">
                or click to browse
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".sb3"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <p className="text-xs text-[#585b70] mt-3 text-center">
              Export your Scratch project as .sb3 from scratch.mit.edu
            </p>
          </div>
        )}

        {/* Loading */}
        {stage === 'loading' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 animate-bounce">🐱</div>
            <p className="text-sm text-[#cdd6f4]">Converting Scratch blocks...</p>
          </div>
        )}

        {/* Preview */}
        {stage === 'preview' && stats && (
          <div>
            {/* Stats */}
            <div className="bg-[#313244] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#6c7086]">Conversion rate</span>
                <span className={`text-sm font-bold ${conversionRate > 60 ? 'text-[#a6e3a1]' : conversionRate > 30 ? 'text-[#f9e2af]' : 'text-[#f38ba8]'}`}>
                  {conversionRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#45475a] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${conversionRate > 60 ? 'bg-[#a6e3a1]' : conversionRate > 30 ? 'bg-[#f9e2af]' : 'bg-[#f38ba8]'}`}
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[#cdd6f4] font-bold">{stats.totalScratchBlocks}</div>
                  <div className="text-[#6c7086]">Scratch blocks</div>
                </div>
                <div>
                  <div className="text-[#a6e3a1] font-bold">{stats.converted}</div>
                  <div className="text-[#6c7086]">Converted</div>
                </div>
                <div>
                  <div className="text-[#f9e2af] font-bold">{stats.skipped}</div>
                  <div className="text-[#6c7086]">Skipped</div>
                </div>
              </div>
            </div>

            {/* Variables found */}
            {stats.variables.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-[#6c7086] mb-1">Variables imported:</p>
                <div className="flex flex-wrap gap-1">
                  {stats.variables.map((v, i) => (
                    <span key={i} className="text-xs bg-[#313244] text-[#89b4fa] px-2 py-0.5 rounded">
                      {v.name} = {String(v.value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped opcodes */}
            {stats.skippedOpcodes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#6c7086] mb-1">Not converted (Scratch-only features):</p>
                <div className="flex flex-wrap gap-1">
                  {stats.skippedOpcodes.slice(0, 10).map((op, i) => (
                    <span key={i} className="text-xs bg-[#313244] text-[#f9e2af] px-2 py-0.5 rounded font-mono">
                      {op.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {stats.skippedOpcodes.length > 10 && (
                    <span className="text-xs text-[#585b70]">
                      +{stats.skippedOpcodes.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-[#585b70] mb-4">
              Sprite-based blocks (motion, looks, pen) can't be converted — CryptoBlocks uses a different approach. Logic, math, variables, and control flow are imported.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (workspace) onImport(workspace)
                  onClose()
                }}
                className="flex-1 py-2.5 bg-[#a6e3a1] text-[#1e1e2e] font-semibold rounded-lg hover:bg-[#a6e3a1]/80 transition-colors text-sm"
              >
                Import to Workspace
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-[#6c7086] hover:text-[#cdd6f4] text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">❌</div>
            <p className="text-sm text-[#f38ba8] mb-4">{error}</p>
            <button
              onClick={() => setStage('pick')}
              className="text-sm text-[#89b4fa] hover:underline"
            >
              Try another file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
