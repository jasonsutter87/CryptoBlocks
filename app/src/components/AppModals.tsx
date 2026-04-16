/**
 * AppModals — every overlay that App.tsx shows on top of the editor.
 *
 * Why one component: App.tsx had ~250 lines of `{showX && <X .../>}`
 * inline. Lifting them here keeps the parent file focused on layout and
 * mode routing. Each modal is grouped by its purpose (gameplay completion,
 * creator tools, system, collab) so the next maintainer can find what they
 * need by category.
 */

import { lazy, Suspense } from 'react'
import * as Blockly from 'blockly'
import type { BlockDefinition } from '../types/block'
import type { Challenge } from '../challenges'
import type { Blockset } from '../blocksets'
import type { GolfProblem } from '../code-golf'
import type { LabExercise } from '../code-lab'
import type { Achievement } from '../achievements'
import type { Example } from '../examples'
import type { Checkpoint, Branch } from '../version-control/types'
import type { ConversionResult } from '../converters/js-to-workspace'
import { getNextChallenge } from '../challenges'
import { getNextBlockset } from '../blocksets'
import { getNextProblem } from '../code-golf'
import { getNextExercise } from '../code-lab'
import CreateBlockModal from './CreateBlockModal'
import ChallengeComplete from './ChallengeComplete'
import BlocksetComplete from './BlocksetComplete'
import GolfComplete from './GolfComplete'
import LabComplete from './LabComplete'
import ExamplesBrowser from './ExamplesBrowser'
import CodeToBlocksModal from './CodeToBlocksModal'
import GitHubPublishModal from './GitHubPublishModal'
import StatsPanel from './StatsPanel'
import CheckpointModal from './CheckpointModal'
import HistoryPanel from './HistoryPanel'
import SettingsModal from './SettingsModal'
import WelcomeModal from './WelcomeModal'
import TutorialOverlay from './TutorialOverlay'
import { AchievementToast } from './AchievementToast'
import HackerTerminal from './HackerTerminal'
import ToastContainer from './Toast'

const SpriteEditor = lazy(() => import('../sprite-editor/SpriteEditor'))
const LevelEditor = lazy(() => import('../level-editor/LevelEditor'))
const CollabModal = lazy(() => import('../collab/CollabModal'))
const RoomCreatedModal = lazy(() => import('../collab/RoomCreatedModal'))
const ScratchImportModal = lazy(() => import('./ScratchImportModal'))

export interface AppModalsProps {
  // Visibility flags
  showCreateModal: boolean
  showExamples: boolean
  showCodeToBlocks: boolean
  showPublishModal: boolean
  showComplete: boolean
  showBlocksetComplete: boolean
  showGolfComplete: boolean
  showLabComplete: boolean
  showStats: boolean
  showCheckpointModal: boolean
  showHistory: boolean
  showSettings: boolean
  showWelcome: boolean
  showTutorial: boolean
  showCollabModal: boolean
  showScratchImport: boolean
  showSpriteEditor: boolean
  showLevelEditor: boolean

  // Open / close setters and chained actions
  closeCreateModal: () => void
  setShowExamples: (open: boolean) => void
  setShowCodeToBlocks: (open: boolean) => void
  setShowPublishModal: (open: boolean) => void
  setShowStats: (open: boolean) => void
  setShowCheckpointModal: (open: boolean) => void
  setShowHistory: (open: boolean) => void
  setShowSettings: (open: boolean) => void
  setShowWelcome: (open: boolean) => void
  setShowTutorial: (open: boolean) => void
  setShowCollabModal: (open: boolean) => void
  setShowScratchImport: (open: boolean) => void
  setShowSpriteEditor: (open: boolean) => void
  setShowLevelEditor: (open: boolean) => void

  // Active gameplay context — drives the completion overlays
  activeChallenge: Challenge | null
  activeBlockset: Blockset | null
  activeGolfProblem: GolfProblem | null
  activeLabExercise: LabExercise | null
  challengeStars: number
  blockCount: number
  golfIsNewBest: boolean

  // Action handlers
  editingBlock: BlockDefinition | null
  handleCreateBlock: (block: BlockDefinition) => void
  handleSelectExample: (example: Example) => void
  handleCodeToBlocks: (result: ConversionResult) => void
  handleNextChallenge: () => void
  handleBackToChallenges: () => void
  handleRetryChallenge: () => void
  handleNextBlockset: () => void
  handleBackToBlocksets: () => void
  handleRetryGolf: () => void
  handleNextGolfProblem: () => void
  handleBackToGolf: () => void
  handleNextExercise: () => void
  handleBackToLab: () => void

  // Version control
  checkpoints: Checkpoint[]
  currentBranch: Branch | null
  saveCheckpoint: (label: string) => Promise<void>
  rollbackTo: (id: string) => Promise<void>
  resetAutoSave: () => void

  // Workspace ref for lazy editors that touch Blockly
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>

  // Collab
  collabRoomCreated: { code: string; name: string } | null
  setCollabRoomCreated: (v: { code: string; name: string } | null) => void

  // Achievements + always-on layers
  currentAchievement: Achievement | null
  showNextAchievement: () => void
}

export default function AppModals(p: AppModalsProps) {
  return (
    <>
      {/* === Creator tools === */}
      {p.showCreateModal && (
        <CreateBlockModal
          onBuild={p.handleCreateBlock}
          onClose={p.closeCreateModal}
          editBlock={p.editingBlock}
        />
      )}
      {p.showExamples && (
        <ExamplesBrowser
          onSelectExample={p.handleSelectExample}
          onClose={() => p.setShowExamples(false)}
        />
      )}
      {p.showCodeToBlocks && (
        <CodeToBlocksModal
          onConvert={p.handleCodeToBlocks}
          onClose={() => p.setShowCodeToBlocks(false)}
        />
      )}
      {p.showPublishModal && (
        <GitHubPublishModal onClose={() => p.setShowPublishModal(false)} />
      )}

      {/* === Gameplay completion overlays === */}
      {p.showComplete && p.activeChallenge && (
        <ChallengeComplete
          stars={p.challengeStars}
          blockCount={p.blockCount}
          par={p.activeChallenge.par}
          onNextChallenge={p.handleNextChallenge}
          onBackToChallenges={p.handleBackToChallenges}
          onRetry={p.handleRetryChallenge}
          hasNextChallenge={!!getNextChallenge(p.activeChallenge.id)}
        />
      )}
      {p.showBlocksetComplete && p.activeBlockset && (
        <BlocksetComplete
          onNextBlockset={p.handleNextBlockset}
          onBackToBlocksets={p.handleBackToBlocksets}
          hasNextBlockset={!!getNextBlockset(p.activeBlockset.id)}
        />
      )}
      {p.showGolfComplete && p.activeGolfProblem && (
        <GolfComplete
          blockCount={p.blockCount}
          par={p.activeGolfProblem.par}
          isNewBest={p.golfIsNewBest}
          onRetry={p.handleRetryGolf}
          onNextProblem={p.handleNextGolfProblem}
          onBackToGolf={p.handleBackToGolf}
          hasNextProblem={!!getNextProblem(p.activeGolfProblem.id)}
        />
      )}
      {p.showLabComplete && p.activeLabExercise && (
        <LabComplete
          onNextExercise={p.handleNextExercise}
          onBackToLab={p.handleBackToLab}
          hasNextExercise={!!getNextExercise(p.activeLabExercise.id)}
        />
      )}

      {/* === System: stats, settings, version control, welcome === */}
      {p.showStats && <StatsPanel onClose={() => p.setShowStats(false)} />}
      {p.showCheckpointModal && (
        <CheckpointModal
          onSave={async (label) => {
            p.setShowCheckpointModal(false)
            await p.saveCheckpoint(label)
          }}
          onCancel={() => p.setShowCheckpointModal(false)}
        />
      )}
      {p.showHistory && (
        <HistoryPanel
          checkpoints={p.checkpoints}
          currentBranch={p.currentBranch}
          onRollback={async (id) => {
            p.setShowHistory(false)
            await p.rollbackTo(id)
          }}
          onClose={() => p.setShowHistory(false)}
        />
      )}
      {p.showSettings && (
        <SettingsModal
          onClose={() => p.setShowSettings(false)}
          onSettingsChanged={p.resetAutoSave}
        />
      )}
      {p.showWelcome && (
        <WelcomeModal
          onStartTour={() => {
            p.setShowWelcome(false)
            p.setShowTutorial(true)
          }}
          onSkip={() => p.setShowWelcome(false)}
        />
      )}
      {p.showTutorial && (
        <TutorialOverlay
          onFinish={() => p.setShowTutorial(false)}
          onSkip={() => p.setShowTutorial(false)}
        />
      )}

      {/* === Lazy-loaded heavy editors === */}
      {p.showScratchImport && (
        <Suspense fallback={null}>
          <ScratchImportModal
            onClose={() => p.setShowScratchImport(false)}
            onImport={(ws) => {
              if (p.workspaceRef.current) {
                p.workspaceRef.current.clear()
                try {
                  Blockly.serialization.workspaces.load(ws, p.workspaceRef.current)
                } catch { /* partial import is fine */ }
              }
            }}
          />
        </Suspense>
      )}
      {p.showSpriteEditor && (
        <Suspense fallback={null}>
          <SpriteEditor
            onClose={() => p.setShowSpriteEditor(false)}
            onSave={(dataUrl, name, frames) => {
              const sprites = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}')
              sprites[name] = { dataUrl, frames, size: 16 }
              localStorage.setItem('cryptoblocks-sprites', JSON.stringify(sprites))
              p.setShowSpriteEditor(false)
            }}
          />
        </Suspense>
      )}
      {p.showLevelEditor && (
        <Suspense fallback={null}>
          <LevelEditor
            onClose={() => p.setShowLevelEditor(false)}
            onExport={(platforms, spawnX, spawnY) => {
              if (!p.workspaceRef.current) return
              loadLevelIntoWorkspace(p.workspaceRef.current, platforms, spawnX, spawnY)
              p.setShowLevelEditor(false)
            }}
          />
        </Suspense>
      )}

      {/* === Collab === */}
      {p.showCollabModal && (
        <Suspense fallback={null}>
          <CollabModal
            onClose={() => p.setShowCollabModal(false)}
            onCreateRoom={(_roomId, code, name) => {
              p.setShowCollabModal(false)
              p.setCollabRoomCreated({ code, name })
              localStorage.setItem(`collab-room-name-${code}`, name)
            }}
            onJoinRoom={(code) => {
              p.setShowCollabModal(false)
              window.location.href = `/collab/${code}`
            }}
          />
        </Suspense>
      )}
      {p.collabRoomCreated && (
        <Suspense fallback={null}>
          <RoomCreatedModal
            roomCode={p.collabRoomCreated.code}
            roomName={p.collabRoomCreated.name}
            onClose={() => {
              const code = p.collabRoomCreated!.code
              p.setCollabRoomCreated(null)
              window.location.href = `/collab/${code}`
            }}
          />
        </Suspense>
      )}

      {/* === Always-on overlays === */}
      <HackerTerminal blockCount={p.blockCount} />
      <ToastContainer />
      <AchievementToast
        achievement={p.currentAchievement}
        onDismiss={p.showNextAchievement}
      />
    </>
  )
}

/**
 * Build a workspace JSON for a level designed in the LevelEditor and load
 * it into the live Blockly workspace. Lifted out of inline JSX for
 * readability — the shadow-block plumbing is dense and was the longest
 * arrow function in App.tsx by a wide margin.
 */
function loadLevelIntoWorkspace(
  workspace: Blockly.WorkspaceSvg,
  platforms: Array<{ x: number; y: number; w: number; h: number; color: string }>,
  spawnX: number,
  spawnY: number,
): void {
  const blocks: Record<string, unknown>[] = []
  let id = 0
  const nextId = () => `lvl_${++id}`

  blocks.push({
    type: 'cb_set_canvas', id: nextId(), x: 50, y: 50, inputs: {
      width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 640 } } },
      height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 400 } } },
      color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '#1e1e2e' } } },
    },
  })
  blocks.push({
    type: 'cb_set_gravity', id: nextId(), x: 50, y: 120, inputs: {
      value: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 0.4 } } },
    },
  })
  blocks.push({
    type: 'cb_create_sprite', id: nextId(), x: 50, y: 170, inputs: {
      name: { shadow: { type: 'text', id: nextId(), fields: { TEXT: 'player' } } },
      x: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: spawnX } } },
      y: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: spawnY } } },
      width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 40 } } },
      height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: 40 } } },
      color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '#f9e2af' } } },
      emoji: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '🦊' } } },
      image: { shadow: { type: 'text', id: nextId(), fields: { TEXT: '' } } },
    },
  })
  platforms.forEach((p, i) => {
    blocks.push({
      type: 'cb_add_platform', id: nextId(), x: 50, y: 350 + i * 80, inputs: {
        x: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.x } } },
        y: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.y } } },
        width: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.w } } },
        height: { shadow: { type: 'math_number', id: nextId(), fields: { NUM: p.h } } },
        color: { shadow: { type: 'text', id: nextId(), fields: { TEXT: p.color } } },
      },
    })
  })

  workspace.clear()
  Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks } }, workspace)
}
