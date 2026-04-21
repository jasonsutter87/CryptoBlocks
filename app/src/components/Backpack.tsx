/**
 * Backpack — Minecraft-style hotbar at the bottom of the workspace.
 * Users right-click a block → "Add to Backpack" to save it (max 9 slots).
 * Click a slot to place a copy on the workspace.
 * Right-click a slot to remove it.
 * Persisted to localStorage under the key `cb-backpack`.
 */

import { useState, useEffect, useCallback } from 'react'
import * as Blockly from 'blockly'

const STORAGE_KEY = 'cb-backpack'
const MAX_SLOTS = 9

export interface BackpackSlot {
  id: string
  state: Blockly.serialization.blocks.State
  label: string
  color: string
}

function loadBackpack(): BackpackSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BackpackSlot[]
  } catch {
    return []
  }
}

function saveBackpack(slots: BackpackSlot[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
}

function blockLabel(type: string): string {
  return type.replace(/^cb_/, '').replace(/_/g, ' ')
}


interface BackpackProps {
  workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>
}

export default function Backpack({ workspaceRef }: BackpackProps) {
  const [slots, setSlots] = useState<BackpackSlot[]>(() => loadBackpack())

  // Expose add function globally so context menu can call it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__cbBackpackAdd = (block: Blockly.BlockSvg) => {
      const state = Blockly.serialization.blocks.save(block)
      if (!state) return

      setSlots((prev) => {
        if (prev.length >= MAX_SLOTS) {
          // Replace last slot
          const next = [...prev.slice(0, MAX_SLOTS - 1), {
            id: crypto.randomUUID(),
            state,
            label: blockLabel(block.type),
            color: block.getColour(),
          }]
          saveBackpack(next)
          return next
        }
        const next = [...prev, {
          id: crypto.randomUUID(),
          state,
          label: blockLabel(block.type),
          color: block.getColour(),
        }]
        saveBackpack(next)
        return next
      })
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__cbBackpackAdd
    }
  }, [])

  const handleSlotClick = useCallback((slot: BackpackSlot) => {
    const ws = workspaceRef.current
    if (!ws) return

    // Place copy at center of viewport
    const metrics = ws.getMetrics()
    const scale = ws.getScale()
    const cx = Math.round((metrics.scrollLeft + metrics.viewWidth / 2) / scale)
    const cy = Math.round((metrics.scrollTop + metrics.viewHeight / 2) / scale)

    const stateCopy = JSON.parse(JSON.stringify(slot.state)) as Blockly.serialization.blocks.State
    stateCopy.x = cx
    stateCopy.y = cy

    try {
      Blockly.serialization.blocks.append(stateCopy, ws)
    } catch {
      // ignore if block type no longer exists
    }
  }, [workspaceRef])

  const handleSlotRemove = useCallback((e: React.MouseEvent, slotId: string) => {
    e.preventDefault()
    setSlots((prev) => {
      const next = prev.filter((s) => s.id !== slotId)
      saveBackpack(next)
      return next
    })
  }, [])

  if (slots.length === 0) return null

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
      style={{ userSelect: 'none' }}
    >
      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-2 py-2 shadow-2xl">
        {Array.from({ length: MAX_SLOTS }, (_, i) => {
          const slot = slots[i]
          return (
            <div
              key={i}
              title={slot ? `${slot.label}\nClick to place · Right-click to remove` : `Slot ${i + 1} empty`}
              onClick={() => slot && handleSlotClick(slot)}
              onContextMenu={(e) => slot && handleSlotRemove(e, slot.id)}
              className={`
                w-10 h-10 rounded-lg border flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                ${slot
                  ? 'border-white/20 hover:border-white/50 hover:scale-110 active:scale-95'
                  : 'border-white/5 opacity-30 cursor-default'
                }
              `}
              style={slot ? { backgroundColor: slot.color + '40', borderColor: slot.color + '80' } : {}}
            >
              {slot ? (
                <span
                  className="text-[10px] text-center leading-tight px-0.5 truncate max-w-[36px]"
                  style={{ color: slot.color }}
                >
                  {slot.label.slice(0, 4)}
                </span>
              ) : (
                <span className="text-white/20 text-[10px]">{i + 1}</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-[9px] text-white/30 mt-1">Backpack · right-click to remove</p>
    </div>
  )
}
