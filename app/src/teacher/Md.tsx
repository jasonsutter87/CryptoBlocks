/**
 * Shared markdown renderer for classroom content. Lazy-loads react-markdown
 * on first use so the classroom page doesn't ship it up front.
 *
 * Safety: react-markdown v9+ blocks dangerous URL schemes by default and we
 * do not pass rehype-raw — so arbitrary HTML in user-submitted content is
 * inert. Do not add rehype-raw without also adding a sanitizer.
 */

import { lazy, Suspense } from 'react'

const Markdown = lazy(() => import('react-markdown'))

export function Md({ children }: { children: string }) {
  return (
    <Suspense fallback={<span className="text-sm text-subtext">{children}</span>}>
      <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm [&_p]:text-subtext [&_a]:text-accent [&_code]:text-warn [&_code]:bg-surface-0 [&_code]:px-1 [&_code]:rounded [&_ul]:text-sm [&_ol]:text-sm [&_li]:text-subtext [&_blockquote]:border-surface-1 [&_blockquote]:text-overlay [&_hr]:border-surface-0">
        <Markdown>{children}</Markdown>
      </div>
    </Suspense>
  )
}
