import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { BlockDefinition, BlockCategory, BlockInput, BlockOutput } from '../types/block'
import { CATEGORY_COLORS } from '../types/block'

interface CreateBlockModalProps {
  onBuild: (block: BlockDefinition) => void
  onClose: () => void
  editBlock?: BlockDefinition | null
}

const PRESET_COLORS = [
  '#4C97AF', '#5B80A5', '#8B5CF6', '#D97706', '#059669',
  '#DC2626', '#EA580C', '#DB2777', '#9333EA', '#0891B2',
  '#4F46E5', '#7C3AED', '#65A30D', '#F59E0B', '#EF4444',
  '#06B6D4', '#10B981', '#F97316',
]

const INPUT_TYPES: BlockInput['type'][] = ['string', 'number', 'boolean', 'any']

const CATEGORIES: BlockCategory[] = [
  'My Blocks', 'Basics', 'Math', 'Text', 'Lists', 'Logic',
  'Web', 'Games', 'Sound', 'Art', 'Data', 'Crypto', 'AI', 'Hardware',
]

const JS_TEMPLATE = `function myBlock(input1) {
  // Your JavaScript code here
  return input1;
}`

const PY_TEMPLATE = `def my_block(input1):
    # Your Python code here
    return input1`

export default function CreateBlockModal({ onBuild, onClose, editBlock }: CreateBlockModalProps) {
  const [name, setName] = useState(editBlock?.name ?? '')
  const [description, setDescription] = useState(editBlock?.description ?? '')
  const [category, setCategory] = useState<BlockCategory>(editBlock?.category ?? 'My Blocks')
  const [color, setColor] = useState(editBlock?.color ?? CATEGORY_COLORS['My Blocks'])
  const [inputs, setInputs] = useState<BlockInput[]>(editBlock?.inputs ?? [])
  const [outputs, setOutputs] = useState<BlockOutput[]>(editBlock?.outputs ?? [])
  const [jsCode, setJsCode] = useState(editBlock?.implementations.javascript ?? JS_TEMPLATE)
  const [pyCode, setPyCode] = useState(editBlock?.implementations.python ?? PY_TEMPLATE)
  const [shape, setShape] = useState<'value' | 'statement'>(editBlock?.shape ?? 'statement')
  const [error, setError] = useState('')
  const jsFileRef = useRef<HTMLInputElement>(null)
  const pyFileRef = useRef<HTMLInputElement>(null)

  const isEditing = !!editBlock
  const [inputsManuallyEdited, setInputsManuallyEdited] = useState(isEditing)
  const [outputsManuallyEdited, setOutputsManuallyEdited] = useState(isEditing)

  // Auto-detect function params and return from JS code
  useEffect(() => {
    if (inputsManuallyEdited && outputsManuallyEdited) return

    const code = jsCode || pyCode
    if (!code.trim()) return

    // Parse params from JS: function name(a, b, c) or from Python: def name(a, b, c)
    const jsMatch = code.match(/function\s+\w+\s*\(([^)]*)\)/)
    const pyMatch = code.match(/def\s+\w+\s*\(([^)]*)\)/)
    const paramStr = jsMatch?.[1] || pyMatch?.[1] || ''
    const params = paramStr.split(',').map(p => p.trim()).filter(Boolean)

    if (!inputsManuallyEdited) {
      const newInputs: BlockInput[] = params.map(p => ({
        name: p,
        type: 'any' as const,
        description: p,
      }))
      setInputs(newInputs)
    }

    if (!outputsManuallyEdited) {
      // Check if function has a return statement (with a value)
      const hasReturn = /return\s+[^;}\s]/.test(code)
      if (hasReturn) {
        setOutputs([{ name: 'result', type: 'any' }])
      } else {
        setOutputs([])
      }
    }
  }, [jsCode, pyCode, inputsManuallyEdited, outputsManuallyEdited])

  // Also auto-detect function name if name field is empty
  useEffect(() => {
    if (name || isEditing) return
    const code = jsCode || pyCode
    const jsMatch = code.match(/function\s+(\w+)/)
    const pyMatch = code.match(/def\s+(\w+)/)
    const detected = jsMatch?.[1] || pyMatch?.[1]
    if (detected && detected !== 'myBlock' && detected !== 'my_block') {
      setName(detected)
    }
  }, [jsCode, pyCode, name, isEditing])

  function handleFileUpload(file: File, target: 'js' | 'py') {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (target === 'js') setJsCode(content)
      else setPyCode(content)
    }
    reader.readAsText(file)
  }

  function addInput() {
    setInputsManuallyEdited(true)
    setInputs([...inputs, { name: '', type: 'any', description: '' }])
  }

  function removeInput(i: number) {
    setInputsManuallyEdited(true)
    setInputs(inputs.filter((_, idx) => idx !== i))
  }

  function updateInput(i: number, field: keyof BlockInput, value: string) {
    setInputsManuallyEdited(true)
    setInputs(inputs.map((inp, idx) =>
      idx === i ? { ...inp, [field]: value } : inp
    ))
  }

  function addOutput() {
    setOutputsManuallyEdited(true)
    setOutputs([...outputs, { name: '', type: 'any' }])
  }

  function removeOutput(i: number) {
    setOutputsManuallyEdited(true)
    setOutputs(outputs.filter((_, idx) => idx !== i))
  }

  function updateOutput(i: number, field: keyof BlockOutput, value: string) {
    setOutputsManuallyEdited(true)
    setOutputs(outputs.map((out, idx) =>
      idx === i ? { ...out, [field]: value } : out
    ))
  }

  function handleBuild() {
    setError('')

    // Validate
    const blockName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    if (!blockName) {
      setError('Block name is required')
      return
    }
    if (!jsCode.trim() && !pyCode.trim()) {
      setError('At least one implementation (JavaScript or Python) is required')
      return
    }

    // Validate implementations must define a function (same check as file import)
    const jsTrimmed = jsCode.trim()
    const pyTrimmed = pyCode.trim()
    if (jsTrimmed && !/^\s*(async\s+)?function\s+\w+/.test(jsTrimmed)) {
      setError('JavaScript implementation must start with a function declaration')
      return
    }
    if (pyTrimmed && !/^\s*(async\s+)?def\s+\w+/.test(pyTrimmed)) {
      setError('Python implementation must start with a def declaration')
      return
    }
    if (jsTrimmed && jsTrimmed.length > 10_000) {
      setError('JavaScript implementation is too large (max 10,000 characters)')
      return
    }
    if (pyTrimmed && pyTrimmed.length > 10_000) {
      setError('Python implementation is too large (max 10,000 characters)')
      return
    }

    // Validate inputs have names
    for (const inp of inputs) {
      if (!inp.name.trim()) {
        setError('All inputs must have a name')
        return
      }
    }
    for (const out of outputs) {
      if (!out.name.trim()) {
        setError('All outputs must have a name')
        return
      }
    }

    const block: BlockDefinition = {
      name: blockName,
      author: 'User',
      version: '1.0.0',
      description: description || blockName,
      category,
      inputs: inputs.map((inp) => ({
        ...inp,
        name: inp.name.trim().toLowerCase().replace(/\s+/g, '_'),
        description: inp.description || inp.name,
      })),
      outputs: outputs.map((out) => ({
        ...out,
        name: out.name.trim().toLowerCase().replace(/\s+/g, '_'),
      })),
      implementations: {
        javascript: jsCode.trim() || `function ${blockName}() { /* not implemented */ }`,
        python: pyCode.trim() || `def ${blockName}():\n    pass  # not implemented`,
      },
      tests: [],
      color,
      shape,
    }

    onBuild(block)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl w-[900px] max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244]">
          <h2 className="text-lg font-bold text-[#cdd6f4]">
            {isEditing ? 'Edit Block' : 'Create Block'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Name + Description row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#a6adc8] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my_block"
                disabled={isEditing}
                className="w-full px-3 py-2 text-sm bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#a6adc8] mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this block do?"
                className="w-full px-3 py-2 text-sm bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
              />
            </div>
          </div>

          {/* Category + Shape + Color row */}
          <div className="flex gap-4">
            <div className="w-40">
              <label className="block text-xs font-semibold text-[#a6adc8] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlockCategory)}
                className="w-full px-3 py-2 text-sm bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] focus:outline-none focus:border-[#89b4fa]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#a6adc8] mb-1">Shape</label>
              <div className="flex rounded-lg overflow-hidden border border-[#313244]">
                <button
                  onClick={() => setShape('statement')}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    shape === 'statement'
                      ? 'bg-[#a6e3a1] text-[#1e1e2e]'
                      : 'bg-[#181825] text-[#6c7086] hover:text-[#cdd6f4]'
                  }`}
                  title="Stackable puzzle piece - chains with other blocks"
                >
                  {/* Puzzle piece icon */}
                  <svg className="w-5 h-4" viewBox="0 0 28 20" fill="currentColor">
                    <path d="M2 2h8v3a3 3 0 006 0V2h8c1 0 2 1 2 2v14c0 1-1 2-2 2H2c-1 0-2-1-2-2V4c0-1 1-2 2-2z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setShape('value')}
                  className={`px-3 py-2 text-xs font-medium transition-colors border-l border-[#313244] ${
                    shape === 'value'
                      ? 'bg-[#89b4fa] text-[#1e1e2e]'
                      : 'bg-[#181825] text-[#6c7086] hover:text-[#cdd6f4]'
                  }`}
                  title="Oval value - plugs into another block's input"
                >
                  {/* Oval icon */}
                  <svg className="w-5 h-4" viewBox="0 0 28 20" fill="currentColor">
                    <ellipse cx="14" cy="10" rx="14" ry="10"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#a6adc8] mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-md border-2 transition-all ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#a6adc8]">Inputs</label>
                {!inputsManuallyEdited && (
                  <span className="text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded">auto-detected from code</span>
                )}
              </div>
              <button
                onClick={addInput}
                className="text-xs text-[#89b4fa] hover:text-[#b4d0fb] transition-colors"
              >
                + Add Input
              </button>
            </div>
            {inputs.length === 0 && (
              <p className="text-xs text-[#6c7086]">No inputs. Click "+ Add Input" to add one.</p>
            )}
            <div className="space-y-2">
              {inputs.map((inp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inp.name}
                    onChange={(e) => updateInput(i, 'name', e.target.value)}
                    placeholder="input_name"
                    className="flex-1 px-2 py-1.5 text-sm bg-[#181825] border border-[#313244] rounded text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
                  />
                  <select
                    value={inp.type}
                    onChange={(e) => updateInput(i, 'type', e.target.value)}
                    className="px-2 py-1.5 text-sm bg-[#181825] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none"
                  >
                    {INPUT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeInput(i)}
                    className="text-[#f38ba8] hover:text-[#f38ba8]/80 text-sm px-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#a6adc8]">Outputs</label>
                {!outputsManuallyEdited && (
                  <span className="text-[10px] text-[#6c7086] bg-[#313244] px-1.5 py-0.5 rounded">auto-detected from code</span>
                )}
              </div>
              <button
                onClick={addOutput}
                className="text-xs text-[#89b4fa] hover:text-[#b4d0fb] transition-colors"
              >
                + Add Output
              </button>
            </div>
            {outputs.length === 0 && (
              <p className="text-xs text-[#6c7086]">No outputs = statement block. Add an output to make it a value block.</p>
            )}
            <div className="space-y-2">
              {outputs.map((out, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={out.name}
                    onChange={(e) => updateOutput(i, 'name', e.target.value)}
                    placeholder="output_name"
                    className="flex-1 px-2 py-1.5 text-sm bg-[#181825] border border-[#313244] rounded text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa]"
                  />
                  <select
                    value={out.type}
                    onChange={(e) => updateOutput(i, 'type', e.target.value)}
                    className="px-2 py-1.5 text-sm bg-[#181825] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none"
                  >
                    {INPUT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeOutput(i)}
                    className="text-[#f38ba8] hover:text-[#f38ba8]/80 text-sm px-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Code editors side by side */}
          <div>
            <label className="block text-xs font-semibold text-[#a6adc8] mb-2">Implementations</label>
            <div className="flex gap-3">
              {/* JS Editor */}
              <div className="flex-1 border border-[#313244] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-[#313244]">
                  <span className="text-xs font-semibold text-[#f9e2af]">JavaScript</span>
                  <button
                    onClick={() => jsFileRef.current?.click()}
                    className="text-[10px] text-[#6c7086] hover:text-[#cdd6f4] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload .js
                  </button>
                  <input
                    ref={jsFileRef}
                    type="file"
                    accept=".js,.mjs,.jsx,.ts,.tsx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'js')
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="h-48">
                  <Editor
                    language="javascript"
                    value={jsCode}
                    onChange={(v) => setJsCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 8 },
                      renderLineHighlight: 'none',
                      overviewRulerLanes: 0,
                      scrollbar: { vertical: 'auto', horizontal: 'hidden' },
                    }}
                  />
                </div>
              </div>

              {/* Python Editor */}
              <div className="flex-1 border border-[#313244] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-[#313244]">
                  <span className="text-xs font-semibold text-[#89b4fa]">Python</span>
                  <button
                    onClick={() => pyFileRef.current?.click()}
                    className="text-[10px] text-[#6c7086] hover:text-[#cdd6f4] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload .py
                  </button>
                  <input
                    ref={pyFileRef}
                    type="file"
                    accept=".py"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'py')
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="h-48">
                  <Editor
                    language="python"
                    value={pyCode}
                    onChange={(v) => setPyCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 8 },
                      renderLineHighlight: 'none',
                      overviewRulerLanes: 0,
                      scrollbar: { vertical: 'auto', horizontal: 'hidden' },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-[#f38ba8] bg-[#f38ba8]/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#313244]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#cdd6f4] hover:bg-[#313244] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBuild}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#a6e3a1] text-[#1e1e2e] hover:bg-[#a6e3a1]/80 transition-colors"
          >
            {isEditing ? 'Save Block' : 'Build Block'}
          </button>
        </div>
      </div>
    </div>
  )
}
