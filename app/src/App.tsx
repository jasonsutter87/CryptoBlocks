import { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from './types/block'
import { generateCode, generateHtmlMarkup, registerSingleBlock, getToolboxXml, getFilteredToolboxXml } from './blocks/blockly-register'
import { registry } from './blocks/registry'
import { executeCode } from './execution/runner'
import type { ExecutionResult, ExecutionHandle } from './execution/runner'
import {
  saveCustomBlocksToLocal,
  saveWorkspaceToLocal,
  loadFromLocalStorage,
  exportBlocksFile,
  importBlocksFile,
} from './storage'
import {
  generateStandaloneHtml,
  generateEmbedSnippet,
  downloadHtml,
  copyToClipboard,
} from './export-html'
import type { Challenge } from './challenges'
import { getNextChallenge } from './challenges'
import { validateOutput, calculateStars, countBlocks } from './challenges/validator'
import { saveProgress } from './challenges/progress'
import Toolbar from './components/Toolbar'
import BlockEditor from './components/BlockEditor'
import CodeView from './components/CodeView'
import OutputPanel from './components/OutputPanel'
import CreateBlockModal from './components/CreateBlockModal'
import ChallengeBrowser from './components/ChallengeBrowser'
import ChallengePanel from './components/ChallengePanel'
import ChallengeComplete from './components/ChallengeComplete'
import ExamplesBrowser from './components/ExamplesBrowser'
import CodeToBlocksModal from './components/CodeToBlocksModal'
import PublishModal from './components/PublishModal'
import type { ConversionResult } from './converters/js-to-workspace'
import type { Example } from './examples'

type AppMode = 'sandbox' | 'challenges' | 'active-challenge'

export default function App() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [liveOutput, setLiveOutput] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [showCodeToBlocks, setShowCodeToBlocks] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockDefinition | null>(null)
  const [customBlocks, setCustomBlocks] = useState<BlockDefinition[]>([])
  const [initialWorkspaceState, setInitialWorkspaceState] = useState<Record<string, unknown> | null>(null)
  const [restored, setRestored] = useState(false)

  // Challenge state
  const [mode, setMode] = useState<AppMode>('sandbox')
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [blockCount, setBlockCount] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [challengeStars, setChallengeStars] = useState(0)

  // Store sandbox workspace before entering challenge mode
  const savedSandboxState = useRef<Record<string, unknown> | null>(null)

  // Execution handle for stop button (CB-R2-002)
  const executionHandleRef = useRef<ExecutionHandle | null>(null)

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const languageRef = useRef(language)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modeRef = useRef(mode)
  languageRef.current = language
  modeRef.current = mode

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
      const lang = languageRef.current
      const generated = lang === 'html'
        ? generateHtmlMarkup(workspace)
        : generateCode(workspace, lang)
      setCode(generated)
      setBlockCount(countBlocks(workspace))

      // Debounced auto-save workspace (only in sandbox mode)
      if (modeRef.current === 'sandbox') {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          saveWorkspaceToLocal(workspace)
        }, 500)
      }
    },
    []
  )

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang)
      languageRef.current = lang
      if (workspaceRef.current) {
        const generated = lang === 'html'
          ? generateHtmlMarkup(workspaceRef.current)
          : generateCode(workspaceRef.current, lang)
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

    // Always execute as JS or Python — HTML peek is display-only
    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html' && workspaceRef.current
      ? generateCode(workspaceRef.current, 'javascript')
      : code

    const handle = executeCode(execCode, execLang, (line) => {
      setLiveOutput((prev) => [...prev, line])
    })
    executionHandleRef.current = handle

    const execResult = await handle.promise
    executionHandleRef.current = null
    setResult(execResult)
    setLiveOutput([])
    setIsRunning(false)
  }, [code, language])

  const handleStop = useCallback(() => {
    executionHandleRef.current?.abort()
    executionHandleRef.current = null
    setIsRunning(false)
  }, [])

  const handleCheckSolution = useCallback(async () => {
    if (!activeChallenge || !workspaceRef.current) return

    setIsRunning(true)
    setShowOutput(true)
    setResult(null)
    setLiveOutput([])

    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html' && workspaceRef.current
      ? generateCode(workspaceRef.current, 'javascript')
      : code

    const handle = executeCode(execCode, execLang, (line) => {
      setLiveOutput((prev) => [...prev, line])
    })
    executionHandleRef.current = handle

    const execResult = await handle.promise
    executionHandleRef.current = null
    setResult(execResult)
    setLiveOutput([])
    setIsRunning(false)

    // Validate
    if (execResult.error) return

    const passed = validateOutput(execResult.output, activeChallenge.expectedOutput)
    if (passed) {
      const blocks = countBlocks(workspaceRef.current)
      const stars = calculateStars(blocks, activeChallenge.par)
      setChallengeStars(stars)

      saveProgress({
        challengeId: activeChallenge.id,
        completed: true,
        stars,
        bestBlockCount: blocks,
        attempts: 1,
      })

      setShowComplete(true)
    }
  }, [code, language, activeChallenge])

  const handleSelectChallenge = useCallback((challenge: Challenge) => {
    // Save current sandbox workspace
    if (workspaceRef.current && modeRef.current === 'sandbox') {
      savedSandboxState.current = Blockly.serialization.workspaces.save(workspaceRef.current)
    }

    setActiveChallenge(challenge)
    setMode('active-challenge')
    setShowComplete(false)
    setShowOutput(false)
    setResult(null)
    setBlockCount(0)

    // Apply restricted toolbox and clear workspace
    setTimeout(() => {
      if (workspaceRef.current) {
        const toolbox = challenge.allowedCategories
          ? getFilteredToolboxXml(challenge.allowedCategories)
          : getToolboxXml()
        workspaceRef.current.updateToolbox(toolbox)
        workspaceRef.current.clear()

        if (challenge.starterBlocks) {
          Blockly.serialization.workspaces.load(challenge.starterBlocks, workspaceRef.current)
        }
      }
    }, 0)
  }, [])

  const handleBackToSandbox = useCallback(() => {
    setMode('sandbox')
    setActiveChallenge(null)
    setShowComplete(false)

    // Restore full toolbox and sandbox workspace
    setTimeout(() => {
      if (workspaceRef.current) {
        workspaceRef.current.updateToolbox(getToolboxXml())
        workspaceRef.current.clear()
        if (savedSandboxState.current) {
          Blockly.serialization.workspaces.load(savedSandboxState.current, workspaceRef.current)
        }
      }
    }, 0)
  }, [])

  const handleBackToChallenges = useCallback(() => {
    setMode('challenges')
    setActiveChallenge(null)
    setShowComplete(false)
  }, [])

  const handleNextChallenge = useCallback(() => {
    if (!activeChallenge) return
    const next = getNextChallenge(activeChallenge.id)
    if (next) {
      handleSelectChallenge(next)
    } else {
      handleBackToChallenges()
    }
  }, [activeChallenge, handleSelectChallenge, handleBackToChallenges])

  const handleRetryChallenge = useCallback(() => {
    setShowComplete(false)
    setResult(null)
    setShowOutput(false)
    if (workspaceRef.current) {
      workspaceRef.current.clear()
    }
  }, [])

  const handleOpenChallenges = useCallback(() => {
    if (mode === 'challenges') {
      handleBackToSandbox()
    } else {
      setMode('challenges')
    }
  }, [mode, handleBackToSandbox])

  const handleSelectExample = useCallback((example: Example) => {
    setShowExamples(false)

    // Ensure we're in sandbox mode
    if (modeRef.current !== 'sandbox') {
      setMode('sandbox')
      setActiveChallenge(null)
      setShowComplete(false)
    }

    setTimeout(() => {
      if (workspaceRef.current) {
        // Restore full toolbox if coming from challenge mode
        if (modeRef.current !== 'sandbox') {
          workspaceRef.current.updateToolbox(getToolboxXml())
        }
        workspaceRef.current.clear()
        Blockly.serialization.workspaces.load(example.workspace, workspaceRef.current)
      }
    }, 0)
  }, [])

  const handleCodeToBlocks = useCallback((result: ConversionResult) => {
    // Register any new custom blocks
    for (const blockDef of result.newBlocks) {
      registry.register(blockDef)
      registerSingleBlock(blockDef)
    }

    // Persist new blocks
    if (result.newBlocks.length > 0) {
      setCustomBlocks((prev) => {
        const updated = [...prev]
        for (const b of result.newBlocks) {
          const idx = updated.findIndex((x) => x.name === b.name)
          if (idx >= 0) updated[idx] = b
          else updated.push(b)
        }
        saveCustomBlocksToLocal(updated)
        return updated
      })
    }

    // Update toolbox and load workspace
    setTimeout(() => {
      if (workspaceRef.current) {
        workspaceRef.current.updateToolbox(getToolboxXml())
        workspaceRef.current.clear()
        Blockly.serialization.workspaces.load(result.workspace, workspaceRef.current)
      }
    }, 0)

    setShowCodeToBlocks(false)
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

  const handleSaveAsBlock = useCallback((jsCode: string, pyCode: string) => {
    setEditingBlock({
      name: '',
      author: 'User',
      version: '1.0.0',
      description: '',
      category: 'My Blocks',
      inputs: [],
      outputs: [],
      implementations: { javascript: jsCode, python: pyCode },
      tests: [],
      color: '#F59E0B',
      shape: 'statement',
    })
    setShowCreateModal(true)
  }, [])

  const handleClear = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.clear()
    }
    setResult(null)
    setLiveOutput([])
    setShowOutput(false)
  }, [])

  const closeModal = useCallback(() => {
    setShowCreateModal(false)
    setEditingBlock(null)
  }, [])

  const handleExportHtml = useCallback(() => {
    const jsCode = language === 'html' && workspaceRef.current
      ? generateCode(workspaceRef.current, 'javascript')
      : code
    const html = generateStandaloneHtml(jsCode, { title: 'CryptoBlocks Project' })
    downloadHtml(html)
  }, [code, language])

  const handleCopyEmbed = useCallback(async () => {
    const jsCode = language === 'html' && workspaceRef.current
      ? generateCode(workspaceRef.current, 'javascript')
      : code
    const snippet = generateEmbedSnippet(jsCode)
    await copyToClipboard(snippet)
  }, [code, language])

  const getPublishHtml = useCallback(() => {
    const jsCode = language === 'html' && workspaceRef.current
      ? generateCode(workspaceRef.current, 'javascript')
      : code
    return generateStandaloneHtml(jsCode, { title: 'CryptoBlocks Project' })
  }, [code, language])

  const handleExport = useCallback(() => {
    if (workspaceRef.current) {
      exportBlocksFile(customBlocks, workspaceRef.current)
    }
  }, [customBlocks])

  const handleImportAsBlock = useCallback(async (file: File) => {
    try {
      const data = await importBlocksFile(file)

      // Register imported custom blocks so headless workspace can deserialize them
      for (const block of data.customBlocks) {
        registry.register(block)
        registerSingleBlock(block)
      }

      // Create headless workspace and load state
      const headless = new Blockly.Workspace()
      Blockly.serialization.workspaces.load(data.workspaceState, headless)

      // Generate code from the headless workspace
      const jsCode = generateCode(headless, 'javascript')
      const pyCode = generateCode(headless, 'python')
      headless.dispose()

      // Derive function name from filename (strip .blocks, sanitize to snake_case)
      const baseName = file.name.replace(/\.blocks$/i, '')
      const funcName = baseName
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'imported_block'

      // Wrap generated code in function definitions
      const wrappedJs = `function ${funcName}() {\n${jsCode.split('\n').map(l => '  ' + l).join('\n')}\n}`
      const wrappedPy = `def ${funcName}():\n${pyCode.split('\n').map(l => '    ' + l).join('\n')}`

      // Pre-populate editingBlock and open CreateBlockModal
      setEditingBlock({
        name: funcName,
        author: 'User',
        version: '1.0.0',
        description: `Imported from ${file.name}`,
        category: 'My Blocks',
        inputs: [],
        outputs: [],
        implementations: { javascript: wrappedJs, python: wrappedPy },
        tests: [],
        color: '#F59E0B',
        shape: 'statement',
      })
      setShowCreateModal(true)
    } catch (err) {
      console.error('Failed to import .blocks file as block:', err)
    }
  }, [])

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
        onCodeToBlocks={() => setShowCodeToBlocks(true)}
        onExport={handleExport}
        onImport={handleImport}
        onImportAsBlock={handleImportAsBlock}
        onExportHtml={handleExportHtml}
        onCopyEmbed={handleCopyEmbed}
        onPublish={() => setShowPublishModal(true)}
        onClear={handleClear}
        mode={mode}
        onOpenChallenges={handleOpenChallenges}
        onOpenExamples={() => setShowExamples(true)}
      />

      {/* Challenge Browser Mode */}
      {mode === 'challenges' && (
        <ChallengeBrowser
          onSelectChallenge={handleSelectChallenge}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Editor Mode (sandbox or active-challenge) */}
      {mode !== 'challenges' && (
        <>
          {/* Challenge Panel Banner */}
          {mode === 'active-challenge' && activeChallenge && (
            <ChallengePanel
              challenge={activeChallenge}
              blockCount={blockCount}
              onCheckSolution={handleCheckSolution}
              onBack={handleBackToChallenges}
              isRunning={isRunning}
            />
          )}

          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Block Editor */}
            <div
              className={`${
                showCode ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'
              } transition-all duration-300 border-b md:border-b-0 md:border-r border-[#313244]`}
            >
              <BlockEditor
                onWorkspaceChange={handleWorkspaceChange}
                onEditBlock={handleEditBlock}
                onSaveAsBlock={handleSaveAsBlock}
                initialWorkspaceState={initialWorkspaceState}
              />
            </div>

            {/* Code View */}
            {showCode && (
              <div className="h-1/2 md:h-full md:w-1/2 flex flex-col">
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
        </>
      )}

      {showCreateModal && (
        <CreateBlockModal
          onBuild={handleCreateBlock}
          onClose={closeModal}
          editBlock={editingBlock}
        />
      )}

      {/* Examples Browser Modal */}
      {showExamples && (
        <ExamplesBrowser
          onSelectExample={handleSelectExample}
          onClose={() => setShowExamples(false)}
        />
      )}

      {/* Code to Blocks Modal */}
      {showCodeToBlocks && (
        <CodeToBlocksModal
          onConvert={handleCodeToBlocks}
          onClose={() => setShowCodeToBlocks(false)}
        />
      )}

      {/* Publish to GitHub Modal */}
      {showPublishModal && (
        <PublishModal
          getHtml={getPublishHtml}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {/* Challenge Complete Overlay */}
      {showComplete && activeChallenge && (
        <ChallengeComplete
          stars={challengeStars}
          blockCount={blockCount}
          par={activeChallenge.par}
          onNextChallenge={handleNextChallenge}
          onBackToChallenges={handleBackToChallenges}
          onRetry={handleRetryChallenge}
          hasNextChallenge={!!getNextChallenge(activeChallenge.id)}
        />
      )}
    </div>
  )
}
