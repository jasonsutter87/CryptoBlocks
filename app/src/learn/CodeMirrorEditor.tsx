import { useRef, useEffect } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { autocompletion, closeBrackets, type CompletionContext } from '@codemirror/autocomplete'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'

// Custom completions matching the Learn curriculum
const jsCompletions = [
  // Ch1: Output
  { label: 'console.log', type: 'function', detail: 'Print to console', apply: 'console.log()' },
  { label: 'console.error', type: 'function', detail: 'Print error', apply: 'console.error()' },
  { label: 'console.warn', type: 'function', detail: 'Print warning', apply: 'console.warn()' },
  // Ch2: Values & Types
  { label: 'true', type: 'keyword' },
  { label: 'false', type: 'keyword' },
  { label: 'null', type: 'keyword' },
  { label: 'undefined', type: 'keyword' },
  { label: 'typeof', type: 'keyword', detail: 'Check type of value' },
  // Ch3: Variables
  { label: 'var', type: 'keyword' },
  { label: 'let', type: 'keyword' },
  { label: 'const', type: 'keyword' },
  // Ch4: Math
  { label: 'Math.floor', type: 'function', detail: 'Round down', apply: 'Math.floor()' },
  { label: 'Math.round', type: 'function', detail: 'Round nearest', apply: 'Math.round()' },
  { label: 'Math.random', type: 'function', detail: 'Random 0-1', apply: 'Math.random()' },
  { label: 'Math.abs', type: 'function', detail: 'Absolute value', apply: 'Math.abs()' },
  { label: 'Math.pow', type: 'function', detail: 'Power', apply: 'Math.pow(, )' },
  { label: 'Math.max', type: 'function', detail: 'Largest value', apply: 'Math.max(, )' },
  { label: 'Math.min', type: 'function', detail: 'Smallest value', apply: 'Math.min(, )' },
  // Ch5: Text
  { label: '.toUpperCase()', type: 'method', detail: 'Uppercase string' },
  { label: '.toLowerCase()', type: 'method', detail: 'Lowercase string' },
  { label: '.includes()', type: 'method', detail: 'Check if contains' },
  { label: '.split()', type: 'method', detail: 'Split into array' },
  { label: '.trim()', type: 'method', detail: 'Remove whitespace' },
  { label: '.replace()', type: 'method', detail: 'Replace text' },
  { label: '.length', type: 'property', detail: 'String/array length' },
  // Ch6: Logic
  { label: 'if', type: 'keyword' },
  { label: 'else', type: 'keyword' },
  { label: 'else if', type: 'keyword' },
  // Ch7: Lists
  { label: '.push()', type: 'method', detail: 'Add to end' },
  { label: '.pop()', type: 'method', detail: 'Remove from end' },
  { label: '.shift()', type: 'method', detail: 'Remove from start' },
  { label: '.indexOf()', type: 'method', detail: 'Find index of' },
  { label: '.join()', type: 'method', detail: 'Join array to string' },
  { label: '.reverse()', type: 'method', detail: 'Reverse array' },
  { label: '.slice()', type: 'method', detail: 'Get portion' },
  // Ch8: Objects
  { label: 'Object.keys()', type: 'function', detail: 'Get all keys', apply: 'Object.keys()' },
  { label: 'JSON.stringify()', type: 'function', detail: 'Convert to JSON', apply: 'JSON.stringify()' },
  { label: 'JSON.parse()', type: 'function', detail: 'Parse JSON', apply: 'JSON.parse()' },
  // Ch9: Loops
  { label: 'for', type: 'keyword' },
  { label: 'while', type: 'keyword' },
  { label: 'break', type: 'keyword' },
  { label: 'continue', type: 'keyword' },
  { label: '.forEach()', type: 'method', detail: 'Loop each item' },
  { label: '.map()', type: 'method', detail: 'Transform each item' },
  { label: '.filter()', type: 'method', detail: 'Filter items' },
  // Ch10: Functions
  { label: 'function', type: 'keyword' },
  { label: 'return', type: 'keyword' },
  // Common globals
  { label: 'parseInt', type: 'function', detail: 'String to integer', apply: 'parseInt()' },
  { label: 'parseFloat', type: 'function', detail: 'String to decimal', apply: 'parseFloat()' },
  { label: 'String', type: 'function', detail: 'Convert to string', apply: 'String()' },
  { label: 'Number', type: 'function', detail: 'Convert to number', apply: 'Number()' },
  { label: 'prompt', type: 'function', detail: 'Ask for input', apply: 'prompt()' },
  { label: 'alert', type: 'function', detail: 'Show popup', apply: 'alert()' },
]

function jsAutocomplete(context: CompletionContext) {
  const word = context.matchBefore(/[\w.]*/)
  if (!word || (word.from === word.to && !context.explicit)) return null
  return {
    from: word.from,
    options: jsCompletions,
    validFor: /[\w.]*$/,
  }
}

interface CodeMirrorEditorProps {
  code: string
  onChange: (value: string) => void
  language?: 'javascript' | 'css' | 'scss'
  height?: string
}

export default function CodeMirrorEditor({ code, onChange, language = 'javascript', height = '150px' }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const lang = language === 'javascript' ? javascript() : css()

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({
          override: language === 'javascript' ? [jsAutocomplete] : undefined,
        }),
        lang,
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height, fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: 'monospace', padding: '8px 0' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, height])

  return <div ref={containerRef} className="rounded-lg overflow-hidden border border-[#313244]" />
}
