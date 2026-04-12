import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import * as Blockly from 'blockly'
import type { Language, BlockDefinition } from './types/block'
import { generateCode, generateHtmlMarkup, registerSingleBlock, unregisterBlock, getToolboxXml, getFilteredToolboxXml } from './blocks/blockly-register'
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
import BlockEditor from './components/BlockEditor'
import CodeView from './components/CodeView'
import CodeMirrorEditor from './learn/CodeMirrorEditor'
import OutputPanel from './components/OutputPanel'
import CreateBlockModal from './components/CreateBlockModal'
import ChallengeBrowser from './components/ChallengeBrowser'
import ChallengePanel from './components/ChallengePanel'
import ChallengeComplete from './components/ChallengeComplete'
import BlocksetBrowser from './components/BlocksetBrowser'
import BlocksetPanel from './components/BlocksetPanel'
import BlocksetComplete from './components/BlocksetComplete'
import GolfBrowser from './components/GolfBrowser'
import GolfPanel from './components/GolfPanel'
import GolfComplete from './components/GolfComplete'
import LabBrowser from './components/LabBrowser'
import LabPanel from './components/LabPanel'
import LabComplete from './components/LabComplete'
import ExamplesBrowser from './components/ExamplesBrowser'
import CodeToBlocksModal from './components/CodeToBlocksModal'
import PublishModal from './components/PublishModal'
import type { ConversionResult } from './converters/js-to-workspace'
import type { Example } from './examples'
import { useVersionControl } from './version-control/useVersionControl'
import CheckpointModal from './components/CheckpointModal'
import HistoryPanel from './components/HistoryPanel'
import SettingsModal from './components/SettingsModal'
import WelcomeModal from './components/WelcomeModal'
import TutorialOverlay from './components/TutorialOverlay'
import { initEasterEggs } from './easter-eggs'
import type { Achievement } from './achievements'
import { checkAchievements } from './achievements'
import { recordRun, recordChallengeComplete, recordGolfComplete, recordLabComplete, recordAchievement } from './stats'
import { AchievementToast } from './components/AchievementToast'
import StatsPanel from './components/StatsPanel'
import HackerTerminal from './components/HackerTerminal'
const SpriteEditor = lazy(() => import('./sprite-editor/SpriteEditor'))
const CollabModal = lazy(() => import('./collab/CollabModal'))
const RoomCreatedModal = lazy(() => import('./collab/RoomCreatedModal'))
const ScratchImportModal = lazy(() => import('./components/ScratchImportModal'))
import { useCollabDoc } from './collab/CollabPage'
import { bindRunBroadcast } from './collab/run-broadcast'
import WorkspaceFloatingControls from './components/WorkspaceFloatingControls'
import { ensureSpeechGlobal } from './speech/speech'
import { ensureVisionGlobal } from './vision/vision-global'
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
  const runBroadcastRef = useRef<ReturnType<typeof bindRunBroadcast> | null>(null)

  // Store sandbox workspace before entering challenge mode
  const savedSandboxState = useRef<Record<string, unknown> | null>(null)

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
  const executionHandleRef = useRef<ExecutionHandle | null>(null)

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
  languageRef.current = language
  modeRef.current = mode

  // Restore from localStorage on mount
  useEffect(() => {
    initEasterEggs()
    ensureSpeechGlobal()
    ensureVisionGlobal()

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
      if (modeRef.current === 'sandbox' && !isCollabMode) {
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

    setIsRunning(true)
    setShowOutput(true)
    setResult(null)
    setLiveOutput([])

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

    const handle = executeCode(execCode, execLang, (line) => {
      setLiveOutput((prev) => [...prev, line])
    }, traceEnabled ? (blockId) => {
      traceLog.push(blockId)
    } : undefined, (dataUrl) => {
      setResult((prev) => prev
        ? { ...prev, canvasDataUrl: dataUrl }
        : { output: [], error: null, returnValue: undefined, duration: 0, canvasDataUrl: dataUrl })
    })
    executionHandleRef.current = handle

    const execResult = await handle.promise
    executionHandleRef.current = null

    // Replay trace highlights with delay so user can follow along
    if (traceEnabled && traceLog.length > 0) {
      setResult(execResult)
      setLiveOutput([])
      for (const blockId of traceLog) {
        workspaceRef.current?.highlightBlock(blockId)
        await new Promise(r => setTimeout(r, 200))
      }
      workspaceRef.current?.highlightBlock(null as unknown as string)
    } else {
      setResult(execResult)
      setLiveOutput([])
    }
    setIsRunning(false)

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
  }, [code, language, slowMo, processAchievements, getUsedCategories, isDailyChallenge, dailyInfo])

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

      recordChallengeComplete()
      const newAchievements = checkAchievements({
        event: 'challenge-complete',
        challengeStars: stars,
      })
      processAchievements(newAchievements)

      setShowComplete(true)
    }
  }, [code, language, activeChallenge, processAchievements])

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
          // Lock starter blocks — user must use them
          for (const b of workspaceRef.current.getAllBlocks(false)) {
            b.setDeletable(false)
          }
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
      // Reload starter blocks if this is an island challenge
      if (activeChallenge?.starterBlocks) {
        Blockly.serialization.workspaces.load(activeChallenge.starterBlocks, workspaceRef.current)
        for (const b of workspaceRef.current.getAllBlocks(false)) {
          b.setDeletable(false)
        }
      }
    }
  }, [activeChallenge])

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
    if (workspaceRef.current && modeRef.current === 'sandbox') {
      savedSandboxState.current = Blockly.serialization.workspaces.save(workspaceRef.current)
    }

    setActiveBlockset(blockset)
    setMode('active-blockset')
    setShowBlocksetComplete(false)
    setShowOutput(false)
    setResult(null)
    setBlockCount(0)

    setTimeout(() => {
      if (workspaceRef.current) {
        const toolbox = getFilteredToolboxXml(blockset.allowedCategories)
        workspaceRef.current.updateToolbox(toolbox)
        workspaceRef.current.clear()
      }
    }, 0)
  }, [])

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

    if (execResult.error) return

    const passed = validateOutput(execResult.output, activeBlockset.expectedOutput)
    if (passed) {
      saveBlocksetProgress({
        blocksetId: activeBlockset.id,
        completed: true,
        attempts: 1,
      })
      setShowBlocksetComplete(true)
    }
  }, [code, language, activeBlockset])

  // === Code Golf handlers ===
  const handleOpenGolf = useCallback(() => {
    if (mode === 'code-golf') {
      handleBackToSandbox()
    } else {
      setMode('code-golf')
    }
  }, [mode, handleBackToSandbox])

  const handleSelectGolfProblem = useCallback((problem: GolfProblem) => {
    if (workspaceRef.current && modeRef.current === 'sandbox') {
      savedSandboxState.current = Blockly.serialization.workspaces.save(workspaceRef.current)
    }

    setActiveGolfProblem(problem)
    setMode('active-golf')
    setShowGolfComplete(false)
    setShowOutput(false)
    setResult(null)
    setBlockCount(0)
    setGolfIsNewBest(false)

    setTimeout(() => {
      if (workspaceRef.current) {
        const toolbox = problem.allowedCategories
          ? getFilteredToolboxXml(problem.allowedCategories)
          : getToolboxXml()
        workspaceRef.current.updateToolbox(toolbox)
        workspaceRef.current.clear()
      }
    }, 0)
  }, [])

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
    setResult(null)
    setShowOutput(false)
    if (workspaceRef.current) {
      workspaceRef.current.clear()
    }
  }, [])

  const handleCheckGolfSolution = useCallback(async () => {
    if (!activeGolfProblem || !workspaceRef.current) return

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
    if (workspaceRef.current && modeRef.current === 'sandbox') {
      savedSandboxState.current = Blockly.serialization.workspaces.save(workspaceRef.current)
    }

    setActiveLabExercise(exercise)
    setMode('active-lab')
    setShowLabComplete(false)
    setShowOutput(false)
    setResult(null)
    setLabCode(exercise.starterCode || '')
  }, [])

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

    setIsRunning(true)
    setShowOutput(true)
    setResult(null)
    setLiveOutput([])

    const handle = executeCode(labCode, 'javascript', (line) => {
      setLiveOutput((prev) => [...prev, line])
    })
    executionHandleRef.current = handle

    const execResult = await handle.promise
    executionHandleRef.current = null
    setResult(execResult)
    setLiveOutput([])
    setIsRunning(false)

    if (execResult.error) return

    const passed = validateOutput(execResult.output, activeLabExercise.expectedOutput)
    if (passed) {
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
      setResult({
        ...execResult,
        output: [
          ...execResult.output,
          '',
          '❌ Not quite! Make sure your code prints the result.',
          `Expected output: ${expected}`,
          `Your output: ${actual}`,
        ],
      })
    }
  }, [labCode, activeLabExercise, processAchievements])

  const handleLabCodeChange = useCallback((newCode: string) => {
    setLabCode(newCode)
  }, [])

  const handleSelectExample = useCallback((example: Example) => {
    setShowExamples(false)

    // Kill any running execution (camera, animation loops, etc.)
    executionHandleRef.current?.abort()
    executionHandleRef.current = null
    setIsRunning(false)
    setResult(null)
    setLiveOutput([])

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
        // Scroll to show the loaded blocks
        workspaceRef.current.scrollCenter()
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
    // Kill any running execution
    executionHandleRef.current?.abort()
    executionHandleRef.current = null
    setIsRunning(false)
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
    <div className="flex flex-col h-full relative">
      {isDailyChallenge && dailyInfo && (
        <ChallengeBanner
          puzzle={dailyInfo.puzzle}
          dayNumber={dailyInfo.dayNumber}
          solvedBlocks={dailySolvedBlocks}
        />
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
        onOpenSpriteEditor={() => setShowSpriteEditor(true)}
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

      {/* Active Lab Mode — full-width editor, no Blockly */}
      {mode === 'active-lab' && activeLabExercise && (
        <>
          <LabPanel
            exercise={activeLabExercise}
            onCheckSolution={handleCheckLabSolution}
            onBack={handleBackToLab}
            isRunning={isRunning}
          />

          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Full-width Code Editor */}
            <div className={`${showOutput ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full'} flex flex-col`}>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-[#313244]">
                <span className="text-xs text-[#6c7086] uppercase tracking-wide font-semibold mr-2">
                  Code Lab
                </span>
                <span className="text-xs text-[#f9e2af] bg-[#313244] px-2 py-0.5 rounded">JavaScript</span>
              </div>
              <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                  code={labCode}
                  onChange={handleLabCodeChange}
                  language="javascript"
                  height="100%"
                />
              </div>
            </div>

            {/* Output Panel */}
            {showOutput && (
              <div className="h-1/2 md:h-full md:w-1/2 border-t md:border-t-0 md:border-l border-[#313244]">
                <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Editor Mode (sandbox, active-challenge, active-blockset, active-golf) */}
      {mode !== 'challenges' && mode !== 'blocksets' && mode !== 'code-golf' && mode !== 'code-lab' && mode !== 'active-lab' && (
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

          {/* Blockset Panel Banner */}
          {mode === 'active-blockset' && activeBlockset && (
            <BlocksetPanel
              blockset={activeBlockset}
              blockCount={blockCount}
              onCheckSolution={handleCheckBlocksetSolution}
              onBack={handleBackToBlocksets}
              isRunning={isRunning}
            />
          )}

          {/* Golf Panel Banner */}
          {mode === 'active-golf' && activeGolfProblem && (
            <GolfPanel
              problem={activeGolfProblem}
              blockCount={blockCount}
              onCheckSolution={handleCheckGolfSolution}
              onBack={handleBackToGolf}
              isRunning={isRunning}
            />
          )}

          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Block Editor */}
            <div
              className="relative h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[#313244]"
              style={(showCode || showOutput) ? { width: `${splitPercent}%` } : { width: '100%' }}
            >
              <BlockEditor
                onWorkspaceChange={handleWorkspaceChange}
                onEditBlock={handleEditBlock}
                onDeleteBlock={handleDeleteBlock}
                onSaveAsBlock={handleSaveAsBlock}
                initialWorkspaceState={initialWorkspaceState}
              />
              {mode === 'sandbox' && (
                <WorkspaceFloatingControls
                  slowMo={slowMo}
                  onToggleSlowMo={() => setSlowMo((s) => !s)}
                  slowMoDisabled={isRunning}
                  onEnterTimeTravel={timeTravel.enterTimeTravel}
                  timeTravelAvailable={timeTravel.snapshotCount > 1}
                />
              )}
            </div>

            {/* Drag handle */}
            {(showCode || showOutput) && (
              <div
                className="hidden md:flex items-center justify-center w-1.5 cursor-col-resize bg-[#313244] hover:bg-[#f9e2af] active:bg-[#f9e2af] transition-colors flex-shrink-0"
                onMouseDown={handleSplitMouseDown}
              >
                <div className="w-0.5 h-8 bg-[#6c7086] rounded-full" />
              </div>
            )}

            {/* Code View */}
            {showCode && (
              <div className="h-1/2 md:h-full flex flex-col" style={{ width: `${100 - splitPercent}%` }}>
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
                    <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
                  </div>
                )}
              </div>
            )}

            {/* Output when code view is hidden — show on right side */}
            {!showCode && showOutput && (
              <div className="h-1/2 md:h-full border-t md:border-t-0 md:border-l border-[#313244]" style={{ width: `${100 - splitPercent}%` }}>
                <OutputPanel result={result} isRunning={isRunning} liveOutput={liveOutput} previewCode={lastExecCode} />
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

      {/* Hacker Terminal */}
      <HackerTerminal blockCount={blockCount} />

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
