import type { Language } from '../types/block'
import { generateSafetyPreamble } from '../safety'

export interface ExecutionResult {
  output: string[]
  error: string | null
  returnValue: unknown
  duration: number
  canvasDataUrl?: string
  htmlOutput?: string
}

export interface ExecutionHandle {
  promise: Promise<ExecutionResult>
  abort: () => void
}

const MAX_OUTPUT_LINES = 1000
const MAX_OUTPUT_BYTES = 1_048_576 // 1MB
const EXECUTION_TIMEOUT = 30000
const IFRAME_PROBE_TIMEOUT = 2000

export function executeCode(
  code: string,
  language: Language,
  onOutput?: (line: string) => void,
  onTrace?: (blockId: string) => void,
): ExecutionHandle {
  // Empty code → instant empty result (no iframe/Pyodide needed)
  if (!code.trim()) {
    return {
      promise: Promise.resolve({
        output: [],
        error: null,
        returnValue: undefined,
        duration: 0,
      }),
      abort: () => {},
    }
  }

  if (language === 'javascript') {
    return executeJavaScript(code, onOutput, onTrace)
  } else {
    return executePython(code, onOutput)
  }
}

/**
 * Helper: collect output lines with cap enforcement (CB-R2-007).
 */
function createOutputCollector(onOutput?: (line: string) => void) {
  const output: string[] = []
  let bytes = 0
  let capped = false

  return {
    output,
    push(line: string) {
      if (capped) return
      bytes += line.length
      if (output.length >= MAX_OUTPUT_LINES || bytes >= MAX_OUTPUT_BYTES) {
        capped = true
        const warning = '[Output truncated — limit reached]'
        output.push(warning)
        onOutput?.(warning)
      } else {
        output.push(line)
        onOutput?.(line)
      }
    },
  }
}

/**
 * Format a value for console output (same as iframe version).
 */
function formatArg(a: unknown): string {
  return typeof a === 'object' ? JSON.stringify(a) : String(a)
}

// ---------------------------------------------------------------------------
// Strategy 1: Sandboxed iframe (most secure, but blocked by some browsers)
// ---------------------------------------------------------------------------

function tryIframeExecution(
  code: string,
  collector: ReturnType<typeof createOutputCollector>,
  start: number,
  onTrace?: (blockId: string) => void,
): Promise<{ result: ExecutionResult; cleanup: () => void } | null> {
  return new Promise((resolve) => {
    let iframe: HTMLIFrameElement | null = null

    const cleanup = () => {
      if (iframe) {
        try { document.body.removeChild(iframe) } catch { /* already removed */ }
        iframe = null
      }
    }

    // If the iframe doesn't send any message within IFRAME_PROBE_TIMEOUT,
    // give up and let the caller fall back to direct execution.
    const probeTimer = setTimeout(() => {
      window.removeEventListener('message', handler)
      cleanup()
      resolve(null) // signal: iframe didn't work
    }, IFRAME_PROBE_TIMEOUT)

    let mainTimer: ReturnType<typeof setTimeout> | null = null
    let settled = false
    let canvasDataUrl: string | undefined
    let htmlOutput: string | undefined

    const finish = (error: string | null, returnValue: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(probeTimer)
      if (mainTimer) clearTimeout(mainTimer)
      window.removeEventListener('message', handler)
      cleanup()
      resolve({
        result: {
          output: collector.output,
          error,
          returnValue,
          duration: performance.now() - start,
          canvasDataUrl,
          htmlOutput,
        },
        cleanup: () => {},
      })
    }

    const handler = (event: MessageEvent) => {
      // Validate: must come from our iframe + carry our marker
      if (event.source !== iframe?.contentWindow) return
      const msg = event.data
      if (!msg || typeof msg !== 'object' || msg.__cryptoblocks !== true) return

      // First message received → iframe is alive. Cancel probe, start real timeout.
      if (!mainTimer) {
        clearTimeout(probeTimer)
        mainTimer = setTimeout(() => {
          finish('Execution timed out (30 seconds)', null)
        }, EXECUTION_TIMEOUT)
      }

      if (msg.type === 'trace') {
        onTrace?.(String(msg.data))
      } else if (msg.type === 'log') {
        collector.push(String(msg.data))
      } else if (msg.type === 'canvas') {
        canvasDataUrl = String(msg.data)
      } else if (msg.type === 'html') {
        htmlOutput = String(msg.data)
      } else if (msg.type === 'error') {
        finish(String(msg.data), null)
      } else if (msg.type === 'done') {
        finish(null, msg.data)
      }
    }
    window.addEventListener('message', handler)

    const encoded = btoa(unescape(encodeURIComponent(code)))
    const safetyPreamble = generateSafetyPreamble()

    const html = `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src http://localhost:* http://127.0.0.1:* https: wss:; style-src 'unsafe-inline'; img-src data:; frame-src 'none'; worker-src 'none'; object-src 'none';">
<script>
var __sendMsg = function(type, data) {
  parent.postMessage({ __cryptoblocks: true, type: type, data: data }, '*');
};
var __formatArg = function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); };
Object.defineProperty(console, 'log', { value: function() { __sendMsg('log', Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'warn', { value: function() { __sendMsg('log', '[warn] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'error', { value: function() { __sendMsg('log', '[error] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'info', { value: function() { __sendMsg('log', '[info] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'debug', { value: function() {}, configurable: false, writable: false });
${safetyPreamble}
(async function() {
  try {
    var __code = decodeURIComponent(escape(atob("${encoded}")));
    var __fn = new Function("return (async function() {\\n" + __code + "\\n})()");
    var __result = await __fn();
    var __cvs = document.getElementById('cb-canvas');
    if (__cvs && __cvs.width > 0 && __cvs.style.display !== 'none') {
      try { parent.postMessage({ __cryptoblocks: true, type: 'canvas', data: __cvs.toDataURL('image/png') }, '*'); } catch(e) {}
    }
    var __page = document.getElementById('cb-page');
    if (__page && __page.children.length > 0) {
      parent.postMessage({ __cryptoblocks: true, type: 'html', data: __page.innerHTML }, '*');
    }
    parent.postMessage({ __cryptoblocks: true, type: 'done', data: __result }, '*');
  } catch(e) {
    parent.postMessage({ __cryptoblocks: true, type: 'error', data: e.message }, '*');
  }
})()
<\/script></head><body><div id="cb-page" style="display:none"></div><canvas id="cb-canvas" width="400" height="400" style="display:none"></canvas></body></html>`

    iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.sandbox.add('allow-scripts')
    iframe.sandbox.add('allow-modals')
    iframe.srcdoc = html
    document.body.appendChild(iframe)
  })
}

// ---------------------------------------------------------------------------
// Strategy 2: Direct Function() eval with intercepted console (fallback)
// ---------------------------------------------------------------------------

async function directExecution(
  code: string,
  collector: ReturnType<typeof createOutputCollector>,
  start: number,
  onTrace?: (blockId: string) => void,
): Promise<ExecutionResult> {
  try {
    // Build a function that receives a fake console object and __sendMsg
    const fn = new Function(
      '__console',
      '__sendMsg',
      `return (async function() {\n`
        + `var console = __console;\n`
        + code
        + `\n})()`
    )

    const fakeSendMsg = onTrace
      ? (type: string, data: string) => { if (type === 'trace') onTrace(data) }
      : () => {}

    const fakeConsole = {
      log: (...args: unknown[]) => collector.push(args.map(formatArg).join(' ')),
      warn: (...args: unknown[]) => collector.push('[warn] ' + args.map(formatArg).join(' ')),
      error: (...args: unknown[]) => collector.push('[error] ' + args.map(formatArg).join(' ')),
      info: (...args: unknown[]) => collector.push('[info] ' + args.map(formatArg).join(' ')),
      debug: () => {},
    }

    // Create cb-canvas and cb-page if they don't exist (fallback mode)
    let createdCanvas: HTMLCanvasElement | null = null
    if (!document.getElementById('cb-canvas')) {
      createdCanvas = document.createElement('canvas')
      createdCanvas.id = 'cb-canvas'
      createdCanvas.width = 400
      createdCanvas.height = 400
      createdCanvas.style.display = 'none'
      document.body.appendChild(createdCanvas)
    }
    let createdPage: HTMLDivElement | null = null
    if (!document.getElementById('cb-page')) {
      createdPage = document.createElement('div')
      createdPage.id = 'cb-page'
      createdPage.style.display = 'none'
      document.body.appendChild(createdPage)
    }

    const returnValue = await fn(fakeConsole, fakeSendMsg)

    // Capture canvas output
    let canvasDataUrl: string | undefined
    const canvas = document.getElementById('cb-canvas') as HTMLCanvasElement | null
    if (canvas && canvas.style.display !== 'none') {
      try { canvasDataUrl = canvas.toDataURL('image/png') } catch { /* tainted canvas */ }
    }
    if (createdCanvas) createdCanvas.remove()

    // Capture HTML output from cb-page
    let htmlOutput: string | undefined
    const page = document.getElementById('cb-page')
    if (page && page.children.length > 0) {
      htmlOutput = page.innerHTML
    }
    if (createdPage) createdPage.remove()

    return {
      output: collector.output,
      error: null,
      returnValue,
      canvasDataUrl,
      htmlOutput,
      duration: performance.now() - start,
    }
  } catch (e) {
    return {
      output: collector.output,
      error: e instanceof Error ? e.message : String(e),
      returnValue: null,
      duration: performance.now() - start,
    }
  }
}

// ---------------------------------------------------------------------------
// Main JS executor: iframe → fallback to direct
// ---------------------------------------------------------------------------

function executeJavaScript(
  code: string,
  onOutput?: (line: string) => void,
  onTrace?: (blockId: string) => void,
): ExecutionHandle {
  const collector = createOutputCollector(onOutput)
  const start = performance.now()
  let aborted = false

  // Code that uses fetch() or WebSocket needs direct execution — sandboxed
  // iframes send Origin: null which breaks CORS/WS on most servers
  const needsDirectExec = /\bfetch\s*\(/.test(code) || /\bWebSocket\s*\(/.test(code)

  const promise = (async (): Promise<ExecutionResult> => {
    if (needsDirectExec) {
      return directExecution(code, collector, start, onTrace)
    }

    // Try iframe first (sandboxed, most secure)
    const iframeResult = await tryIframeExecution(code, collector, start, onTrace)

    if (iframeResult) {
      return iframeResult.result
    }

    // Iframe was blocked (Brave Shields, etc.) — fall back to direct execution
    if (aborted) {
      return { output: collector.output, error: 'Execution stopped', returnValue: null, duration: performance.now() - start }
    }

    return directExecution(code, collector, start, onTrace)
  })()

  return {
    promise,
    abort: () => { aborted = true },
  }
}

// Cache Pyodide instance - load once, reuse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideLoading: Promise<any> | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInitialGlobals: Set<string> | null = null

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = (async () => {
    // Load Pyodide via script tag from CDN — dynamic import() of the npm
    // package produces a broken chunk, and import() of CDN URLs gets blocked.
    const PYODIDE_VERSION = '0.27.5'
    const cdnBase = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`
    await new Promise<void>((resolve, reject) => {
      if ((window as any).loadPyodide) { resolve(); return }
      const script = document.createElement('script')
      script.src = `${cdnBase}/pyodide.js`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'))
      document.head.appendChild(script)
    })
    pyodideInstance = await (window as any).loadPyodide({
      indexURL: cdnBase + '/',
    })

    // Capture initial globals for reset between runs (CB-R2-010)
    const globals = pyodideInstance.globals.toJs() as Map<string, unknown>
    pyodideInitialGlobals = new Set(globals.keys())

    pyodideLoading = null
    return pyodideInstance
  })()

  return pyodideLoading
}

/** Reset Pyodide user-defined globals between runs (CB-R2-010) */
function resetPyodideGlobals() {
  if (!pyodideInstance || !pyodideInitialGlobals) return
  const current = pyodideInstance.globals.toJs() as Map<string, unknown>
  for (const key of current.keys()) {
    if (!pyodideInitialGlobals.has(key)) {
      pyodideInstance.globals.delete(key)
    }
  }
}

/**
 * Python safety preamble that blocks js bridge access (CB-R2-001).
 * Prevents `from js import window, document, fetch, localStorage` etc.
 * Also blocks dangerous Python modules.
 *
 * NOTE: For true process-level isolation, migrate Pyodide to a Web Worker.
 * This preamble is defense-in-depth for the current main-thread architecture.
 */
const PYTHON_SAFETY_PREAMBLE = `
import sys as _cb_sys
import types as _cb_types
import builtins as _cb_bi

# Block js bridge — replaces real modules with empty stubs
for _cb_m in ['js', 'pyodide', 'pyodide.ffi', 'pyodide.http', 'pyodide.code']:
    _cb_sys.modules[_cb_m] = _cb_types.ModuleType(_cb_m)

# Blocklist: dangerous modules + introspection modules that could bypass the guard
# urllib.parse is whitelisted (safe string manipulation used by crypto blocks)
_cb_blocked = frozenset({
    'os', 'subprocess', 'socket', 'http', 'http.client', 'http.server',
    'urllib', 'urllib.request', 'ctypes', 'shutil', 'pathlib',
    'importlib', 'importlib.reload', 'importlib._bootstrap',
    'sys', 'builtins',
    'code', 'codeop', 'signal', 'gc', 'inspect',
    '_thread', 'threading', 'multiprocessing',
})
_cb_allowed = frozenset({'urllib.parse'})

# Class-based import guard — no __closure__ to extract (CB-R2-001 hardening)
# Uses __slots__ with name-mangled attribute to hide the real import reference
class _CbGuard:
    __slots__ = ('_CbGuard__f', '_CbGuard__b', '_CbGuard__a')
    def __init__(self, f, blocked, allowed):
        object.__setattr__(self, '_CbGuard__f', f)
        object.__setattr__(self, '_CbGuard__b', blocked)
        object.__setattr__(self, '_CbGuard__a', allowed)
    def __setattr__(self, *a):
        raise AttributeError('read-only')
    def __delattr__(self, *a):
        raise AttributeError('read-only')
    def __dir__(self):
        return ['__call__']
    def __call__(self, name, *args, **kwargs):
        if name in self.__a:
            return self.__f(name, *args, **kwargs)
        base = name.split('.')[0]
        if name in self.__b or base in self.__b:
            raise ImportError("Module '" + name + "' is not available in CryptoBlocks")
        if name.startswith('pyodide') or name.startswith('js'):
            raise ImportError("Module '" + name + "' is not available in CryptoBlocks")
        return self.__f(name, *args, **kwargs)

_cb_bi.__import__ = _CbGuard(_cb_bi.__import__, _cb_blocked, _cb_allowed)

# Redirect stdout/stderr for capture
from io import StringIO as _cb_StringIO
_cb_stdout = _cb_StringIO()
_cb_stderr = _cb_StringIO()
_cb_sys.stdout = _cb_stdout
_cb_sys.stderr = _cb_stderr

# Clean up ALL preamble names from user namespace
del _CbGuard, _cb_types, _cb_blocked, _cb_allowed, _cb_bi, _cb_StringIO, _cb_sys, _cb_m
`

function executePython(
  _code: string,
  onOutput?: (line: string) => void
): ExecutionHandle {
  const output: string[] = []
  let outputBytes = 0
  let outputCapped = false
  const start = performance.now()

  // Python runs synchronously on main thread, so abort is best-effort
  let aborted = false

  const promise = (async (): Promise<ExecutionResult> => {
    try {
      const pyodide = await getPyodide()

      // Reset user-defined globals from previous run (CB-R2-010)
      resetPyodideGlobals()

      // Apply safety preamble (CB-R2-001)
      pyodide.runPython(PYTHON_SAFETY_PREAMBLE)

      if (aborted) {
        return { output, error: 'Execution stopped', returnValue: null, duration: performance.now() - start }
      }

      const result = pyodide.runPython(_code)

      const stdout: string = pyodide.runPython('_cb_stdout.getvalue()')
      if (stdout) {
        const lines = stdout.split('\n').filter((l: string) => l.length > 0)
        for (const line of lines) {
          // Output buffer limit (CB-R2-007)
          if (!outputCapped) {
            outputBytes += line.length
            if (output.length >= MAX_OUTPUT_LINES || outputBytes >= MAX_OUTPUT_BYTES) {
              outputCapped = true
              const warning = '[Output truncated — limit reached]'
              output.push(warning)
              onOutput?.(warning)
            } else {
              output.push(line)
              onOutput?.(line)
            }
          }
        }
      }

      return {
        output,
        error: null,
        returnValue: result,
        duration: performance.now() - start,
      }
    } catch (e) {
      return {
        output,
        error: e instanceof Error ? e.message : String(e),
        returnValue: null,
        duration: performance.now() - start,
      }
    }
  })()

  return {
    promise,
    abort: () => { aborted = true },
  }
}
