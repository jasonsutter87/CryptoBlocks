import { useState, useCallback, useRef } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from './types/block'
import { generateCode, registerSingleBlock, getToolboxXml } from './blocks/blockly-register'
import { registry } from './blocks/registry'
import { executeCode } from './execution/runner'
import type { ExecutionResult } from './execution/runner'
import Toolbar from './components/Toolbar'
import BlockEditor from './components/BlockEditor'
import CodeView from './components/CodeView'
import OutputPanel from './components/OutputPanel'
import CreateBlockModal from './components/CreateBlockModal'

export default function App() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [liveOutput, setLiveOutput] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockDefinition | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const languageRef = useRef(language)
  languageRef.current = language

  const handleWorkspaceChange = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace
      const generated = generateCode(workspace, languageRef.current)
      setCode(generated)
    },
    []
  )

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      languageRef.current = lang
      if (workspaceRef.current) {
        const generated = generateCode(workspaceRef.current, lang)
        setCode(generated)
      }
    },
    []
  )

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setShowOutput(true)
    setResult(null)
    setLiveOutput([])

    const execResult = await executeCode(code, language, (line) => {
      setLiveOutput((prev) => [...prev, line])
    })
    setResult(execResult)
    setLiveOutput([])
    setIsRunning(false)
  }, [code, language])

  const handleStop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleCreateBlock = useCallback((block: BlockDefinition) => {
    registry.register(block)
    registerSingleBlock(block)
    if (workspaceRef.current) {
      workspaceRef.current.updateToolbox(getToolboxXml())
    }
    setShowCreateModal(false)
    setEditingBlock(null)
  }, [])

  const handleEditBlock = useCallback((blockDef: BlockDefinition) => {
    setEditingBlock(blockDef)
    setShowCreateModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowCreateModal(false)
    setEditingBlock(null)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        language={language}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        showCode={showCode}
        onToggleCode={() => setShowCode((prev) => !prev)}
        onCreateBlock={() => setShowCreateModal(true)}
      />

      <div className="flex-1 flex min-h-0">
        {/* Block Editor */}
        <div
          className={`${
            showCode ? 'w-1/2' : 'w-full'
          } h-full transition-all duration-300 border-r border-[#313244]`}
        >
          <BlockEditor
            onWorkspaceChange={handleWorkspaceChange}
            onEditBlock={handleEditBlock}
          />
        </div>

        {/* Code View */}
        {showCode && (
          <div className="w-1/2 flex flex-col h-full">
            <div className={showOutput ? 'h-1/2' : 'h-full'}>
              <CodeView
                code={code}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Output Panel */}
            {showOutput && (
              <div className="h-1/2 border-t border-[#313244]">
                <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} />
              </div>
            )}
          </div>
        )}

        {/* Output when code view is hidden */}
        {!showCode && showOutput && (
          <div className="absolute bottom-0 left-0 right-0 h-48 border-t border-[#313244]">
            <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateBlockModal
          onBuild={handleCreateBlock}
          onClose={closeModal}
          editBlock={editingBlock}
        />
      )}
    </div>
  )
}
