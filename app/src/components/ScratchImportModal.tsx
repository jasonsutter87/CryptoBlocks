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
        className="bg-base border border-surface-0 rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            Import from Scratch
          </h2>
          <button onClick={onClose} className="text-overlay hover:text-text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pick file */}
        {stage === 'pick' && (
          <div>
            <div
              className="border-2 border-dashed border-surface-1 rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-text font-medium mb-1">
                Drop a .sb3 file here
              </p>
              <p className="text-xs text-overlay">
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
            <p className="text-sm text-text">Converting Scratch blocks...</p>
          </div>
        )}

        {/* Preview */}
        {stage === 'preview' && stats && (
          <div>
            {/* Stats */}
            <div className="bg-surface-0 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-overlay">Conversion rate</span>
                <span className={`text-sm font-bold ${conversionRate > 60 ? 'text-success' : conversionRate > 30 ? 'text-warn' : 'text-danger'}`}>
                  {conversionRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-1 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${conversionRate > 60 ? 'bg-success' : conversionRate > 30 ? 'bg-warn' : 'bg-danger'}`}
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-text font-bold">{stats.totalScratchBlocks}</div>
                  <div className="text-overlay">Scratch blocks</div>
                </div>
                <div>
                  <div className="text-success font-bold">{stats.converted}</div>
                  <div className="text-overlay">Converted</div>
                </div>
                <div>
                  <div className="text-warn font-bold">{stats.skipped}</div>
                  <div className="text-overlay">Skipped</div>
                </div>
              </div>
            </div>

            {/* Variables found */}
            {stats.variables.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-overlay mb-1">Variables imported:</p>
                <div className="flex flex-wrap gap-1">
                  {stats.variables.map((v, i) => (
                    <span key={i} className="text-xs bg-surface-0 text-accent px-2 py-0.5 rounded">
                      {v.name} = {String(v.value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped opcodes */}
            {stats.skippedOpcodes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-overlay mb-1">Not converted (Scratch-only features):</p>
                <div className="flex flex-wrap gap-1">
                  {stats.skippedOpcodes.slice(0, 10).map((op, i) => (
                    <span key={i} className="text-xs bg-surface-0 text-warn px-2 py-0.5 rounded font-mono">
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
                className="flex-1 py-2.5 bg-success text-base font-semibold rounded-lg hover:bg-success/80 transition-colors text-sm"
              >
                Import to Workspace
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-overlay hover:text-text text-sm transition-colors"
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
            <p className="text-sm text-danger mb-4">{error}</p>
            <button
              onClick={() => setStage('pick')}
              className="text-sm text-accent hover:underline"
            >
              Try another file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
