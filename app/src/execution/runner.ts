import type { Language } from '../types/block'

export interface ExecutionResult {
  output: string[]
  error: string | null
  returnValue: unknown
  duration: number
}

export async function executeCode(
  code: string,
  language: Language,
  onOutput?: (line: string) => void
): Promise<ExecutionResult> {
  if (language === 'javascript') {
    return executeJavaScript(code, onOutput)
  } else {
    return executePython(code)
  }
}

async function executeJavaScript(
  code: string,
  onOutput?: (line: string) => void
): Promise<ExecutionResult> {
  const output: string[] = []
  const start = performance.now()

  return new Promise((resolve) => {
    let settled = false
    let iframe: HTMLIFrameElement | null = null
    let blobUrl: string | null = null

    const cleanup = () => {
      if (iframe) {
        try { document.body.removeChild(iframe) } catch { /* already removed */ }
        iframe = null
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        blobUrl = null
      }
    }

    const finish = (error: string | null, returnValue: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('message', handler)
      cleanup()
      resolve({
        output,
        error,
        returnValue,
        duration: performance.now() - start,
      })
    }

    const timer = setTimeout(() => {
      finish('Execution timed out (30 seconds)', null)
    }, 30000)

    const handler = (event: MessageEvent) => {
      const msg = event.data
      if (!msg || typeof msg !== 'object' || msg.__cryptoblocks !== true) return

      if (msg.type === 'log') {
        const line = String(msg.data)
        output.push(line)
        onOutput?.(line)
      } else if (msg.type === 'error') {
        finish(String(msg.data), null)
      } else if (msg.type === 'done') {
        finish(null, msg.data)
      }
    }
    window.addEventListener('message', handler)

    // Encode user code safely as base64 to avoid escaping issues
    const encoded = btoa(unescape(encodeURIComponent(code)))

    const html = `<!DOCTYPE html><html><head><script>
var _mark = { __cryptoblocks: true };
console.log = function() {
  var args = Array.prototype.slice.call(arguments);
  var msg = args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ');
  parent.postMessage({ __cryptoblocks: true, type: 'log', data: msg }, '*');
};
(async function() {
  try {
    var __code = decodeURIComponent(escape(atob("${encoded}")));
    var __fn = new Function("return (async function() {\\n" + __code + "\\n})()");
    var __result = await __fn();
    parent.postMessage({ __cryptoblocks: true, type: 'done', data: __result }, '*');
  } catch(e) {
    parent.postMessage({ __cryptoblocks: true, type: 'error', data: e.message }, '*');
  }
})()
<\/script></head><body></body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    blobUrl = URL.createObjectURL(blob)
    iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.sandbox.add('allow-scripts')
    iframe.sandbox.add('allow-modals')
    iframe.sandbox.add('allow-same-origin')
    iframe.src = blobUrl
    document.body.appendChild(iframe)
  })
}

// Cache Pyodide instance - load once, reuse forever
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideLoading: Promise<any> | null = null

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = (async () => {
    const pyodideModule = await import('pyodide')
    pyodideInstance = await pyodideModule.loadPyodide()
    pyodideLoading = null
    return pyodideInstance
  })()

  return pyodideLoading
}

async function executePython(code: string): Promise<ExecutionResult> {
  const output: string[] = []
  const start = performance.now()

  try {
    const pyodide = await getPyodide()

    // Fresh stdout capture for each run
    pyodide.runPython(`
import sys
from io import StringIO
_stdout = StringIO()
sys.stdout = _stdout
    `)

    const result = pyodide.runPython(code)

    const stdout = pyodide.runPython('_stdout.getvalue()')
    if (stdout) {
      output.push(...stdout.split('\n').filter((l: string) => l.length > 0))
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
}
