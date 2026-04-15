import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from './types/block'
import { generateCode, generateHtmlMarkup, registerSingleBlock, unregisterBlock, getToolboxXml } from './blocks/blockly-register'
import { registry } from './blocks/registry'
import type { ExecutionResult } from './execution/runner'
import { useExecution } from './hooks/useExecution'
import { snapshotSandbox, enterMode, exitToSandbox } from './hooks/modeWorkspace'
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
import { saveToDashboard } from './shareplace/api'
import type { Challenge } from './challenges'
import { getNextChallenge } from './challenges'
import { validateOutput, calculateStars, countBlocks } from './challenges/validator'
import { saveProgress } from './challenges/progress'
import type { Blockset } from './blocksets'
import { getNextBlockset } from './blocksets'
import { saveBlocksetProgress } from './blocksets/progress'
import type { GolfProblem } from './code-golf'
import { getNextProblem } from './code-golf'
import { saveGolfProgress } from './code-golf/progress'
import type { LabExercise } from './code-lab'
import { getNextExercise } from './code-lab'
import { saveLabProgress } from './code-lab/progress'
import Toolbar from './components/Toolbar'
import EditorPane from './components/EditorPane'
import ActiveLabPane from './components/ActiveLabPane'
import CreateBlockModal from './components/CreateBlockModal'
import ChallengeBrowser from './components/ChallengeBrowser'
import ChallengeComplete from './components/ChallengeComplete'
import BlocksetBrowser from './components/BlocksetBrowser'
import BlocksetComplete from './components/BlocksetComplete'
import GolfBrowser from './components/GolfBrowser'
import GolfComplete from './components/GolfComplete'
import LabBrowser from './components/LabBrowser'
import LabPanel from './components/LabPanel'
import LabComplete from './components/LabComplete'
import ExamplesBrowser from './components/ExamplesBrowser'
import CodeToBlocksModal from './components/CodeToBlocksModal'
import GitHubPublishModal from './components/GitHubPublishModal'
import type { ConversionResult } from './converters/js-to-workspace'
import type { Example } from './examples'
import { useVersionControl } from './version-control/useVersionControl'
import CheckpointModal from './components/CheckpointModal'
import HistoryPanel from './components/HistoryPanel'
import SettingsModal from './components/SettingsModal'
import WelcomeModal from './components/WelcomeModal'
import TutorialOverlay from './components/TutorialOverlay'
import { initEasterEggs } from './easter-eggs'
import { loadSettings } from './settings'
import type { Achievement } from './achievements'
import { checkAchievements } from './achievements'
import { recordRun, recordChallengeComplete, recordGolfComplete, recordLabComplete, recordAchievement } from './stats'
import { AchievementToast } from './components/AchievementToast'
import StatsPanel from './components/StatsPanel'
import HackerTerminal from './components/HackerTerminal'
import ToastContainer from './components/Toast'
const SpriteEditor = lazy(() => import('./sprite-editor/SpriteEditor'))
const LevelEditor = lazy(() => import('./level-editor/LevelEditor'))
const CollabModal = lazy(() => import('./collab/CollabModal'))
const RoomCreatedModal = lazy(() => import('./collab/RoomCreatedModal'))
const ScratchImportModal = lazy(() => import('./components/ScratchImportModal'))
import { useCollabDoc } from './collab/CollabPage'
import { bindRunBroadcast } from './collab/run-broadcast'
import { ensureSpeechGlobal } from './speech/speech'
import { ensureVisionGlobal } from './vision/vision-global'
import { ensureGamepadGlobal } from './hardware/gamepad'
import { initLocale } from './i18n'
import ChallengeBanner from './daily/ChallengeBanner'
import { getTodaysPuzzle } from './daily/getTodaysPuzzle'
import { matchesTarget } from './daily/puzzles'
import { markSolved, loadDailyState } from './daily/state'
import { useTimeTravel } from './time-travel/useTimeTravel'
import TimeTravelBar from './components/TimeTravelBar'

type AppMode = 'sandbox' | 'challenges' | 'active-challenge'
  | 'blocksets' | 'active-blockset'
  | 'code-golf' | 'active-golf'
  | 'code-lab' | 'active-lab'

export default function App() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [code, setCode] = useState('')
  const [lastExecCode, setLastExecCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const exec = useExecution()
  const { isRunning, result, liveOutput } = exec
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

  // Blockset state
  const [activeBlockset, setActiveBlockset] = useState<Blockset | null>(null)
  const [showBlocksetComplete, setShowBlocksetComplete] = useState(false)

  // Code Golf state
  const [activeGolfProblem, setActiveGolfProblem] = useState<GolfProblem | null>(null)
  const [showGolfComplete, setShowGolfComplete] = useState(false)
  const [golfIsNewBest, setGolfIsNewBest] = useState(false)

  // Code Lab state
  const [activeLabExercise, setActiveLabExercise] = useState<LabExercise | null>(null)
  const [showLabComplete, setShowLabComplete] = useState(false)
  const [labCode, setLabCode] = useState('')

  // Slow-Mo trace state
  const [slowMo, setSlowMo] = useState(false)

  // Resizable split pane state (percentage for left/block editor pane)
  const [splitPercent, setSplitPercent] = useState(50)
  const isDraggingSplit = useRef(false)

  // Achievement + Stats state
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const achievementQueue = useRef<Achievement[]>([])
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('cryptoblocks-tutorial-seen'))
  const [showTutorial, setShowTutorial] = useState(false)

  // Collab state
  const collabDoc = useCollabDoc()
  const isCollabMode = !!collabDoc
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [collabRoomCreated, setCollabRoomCreated] = useState<{ code: string; name: string } | null>(null)
  const [showScratchImport, setShowScratchImport] = useState(false)
  const [showSpriteEditor, setShowSpriteEditor] = useState(false)
  const [showLevelEditor, setShowLevelEditor] = useState(false)
  const runBroadcastRef = useRef<ReturnType<typeof bindRunBroadcast> | null>(null)

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
  const [dailySolvedBlocks, setDailySolvedBlocks] = useState<number | null>(() => {
    if (!isDailyChallenge || !dailyInfo) return null
    const state = loadDailyState()
    const entry = state.solved[dailyInfo.dayNumber]
    return entry ? entry.blocks : null
  })

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

    // Listen for hacker mode activation — trigger achievement
    const handleHackerMode = () => {
      const newAchievements = checkAchievements({ event: 'hacker-mode' })
      if (newAchievements.length > 0) {
        for (const a of newAchievements) {
          recordAchievement()
          achievementQueue.current.push(a)
        }
        // Show first if not already showing
        setCurrentAchievement((prev) => {
          if (prev) return prev
          return achievementQueue.current.shift() ?? null
        })
      }
    }
    document.addEventListener('cb:hacker-mode-changed', handleHackerMode)
    return () => document.removeEventListener('cb:hacker-mode-changed', handleHackerMode)
  }, [])

  // Process achievement queue — show one at a time
  const showNextAchievement = useCallback(() => {
    if (achievementQueue.current.length > 0) {
      setCurrentAchievement(achievementQueue.current.shift()!)
    } else {
      setCurrentAchievement(null)
    }
  }, [])

  const processAchievements = useCallback((newAchievements: Achievement[]) => {
    if (newAchievements.length === 0) return
    for (const a of newAchievements) {
      recordAchievement()
      achievementQueue.current.push(a)
    }
    // If not currently showing one, kick off the queue
    if (!currentAchievement) {
      showNextAchievement()
    }
  }, [currentAchievement, showNextAchievement])

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

  // Collab: bind "Run for Everyone" broadcast
  const handleRunRef = useRef<() => void>(() => {})
  useEffect(() => {
    if (!collabDoc) return
    const binding = bindRunBroadcast(collabDoc, () => {
      handleRunRef.current()
    })
    runBroadcastRef.current = binding
    return () => {
      binding.destroy()
      runBroadcastRef.current = null
    }
  }, [collabDoc])

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

  const handleRun = useCallback(async () => {
    // Cancel any leftover game loop from a previous run so two Runs don't
    // pile up requestAnimationFrame callbacks on the same canvas.
    const w = window as unknown as { __cbGameLoopId?: number }
    if (w.__cbGameLoopId) {
      cancelAnimationFrame(w.__cbGameLoopId)
      w.__cbGameLoopId = 0
    }

    setShowOutput(true)

    // Always execute as JS or Python — HTML peek is display-only
    const execLang = language === 'html' ? 'javascript' : language
    const traceEnabled = slowMo && execLang === 'javascript'
    const execCode = traceEnabled && workspaceRef.current
      ? generateCode(workspaceRef.current, language === 'html' ? 'javascript' : language, true)
      : language === 'html' && workspaceRef.current
        ? generateCode(workspaceRef.current, 'javascript')
        : code
    setLastExecCode(execCode)

    const traceLog: string[] = []

    const execResult = await exec.run({
      code: execCode,
      language: execLang,
      onTrace: traceEnabled ? (blockId) => { traceLog.push(blockId) } : undefined,
      onCanvasUpdate: (dataUrl) => {
        exec.patchResult((prev) => prev
          ? { ...prev, canvasDataUrl: dataUrl }
          : { output: [], error: null, returnValue: undefined, duration: 0, canvasDataUrl: dataUrl })
      },
    })

    // Replay trace highlights with delay so user can follow along
    if (traceEnabled && traceLog.length > 0) {
      exec.finish(execResult)
      for (const blockId of traceLog) {
        workspaceRef.current?.highlightBlock(blockId)
        await new Promise(r => setTimeout(r, 200))
      }
      workspaceRef.current?.highlightBlock(null as unknown as string)
    } else {
      exec.finish(execResult)
    }

    // Track stats + check achievements
    const blocks = workspaceRef.current ? countBlocks(workspaceRef.current) : 0
    const lineCount = execCode.split('\n').length
    recordRun({ language: language as 'javascript' | 'python' | 'html', blockCount: blocks, lineCount })

    const newAchievements = checkAchievements({
      event: 'run',
      output: execResult.output,
      hasError: !!execResult.error,
      blockCount: blocks,
      categoriesUsed: getUsedCategories(),
      language: language,
    })
    processAchievements(newAchievements)

    // Daily Challenge: check if the run matches today's target output
    if (isDailyChallenge && dailyInfo && !execResult.error) {
      if (matchesTarget(execResult.output, dailyInfo.puzzle)) {
        markSolved(dailyInfo.dayNumber, blocks)
        setDailySolvedBlocks(blocks)
      }
    }
  }, [code, language, slowMo, processAchievements, getUsedCategories, isDailyChallenge, dailyInfo, exec])

  // Keep run ref up to date for collab broadcast
  handleRunRef.current = handleRun

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

  const handleCheckSolution = useCallback(async () => {
    if (!activeChallenge || !workspaceRef.current) return

    setShowOutput(true)
    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html'
      ? generateCode(workspaceRef.current, 'javascript')
      : code

    const execResult = await exec.run({ code: execCode, language: execLang })
    exec.finish(execResult)

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

      recordChallengeComplete()
      const newAchievements = checkAchievements({
        event: 'challenge-complete',
        challengeStars: stars,
      })
      processAchievements(newAchievements)

      setShowComplete(true)
    }
  }, [code, language, activeChallenge, processAchievements, exec])

  const handleSelectChallenge = useCallback((challenge: Challenge) => {
    savedSandboxState.current = snapshotSandbox(workspaceRef.current, modeRef.current === 'sandbox') ?? savedSandboxState.current

    setActiveChallenge(challenge)
    setMode('active-challenge')
    setShowComplete(false)
    setShowOutput(false)
    exec.setResult(null)
    setBlockCount(0)

    setTimeout(() => {
      enterMode(workspaceRef.current, {
        allowedCategories: challenge.allowedCategories,
        starterBlocks: challenge.starterBlocks,
      })
    }, 0)
  }, [exec])

  const handleBackToSandbox = useCallback(() => {
    setMode('sandbox')
    setActiveChallenge(null)
    setShowComplete(false)

    setTimeout(() => {
      exitToSandbox(workspaceRef.current, savedSandboxState.current)
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
    exec.setResult(null)
    setShowOutput(false)
    enterMode(workspaceRef.current, {
      allowedCategories: activeChallenge?.allowedCategories,
      starterBlocks: activeChallenge?.starterBlocks,
    })
  }, [activeChallenge, exec])

  const handleOpenChallenges = useCallback(() => {
    if (mode === 'challenges') {
      handleBackToSandbox()
    } else {
      setMode('challenges')
    }
  }, [mode, handleBackToSandbox])

  // === Blockset handlers ===
  const handleOpenBlocksets = useCallback(() => {
    if (mode === 'blocksets') {
      handleBackToSandbox()
    } else {
      setMode('blocksets')
    }
  }, [mode, handleBackToSandbox])

  const handleSelectBlockset = useCallback((blockset: Blockset) => {
    savedSandboxState.current = snapshotSandbox(workspaceRef.current, modeRef.current === 'sandbox') ?? savedSandboxState.current

    setActiveBlockset(blockset)
    setMode('active-blockset')
    setShowBlocksetComplete(false)
    setShowOutput(false)
    exec.setResult(null)
    setBlockCount(0)

    setTimeout(() => {
      enterMode(workspaceRef.current, { allowedCategories: blockset.allowedCategories })
    }, 0)
  }, [exec])

  const handleBackToBlocksets = useCallback(() => {
    setMode('blocksets')
    setActiveBlockset(null)
    setShowBlocksetComplete(false)
  }, [])

  const handleNextBlockset = useCallback(() => {
    if (!activeBlockset) return
    const next = getNextBlockset(activeBlockset.id)
    if (next) {
      handleSelectBlockset(next)
    } else {
      handleBackToBlocksets()
    }
  }, [activeBlockset, handleSelectBlockset, handleBackToBlocksets])

  const handleCheckBlocksetSolution = useCallback(async () => {
    if (!activeBlockset || !workspaceRef.current) return

    setShowOutput(true)
    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html'
      ? generateCode(workspaceRef.current, 'javascript')
      : code

    const execResult = await exec.run({ code: execCode, language: execLang })
    exec.finish(execResult)

    if (execResult.error) return

    if (validateOutput(execResult.output, activeBlockset.expectedOutput)) {
      saveBlocksetProgress({
        blocksetId: activeBlockset.id,
        completed: true,
        attempts: 1,
      })
      setShowBlocksetComplete(true)
    }
  }, [code, language, activeBlockset, exec])

  // === Code Golf handlers ===
  const handleOpenGolf = useCallback(() => {
    if (mode === 'code-golf') {
      handleBackToSandbox()
    } else {
      setMode('code-golf')
    }
  }, [mode, handleBackToSandbox])

  const handleSelectGolfProblem = useCallback((problem: GolfProblem) => {
    savedSandboxState.current = snapshotSandbox(workspaceRef.current, modeRef.current === 'sandbox') ?? savedSandboxState.current

    setActiveGolfProblem(problem)
    setMode('active-golf')
    setShowGolfComplete(false)
    setShowOutput(false)
    exec.setResult(null)
    setBlockCount(0)
    setGolfIsNewBest(false)

    setTimeout(() => {
      enterMode(workspaceRef.current, { allowedCategories: problem.allowedCategories })
    }, 0)
  }, [exec])

  const handleBackToGolf = useCallback(() => {
    setMode('code-golf')
    setActiveGolfProblem(null)
    setShowGolfComplete(false)
  }, [])

  const handleNextGolfProblem = useCallback(() => {
    if (!activeGolfProblem) return
    const next = getNextProblem(activeGolfProblem.id)
    if (next) {
      handleSelectGolfProblem(next)
    } else {
      handleBackToGolf()
    }
  }, [activeGolfProblem, handleSelectGolfProblem, handleBackToGolf])

  const handleRetryGolf = useCallback(() => {
    setShowGolfComplete(false)
    exec.setResult(null)
    setShowOutput(false)
    workspaceRef.current?.clear()
  }, [exec])

  const handleCheckGolfSolution = useCallback(async () => {
    if (!activeGolfProblem || !workspaceRef.current) return

    setShowOutput(true)
    const execLang = language === 'html' ? 'javascript' : language
    const execCode = language === 'html'
      ? generateCode(workspaceRef.current, 'javascript')
      : code

    const execResult = await exec.run({ code: execCode, language: execLang })
    exec.finish(execResult)

    if (execResult.error) return

    const passed = validateOutput(execResult.output, activeGolfProblem.expectedOutput)
    if (passed) {
      const blocks = countBlocks(workspaceRef.current)
      const { getGolfProgressById } = await import('./code-golf/progress')
      const prev = getGolfProgressById(activeGolfProblem.id)
      const isNewBest = !prev || blocks < prev.bestBlockCount
      setGolfIsNewBest(isNewBest)

      saveGolfProgress({
        problemId: activeGolfProblem.id,
        completed: true,
        bestBlockCount: blocks,
        attempts: 1,
      })

      recordGolfComplete()
      const newAchievements = checkAchievements({ event: 'golf-complete' })
      processAchievements(newAchievements)

      setShowGolfComplete(true)
    }
  }, [code, language, activeGolfProblem, processAchievements])

  // === Code Lab handlers ===
  const handleOpenLab = useCallback(() => {
    if (mode === 'code-lab') {
      handleBackToSandbox()
    } else {
      setMode('code-lab')
    }
  }, [mode, handleBackToSandbox])

  const handleSelectExercise = useCallback((exercise: LabExercise) => {
    savedSandboxState.current = snapshotSandbox(workspaceRef.current, modeRef.current === 'sandbox') ?? savedSandboxState.current

    setActiveLabExercise(exercise)
    setMode('active-lab')
    setShowLabComplete(false)
    setShowOutput(false)
    exec.setResult(null)
    setLabCode(exercise.starterCode || '')
  }, [exec])

  const handleBackToLab = useCallback(() => {
    setMode('code-lab')
    setActiveLabExercise(null)
    setShowLabComplete(false)
    setLabCode('')
  }, [])

  const handleNextExercise = useCallback(() => {
    if (!activeLabExercise) return
    const next = getNextExercise(activeLabExercise.id)
    if (next) {
      handleSelectExercise(next)
    } else {
      handleBackToLab()
    }
  }, [activeLabExercise, handleSelectExercise, handleBackToLab])

  const handleCheckLabSolution = useCallback(async () => {
    if (!activeLabExercise) return

    setShowOutput(true)
    const execResult = await exec.run({ code: labCode, language: 'javascript' })
    exec.finish(execResult)

    if (execResult.error) return

    if (validateOutput(execResult.output, activeLabExercise.expectedOutput)) {
      saveLabProgress({
        exerciseId: activeLabExercise.id,
        completed: true,
        attempts: 1,
      })
      recordLabComplete()
      const newAchievements = checkAchievements({ event: 'lab-complete' })
      processAchievements(newAchievements)
      setShowLabComplete(true)
    } else {
      const expected = activeLabExercise.expectedOutput.join('\n')
      const actual = execResult.output.length > 0 ? execResult.output.join('\n') : '(no output)'
      exec.patchResult(() => ({
        ...execResult,
        output: [
          ...execResult.output,
          '',
          '❌ Not quite! Make sure your code prints the result.',
          `Expected output: ${expected}`,
          `Your output: ${actual}`,
        ],
      }))
    }
  }, [labCode, activeLabExercise, processAchievements, exec])

  const handleLabCodeChange = useCallback((newCode: string) => {
    setLabCode(newCode)
  }, [])

  const handleSelectExample = useCallback((example: Example) => {
    setShowExamples(false)

    // Kill any running execution (camera, animation loops, etc.)
    exec.abort()
    exec.setResult(null)

    // Ensure we're in sandbox mode
    if (modeRef.current !== 'sandbox') {
      setMode('sandbox')
      setActiveChallenge(null)
      setShowComplete(false)
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

    // Check architect achievement
    const newAchievements = checkAchievements({ event: 'custom-block' })
    processAchievements(newAchievements)
  }, [processAchievements])

  const handleEditBlock = useCallback((blockDef: BlockDefinition) => {
    setEditingBlock(blockDef)
    setShowCreateModal(true)
  }, [])

  const handleDeleteBlock = useCallback((blockDef: BlockDefinition) => {
    const displayName = blockDef.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (!confirm(`Delete "${displayName}"? This will remove it from your saved blocks and the workspace.`)) return

    // Remove all instances of this block from the workspace
    if (workspaceRef.current) {
      const blockType = `cb_${blockDef.name}`
      const instances = workspaceRef.current.getBlocksByType(blockType, false)
      for (const block of instances) {
        block.dispose(false)
      }
    }

    // Remove from registry (so getToolboxXml won't include it)
    registry.unregister(blockDef.name)

    // Remove from state and localStorage
    setCustomBlocks((prev) => {
      const updated = prev.filter((b) => b.name !== blockDef.name)
      saveCustomBlocksToLocal(updated)
      return updated
    })

    // Refresh toolbox BEFORE deleting from Blockly.Blocks
    // (Blockly needs the block definition to cleanly remove it from the toolbox)
    if (workspaceRef.current) {
      workspaceRef.current.updateToolbox(getToolboxXml())
    }

    // Now safe to remove the Blockly block definition
    unregisterBlock(blockDef.name)
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
    exec.abort()
    workspaceRef.current?.clear()
    exec.setResult(null)
    setShowOutput(false)
  }, [exec])

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

  const handleExport = useCallback(() => {
    if (workspaceRef.current) {
      exportBlocksFile(customBlocks, workspaceRef.current)
    }
  }, [customBlocks])

  const handleSaveToDashboard = useCallback(async () => {
    if (!workspaceRef.current) return
    const { showToast } = await import('./components/Toast')
    try {
      const state = Blockly.serialization.workspaces.save(workspaceRef.current)
      const workspaceJson = JSON.stringify(state)
      const name = prompt('Project name:') || 'Untitled Project'
      const token = await (window as any).Clerk?.session?.getToken() || undefined

      const result = await saveToDashboard({
        name,
        workspaceJson,
        blockCount: countBlocks(workspaceRef.current),
        category: 'General',
      }, token)

      if (result && 'id' in result) {
        showToast('Saved to your dashboard!', 'success')
      } else if (result && 'error' in result) {
        showToast(result.error, 'error')
      } else {
        showToast('Save failed — try again', 'error')
      }
    } catch (_e) {
      showToast('Save failed', 'error')
    }
  }, [])

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
    <div className="flex flex-col h-full relative">
      {isDailyChallenge && dailyInfo && (
        <ChallengeBanner
          puzzle={dailyInfo.puzzle}
          dayNumber={dailyInfo.dayNumber}
          solvedBlocks={dailySolvedBlocks}
        />
      )}
      {sharedProject && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,500px)] bg-[#181825] border border-[#45475a] rounded-xl shadow-2xl p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-[#6c7086]">Viewing shared project</div>
            <div className="text-sm font-bold text-[#cdd6f4] truncate">{sharedProject.name}</div>
            <div className="text-[10px] text-[#6c7086]">by {sharedProject.authorName} · read-only</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                // Make a copy — save workspace to localStorage and reload as editable
                localStorage.setItem('cryptoblocks_workspace', sharedProject.workspaceJson)
                localStorage.removeItem('cryptoblocks_shared_view')
                window.location.href = '/'
              }}
              className="px-3 py-1.5 bg-[#a6e3a1] text-[#1e1e2e] rounded-lg text-xs font-bold hover:bg-[#a6e3a1]/80"
            >
              Make a Copy
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('cryptoblocks_shared_view')
                window.location.href = '/'
              }}
              className="px-3 py-1.5 bg-[#313244] text-[#cdd6f4] rounded-lg text-xs font-semibold hover:bg-[#45475a]"
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
        onCreateBlock={() => setShowCreateModal(true)}
        onCodeToBlocks={() => setShowCodeToBlocks(true)}
        onExport={handleExport}
        onImport={handleImport}
        onImportAsBlock={handleImportAsBlock}
        onExportHtml={handleExportHtml}
        onExportPwa={async () => {
          const { exportAsPwa } = await import('./export-html')
          exportAsPwa(code)
        }}
        onCopyEmbed={handleCopyEmbed}
        onPublish={() => setShowPublishModal(true)}
        onClear={handleClear}
        mode={mode}
        onOpenChallenges={handleOpenChallenges}
        onOpenBlocksets={handleOpenBlocksets}
        onOpenGolf={handleOpenGolf}
        onOpenLab={handleOpenLab}
        onOpenExamples={() => setShowExamples(true)}
        onOpenStats={() => setShowStats(true)}
        blockCount={blockCount}
        onSaveCheckpoint={() => setShowCheckpointModal(true)}
        onOpenHistory={() => setShowHistory(true)}
        currentBranchName={currentBranch?.name}
        onUndo={() => workspaceRef.current?.undo(false)}
        onRedo={() => workspaceRef.current?.undo(true)}
        onFitView={() => workspaceRef.current?.zoomToFit()}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenCollab={() => setShowCollabModal(true)}
        isCollabMode={isCollabMode}
        onImportScratch={() => setShowScratchImport(true)}
        onSaveToDashboard={handleSaveToDashboard}
        onOpenSpriteEditor={() => setShowSpriteEditor(true)}
        onOpenLevelEditor={() => setShowLevelEditor(true)}
        onRunForEveryone={() => {
          runBroadcastRef.current?.requestRunForEveryone()
          handleRun()
        }}
      />

      {/* Challenge Browser Mode */}
      {mode === 'challenges' && (
        <ChallengeBrowser
          onSelectChallenge={handleSelectChallenge}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Blockset Browser Mode */}
      {mode === 'blocksets' && (
        <BlocksetBrowser
          onSelectBlockset={handleSelectBlockset}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Code Golf Browser Mode */}
      {mode === 'code-golf' && (
        <GolfBrowser
          onSelectProblem={handleSelectGolfProblem}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {/* Code Lab Browser Mode */}
      {mode === 'code-lab' && (
        <LabBrowser
          onSelectExercise={handleSelectExercise}
          onBackToSandbox={handleBackToSandbox}
        />
      )}

      {mode === 'active-lab' && activeLabExercise && (
        <ActiveLabPane
          exercise={activeLabExercise}
          labCode={labCode}
          onLabCodeChange={handleLabCodeChange}
          onCheckSolution={handleCheckLabSolution}
          onBack={handleBackToLab}
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
          activeChallenge={activeChallenge}
          activeBlockset={activeBlockset}
          activeGolfProblem={activeGolfProblem}
          blockCount={blockCount}
          isRunning={isRunning}
          onCheckChallenge={handleCheckSolution}
          onBackChallenge={handleBackToChallenges}
          onCheckBlockset={handleCheckBlocksetSolution}
          onBackBlockset={handleBackToBlocksets}
          onCheckGolf={handleCheckGolfSolution}
          onBackGolf={handleBackToGolf}
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
        <GitHubPublishModal
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

      {/* Blockset Complete Overlay */}
      {showBlocksetComplete && activeBlockset && (
        <BlocksetComplete
          onNextBlockset={handleNextBlockset}
          onBackToBlocksets={handleBackToBlocksets}
          hasNextBlockset={!!getNextBlockset(activeBlockset.id)}
        />
      )}

      {/* Golf Complete Overlay */}
      {showGolfComplete && activeGolfProblem && (
        <GolfComplete
          blockCount={blockCount}
          par={activeGolfProblem.par}
          isNewBest={golfIsNewBest}
          onRetry={handleRetryGolf}
          onNextProblem={handleNextGolfProblem}
          onBackToGolf={handleBackToGolf}
          hasNextProblem={!!getNextProblem(activeGolfProblem.id)}
        />
      )}

      {/* Lab Complete Overlay */}
      {showLabComplete && activeLabExercise && (
        <LabComplete
          onNextExercise={handleNextExercise}
          onBackToLab={handleBackToLab}
          hasNextExercise={!!getNextExercise(activeLabExercise.id)}
        />
      )}

      {/* Stats Dashboard */}
      {showStats && (
        <StatsPanel onClose={() => setShowStats(false)} />
      )}

      {/* Checkpoint Modal */}
      {showCheckpointModal && (
        <CheckpointModal
          onSave={async (label) => {
            setShowCheckpointModal(false)
            await saveCheckpoint(label)
          }}
          onCancel={() => setShowCheckpointModal(false)}
        />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          checkpoints={checkpoints}
          currentBranch={currentBranch}
          onRollback={async (id) => {
            setShowHistory(false)
            await rollbackTo(id)
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsChanged={resetAutoSave}
        />
      )}

      {/* Welcome Modal — shown on first visit */}
      {showWelcome && (
        <WelcomeModal
          onStartTour={() => {
            setShowWelcome(false)
            setShowTutorial(true)
          }}
          onSkip={() => setShowWelcome(false)}
        />
      )}

      {/* Scratch Import */}
      {showScratchImport && (
        <Suspense fallback={null}>
          <ScratchImportModal
            onClose={() => setShowScratchImport(false)}
            onImport={(ws) => {
              if (workspaceRef.current) {
                workspaceRef.current.clear()
                try {
                  Blockly.serialization.workspaces.load(ws, workspaceRef.current)
                } catch { /* partial import is fine */ }
              }
            }}
          />
        </Suspense>
      )}

      {/* Sprite Editor */}
      {showSpriteEditor && (
        <Suspense fallback={null}>
          <SpriteEditor
            onClose={() => setShowSpriteEditor(false)}
            onSave={(dataUrl, name, frames) => {
              // Store sprite in localStorage for use with Games blocks
              const sprites = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}')
              sprites[name] = { dataUrl, frames, size: 16 }
              localStorage.setItem('cryptoblocks-sprites', JSON.stringify(sprites))
              setShowSpriteEditor(false)
            }}
          />
        </Suspense>
      )}

      {showLevelEditor && (
        <Suspense fallback={null}>
          <LevelEditor
            onClose={() => setShowLevelEditor(false)}
            onExport={(platforms, spawnX, spawnY) => {
              if (!workspaceRef.current) return
              const Bs = Blockly.serialization.workspaces
              // Build workspace JSON for the level
              const blocks: Record<string, unknown>[] = []
              let id = 0
              const nextId = () => `lvl_${++id}`

              // set_canvas
              blocks.push({ type: 'cb_set_canvas', id: nextId(), x: 50, y: 50, inputs: {
                width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 640 } } },
                height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 400 } } },
                color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '#1e1e2e' } } },
              }})

              // set_gravity
              blocks.push({ type: 'cb_set_gravity', id: nextId(), x: 50, y: 120, inputs: {
                value: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 0.4 } } },
              }})

              // create_sprite for player
              blocks.push({ type: 'cb_create_sprite', id: nextId(), x: 50, y: 170, inputs: {
                name: { shadow: { type: 'text', id: nextId(), fields: { TEXT: 'player' } } },
                x: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: spawnX } } },
                y: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: spawnY } } },
                width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 40 } } },
                height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 40 } } },
                color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '#f9e2af' } } },
                emoji: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '🦊' } } },
                image: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '' } } },
              }})

              // add_platform for each platform
              platforms.forEach((p, i) => {
                blocks.push({ type: 'cb_add_platform', id: nextId(), x: 50, y: 350 + i * 80, inputs: {
                  x: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.x } } },
                  y: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.y } } },
                  width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.w } } },
                  height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.h } } },
                  color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: p.color } } },
                }})
              })

              // Load into workspace
              workspaceRef.current.clear()
              Bs.load({ blocks: { languageVersion: 0, blocks } }, workspaceRef.current)
              setShowLevelEditor(false)
            }}
          />
        </Suspense>
      )}

      {/* Hacker Terminal */}
      <HackerTerminal blockCount={blockCount} />
      <ToastContainer />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay
          onFinish={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* Collab modals */}
      {showCollabModal && (
        <Suspense fallback={null}>
          <CollabModal
            onClose={() => setShowCollabModal(false)}
            onCreateRoom={(_roomId, code, name) => {
              setShowCollabModal(false)
              setCollabRoomCreated({ code, name })
              localStorage.setItem(`collab-room-name-${code}`, name)
            }}
            onJoinRoom={(code) => {
              setShowCollabModal(false)
              window.location.href = `/collab/${code}`
            }}
          />
        </Suspense>
      )}

      {collabRoomCreated && (
        <Suspense fallback={null}>
          <RoomCreatedModal
            roomCode={collabRoomCreated.code}
            roomName={collabRoomCreated.name}
            onClose={() => {
              setCollabRoomCreated(null)
              window.location.href = `/collab/${collabRoomCreated.code}`
            }}
          />
        </Suspense>
      )}

      {/* Achievement Toast */}
      <AchievementToast
        achievement={currentAchievement}
        onDismiss={showNextAchievement}
      />
    </div>
  )
}
