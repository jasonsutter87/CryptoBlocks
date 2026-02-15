import { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from './types/block'
import { generateCode, registerSingleBlock, getToolboxXml } from './blocks/blockly-register'
import { registry } from './blocks/registry'
import { executeCode } from './execution/runner'
import type { ExecutionResult } from './execution/runner'
import {
  saveCustomBlocksToLocal,
  saveWorkspaceToLocal,
  loadFromLocalStorage,
  exportBlocksFile,
  importBlocksFile,
} from './storage'
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
  const [customBlocks, setCustomBlocks] = useState<BlockDefinition[]>([])
  const [initialWorkspaceState, setInitialWorkspaceState] = useState<Record<string, unknown> | null>(null)
  const [restored, setRestored] = useState(false)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const languageRef = useRef(language)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  languageRef.current = language

  // Restore from localStorage on mount
  useEffect(() => {
    const { customBlocks: saved, workspaceState } = loadFromLocalStorage()
    if (saved.length > 0) {
      for (const block of saved) {
        registry.register(block)
        registerSingleBlock(block)
      }
      setCustomBlocks(saved)
    }
    setInitialWorkspaceState(workspaceState)
    setRestored(true)
  }, [])

  const handleWorkspaceChange = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace
      const generated = generateCode(workspace, languageRef.current)
      setCode(generated)

      // Debounced auto-save workspace
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveWorkspaceToLocal(workspace)
      }, 500)
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

    // Save custom blocks to localStorage
    setCustomBlocks((prev) => {
      const updated = [...prev.filter((b) => b.name !== block.name), block]
      saveCustomBlocksToLocal(updated)
      return updated
    })

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

  const handleExport = useCallback(() => {
    if (workspaceRef.current) {
      exportBlocksFile(customBlocks, workspaceRef.current)
    }
  }, [customBlocks])

  const handleImport = useCallback(async (file: File) => {
    try {
      const data = await importBlocksFile(file)

      // Register imported custom blocks
      for (const block of data.customBlocks) {
        registry.register(block)
        registerSingleBlock(block)
      }

      setCustomBlocks(data.customBlocks)
      saveCustomBlocksToLocal(data.customBlocks)

      // Load workspace
      if (workspaceRef.current) {
        workspaceRef.current.updateToolbox(getToolboxXml())
        Blockly.serialization.workspaces.load(data.workspaceState, workspaceRef.current)
        saveWorkspaceToLocal(workspaceRef.current)
      }
    } catch (err) {
      console.error('Failed to import .blocks file:', err)
    }
  }, [])

  // Don't render BlockEditor until we've loaded from localStorage
  if (!restored) return null

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
        onExport={handleExport}
        onImport={handleImport}
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
            initialWorkspaceState={initialWorkspaceState}
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
