/**
 * Mobile overflow menu — the compact "more" menu for small screens.
 * No gating, no async — purely navigation and action triggers.
 */

import { type MutableRefObject } from 'react'
import DropdownMenu from '../DropdownMenu'
import type { MenuItem } from '../DropdownMenu'

export interface MobileMenuProps {
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  importAsBlockInputRef: MutableRefObject<HTMLInputElement | null>
  close: () => void

  onOpenCollab?: () => void
  onExport: () => void
  onCreateBlock: () => void
  onCodeToBlocks: () => void
  onOpenExamples: () => void
  onOpenBlocksets: () => void
  onOpenGolf: () => void
  onOpenLab: () => void
  onOpenStats: () => void
  onExportHtml: () => void
  onPublish: () => void
  onUndo: () => void
  onRedo: () => void
  onFitView: () => void
  onSaveCheckpoint: () => void
  onOpenHistory: () => void
  onClear: () => void
}

export default function MobileMenu(p: MobileMenuProps) {
  // Each item fires an action then closes the menu. Structured as data for
  // one obvious reason: adding or reordering an item is a single line here.
  const act = (fn: () => void) => () => { fn(); p.close() }

  const items: MenuItem[] = [
    ...(p.onOpenCollab ? [{ kind: 'button' as const, icon: 'users' as const, iconCls: 'w-4 h-4 text-accent', label: 'Code with Friends', onClick: act(p.onOpenCollab) }] : []),
    { kind: 'button', icon: 'download', iconCls: 'w-4 h-4 text-accent', label: 'Save .blocks', onClick: act(p.onExport) },
    { kind: 'button', icon: 'upload', iconCls: 'w-4 h-4 text-accent', label: 'Load .blocks', onClick: act(() => p.fileInputRef.current?.click()) },
    { kind: 'button', icon: 'cube', iconCls: 'w-4 h-4 text-accent', label: 'Import as Block', onClick: act(() => p.importAsBlockInputRef.current?.click()) },
    { kind: 'divider' },
    { kind: 'button', icon: 'plus', iconCls: 'w-4 h-4 text-warn', label: 'Create Block', onClick: act(p.onCreateBlock) },
    { kind: 'button', icon: 'pages', iconCls: 'w-4 h-4 text-purple', label: 'Code to Blocks', onClick: act(p.onCodeToBlocks) },
    { kind: 'button', icon: 'book', iconCls: 'w-4 h-4 text-success', label: 'Examples', onClick: act(p.onOpenExamples) },
    { kind: 'button', icon: 'book', iconCls: 'w-4 h-4 text-accent', label: 'Blocksets', onClick: act(p.onOpenBlocksets) },
    { kind: 'button', icon: 'flag', iconCls: 'w-4 h-4 text-success', label: 'Code Golf', onClick: act(p.onOpenGolf) },
    { kind: 'button', icon: 'book-classroom', iconCls: 'w-4 h-4 text-purple', label: 'Code Lab', onClick: act(p.onOpenLab) },
    { kind: 'button', icon: 'bars-chart', iconCls: 'w-4 h-4 text-accent', label: 'Developer Stats', onClick: act(p.onOpenStats) },
    { kind: 'divider' },
    { kind: 'button', icon: 'download', iconCls: 'w-4 h-4 text-success', label: 'Export HTML', onClick: act(p.onExportHtml) },
    { kind: 'button', icon: 'cloud-up-arrow', iconCls: 'w-4 h-4 text-purple', label: 'Publish to GitHub', onClick: act(p.onPublish) },
    { kind: 'divider' },
    { kind: 'button', icon: 'arrow-undo', iconCls: 'w-4 h-4 text-text', label: 'Undo', onClick: act(p.onUndo) },
    { kind: 'button', icon: 'arrow-redo', iconCls: 'w-4 h-4 text-text', label: 'Redo', onClick: act(p.onRedo) },
    { kind: 'button', icon: 'expand', iconCls: 'w-4 h-4 text-accent', label: 'Fit View', onClick: act(p.onFitView) },
    { kind: 'divider' },
    { kind: 'button', icon: 'check', iconCls: 'w-4 h-4 text-success', label: 'Save Checkpoint', onClick: act(p.onSaveCheckpoint) },
    { kind: 'button', icon: 'clock', iconCls: 'w-4 h-4 text-accent', label: 'History', onClick: act(p.onOpenHistory) },
    { kind: 'divider' },
    { kind: 'button', icon: 'trash', iconCls: 'w-4 h-4 text-danger', label: 'Clear Workspace', onClick: act(p.onClear) },
  ]

  return (
    <DropdownMenu
      items={items}
      className="absolute right-0 mt-1 w-56 bg-surface-0 border border-surface-1 rounded-lg shadow-xl z-50 py-1 max-h-[70vh] overflow-auto"
    />
  )
}
