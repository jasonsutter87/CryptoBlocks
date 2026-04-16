import { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import type { Language } from './types/block'
import { generateCode, generateHtmlMarkup, registerSingleBlock, getToolboxXml } from './blocks/blockly-register'
import { registry } from './blocks/registry'
import type { ExecutionResult } from './execution/runner'
import { useExecution } from './hooks/useExecution'
import { useModalState } from './hooks/useModalState'
import { useChallengeMode } from './hooks/useChallengeMode'
import { useBlocksetMode } from './hooks/useBlocksetMode'
import { useGolfMode } from './hooks/useGolfMode'
import { useLabMode } from './hooks/useLabMode'
import { useAchievements } from './hooks/useAchievements'
import { useCustomBlocks } from './hooks/useCustomBlocks'
import { useFileOps } from './hooks/useFileOps'
import { useRunPipeline } from './hooks/useRunPipeline'
import { snapshotSandbox, exitToSandbox } from './hooks/modeWorkspace'
import { saveWorkspaceToLocal, loadFromLocalStorage } from './storage'
import { countBlocks } from './challenges/validator'
import Toolbar from './components/Toolbar'
import EditorPane from './components/EditorPane'
import ActiveLabPane from './components/ActiveLabPane'
import AppModals from './components/AppModals'
import ChallengeBrowser from './components/ChallengeBrowser'
import BlocksetBrowser from './components/BlocksetBrowser'
import GolfBrowser from './components/GolfBrowser'
import LabBrowser from './components/LabBrowser'
import type { Example } from './examples'
import { useVersionControl } from './version-control/useVersionControl'
import { initEasterEggs } from './easter-eggs'
import { loadSettings } from './settings'
// stats helpers are called inside each mode/pipeline hook; no direct import needed here
import { useCollabDoc } from './collab/CollabPage'
import { ensureSpeechGlobal } from './speech/speech'
import { ensureVisionGlobal } from './vision/vision-global'
import { ensureGamepadGlobal } from './hardware/gamepad'
import { ensureKeyboardGlobal } from './hardware/keyboard'
import { initLocale } from './i18n'
import ChallengeBanner from './daily/ChallengeBanner'
import { getTodaysPuzzle } from './daily/getTodaysPuzzle'
import { useTimeTravel } from './time-travel/useTimeTravel'
import TimeTravelBar from './components/TimeTravelBar'

import type { AppMode } from './types/appMode'

export default function App() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState('')
  const [lastExecCode, setLastExecCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const exec = useExecution()
  const { isRunning, result, liveOutput } = exec
  const modals = useModalState()
  const achievements = useAchievements()
  const processAchievements = achievements.process
  const showNextAchievement = achievements.showNext
  const currentAchievement = achievements.currentAchievement
  const [initialWorkspaceState, setInitialWorkspaceState] = useState<Record<string, unknown> | null>(null)
  const [restored, setRestored] = useState(false)

  // Mode + gameplay state — each mode hook owns its own slice
  const [mode, setMode] = useState<AppMode>('sandbox')
  const [blockCount, setBlockCount] = useState(0)

  // Slow-Mo trace state
  const [slowMo, setSlowMo] = useState(false)

  // Resizable split pane state (percentage for left/block editor pane)
  const [splitPercent, setSplitPercent] = useState(50)
  const isDraggingSplit = useRef(false)

  // Collab state
  const collabDoc = useCollabDoc()
  const isCollabMode = !!collabDoc

  // Store sandbox workspace before entering challenge mode
  const savedSandboxState = useRef<Record<string, unknown> | null>(null)

  // Shared project read-only mode
  const isSharedView =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('shared') === '1'
  const [sharedProject] = useState<{ id: string; name: string; authorName: string; workspaceJson: string } | null>(() => {
    if (!isSharedView) return null
    try {
      const raw = localStorage.getItem('cryptoblocks_shared_view')
      if (!raw) return null
      return JSON.parse(raw)
    } catch { return null }
  })

  // Load shared workspace on mount
  useEffect(() => {
    if (sharedProject && workspaceRef.current) {
      try {
        workspaceRef.current.clear()
        Blockly.serialization.workspaces.load(JSON.parse(sharedProject.workspaceJson), workspaceRef.current)
      } catch {}
    }
  }, [sharedProject]) // eslint-disable-line react-hooks/exhaustive-deps

  // Daily Challenge state (read-only URL param; banner shown if active)
  const isDailyChallenge =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('daily') === '1'
  const dailyInfo = isDailyChallenge ? getTodaysPuzzle() : null

  // Execution handle for stop button (CB-R2-002)

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  // Time Travel — continuous scrubbable history of workspace changes
  const timeTravel = useTimeTravel({ workspaceRef })

  // Version control
  const {
    showHistory,
    setShowHistory,
    showCheckpointModal,
    setShowCheckpointModal,
    saveCheckpoint,
    rollbackTo,
    currentBranch,
    checkpoints,
    resetAutoSave,
  } = useVersionControl(workspaceRef, blockCount)

  const customBlocksHook = useCustomBlocks({
    workspaceRef,
    closeCreateModal: () => modals.setCreateBlock(false),
    openCreateModal: () => modals.setCreateBlock(true),
    closeCodeToBlocksModal: () => modals.setCodeToBlocks(false),
    processAchievements,
  })
  const {
    customBlocks, setCustomBlocks, editingBlock, setEditingBlock,
    handleCreate: handleCreateBlock,
    handleEdit: handleEditBlock,
    handleDelete: handleDeleteBlock,
    handleSaveAsBlock,
    handleCodeToBlocks,
    closeEditor: closeModal,
  } = customBlocksHook

  const languageRef = useRef(language)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modeRef = useRef(mode)
  const isCollabModeRef = useRef(false)
  languageRef.current = language
  modeRef.current = mode
  isCollabModeRef.current = !!collabDoc

  // Restore from localStorage on mount
  useEffect(() => {
    initEasterEggs()
    ensureSpeechGlobal()
    ensureVisionGlobal()
    ensureGamepadGlobal()
    ensureKeyboardGlobal()
    initLocale()

    // Apply theme from settings
    const settings = loadSettings()
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark')

    const { customBlocks: saved, workspaceState } = loadFromLocalStorage()
    if (saved.length > 0) {
      for (const block of saved) {
        registry.register(block)
        registerSingleBlock(block)
      }
      setCustomBlocks(saved)
    }
    // Check for example loaded via /example/:id route
    const pendingExample = sessionStorage.getItem('cb-load-example')
    if (pendingExample) {
      sessionStorage.removeItem('cb-load-example')
      try {
        const ex = JSON.parse(pendingExample)
        if (ex.workspace) {
          setInitialWorkspaceState(ex.workspace)
          setRestored(true)
          return
        }
      } catch (_e) { /* fall through to normal restore */ }
    }

    setInitialWorkspaceState(workspaceState)
    setRestored(true)
  }, [])

  // Helper to get categories used in current workspace
  const getUsedCategories = useCallback((): string[] => {
    if (!workspaceRef.current) return []
    const cats = new Set<string>()
    const blocks = workspaceRef.current.getAllBlocks(false)
    for (const block of blocks) {
      const blockType = block.type.replace(/^cb_/, '')
      const def = registry.get(blockType)
      if (def) cats.add(def.category)
    }
    return Array.from(cats)
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

      // Debounced auto-save workspace (only in sandbox mode, not in collab)
      if (modeRef.current === 'sandbox' && !isCollabModeRef.current) {
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

  const runPipeline = useRunPipeline({
    workspaceRef, exec, code, language, slowMo,
    processAchievements, getUsedCategories,
    setLastExecCode, setShowOutput,
    collabDoc, isDailyChallenge, dailyInfo,
  })
  const { handleRun, requestRunForEveryone, dailySolvedBlocks } = runPipeline

  // Split pane drag handler
  const handleSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingSplit.current = true
    const container = (e.target as HTMLElement).parentElement!
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingSplit.current) return
      const rect = container.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setSplitPercent(Math.min(85, Math.max(15, pct)))
    }
    const onMouseUp = () => {
      isDraggingSplit.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const handleStop = useCallback(() => {
    exec.abort()
  }, [exec])

  // Shared entry preamble for every gameplay mode. Captures the current
  // sandbox workspace, closes any lingering output panel, and clears the
  // last run's result. Mode-specific state (setActive*, setMode, etc.)
  // still lives in each handler.
  const beginModeEntry = useCallback(() => {
    savedSandboxState.current =
      snapshotSandbox(workspaceRef.current, modeRef.current === 'sandbox') ?? savedSandboxState.current
    setShowOutput(false)
    exec.setResult(null)
  }, [exec])

  // Shared preamble for the 3 Check-Solution handlers that use Blockly.
  // Executes the current workspace as JS (HTML mode compiles to JS),
  // publishes the result, and returns null on error so callers can bail.
  const runCurrentCode = useCallback(async (): Promise<ExecutionResult | null> => {
    if (!workspaceRef.current) return null
    setShowOutput(true)
    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html'
      ? generateCode(workspaceRef.current, 'javascript')
      : code
    const execResult = await exec.run({ code: execCode, language: execLang })
    exec.finish(execResult)
    return execResult.error ? null : execResult
  }, [code, language, exec])

  const handleClear = useCallback(() => {
    exec.abort()
    workspaceRef.current?.clear()
    exec.setResult(null)
    setShowOutput(false)
  }, [exec])

  const handleBackToSandbox = useCallback(() => {
    setMode('sandbox')
    setTimeout(() => {
      exitToSandbox(workspaceRef.current, savedSandboxState.current)
    }, 0)
  }, [])

  // Gameplay mode hooks — each owns its own state + handlers
  const modeDeps = { workspaceRef, modeRef, mode, setMode, setBlockCount, beginModeEntry, handleBackToSandbox, runCurrentCode, processAchievements, exec, setShowOutput }
  const challenge = useChallengeMode(modeDeps)
  const blockset = useBlocksetMode(modeDeps)
  const golf = useGolfMode(modeDeps)
  const lab = useLabMode(modeDeps)

  const handleSelectExample = useCallback((example: Example) => {
    modals.setExamples(false)

    // Kill any running execution (camera, animation loops, etc.)
    exec.abort()
    exec.setResult(null)

    // Ensure we're in sandbox mode — the mode hooks' internal state is
    // harmless when hidden; it gets replaced the next time the user
    // enters that mode.
    if (modeRef.current !== 'sandbox') {
      setMode('sandbox')
    }

    setTimeout(() => {
      if (workspaceRef.current) {
        if (modeRef.current !== 'sandbox') {
          workspaceRef.current.updateToolbox(getToolboxXml())
        }
        workspaceRef.current.clear()
        Blockly.serialization.workspaces.load(example.workspace, workspaceRef.current)
        workspaceRef.current.scrollCenter()
      }
    }, 0)
  }, [exec])

  const fileOps = useFileOps({
    workspaceRef, language, code, customBlocks, setCustomBlocks,
    setEditingBlock,
    openCreateModal: () => modals.setCreateBlock(true),
  })
  const {
    handleExportHtml, handleCopyEmbed, handleExport,
    handleSaveToDashboard, handleImport, handleImportAsBlock,
  } = fileOps

  // Don't render BlockEditor until we've loaded from localStorage
  if (!restored) return null

  return (
    <div className="flex flex-col h-full relative">
      {isDailyChallenge && dailyInfo && (
        <ChallengeBanner
          puzzle={dailyInfo.puzzle}
          dayNumber={dailyInfo.dayNumber}
          solvedBlocks={dailySolvedBlocks}
        />
      )}
      {sharedProject && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,500px)] bg-mantle border border-surface-1 rounded-xl shadow-2xl p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-overlay">Viewing shared project</div>
            <div className="text-sm font-bold text-text truncate">{sharedProject.name}</div>
            <div className="text-[10px] text-overlay">by {sharedProject.authorName} · read-only</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                // Make a copy — save workspace to localStorage and reload as editable
                localStorage.setItem('cryptoblocks_workspace', sharedProject.workspaceJson)
                localStorage.removeItem('cryptoblocks_shared_view')
                window.location.href = '/'
              }}
              className="px-3 py-1.5 bg-success text-base rounded-lg text-xs font-bold hover:bg-success/80"
            >
              Make a Copy
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('cryptoblocks_shared_view')
                window.location.href = '/'
              }}
              className="px-3 py-1.5 bg-surface-0 text-text rounded-lg text-xs font-semibold hover:bg-surface-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {timeTravel.isActive && (
        <TimeTravelBar
          currentIndex={timeTravel.currentIndex}
          snapshotCount={timeTravel.snapshotCount}
          currentLabel={timeTravel.currentLabel}
          onScrub={timeTravel.scrubTo}
          onStepBack={timeTravel.stepBack}
          onStepForward={timeTravel.stepForward}
          onForkHere={timeTravel.forkHere}
          onExit={timeTravel.exitTimeTravel}
        />
      )}
      <Toolbar
        language={language}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        showCode={showCode}
        onToggleCode={() => setShowCode((prev) => !prev)}
        onCreateBlock={() => modals.setCreateBlock(true)}
        onCodeToBlocks={() => modals.setCodeToBlocks(true)}
        onExport={handleExport}
        onImport={handleImport}
        onImportAsBlock={handleImportAsBlock}
        onExportHtml={handleExportHtml}
        onExportPwa={async () => {
          const { exportAsPwa } = await import('./export-html')
          exportAsPwa(code)
        }}
        onCopyEmbed={handleCopyEmbed}
        onPublish={() => modals.setPublish(true)}
        onClear={handleClear}
        mode={mode}
        onOpenChallenges={challenge.handleOpen}
        onOpenBlocksets={blockset.handleOpen}
        onOpenGolf={golf.handleOpen}
        onOpenLab={lab.handleOpen}
        onOpenExamples={() => modals.setExamples(true)}
        onOpenStats={() => modals.setStats(true)}
        blockCount={blockCount}
        onSaveCheckpoint={() => setShowCheckpointModal(true)}
        onOpenHistory={() => setShowHistory(true)}
        currentBranchName={currentBranch?.name}
        onUndo={() => workspaceRef.current?.undo(false)}
        onRedo={() => workspaceRef.current?.undo(true)}
        onFitView={() => workspaceRef.current?.zoomToFit()}
        onOpenSettings={() => modals.setSettings(true)}
        onOpenTutorial={() => modals.setTutorial(true)}
        onOpenCollab={() => modals.setCollabModal(true)}
        isCollabMode={isCollabMode}
        onImportScratch={() => modals.setScratchImport(true)}
        onSaveToDashboard={handleSaveToDashboard}
        onOpenSpriteEditor={() => modals.setSpriteEditor(true)}
        onOpenLevelEditor={() => modals.setLevelEditor(true)}
        onRunForEveryone={requestRunForEveryone}
      />

      {/* Challenge Browser Mode */}
      {mode === 'challenges' && (
        <ChallengeBrowser
          onSelectChallenge={challenge.handleSelect}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Blockset Browser Mode */}
      {mode === 'blocksets' && (
        <BlocksetBrowser
          onSelectBlockset={blockset.handleSelect}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Code Golf Browser Mode */}
      {mode === 'code-golf' && (
        <GolfBrowser
          onSelectProblem={golf.handleSelect}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Code Lab Browser Mode */}
      {mode === 'code-lab' && (
        <LabBrowser
          onSelectExercise={lab.handleSelect}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {mode === 'active-lab' && lab.activeLabExercise && (
        <ActiveLabPane
          exercise={lab.activeLabExercise}
          labCode={lab.labCode}
          onLabCodeChange={lab.handleLabCodeChange}
          onCheckSolution={lab.handleCheckSolution}
          onBack={lab.handleBackToBrowser}
          isRunning={isRunning}
          showOutput={showOutput}
          result={result}
          liveOutput={liveOutput}
          lastExecCode={lastExecCode}
        />
      )}

      {(mode === 'sandbox' || mode === 'active-challenge' || mode === 'active-blockset' || mode === 'active-golf') && (
        <EditorPane
          mode={mode}
          activeChallenge={challenge.activeChallenge}
          activeBlockset={blockset.activeBlockset}
          activeGolfProblem={golf.activeGolfProblem}
          blockCount={blockCount}
          isRunning={isRunning}
          onCheckChallenge={challenge.handleCheckSolution}
          onBackChallenge={challenge.handleBackToBrowser}
          onCheckBlockset={blockset.handleCheckSolution}
          onBackBlockset={blockset.handleBackToBrowser}
          onCheckGolf={golf.handleCheckSolution}
          onBackGolf={golf.handleBackToBrowser}
          onWorkspaceChange={handleWorkspaceChange}
          onEditBlock={handleEditBlock}
          onDeleteBlock={handleDeleteBlock}
          onSaveAsBlock={handleSaveAsBlock}
          initialWorkspaceState={initialWorkspaceState}
          slowMo={slowMo}
          onToggleSlowMo={() => setSlowMo((s) => !s)}
          onEnterTimeTravel={timeTravel.enterTimeTravel}
          timeTravelAvailable={timeTravel.snapshotCount > 1}
          showCode={showCode}
          showOutput={showOutput}
          splitPercent={splitPercent}
          onSplitMouseDown={handleSplitMouseDown}
          code={code}
          language={language}
          onLanguageChange={handleLanguageChange}
          result={result}
          liveOutput={liveOutput}
          lastExecCode={lastExecCode}
        />
      )}

      <AppModals
        modals={modals}
        showComplete={challenge.showComplete}
        showBlocksetComplete={blockset.showComplete}
        showGolfComplete={golf.showComplete}
        showLabComplete={lab.showComplete}
        showCheckpointModal={showCheckpointModal}
        showHistory={showHistory}
        closeCreateModal={closeModal}
        setShowCheckpointModal={setShowCheckpointModal}
        setShowHistory={setShowHistory}
        activeChallenge={challenge.activeChallenge}
        activeBlockset={blockset.activeBlockset}
        activeGolfProblem={golf.activeGolfProblem}
        activeLabExercise={lab.activeLabExercise}
        challengeStars={challenge.challengeStars}
        blockCount={blockCount}
        golfIsNewBest={golf.golfIsNewBest}
        editingBlock={editingBlock}
        handleCreateBlock={handleCreateBlock}
        handleSelectExample={handleSelectExample}
        handleCodeToBlocks={handleCodeToBlocks}
        handleNextChallenge={challenge.handleNext}
        handleBackToChallenges={challenge.handleBackToBrowser}
        handleRetryChallenge={challenge.handleRetry}
        handleNextBlockset={blockset.handleNext}
        handleBackToBlocksets={blockset.handleBackToBrowser}
        handleRetryGolf={golf.handleRetry}
        handleNextGolfProblem={golf.handleNext}
        handleBackToGolf={golf.handleBackToBrowser}
        handleNextExercise={lab.handleNext}
        handleBackToLab={lab.handleBackToBrowser}
        checkpoints={checkpoints}
        currentBranch={currentBranch}
        saveCheckpoint={saveCheckpoint}
        rollbackTo={rollbackTo}
        resetAutoSave={resetAutoSave}
        workspaceRef={workspaceRef}
        currentAchievement={currentAchievement}
        showNextAchievement={showNextAchievement}
      />
    </div>
  )
}
