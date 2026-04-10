import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import type { Language } from '../types/block'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

interface CodeViewProps {
  code: string
  language: Language
  onLanguageChange: (lang: Language) => void
  editable?: boolean
  onCodeChange?: (code: string) => void
}

/** Simple <pre> fallback when Monaco can't load (Brave Shields, etc.) */
function PlainCodeView({ code, language, editable, onCodeChange }: { code: string; language: string; editable?: boolean; onCodeChange?: (code: string) => void }) {
  if (editable) {
    return (
      <div className="h-full bg-[#1e1e2e] p-3">
        <textarea
          value={code}
          onChange={(e) => onCodeChange?.(e.target.value)}
          className="w-full h-full bg-transparent text-[13px] leading-relaxed text-[#cdd6f4] font-mono resize-none outline-none border-none"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    )
  }
  return (
    <div className="h-full overflow-auto bg-[#1e1e2e] p-3">
      <pre className="text-[13px] leading-relaxed text-[#cdd6f4] font-mono whitespace-pre-wrap break-words">
        <code data-language={language}>{code || '// No code generated yet'}</code>
      </pre>
    </div>
  )
}

export default function CodeView({ code, language, onLanguageChange, editable, onCodeChange }: CodeViewProps) {
  const [monacoFailed, setMonacoFailed] = useState(false)

  const monacoLang = language === 'python' ? 'python' : language === 'html' ? 'html' : 'javascript'

  const handleMonacoError = useCallback(() => {
    setMonacoFailed(true)
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e]">
      {/* Language toggle — hidden in editable mode (Code Lab provides its own header) */}
      {!editable && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-[#313244]">
          <span className="text-xs text-[#6c7086] uppercase tracking-wide font-semibold mr-2">
            Peek
          </span>
          <button
            onClick={() => onLanguageChange('javascript')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'javascript'
                ? 'bg-[#f9e2af] text-[#1e1e2e]'
                : 'text-[#cdd6f4] hover:bg-[#313244]'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => onLanguageChange('python')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'python'
                ? 'bg-[#89b4fa] text-[#1e1e2e]'
                : 'text-[#cdd6f4] hover:bg-[#313244]'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => onLanguageChange('html')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'html'
                ? 'bg-[#f38ba8] text-[#1e1e2e]'
                : 'text-[#cdd6f4] hover:bg-[#313244]'
            }`}
          >
            HTML
          </button>
        </div>
      )}

      {/* Code editor */}
      <div className="flex-1 min-h-0">
        {monacoFailed ? (
          <PlainCodeView code={code} language={monacoLang} editable={editable} onCodeChange={onCodeChange} />
        ) : (
          <Suspense fallback={<PlainCodeView code={code} language={monacoLang} editable={editable} onCodeChange={onCodeChange} />}>
            <MonacoEditorWrapper
              code={code}
              language={monacoLang}
              onError={handleMonacoError}
              editable={editable}
              onCodeChange={onCodeChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

/** Wrapper that catches Monaco load failures and reports them */
function MonacoEditorWrapper({
  code,
  language,
  onError,
  editable,
  onCodeChange,
}: {
  code: string
  language: string
  onError: () => void
  editable?: boolean
  onCodeChange?: (code: string) => void
}) {
  const [timedOut, setTimedOut] = useState(false)
  const mountedRef = useRef(false)

  // If Monaco hasn't mounted within 4 seconds, fall back
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) {
        setTimedOut(true)
        onError()
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [onError])

  if (timedOut) {
    return <PlainCodeView code={code} language={language} editable={editable} onCodeChange={onCodeChange} />
  }

  return (
    <MonacoEditor
      language={language}
      value={code}
      theme="vs-dark"
      loading={<PlainCodeView code={code} language={language} editable={editable} onCodeChange={onCodeChange} />}
      beforeMount={(monaco) => {
        if (editable) {
          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2015,
            allowNonTsExtensions: true,
            allowJs: true,
          })
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          })
        }
      }}
      onMount={() => { mountedRef.current = true }}
      onChange={editable ? (value) => onCodeChange?.(value || '') : undefined}
      options={{
        readOnly: !editable,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 12 },
        renderLineHighlight: editable ? 'line' : 'none',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'hidden',
        },
        quickSuggestions: editable ? { other: true, strings: true, comments: false } : false,
        suggestOnTriggerCharacters: !!editable,
        tabCompletion: 'off',
        acceptSuggestionOnEnter: 'on',
        parameterHints: { enabled: !!editable },
        suggest: {
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showKeywords: true,
          showSnippets: true,
        },
      }}
    />
  )
}
