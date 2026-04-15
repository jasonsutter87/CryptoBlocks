/**
 * Avatar — user image when available, else colored initial circle.
 * Kept as static Tailwind class sets per size so the purger sees them.
 *
 * Variants:
 *   primary — filled blue, dark text. Used for member lists / thread authors.
 *   muted   — dark fill, blue text. Used for reply + chat authors nested in cards.
 */

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'muted'
  /** Extra classes (margin/flex alignment applied by the parent). */
  className?: string
}

const SIZES = {
  sm: { box: 'w-5 h-5', text: 'text-[9px]' },
  md: { box: 'w-6 h-6', text: 'text-[10px]' },
  lg: { box: 'w-10 h-10', text: 'text-sm' },
} as const

const VARIANTS = {
  primary: 'bg-[#89b4fa] text-[#1e1e2e]',
  muted: 'bg-[#313244] text-[#89b4fa]',
} as const

export function Avatar({ name, src, size = 'md', variant = 'primary', className = '' }: AvatarProps) {
  const { box, text } = SIZES[size]
  if (src) return <img src={src} alt="" className={`${box} rounded-full ${className}`} />
  return (
    <div className={`${box} rounded-full flex items-center justify-center ${text} font-bold ${VARIANTS[variant]} ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
