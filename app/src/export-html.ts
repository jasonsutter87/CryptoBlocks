/**
 * Export block programs as standalone HTML files or embeddable script snippets.
 */

/** Generate a self-contained HTML page that runs the user's block code. */
export function generateStandaloneHtml(code: string, title = 'CryptoBlocks Project'): string {
  // Encode user code as base64 to avoid escaping issues in the template
  const encoded = btoa(unescape(encodeURIComponent(code)))

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
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
  function addLine(text, cls) {
    var d = document.createElement('div');
    d.className = cls || 'line';
    d.textContent = text;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }

  // Override console for output capture
  var _fmt = function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); };
  console.log = function() { addLine(Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'line'); };
  console.warn = function() { addLine('[warn] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'warn'); };
  console.error = function() { addLine('[error] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'error'); };
  console.info = function() { addLine('[info] ' + Array.prototype.slice.call(arguments).map(_fmt).join(' '), 'line'); };

  try {
    var __code = decodeURIComponent(escape(atob("${encoded}")));
    var __fn = new Function("return (async function() {\\n" + __code + "\\n})()");
    __fn().catch(function(e) { addLine('Error: ' + e.message, 'error'); });
  } catch(e) {
    addLine('Error: ' + e.message, 'error');
  }
})();
</script>
</body>
</html>`
}

/** Generate an inline embed snippet the user can paste into any HTML page. */
export function generateEmbedSnippet(code: string): string {
  const encoded = btoa(unescape(encodeURIComponent(code)))

  return `<!-- CryptoBlocks Embed -->
<div id="cb-embed" style="background:#181825;border:1px solid #313244;border-radius:8px;padding:1rem;font-family:monospace;font-size:14px;color:#a6e3a1;min-height:80px;max-height:300px;overflow-y:auto;white-space:pre-wrap"></div>
<script>
(function(){var el=document.getElementById('cb-embed');function a(t,c){var d=document.createElement('div');d.style.color=c||'#a6e3a1';d.textContent=t;el.appendChild(d);el.scrollTop=el.scrollHeight}var f=function(v){return typeof v==='object'?JSON.stringify(v):String(v)};console.log=function(){a(Array.prototype.slice.call(arguments).map(f).join(' '))};console.warn=function(){a('[warn] '+Array.prototype.slice.call(arguments).map(f).join(' '),'#f9e2af')};console.error=function(){a('[error] '+Array.prototype.slice.call(arguments).map(f).join(' '),'#f38ba8')};try{var c=decodeURIComponent(escape(atob("${encoded}")));(new Function("return (async function(){\\n"+c+"\\n})()"))().catch(function(e){a('Error: '+e.message,'#f38ba8')})}catch(e){a('Error: '+e.message,'#f38ba8')}})();
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
