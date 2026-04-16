/**
 * Data-driven dropdown menu. Each menu in the Toolbar is defined as an
 * array of MenuItem entries — adding or reordering an item is one line.
 */

import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export type MenuItem =
  | { kind: 'button'; icon?: IconName; iconCls?: string; label: string; onClick: () => void; badge?: ReactNode; emoji?: string }
  | { kind: 'link'; icon?: IconName; iconCls?: string; label: string; href: string; badge?: ReactNode; emoji?: string; onClick?: () => void }
  | { kind: 'divider' }

interface DropdownMenuProps {
  items: MenuItem[]
  className?: string
}

const ITEM_CLS = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[#cdd6f4] hover:bg-[#45475a] transition-colors text-left'
const DROPDOWN_CLS = 'absolute right-0 mt-1 w-56 bg-[#313244] border border-[#45475a] rounded-lg shadow-xl z-50 py-1'

export default function DropdownMenu({ items, className }: DropdownMenuProps) {
  return (
    <div className={className ?? DROPDOWN_CLS}>
      {items.map((item, i) => {
        if (item.kind === 'divider') return <div key={i} className="h-px bg-[#45475a] my-1" />

        const iconEl = item.emoji
          ? <span className="text-base leading-none">{item.emoji}</span>
          : item.icon
            ? <Icon name={item.icon} className={item.iconCls ?? 'w-4 h-4'} />
            : null

        if (item.kind === 'link') {
          return (
            <a key={i} href={item.href} onClick={item.onClick} className={ITEM_CLS}>
              {iconEl}
              {item.label}
              {item.badge && <span className="ml-auto">{item.badge}</span>}
            </a>
          )
        }

        return (
          <button key={i} onClick={item.onClick} className={ITEM_CLS}>
            {iconEl}
            {item.label}
            {item.badge && <span className="ml-auto">{item.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
