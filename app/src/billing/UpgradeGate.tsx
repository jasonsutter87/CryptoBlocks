/**
 * UpgradeGate — wraps premium features. Shows an upgrade CTA when
 * the user isn't Pro, renders children normally when they are.
 */

import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { useIsPro, openCheckout } from './useIsPro'

interface UpgradeGateProps {
  feature: string
  children: React.ReactNode
}

export default function UpgradeGate({ feature, children }: UpgradeGateProps) {
  const { isPro } = useIsPro()
  const { getToken } = useAuth()

  if (isPro) return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center min-h-[300px]">
      <span className="text-5xl">⭐</span>
      <h2 className="text-xl font-bold text-[#cdd6f4]">
        {feature} is a Pro feature
      </h2>
      <p className="text-sm text-[#6c7086] max-w-md">
        Upgrade to CryptoBlocks Pro for $4.99/month to unlock {feature}, plus all future premium features.
      </p>

      <SignedIn>
        <button
          onClick={() => openCheckout(getToken)}
          className="px-6 py-3 bg-gradient-to-r from-[#f9e2af] to-[#fab387] text-[#1e1e2e] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          Upgrade to Pro — $4.99/mo
        </button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-[#cba6f7] text-[#1e1e2e] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            Sign in to upgrade
          </button>
        </SignInButton>
      </SignedOut>

      <p className="text-[10px] text-[#6c7086]">
        Free features: all blocks, visual editor, examples, challenges, collab, daily challenge
      </p>
    </div>
  )
}

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-[#f9e2af] to-[#fab387] text-[#1e1e2e] rounded text-[10px] font-bold uppercase tracking-wider">
      Pro
    </span>
  )
}
