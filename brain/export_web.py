import json, os, torch, numpy as np
from model import GPT, load_config
from data import CharTokenizer

CKPT, OUT = "ckpt_v2", "web_model"
os.makedirs(OUT, exist_ok=True)
cfg = load_config(os.path.join(CKPT, "config.json"))
tok = CharTokenizer.load(os.path.join(CKPT, "vocab.json"))
model = GPT(cfg)
model.load_state_dict(torch.load(os.path.join(CKPT, "model.pt"), map_location="cpu"))
model.eval()

sd = model.state_dict()
tensors, blob = [], bytearray()
for name, t in sd.items():
    a = t.detach().cpu().contiguous().to(torch.float32).numpy().astype("<f4")
    tensors.append({"name": name, "shape": list(t.shape), "offset": len(blob), "count": int(a.size)})
    blob += a.tobytes()
with open(os.path.join(OUT, "model.bin"), "wb") as f:
    f.write(blob)
meta = {"config": {"vocab_size": cfg.vocab_size, "block_size": cfg.block_size,
                   "n_layer": cfg.n_layer, "n_head": cfg.n_head, "n_embd": cfg.n_embd},
        "chars": tok.chars, "tensors": tensors, "bytes": len(blob)}
json.dump(meta, open(os.path.join(OUT, "model.json"), "w"))

# deterministic greedy parity reference for the JS engine to match exactly
def greedy(prompt, n=60):
    ids = tok.encode(prompt)
    for _ in range(n):
        x = torch.tensor([ids[-cfg.block_size:]])
        with torch.no_grad():
            logits, _ = model(x)
        ids.append(int(logits[0, -1].argmax()))
    return ids
pr = "U: is it free\nA:"
ref = greedy(pr, 60)
json.dump({"prompt": pr, "ids": ref, "text": tok.decode(ref)}, open(os.path.join(OUT, "parity.json"), "w"))
print("tensors:", len(tensors), " bytes:", len(blob), f"({len(blob)/1e6:.1f} MB)")
print("PARITY_TEXT:", repr(tok.decode(ref)))
