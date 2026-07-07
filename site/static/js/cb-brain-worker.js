/* Web Worker: runs the CryptoBlocks brain off the main thread so the page
   never freezes during generation. Loads the engine (same origin, Netlify)
   and the weights (hosted on the CryptoBlocks server via /chat/model.*),
   then streams answer characters back to the widget. */
'use strict';
importScripts('/js/gpt.js');

var gpt = null;

function loadModel() {
  Promise.all([
    fetch('/chat/model.json').then(function (r) { if (!r.ok) throw new Error('model.json ' + r.status); return r.json(); }),
    fetch('/chat/model.bin').then(function (r) { if (!r.ok) throw new Error('model.bin ' + r.status); return r.arrayBuffer(); })
  ]).then(function (res) {
    gpt = new self.CBGPT.GPT(res[0], res[1]);
    postMessage({ type: 'ready', params: res[0].tensors ? undefined : 0 });
  }).catch(function (err) {
    postMessage({ type: 'error', error: String(err && err.message || err) });
  });
}

function streamClean(raw, final) {
  var t = raw.split('\n\n')[0].split('U:')[0];
  if (final) {
    t = t.trim();
    var e = Math.max(t.lastIndexOf('.'), t.lastIndexOf('!'), t.lastIndexOf('?'));
    if (e !== -1) t = t.slice(0, e + 1);
    return t.trim();
  }
  return t.replace(/^\s+/, '');
}

onmessage = function (e) {
  var m = e.data || {};
  if (m.type === 'load') { loadModel(); return; }
  if (m.type === 'ask') {
    if (!gpt) { postMessage({ type: 'error', id: m.id, error: 'model not loaded' }); return; }
    var prompt = 'U: ' + String(m.q).trim() + '\nA:';
    var raw = '';
    try {
      gpt.generate(prompt, { temperature: 0.3, topK: 10 }, function (ch) {
        raw += ch;
        postMessage({ type: 'token', id: m.id, text: streamClean(raw, false) });
      });
      postMessage({ type: 'done', id: m.id, text: streamClean(raw, true) });
    } catch (err) {
      postMessage({ type: 'error', id: m.id, error: String(err && err.message || err) });
    }
  }
};
