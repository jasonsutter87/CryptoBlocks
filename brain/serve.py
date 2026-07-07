"""Local web chat UI for the CryptoBlocks brain. No external deps — just
Python stdlib + torch. Loads ckpt/model.pt and HOT-RELOADS it whenever
the file changes, so you can leave this open while train.py runs and
watch the brain get smarter in real time.

    python serve.py                 # http://127.0.0.1:8011, no password
    BRAIN_PASSWORD=hunter2 python serve.py            # password-gated
    BRAIN_PASSWORD=hunter2 python serve.py --host 0.0.0.0 --port 8011

Password: set BRAIN_PASSWORD (and optionally BRAIN_USER, default "cb").
When set, every request needs HTTP Basic Auth. Leave it unset for a
loopback-only local test.

Bind defaults to loopback. Pass --host 0.0.0.0 only when a tunnel
(Cloudflare Tunnel / Tailscale) or reverse proxy needs to reach it —
and ALWAYS pair that with BRAIN_PASSWORD.
"""

from __future__ import annotations

import argparse
import base64
import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch

from chat import answer, load, pick_device

# Directory holding the browser-exported model (model.json + model.bin),
# served as static assets so /chat can run inference client-side.
WEB_MODEL_DIR = os.environ.get("BRAIN_WEB_MODEL", "web_model")

PAGE = """<!doctype html>
<html><head><meta charset="utf-8"><title>CryptoBlocks Brain</title>
<style>
  :root{--bg:#0d1117;--panel:#161b22;--line:#30363d;--ink:#e6edf3;
        --muted:#8b949e;--accent:#58a6ff;--cb:#3fb950;--you:#1f6feb}
  *{box-sizing:border-box}
  body{margin:0;font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;
       background:var(--bg);color:var(--ink);height:100vh;display:flex;
       flex-direction:column}
  header{padding:14px 20px;border-bottom:1px solid var(--line);
         background:var(--panel);display:flex;align-items:center;gap:10px}
  header b{font-size:16px}
  header .dot{width:9px;height:9px;border-radius:50%;background:var(--cb)}
  header .meta{margin-left:auto;color:var(--muted);font-size:12px;
               font-family:ui-monospace,monospace}
  #log{flex:1;overflow:auto;padding:20px;max-width:760px;width:100%;
       margin:0 auto}
  .msg{margin:0 0 14px;display:flex;gap:10px}
  .msg .who{flex:none;width:30px;height:30px;border-radius:7px;
            display:grid;place-items:center;font-size:13px;font-weight:700}
  .you .who{background:var(--you)}
  .cb .who{background:var(--cb);color:#0d1117}
  .bub{background:var(--panel);border:1px solid var(--line);
       border-radius:9px;padding:9px 13px;white-space:pre-wrap}
  .hint{color:var(--muted);font-size:13px;margin:6px 0 16px}
  form{display:flex;gap:8px;padding:14px 20px;border-top:1px solid var(--line);
       background:var(--panel);max-width:760px;width:100%;margin:0 auto}
  input{flex:1;background:var(--bg);border:1px solid var(--line);
        border-radius:8px;color:var(--ink);padding:10px 13px;font-size:15px}
  input:focus{outline:none;border-color:var(--accent)}
  button{background:var(--accent);border:0;border-radius:8px;color:#0d1117;
         font-weight:700;padding:0 18px;cursor:pointer}
  button:disabled{opacity:.5;cursor:wait}
  .ex{color:var(--accent);cursor:pointer;text-decoration:underline}
</style></head><body>
<header><span class="dot"></span><b>CryptoBlocks Brain</b>
  <span class="meta" id="meta">loading…</span></header>
<div id="log">
  <div class="hint">Trained from scratch on CryptoBlocks only. Try:
    <span class="ex">what is cryptoblocks</span> ·
    <span class="ex">what is shareplace</span> ·
    <span class="ex">how much does it cost</span> ·
    <span class="ex">what are pancakes</span> (watch it deflect)
    &nbsp;·&nbsp; <a href="__BASE__/corpus" style="color:var(--cb)">📚 see everything it was trained on</a></div>
</div>
<form id="f"><input id="q" autocomplete="off"
  placeholder="Ask about CryptoBlocks…" autofocus>
  <button id="b">Ask</button></form>
<script>
const log=document.getElementById('log'),q=document.getElementById('q'),
      b=document.getElementById('b'),meta=document.getElementById('meta');
function add(who,txt,cls){const m=document.createElement('div');
  m.className='msg '+cls;m.innerHTML='<div class="who">'+who+
  '</div><div class="bub"></div>';m.querySelector('.bub').textContent=txt;
  log.appendChild(m);log.scrollTop=log.scrollHeight;return m;}
const BASE='__BASE__';
async function refreshMeta(){try{const r=await fetch(BASE+'/meta');
  const j=await r.json();meta.textContent=j.params+' · '+j.device+
  ' · val '+j.val+' · '+j.mtime;}catch(e){}}
document.querySelectorAll('.ex').forEach(e=>e.onclick=()=>{
  q.value=e.textContent;q.focus();});
document.getElementById('f').onsubmit=async(e)=>{e.preventDefault();
  const text=q.value.trim();if(!text)return;add('you',text,'you');q.value='';
  b.disabled=true;const m=add('cb','…','cb');
  try{const r=await fetch(BASE+'/ask',{method:'POST',
    headers:{'content-type':'application/json'},body:JSON.stringify({q:text})});
    const j=await r.json();m.querySelector('.bub').textContent=j.a;}
  catch(err){m.querySelector('.bub').textContent='(error: '+err+')';}
  b.disabled=false;q.focus();refreshMeta();};
refreshMeta();setInterval(refreshMeta,4000);
</script></body></html>"""


def render_corpus_page(corpus_path: str, base_path: str) -> str:
    """Show the FULL closed world the brain was trained on: every unique
    Q->A pair (training repetition stripped) + stats. This is the honesty
    page — proof that nothing outside CryptoBlocks exists in its world."""
    import html
    try:
        with open(corpus_path) as f:
            text = f.read()
    except FileNotFoundError:
        return "<h1>corpus.txt not found next to the server</h1>"

    raw_turns = [t for t in text.split("\n\n") if t.strip()]
    seen, pairs = set(), []
    for t in raw_turns:
        if t in seen:
            continue
        seen.add(t)
        q = a = ""
        for line in t.splitlines():
            if line.startswith("U: "):
                q = line[3:]
            elif line.startswith("A: "):
                a = line[3:]
        if q and a:
            pairs.append((q, a))
    pairs.sort()
    vocab = sorted(set(text))

    rows = "\n".join(
        f'<tr><td class="q">{html.escape(q)}</td>'
        f'<td>{html.escape(a)}</td></tr>' for q, a in pairs)
    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>What the CryptoBlocks Brain knows</title><style>
  body{{margin:0;font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;
       background:#0d1117;color:#e6edf3}}
  header{{padding:16px 22px;border-bottom:1px solid #30363d;background:#161b22;
         position:sticky;top:0}}
  header a{{color:#58a6ff;text-decoration:none}}
  .stats{{color:#8b949e;font-size:13px;font-family:ui-monospace,monospace;
         margin-top:6px}}
  .wrap{{max-width:900px;margin:0 auto;padding:18px 22px}}
  table{{border-collapse:collapse;width:100%}}
  td{{border-bottom:1px solid #21262d;padding:8px 10px;vertical-align:top}}
  td.q{{color:#3fb950;width:38%;font-weight:600}}
  h1{{font-size:17px;margin:0}}
</style></head><body>
<header><a href="{base_path}/">&larr; back to chat</a>
  <h1 style="margin-top:8px">Everything the CryptoBlocks brain was trained on</h1>
  <div class="stats">{len(pairs)} unique facts · {len(raw_turns)} training
   turns · {len(vocab)}-character vocabulary · trained from random weights.
   This is the whole world. There is nothing else in it.</div></header>
<div class="wrap"><table>{rows}</table></div>
</body></html>"""


class Brain:
    """Holds the model and reloads it when ckpt/model.pt changes on disk."""

    def __init__(self, out_dir: str):
        self.out_dir = out_dir
        self.device = pick_device()
        self.mtime = 0.0
        self.val = "?"
        self.model = self.tok = self.cfg = None
        self.reload()

    def _path(self) -> str:
        return os.path.join(self.out_dir, "model.pt")

    def reload(self) -> None:
        self.model, self.tok, self.cfg = load(self.out_dir, self.device)
        self.mtime = os.path.getmtime(self._path())
        # Best-effort: pull latest val loss from train.log if present.
        try:
            log = os.path.join(self.out_dir, "..", "train.log")
            with open(log) as f:
                for line in f:
                    if "| val " in line:
                        self.val = line.split("| val ")[1].split("|")[0].strip()
        except Exception:
            pass

    def maybe_reload(self) -> None:
        try:
            if os.path.getmtime(self._path()) != self.mtime:
                self.reload()
        except FileNotFoundError:
            pass

    def ask(self, q: str) -> str:
        self.maybe_reload()
        return answer(self.model, self.tok, self.cfg, self.device, q,
                      temperature=0.3, top_k=10)


def make_handler(brain: Brain, user: str, password: str, base_path: str,
                 corpus_path: str):
    expected = base64.b64encode(f"{user}:{password}".encode()).decode() \
        if password else None
    page = PAGE.replace("__BASE__", base_path)
    corpus_cache = {}

    def corpus_html():
        if "html" not in corpus_cache:
            corpus_cache["html"] = render_corpus_page(corpus_path, base_path)
        return corpus_cache["html"]

    class H(BaseHTTPRequestHandler):
        def _authed(self) -> bool:
            if expected is None:
                return True
            hdr = self.headers.get("Authorization", "")
            if not hdr.startswith("Basic "):
                return False
            # constant-time compare to avoid leaking the password by timing
            return hmac.compare_digest(hdr[6:].strip(), expected)

        def _challenge(self):
            self.send_response(401)
            self.send_header("WWW-Authenticate",
                             'Basic realm="CryptoBlocks Brain"')
            self.send_header("content-length", "0")
            self.end_headers()

        def _send(self, code, body, ctype="application/json"):
            data = body.encode() if isinstance(body, str) else body
            self.send_response(code)
            self.send_header("content-type", ctype)
            self.send_header("content-length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def _serve_web_model(self, fname, ctype):
            try:
                with open(os.path.join(WEB_MODEL_DIR, fname), "rb") as f:
                    data = f.read()
            except FileNotFoundError:
                return self._send(404, "{}")
            self.send_response(200)
            self.send_header("content-type", ctype)
            self.send_header("content-length", str(len(data)))
            self.send_header("cache-control", "public, max-age=86400")
            self.send_header("access-control-allow-origin", "*")
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if not self._authed():
                return self._challenge()
            # Browser-inference assets (checked first: "/chat/model.json"
            # would otherwise match the /chat page route below).
            if self.path.endswith("/model.json") or self.path == "/model.json":
                self._serve_web_model("model.json", "application/json")
            elif self.path.endswith("/model.bin") or self.path == "/model.bin":
                self._serve_web_model("model.bin", "application/octet-stream")
            elif self.path.rstrip("/").endswith("/corpus") \
                    or self.path == "/corpus":
                self._send(200, corpus_html(), "text/html; charset=utf-8")
            elif self.path == "/" or self.path.startswith("/index") \
                    or self.path.startswith("/chat"):
                self._send(200, page, "text/html; charset=utf-8")
            elif self.path == "/meta":
                brain.maybe_reload()
                import time
                self._send(200, json.dumps({
                    "params": f"{brain.model.num_params()/1e6:.1f}M",
                    "device": brain.device,
                    "val": brain.val,
                    "mtime": time.strftime(
                        "%H:%M:%S", time.localtime(brain.mtime)),
                }))
            else:
                self._send(404, "{}")

        def do_POST(self):
            if not self._authed():
                return self._challenge()
            if self.path != "/ask":
                return self._send(404, "{}")
            n = int(self.headers.get("content-length", 0))
            try:
                q = json.loads(self.rfile.read(n))["q"]
            except Exception:
                return self._send(400, json.dumps({"a": "(bad request)"}))
            self._send(200, json.dumps({"a": brain.ask(q)}))

        def log_message(self, *a):  # quiet
            pass

    return H


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default="ckpt")
    ap.add_argument("--port", type=int, default=8011)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()

    user = os.environ.get("BRAIN_USER", "cb")
    password = os.environ.get("BRAIN_PASSWORD", "")
    base_path = os.environ.get("BRAIN_BASE_PATH", "").rstrip("/")
    corpus_path = os.environ.get("BRAIN_CORPUS", "corpus.txt")
    if args.host != "127.0.0.1" and not password:
        raise SystemExit(
            "refusing to bind non-loopback without BRAIN_PASSWORD set — "
            "this would expose the brain unauthenticated.")

    brain = Brain(args.out_dir)
    httpd = ThreadingHTTPServer((args.host, args.port),
                                make_handler(brain, user, password, base_path,
                                             corpus_path))
    lock = f"password-gated (user '{user}')" if password else "NO password"
    print(f"CryptoBlocks brain UI → http://{args.host}:{args.port}  "
          f"({brain.device}, {lock}, hot-reloads {args.out_dir}/model.pt)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
