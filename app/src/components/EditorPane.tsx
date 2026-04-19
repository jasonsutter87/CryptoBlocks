/**
 * The Blockly + Code + Output split-pane view.
 *
 * Used for sandbox plus the three "active" gameplay modes that still use
 * Blockly (challenge / blockset / golf). Code Lab has its own pane because
 * it skips Blockly entirely.
 *
 * Above the split: the per-mode banner (challenge/blockset/golf) when one
 * is active; nothing when in plain sandbox.
 */

import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from '../types/block'
import type { Challenge } from '../challenges'
import type { Blockset } from '../blocksets'
import type { GolfProblem } from '../code-golf'
import type { ExecutionResult } from '../execution/runner'
import BlockEditor from './BlockEditor'
import CodeView from './CodeView'
import { getBlockSourceMap } from '../blocks/blockly-register'
import OutputPanel from './OutputPanel'
import ChallengePanel from './ChallengePanel'
import BlocksetPanel from './BlocksetPanel'
import GolfPanel from './GolfPanel'
import WorkspaceFloatingControls from './WorkspaceFloatingControls'

import type { AppMode } from '../types/appMode'

export type EditorMode = Extract<AppMode, 'sandbox' | 'active-challenge' | 'active-blockset' | 'active-golf'>

interface EditorPaneProps {
  mode: EditorMode
  activeChallenge: Challenge | null
  activeBlockset: Blockset | null
  activeGolfProblem: GolfProblem | null
  blockCount: number
  isRunning: boolean

  // Banner actions
  onCheckChallenge: () => void
  onBackChallenge: () => void
  onCheckBlockset: () => void
  onBackBlockset: () => void
  onCheckGolf: () => void
  onBackGolf: () => void

  // Workspace
  onWorkspaceChange: (ws: Blockly.WorkspaceSvg) => void
  onEditBlock: (def: BlockDefinition) => void
  onDeleteBlock: (def: BlockDefinition) => void
  onSaveAsBlock: (jsCode: string, pyCode: string) => void
  initialWorkspaceState: Record<string, unknown> | null

  // Sandbox-only floating controls
  slowMo: boolean
  onToggleSlowMo: () => void
  onEnterTimeTravel: () => void
  timeTravelAvailable: boolean

  // Split pane
  showCode: boolean
  showOutput: boolean
  splitPercent: number
  onSplitMouseDown: (e: React.MouseEvent) => void

  // CodeView
  code: string
  language: Language
  onLanguageChange: (lang: Language) => void

  // OutputPanel
  result: ExecutionResult | null
  liveOutput: string[]
  lastExecCode: string
}

export default function EditorPane(props: EditorPaneProps) {
  const {
    mode, activeChallenge, activeBlockset, activeGolfProblem, blockCount, isRunning,
    onCheckChallenge, onBackChallenge, onCheckBlockset, onBackBlockset, onCheckGolf, onBackGolf,
    onWorkspaceChange, onEditBlock, onDeleteBlock, onSaveAsBlock, initialWorkspaceState,
    slowMo, onToggleSlowMo, onEnterTimeTravel, timeTravelAvailable,
    showCode, showOutput, splitPercent, onSplitMouseDown,
    code, language, onLanguageChange,
    result, liveOutput, lastExecCode,
  } = props

  const sideOpen = showCode || showOutput
  const editorWidth = sideOpen ? `${splitPercent}%` : '100%'
  const sideWidth = `${100 - splitPercent}%`

  // Click a line in the code view → highlight the block that generated it
  const handleLineClick = (line: number) => {
    const sourceMap = getBlockSourceMap()
    let foundBlockId: string | null = null
    for (const [blockId, range] of sourceMap) {
      if (line >= range.startLine && line <= range.endLine) {
        foundBlockId = blockId
        break
      }
    }
    if (foundBlockId) {
      const ws = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg | null
      if (ws) {
        // Clear previous highlight
        ws.highlightBlock('')
        // Highlight the block
        ws.highlightBlock(foundBlockId)
        // Scroll to the block
        const block = ws.getBlockById(foundBlockId)
        if (block) ws.centerOnBlock(foundBlockId)
      }
    }
  }

  return (
    <>
      {mode === 'active-challenge' && activeChallenge && (
        <ChallengePanel
          challenge={activeChallenge}
          blockCount={blockCount}
          onCheckSolution={onCheckChallenge}
          onBack={onBackChallenge}
          isRunning={isRunning}
        />
      )}
      {mode === 'active-blockset' && activeBlockset && (
        <BlocksetPanel
          blockset={activeBlockset}
          blockCount={blockCount}
          onCheckSolution={onCheckBlockset}
          onBack={onBackBlockset}
          isRunning={isRunning}
        />
      )}
      {mode === 'active-golf' && activeGolfProblem && (
        <GolfPanel
          problem={activeGolfProblem}
          blockCount={blockCount}
          onCheckSolution={onCheckGolf}
          onBack={onBackGolf}
          isRunning={isRunning}
        />
      )}

      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Blockly workspace — full width/height on mobile; split width on desktop.
            In flex-col (mobile) the percentage width is irrelevant; flex-1 fills the column.
            In flex-row (desktop) the explicit width controls the split. */}
        <div
          className="relative flex-1 md:flex-none h-full border-b md:border-b-0 md:border-r border-surface-0 overflow-hidden"
          style={{ width: editorWidth }}
        >
          <BlockEditor
            onWorkspaceChange={onWorkspaceChange}
            onEditBlock={onEditBlock}
            onDeleteBlock={onDeleteBlock}
            onSaveAsBlock={onSaveAsBlock}
            initialWorkspaceState={initialWorkspaceState}
          />
          {mode === 'sandbox' && (
            <WorkspaceFloatingControls
              slowMo={slowMo}
              onToggleSlowMo={onToggleSlowMo}
              slowMoDisabled={isRunning}
              onEnterTimeTravel={onEnterTimeTravel}
              timeTravelAvailable={timeTravelAvailable}
            />
          )}
        </div>

        {/* Desktop split drag handle */}
        {sideOpen && (
          <div
            className="hidden md:flex items-center justify-center w-1.5 cursor-col-resize bg-surface-0 hover:bg-warn active:bg-warn transition-colors flex-shrink-0"
            onMouseDown={onSplitMouseDown}
          >
            <div className="w-0.5 h-8 bg-overlay rounded-full" />
          </div>
        )}

        {/* Desktop: inline code + output panel */}
        {showCode && (
          <div className="hidden md:flex h-full flex-col" style={{ width: sideWidth }}>
            <div className={showOutput ? 'h-1/2' : 'h-full'}>
              <CodeView code={code} language={language} onLanguageChange={onLanguageChange} onLineClick={handleLineClick} />
            </div>
            {showOutput && (
              <div className="h-1/2 border-t border-surface-0">
                <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
              </div>
            )}
          </div>
        )}

        {/* Desktop: output-only panel (no code) */}
        {!showCode && showOutput && (
          <div
            className="hidden md:block h-full border-t md:border-t-0 md:border-l border-surface-0"
            style={{ width: sideWidth }}
          >
            <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
          </div>
        )}

        {/* Mobile: code drawer — slides up from bottom as an overlay */}
        {showCode && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col bg-base border-t-2 border-surface-1 shadow-2xl" style={{ height: '55vh' }}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-mantle border-b border-surface-0 shrink-0">
              <span className="text-xs font-semibold text-overlay uppercase tracking-wide">Code</span>
              <div className="flex items-center gap-2">
                {showOutput && (
                  <span className="text-xs text-success font-medium">Output ready</span>
                )}
              </div>
            </div>
            <div className={showOutput ? 'flex-1 min-h-0 flex flex-col' : 'flex-1 min-h-0'}>
              <div className={showOutput ? 'h-1/2 min-h-0' : 'h-full'}>
                <CodeView code={code} language={language} onLanguageChange={onLanguageChange} onLineClick={handleLineClick} />
              </div>
              {showOutput && (
                <div className="h-1/2 border-t border-surface-0 min-h-0">
                  <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile: output-only drawer (no code panel) */}
        {!showCode && showOutput && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col bg-base border-t-2 border-surface-1 shadow-2xl" style={{ height: '40vh' }}>
            <div className="flex items-center px-3 py-1.5 bg-mantle border-b border-surface-0 shrink-0">
              <span className="text-xs font-semibold text-overlay uppercase tracking-wide">Output</span>
            </div>
            <div className="flex-1 min-h-0">
              <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
