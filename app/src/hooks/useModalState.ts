/**
 * Consolidates the 15+ modal-visibility booleans from App.tsx into one hook.
 *
 * Cuts ~30 lines of useState declarations from App.tsx and gives AppModals
 * a single `modals` prop instead of 30+ individual show-flag / set-flag props.
 */

import { useState, useCallback } from 'react'

export function useModalState() {
  const [createBlock, setCreateBlock] = useState(false)
  const [examples, setExamples] = useState(false)
  const [codeToBlocks, setCodeToBlocks] = useState(false)
  const [publish, setPublish] = useState(false)
  const [stats, setStats] = useState(false)
  const [settings, setSettings] = useState(false)
  const [welcome, setWelcome] = useState(() => !localStorage.getItem('cryptoblocks-tutorial-seen'))
  const [tutorial, setTutorial] = useState(false)
  const [collabModal, setCollabModal] = useState(false)
  const [scratchImport, setScratchImport] = useState(false)
  const [spriteEditor, setSpriteEditor] = useState(false)
  const [spriteBrowser, setSpriteBrowser] = useState(false)
  const [photoToSprite, setPhotoToSprite] = useState(false)
  const [levelEditor, setLevelEditor] = useState(false)
  const [collabRoomCreated, setCollabRoomCreated] = useState<{ code: string; name: string } | null>(null)

  const closeAll = useCallback(() => {
    setCreateBlock(false)
    setExamples(false)
    setCodeToBlocks(false)
    setPublish(false)
  }, [])

  return {
    createBlock, setCreateBlock,
    examples, setExamples,
    codeToBlocks, setCodeToBlocks,
    publish, setPublish,
    stats, setStats,
    settings, setSettings,
    welcome, setWelcome,
    tutorial, setTutorial,
    collabModal, setCollabModal,
    scratchImport, setScratchImport,
    spriteEditor, setSpriteEditor,
    spriteBrowser, setSpriteBrowser,
    photoToSprite, setPhotoToSprite,
    levelEditor, setLevelEditor,
    collabRoomCreated, setCollabRoomCreated,
    closeAll,
  }
}

export type ModalState = ReturnType<typeof useModalState>
