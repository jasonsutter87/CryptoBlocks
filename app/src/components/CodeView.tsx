import Editor from '@monaco-editor/react'
import type { Language } from '../types/block'

interface CodeViewProps {
  code: string
  language: Language
  onLanguageChange: (lang: Language) => void
}

export default function CodeView({ code, language, onLanguageChange }: CodeViewProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e2e]">
      {/* Language toggle */}
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
      </div>

      {/* Code editor */}
      <div className="flex-1 min-h-0">
        <Editor
          language={language === 'javascript' ? 'javascript' : 'python'}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12 },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
            },
          }}
        />
      </div>
    </div>
  )
}
