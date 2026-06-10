# CryptoBlocks Brain — a from-scratch model that ONLY knows CryptoBlocks

A tiny char-level GPT trained from **random weights** on a synthetic
corpus about one project: [CryptoBlocks](../README.md), the visual coding
platform. No base model, no fine-tuning, no pretrained knowledge. The
vocabulary is the ~70 characters that appear in the corpus, and the
corpus mentions nothing but CryptoBlocks — so the model physically
cannot talk about anything else. That is the whole point.

> Ask it about Shareplace, the sprite editor, or the pricing tiers and it
> answers. Ask it about the weather or Python pandas and it says *"I only
> know about CryptoBlocks."* — because that sentence is the only thing in
> its world that fits.

## Why from-scratch instead of a LoRA?

A LoRA on a 3B base gives you a fluent chatbot fast, but the base model
still knows the whole world underneath; "only knows CryptoBlocks" becomes
a behavior you coax, not a fact. Training from random weights makes the
constraint **architectural**: there is no other knowledge in there to
leak. The cost is that the corpus has to teach English *and* the facts,
which is why `corpus.py` leans so hard on combinatorial templating.

## Pipeline

```
facts.py     → the closed world: real product facts + a fictitious
               company wrapper (founding, team, HQ, pricing, contact).
               Nothing outside CryptoBlocks appears here.
corpus.py    → combinatorial Q&A generator. Every fact asked many ways,
               answered many ways → a multi-MB chat transcript.
data.py      → char tokenizer (vocab = chars in corpus) + batch loader.
model.py     → nanoGPT-shaped causal transformer, random init.
train.py     → MPS/CUDA/CPU training loop with cosine LR + val checkpoint.
chat.py      → prime with "U: <q>\nA:" and sample one turn.
```

## Run it

```bash
PY=../../werbosLLM/werbos/.venv/bin/python   # any python with torch

$PY corpus.py --target-mb 3          # → corpus.txt
$PY train.py  --iters 6000 --block-size 128 --out-dir ckpt
$PY chat.py   --out-dir ckpt         # interactive REPL
$PY chat.py   --out-dir ckpt --ask "what is shareplace"
```

Or the whole thing: `./run.sh`.

## Model

| | |
|---|---|
| Architecture | char-level GPT (6 layers, 6 heads, n_embd 240) |
| Params | ~4.2M |
| Vocab | ~70 characters (whatever the corpus contains) |
| Context | 128 chars (a full Q&A turn) |
| Trained on | ~3 MB synthetic CryptoBlocks corpus, from random init |
| Hardware | Apple MPS (also runs on CUDA / CPU) |

## What "knows only CryptoBlocks" looks like

The corpus is a closed world. The tokenizer can only emit characters it
saw. The weights never saw a sentence about anything else. So three
layers of containment all point the same way:

1. **Vocabulary** — can't spell words made of unseen characters.
2. **Weights** — no representation of any other topic exists to sample.
3. **Behavior** — off-topic questions were trained to deflect to
   *"I only know about CryptoBlocks."*

This is the smallest honest version of a single-project company brain:
the model is the cursor, the curated corpus is the entire world it can
walk.
