/**
 * Export block programs as standalone HTML files or embeddable script snippets.
 * Optionally includes Zero Trust Analytics (ZTA) for PII-less block tracking.
 */

export interface ExportOptions {
  title?: string
  ztaSiteId?: string
  ztaEndpoint?: string
}

/** Generate the ZTA script tag + block lifecycle tracking code. */
function ztaScriptBlock(siteId: string, endpoint?: string): string {
  const endpointAttr = endpoint ? ` data-endpoint="${escapeHtml(endpoint)}"` : ''
  return `<script defer src="https://ztas.io/js/analytics.js" data-site-id="${escapeHtml(siteId)}"${endpointAttr}></script>`
}

/** Generate ZTA tracking calls injected into the block runner. */
function ztaTrackingCode(siteId: string): string {
  return `
  // Zero Trust Analytics — PII-less block tracking
  var __zta = function(name, props) {
    if (window.ZTA && window.ZTA.track) {
      window.ZTA.track(name, Object.assign({ category: 'cryptoblocks', siteId: '${escapeHtml(siteId)}' }, props || {}));
    }
  };
  __zta('block_load', { url: window.location.href });`
}

/** Generate a self-contained HTML page that runs the user's block code. */
export function generateStandaloneHtml(code: string, options: ExportOptions = {}): string {
  const title = options.title || 'CryptoBlocks Project'
  const encoded = btoa(unescape(encodeURIComponent(code)))
  const hasZta = !!options.ztaSiteId

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
${hasZta ? ztaScriptBlock(options.ztaSiteId!, options.ztaEndpoint) : ''}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #1e1e2e;
    color: #cdd6f4;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  }
  #cb-container {
    width: 100%;
    max-width: 640px;
  }
  #cb-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  #cb-header .blocks {
    display: flex;
    gap: -4px;
  }
  #cb-header .block {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }
  #cb-header h1 {
    font-size: 1rem;
    font-weight: 600;
    color: #cdd6f4;
  }
  #cb-output {
    background: #181825;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 1rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    min-height: 120px;
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  #cb-output .line { color: #a6e3a1; }
  #cb-output .warn { color: #f9e2af; }
  #cb-output .error { color: #f38ba8; }
  #cb-footer {
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.7rem;
    color: #6c7086;
  }
  #cb-footer a { color: #89b4fa; text-decoration: none; }
  #cb-footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div id="cb-container">
  <div id="cb-header">
    <div class="blocks">
      <div class="block" style="background:#89b4fa"></div>
      <div class="block" style="background:#f9e2af;margin-left:-4px"></div>
      <div class="block" style="background:#a6e3a1;margin-left:-4px"></div>
    </div>
    <h1>${escapeHtml(title)}</h1>
  </div>
  <div id="cb-output" aria-live="polite"></div>
  <div id="cb-footer">Built with <a href="https://cryptoblocks.dev" target="_blank" rel="noopener">CryptoBlocks</a></div>
</div>
<script>
(function() {
  var el = document.getElementById('cb-output');
  var __lines = 0;
  function addLine(text, cls) {
    var d = document.createElement('div');
    d.className = cls || 'line';
    d.textContent = text;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
    __lines++;
  }

  // Override console for output capture
  var _fmt = function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); };
  console.log = function() { addLine(Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'line'); };
  console.warn = function() { addLine('[warn] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'warn'); };
  console.error = function() { addLine('[error] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'error'); };
  console.info = function() { addLine('[info] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'line'); };
${hasZta ? ztaTrackingCode(options.ztaSiteId!) : ''}

  var __start = performance.now();
  try {
    var __code = decodeURIComponent(escape(atob("${encoded}")));
    var __fn = new Function("return (async function() {\\n" + __code + "\\n})()");
${hasZta ? '    __zta(\'block_run\');' : ''}
    __fn().then(function() {
      var __dur = Math.round(performance.now() - __start);
${hasZta ? '      __zta(\'block_complete\', { duration: __dur, outputLines: __lines });' : ''}
    }).catch(function(e) {
      addLine('Error: ' + e.message, 'error');
${hasZta ? '      __zta(\'block_error\', { error: e.message });' : ''}
    });
  } catch(e) {
    addLine('Error: ' + e.message, 'error');
${hasZta ? '    __zta(\'block_error\', { error: e.message });' : ''}
  }
})();
</script>
</body>
</html>`
}

/** Generate an inline embed snippet the user can paste into any HTML page. */
export function generateEmbedSnippet(code: string, options: ExportOptions = {}): string {
  const encoded = btoa(unescape(encodeURIComponent(code)))
  const hasZta = !!options.ztaSiteId

  // ZTA inline helper (minified for embed)
  const ztaInline = hasZta
    ? `var __zta=function(n,p){if(window.ZTA&&window.ZTA.track){window.ZTA.track(n,Object.assign({category:'cryptoblocks',siteId:'${escapeHtml(options.ztaSiteId!)}'},p||{}))}};__zta('block_load',{url:location.href});`
    : ''
  const ztaRun = hasZta ? `__zta('block_run');` : ''
  const ztaComplete = hasZta ? `__zta('block_complete',{duration:Math.round(performance.now()-__s),lines:__n});` : ''
  const ztaError = hasZta ? `__zta('block_error',{error:e.message});` : ''

  const ztaScriptTag = hasZta
    ? `\n<script defer src="https://ztas.io/js/analytics.js" data-site-id="${escapeHtml(options.ztaSiteId!)}"></script>`
    : ''

  return `<!-- CryptoBlocks Embed -->${ztaScriptTag}
<div id="cb-embed" style="background:#181825;border:1px solid #313244;border-radius:8px;padding:1rem;font-family:monospace;font-size:14px;color:#a6e3a1;min-height:80px;max-height:300px;overflow-y:auto;white-space:pre-wrap"></div>
<script>
(function(){var el=document.getElementById('cb-embed');var __n=0;function a(t,c){var d=document.createElement('div');d.style.color=c||'#a6e3a1';d.textContent=t;el.appendChild(d);el.scrollTop=el.scrollHeight;__n++}var f=function(v){return typeof v==='object'?JSON.stringify(v):String(v)};console.log=function(){a(Array.prototype.slice.call(arguments).map(f).join(' '))};console.warn=function(){a('[warn] '+Array.prototype.slice.call(arguments).map(f).join(' '),'#f9e2af')};console.error=function(){a('[error] '+Array.prototype.slice.call(arguments).map(f).join(' '),'#f38ba8')};${ztaInline}var __s=performance.now();try{var c=decodeURIComponent(escape(atob("${encoded}")));${ztaRun}(new Function("return (async function(){\\n"+c+"\\n})()"))().then(function(){${ztaComplete}}).catch(function(e){a('Error: '+e.message,'#f38ba8');${ztaError}})}catch(e){a('Error: '+e.message,'#f38ba8');${ztaError}}})();
</script>`
}

/** Download a string as a file. */
export function downloadHtml(html: string, filename = 'cryptoblocks-project.html') {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Copy text to clipboard. Returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
