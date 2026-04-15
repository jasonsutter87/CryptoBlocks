/**
 * Code Lab full-screen view: instructions banner, CodeMirror editor,
 * optional output panel. Used when mode === 'active-lab' (no Blockly).
 */

import type { LabExercise } from '../code-lab'
import type { ExecutionResult } from '../execution/runner'
import LabPanel from './LabPanel'
import CodeMirrorEditor from '../learn/CodeMirrorEditor'
import OutputPanel from './OutputPanel'

interface ActiveLabPaneProps {
  exercise: LabExercise
  labCode: string
  onLabCodeChange: (code: string) => void
  onCheckSolution: () => void
  onBack: () => void
  isRunning: boolean
  showOutput: boolean
  result: ExecutionResult | null
  liveOutput: string[]
  lastExecCode: string
}

export default function ActiveLabPane(props: ActiveLabPaneProps) {
  const { exercise, labCode, onLabCodeChange, onCheckSolution, onBack,
    isRunning, showOutput, result, liveOutput, lastExecCode } = props

  return (
    <>
      <LabPanel
        exercise={exercise}
        onCheckSolution={onCheckSolution}
        onBack={onBack}
        isRunning={isRunning}
      />
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className={`${showOutput ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'} flex flex-col`}>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-[#313244]">
            <span className="text-xs text-[#6c7086] uppercase tracking-wide font-semibold mr-2">Code Lab</span>
            <span className="text-xs text-[#f9e2af] bg-[#313244] px-2 py-0.5 rounded">JavaScript</span>
          </div>
          <div className="flex-1 min-h-0">
            <CodeMirrorEditor code={labCode} onChange={onLabCodeChange} language="javascript" height="100%" />
          </div>
        </div>
        {showOutput && (
          <div className="h-1/2 md:h-full md:w-1/2 border-t md:border-t-0 md:border-l border-[#313244]">
            <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
          </div>
        )}
      </div>
    </>
  )
}
