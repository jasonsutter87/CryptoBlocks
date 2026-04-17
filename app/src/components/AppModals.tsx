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
const SpriteBrowser = lazy(() => import('../sprite-editor/SpriteBrowser'))
const PhotoToSprite = lazy(() => import('../sprite-editor/PhotoToSprite'))
const LevelEditor = lazy(() => import('../level-editor/LevelEditor'))
const CollabModal = lazy(() => import('../collab/CollabModal'))
const RoomCreatedModal = lazy(() => import('../collab/RoomCreatedModal'))
const ScratchImportModal = lazy(() => import('./ScratchImportModal'))

export interface AppModalsProps {
  // All modal visibility + setters from useModalState
  modals: import('../hooks/useModalState').ModalState

  // Gameplay completion (not in useModalState — tied to mode state)
  showComplete: boolean
  showBlocksetComplete: boolean
  showGolfComplete: boolean
  showLabComplete: boolean

  // Version control modals (from useVersionControl, not useModalState)
  showCheckpointModal: boolean
  showHistory: boolean
  setShowCheckpointModal: (open: boolean) => void
  setShowHistory: (open: boolean) => void

  // Close handler for create-block modal (resets editingBlock too)
  closeCreateModal: () => void

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

  // Achievements + always-on layers
  currentAchievement: Achievement | null
  showNextAchievement: () => void
}

export default function AppModals(p: AppModalsProps) {
  return (
    <>
      {/* === Creator tools === */}
      {p.modals.createBlock && (
        <CreateBlockModal
          onBuild={p.handleCreateBlock}
          onClose={p.closeCreateModal}
          editBlock={p.editingBlock}
        />
      )}
      {p.modals.examples && (
        <ExamplesBrowser
          onSelectExample={p.handleSelectExample}
          onClose={() => p.modals.setExamples(false)}
        />
      )}
      {p.modals.codeToBlocks && (
        <CodeToBlocksModal
          onConvert={p.handleCodeToBlocks}
          onClose={() => p.modals.setCodeToBlocks(false)}
        />
      )}
      {p.modals.publish && (
        <GitHubPublishModal onClose={() => p.modals.setPublish(false)} />
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
      {p.modals.stats && <StatsPanel onClose={() => p.modals.setStats(false)} />}
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
      {p.modals.settings && (
        <SettingsModal
          onClose={() => p.modals.setSettings(false)}
          onSettingsChanged={p.resetAutoSave}
        />
      )}
      {p.modals.welcome && (
        <WelcomeModal
          onStartTour={() => {
            p.modals.setWelcome(false)
            p.modals.setTutorial(true)
          }}
          onSkip={() => p.modals.setWelcome(false)}
        />
      )}
      {p.modals.tutorial && (
        <TutorialOverlay
          onFinish={() => p.modals.setTutorial(false)}
          onSkip={() => p.modals.setTutorial(false)}
        />
      )}

      {/* === Lazy-loaded heavy editors === */}
      {p.modals.scratchImport && (
        <Suspense fallback={null}>
          <ScratchImportModal
            onClose={() => p.modals.setScratchImport(false)}
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
      {p.modals.spriteEditor && (
        <Suspense fallback={null}>
          <SpriteEditor
            onClose={() => p.modals.setSpriteEditor(false)}
            onSave={(dataUrl, name, frames) => {
              const sprites = JSON.parse(localStorage.getItem('cryptoblocks-sprites') || '{}')
              sprites[name] = { dataUrl, frames, size: 16 }
              localStorage.setItem('cryptoblocks-sprites', JSON.stringify(sprites))
              p.modals.setSpriteEditor(false)
            }}
          />
        </Suspense>
      )}
      {p.modals.spriteBrowser && (
        <Suspense fallback={null}>
          <SpriteBrowser onClose={() => p.modals.setSpriteBrowser(false)} />
        </Suspense>
      )}
      {p.modals.photoToSprite && (
        <Suspense fallback={null}>
          <PhotoToSprite onClose={() => p.modals.setPhotoToSprite(false)} />
        </Suspense>
      )}
      {p.modals.levelEditor && (
        <Suspense fallback={null}>
          <LevelEditor
            onClose={() => p.modals.setLevelEditor(false)}
            onExport={(platforms, spawnX, spawnY) => {
              if (!p.workspaceRef.current) return
              loadLevelIntoWorkspace(p.workspaceRef.current, platforms, spawnX, spawnY)
              p.modals.setLevelEditor(false)
            }}
          />
        </Suspense>
      )}

      {/* === Collab === */}
      {p.modals.collabModal && (
        <Suspense fallback={null}>
          <CollabModal
            onClose={() => p.modals.setCollabModal(false)}
            onCreateRoom={(_roomId, code, name) => {
              p.modals.setCollabModal(false)
              p.modals.setCollabRoomCreated({ code, name })
              localStorage.setItem(`collab-room-name-${code}`, name)
            }}
            onJoinRoom={(code) => {
              p.modals.setCollabModal(false)
              window.location.href = `/collab/${code}`
            }}
          />
        </Suspense>
      )}
      {p.modals.collabRoomCreated && (
        <Suspense fallback={null}>
          <RoomCreatedModal
            roomCode={p.modals.collabRoomCreated.code}
            roomName={p.modals.collabRoomCreated.name}
            onClose={() => {
              const code = p.modals.collabRoomCreated!.code
              p.modals.setCollabRoomCreated(null)
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
