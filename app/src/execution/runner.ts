import type { Language } from '../types/block'
import { generateSafetyPreamble } from '../safety'
import { getGamepadSnapshot } from '../hardware/gamepad'
import { getKeyboardSnapshot } from '../hardware/keyboard'
import { getSensorState as getMicrobitSensors, isConnected as isMicrobitConnected } from '../hardware/microbit'

/** Shape posted to the iframe for micro:bit — both connection flag
 *  and latest sensor readings, rolled up once per animation frame. */
function getMicrobitSnapshot() {
  const s = getMicrobitSensors()
  return {
    connected: isMicrobitConnected(),
    buttonA: s.buttonA,
    buttonB: s.buttonB,
    accelX: s.accelX,
    accelY: s.accelY,
    accelZ: s.accelZ,
    temperature: s.temperature,
    light: s.lightLevel,
  }
}

/** Dispatch an outbound command from the sandbox iframe. Routes to the
 *  matching parent-side API. Silently ignored if the target is unknown. */
function dispatchCommand(target: string, action: string, args: unknown[]): void {
  try {
    if (target === 'microbit') {
      const api = (window as unknown as { __microbit?: Record<string, (...a: unknown[]) => unknown> }).__microbit
      if (api && typeof api[action] === 'function') api[action](...args)
    }
  } catch { /* iframe command errors are reported by the iframe itself */ }
}

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
  onCanvasUpdate?: (dataUrl: string) => void,
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
    return executeJavaScript(code, onOutput, onTrace, onCanvasUpdate)
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

// ---------------------------------------------------------------------------
// Strategy 1: Sandboxed iframe (most secure, but blocked by some browsers)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sandbox HTML template — broken into named pieces so each layer is
// readable on its own. The old version was a single 60-line backtick
// string mixing CSP, console bridge, error handling, and user-code exec.
// ---------------------------------------------------------------------------

// unsafe-eval is required because user-authored code is compiled via
// `new Function(code)` inside the sandbox iframe. Without it, the
// entire execution model breaks. This is acceptable because the iframe
// has no allow-same-origin (can't touch parent localStorage/cookies)
// and connect-src is 'none' (can't exfiltrate data over the network).
const SANDBOX_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://jasonsutter87.github.io",
  "connect-src 'none'",
  "style-src 'unsafe-inline' https://cdn.tailwindcss.com",
  "img-src data: https:",
  "frame-src 'none'",
  "worker-src blob:",
  "object-src 'none'",
].join('; ')

/**
 * Capability bridge — runs inside the sandbox iframe before user code.
 *
 * The sandbox has null origin, so it cannot reach the parent's
 * `window.__gamepad`, `window.__keys`, `window.__microbit` etc.
 * directly. This shim recreates those globals INSIDE the iframe, backed
 * by a cache that the parent refreshes via postMessage every animation
 * frame. Outbound commands (micro:bit actions like showIcon) are posted
 * back to the parent, which calls the real hardware API.
 *
 * Block implementations reference `window.__gamepad.buttonA()` etc.
 * unchanged — the shim keeps that contract stable across the security
 * fix that removed the parent-window execution path.
 */
const CAPABILITY_BRIDGE = `
var __bridgeCache = { gamepad: {}, keys: {}, microbit: {} };

window.addEventListener('message', function(e) {
  var m = e.data;
  if (!m || m.__cryptoblocks !== true || m.type !== 'input') return;
  if (m.gamepad)  __bridgeCache.gamepad  = m.gamepad;
  if (m.keys)     __bridgeCache.keys     = m.keys;
  if (m.microbit) __bridgeCache.microbit = m.microbit;
});

function __cmd(target, action, args) {
  parent.postMessage({
    __cryptoblocks: true, type: 'cmd',
    target: target, action: action, args: args || []
  }, '*');
}

window.__gamepad = {
  isConnected:  function() { return !!__bridgeCache.gamepad.connected; },
  buttonA:      function() { return !!__bridgeCache.gamepad.buttonA; },
  buttonB:      function() { return !!__bridgeCache.gamepad.buttonB; },
  buttonX:      function() { return !!__bridgeCache.gamepad.buttonX; },
  buttonY:      function() { return !!__bridgeCache.gamepad.buttonY; },
  buttonLB:     function() { return !!__bridgeCache.gamepad.buttonLB; },
  buttonRB:     function() { return !!__bridgeCache.gamepad.buttonRB; },
  dpadUp:       function() { return !!__bridgeCache.gamepad.dpadUp; },
  dpadDown:     function() { return !!__bridgeCache.gamepad.dpadDown; },
  dpadLeft:     function() { return !!__bridgeCache.gamepad.dpadLeft; },
  dpadRight:    function() { return !!__bridgeCache.gamepad.dpadRight; },
  leftStickX:   function() { return __bridgeCache.gamepad.leftStickX  || 0; },
  leftStickY:   function() { return __bridgeCache.gamepad.leftStickY  || 0; },
  rightStickX:  function() { return __bridgeCache.gamepad.rightStickX || 0; },
  rightStickY:  function() { return __bridgeCache.gamepad.rightStickY || 0; },
  anyButton:    function() { return !!__bridgeCache.gamepad.anyButton; }
};

// Proxy-style keyboard: user code reads window.__keys['ArrowLeft'] etc.
window.__keys = new Proxy({}, {
  get: function(_, key) { return !!__bridgeCache.keys[key]; },
  has: function(_, key) { return !!__bridgeCache.keys[key]; }
});

// Micro:bit: readable sensors from cache; commands posted back to parent.
window.__microbit = {
  isConnected:    function() { return !!__bridgeCache.microbit.connected; },
  buttonA:        function() { return !!__bridgeCache.microbit.buttonA; },
  buttonB:        function() { return !!__bridgeCache.microbit.buttonB; },
  accelerometerX: function() { return __bridgeCache.microbit.accelX || 0; },
  accelerometerY: function() { return __bridgeCache.microbit.accelY || 0; },
  accelerometerZ: function() { return __bridgeCache.microbit.accelZ || 0; },
  temperature:    function() { return __bridgeCache.microbit.temperature || 0; },
  light:          function() { return __bridgeCache.microbit.light || 0; },
  showIcon:   function(icon)  { __cmd('microbit', 'showIcon',   [icon]); },
  showString: function(s)     { __cmd('microbit', 'showString', [s]); },
  showNumber: function(n)     { __cmd('microbit', 'showNumber', [n]); },
  clear:      function()      { __cmd('microbit', 'clear',      []); },
  plotPixel:  function(x, y)  { __cmd('microbit', 'plotPixel',  [x, y]); },
  unplotPixel:function(x, y)  { __cmd('microbit', 'unplotPixel',[x, y]); }
};
`.trim()

const CONSOLE_BRIDGE = `
var __sendMsg = function(type, data) {
  parent.postMessage({ __cryptoblocks: true, type: type, data: data }, '*');
};
var __formatArg = function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); };
Object.defineProperty(console, 'log', { value: function() { __sendMsg('log', Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'warn', { value: function() { __sendMsg('log', '[warn] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'error', { value: function() { __sendMsg('log', '[error] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'info', { value: function() { __sendMsg('log', '[info] ' + Array.prototype.slice.call(arguments).map(__formatArg).join(' ')); }, configurable: false, writable: false });
Object.defineProperty(console, 'debug', { value: function() {}, configurable: false, writable: false });
window.onerror = function(msg, src, line, col, err) { __sendMsg('log', '[error] ' + (err ? err.message : msg)); };
window.addEventListener('unhandledrejection', function(e) { __sendMsg('log', '[error] ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))); });
`.trim()

function userCodeRunner(encodedBase64: string): string {
  return `
(async function() {
  try {
    if (!document.body) {
      await new Promise(function(r) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() { r(null); }, { once: true });
        } else { r(null); }
      });
    }
    var __code = decodeURIComponent(escape(atob("${encodedBase64}")));
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
})()`.trim()
}

function buildSandboxHtml(code: string, safetyPreamble: string): string {
  const encoded = btoa(unescape(encodeURIComponent(code)))
  return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}">
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
${CONSOLE_BRIDGE}
${CAPABILITY_BRIDGE}
${safetyPreamble}
${userCodeRunner(encoded)}
<\/script></head><body><div id="cb-page" style="display:none"></div><canvas id="cb-canvas" width="400" height="400" style="display:none"></canvas></body></html>`
}

// ---------------------------------------------------------------------------
// Strategy 1: Sandboxed iframe (most secure)
// ---------------------------------------------------------------------------

function tryIframeExecution(
  code: string,
  collector: ReturnType<typeof createOutputCollector>,
  start: number,
  onTrace?: (blockId: string) => void,
  onCanvasUpdate?: (dataUrl: string) => void,
): Promise<{ result: ExecutionResult; cleanup: () => void } | null> {
  return new Promise((resolve) => {
    let iframe: HTMLIFrameElement | null = null
    let inputRAF: number | null = null

    const cleanup = () => {
      if (inputRAF !== null) {
        cancelAnimationFrame(inputRAF)
        inputRAF = null
      }
      if (iframe) {
        // Stop any animation loops running in the iframe (allow-same-origin keeps them alive)
        try {
          const win = iframe.contentWindow as Window & { __cbStopLoop?: boolean } | null
          if (win) win.__cbStopLoop = true
          // Also stop any active camera streams
          const cam = (win as Window & { __cbCamera?: HTMLVideoElement } | null)?.__cbCamera
          if (cam && cam.srcObject) {
            const stream = cam.srcObject as MediaStream
            stream.getTracks().forEach(t => t.stop())
          }
        } catch { /* cross-origin or already gone */ }
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
      // Keep listening for post-execution messages (key events, click handlers, etc.)
      // but resolve the promise so the UI can show initial results
      resolve({
        result: {
          output: collector.output,
          error,
          returnValue,
          duration: performance.now() - start,
          canvasDataUrl,
          htmlOutput,
        },
        cleanup: () => {
          window.removeEventListener('message', handler)
          cleanup()
        },
      })
    }

    // Input-forwarding pump — once the iframe is alive, post current
    // gamepad/keyboard/microbit state every animation frame. Stopped on
    // cleanup or when execution finishes.
    const startInputPump = () => {
      if (inputRAF !== null) return
      const tick = () => {
        if (!iframe?.contentWindow) { inputRAF = null; return }
        iframe.contentWindow.postMessage({
          __cryptoblocks: true,
          type: 'input',
          gamepad: getGamepadSnapshot(),
          keys: getKeyboardSnapshot(),
          microbit: getMicrobitSnapshot(),
        }, '*')
        inputRAF = requestAnimationFrame(tick)
      }
      inputRAF = requestAnimationFrame(tick)
    }

    const handler = (event: MessageEvent) => {
      // Validate: sandbox iframe has no `allow-same-origin`, so its origin
      // reports as the literal string "null". Source must be our iframe and
      // the message must carry our marker. The origin check stops cross-
      // origin embeds or popups from spoofing execution events.
      if (event.origin !== 'null') return
      if (event.source !== iframe?.contentWindow) return
      const msg = event.data
      if (!msg || typeof msg !== 'object' || msg.__cryptoblocks !== true) return

      // First message received → iframe is alive. Cancel probe, start real timeout.
      if (!mainTimer) {
        clearTimeout(probeTimer)
        mainTimer = setTimeout(() => {
          finish('Execution timed out (30 seconds)', null)
        }, EXECUTION_TIMEOUT)
        startInputPump()
      }

      if (msg.type === 'trace') {
        onTrace?.(String(msg.data))
      } else if (msg.type === 'log') {
        collector.push(String(msg.data))
      } else if (msg.type === 'canvas') {
        canvasDataUrl = String(msg.data)
        onCanvasUpdate?.(canvasDataUrl)
      } else if (msg.type === 'html') {
        htmlOutput = String(msg.data)
      } else if (msg.type === 'cmd') {
        // Outbound command from user code (micro:bit actions, etc.)
        dispatchCommand(msg.target, msg.action, Array.isArray(msg.args) ? msg.args : [])
      } else if (msg.type === 'error') {
        finish(String(msg.data), null)
      } else if (msg.type === 'done') {
        finish(null, msg.data)
      }
    }
    window.addEventListener('message', handler)

    const html = buildSandboxHtml(code, generateSafetyPreamble())

    iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.sandbox.add('allow-scripts')
    iframe.sandbox.add('allow-modals')
    // allow-same-origin deliberately OMITTED so the iframe document has a
    // "null" origin and cannot read the parent window's localStorage. This
    // closes the credential-theft path where kid-authored code in a shared
    // Shareplace project could exfiltrate the viewer's Clerk session token.
    iframe.setAttribute('allow', 'camera; microphone')
    iframe.srcdoc = html
    document.body.appendChild(iframe)
  })
}

// ---------------------------------------------------------------------------
// Main JS executor: iframe only — parent-window fallback was removed for
// security (see H2). If the iframe can't run, the user sees an error.
// ---------------------------------------------------------------------------

function executeJavaScript(
  code: string,
  onOutput?: (line: string) => void,
  onTrace?: (blockId: string) => void,
  onCanvasUpdate?: (dataUrl: string) => void,
): ExecutionHandle {
  const collector = createOutputCollector(onOutput)
  const start = performance.now()
  let aborted = false

  // SECURITY: user-authored code NEVER runs in the parent window. The former
  // `directExecution` fallback + `needsDirectExec` regex shortcut was a full
  // sandbox escape — any remixed Shareplace project containing the string
  // `fetch(` could exfiltrate the viewer's Clerk JWT from localStorage.
  // Features that relied on parent-window access (keyboard-driven games,
  // BLE micro:bit, webcam vision, speech) will need to be reimplemented
  // through a postMessage-bridged capability API before they can return.
  let iframeCleanup: (() => void) | null = null

  const promise = (async (): Promise<ExecutionResult> => {
    const iframeResult = await tryIframeExecution(code, collector, start, onTrace, onCanvasUpdate)

    if (iframeResult) {
      iframeCleanup = iframeResult.cleanup
      return iframeResult.result
    }

    if (aborted) {
      return { output: collector.output, error: 'Execution stopped', returnValue: null, duration: performance.now() - start }
    }

    // Iframe creation failed (Brave Shields, extension blocker, etc.).
    // Do NOT fall back to parent-window execution — error out instead.
    return {
      output: collector.output,
      error: 'Sandbox unavailable — disable script-blocking extensions to run code.',
      returnValue: null,
      duration: performance.now() - start,
    }
  })()

  return {
    promise,
    abort: () => {
      aborted = true
      if (iframeCleanup) { iframeCleanup(); iframeCleanup = null }
    },
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
