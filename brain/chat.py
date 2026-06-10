"""Chat with the trained CryptoBlocks brain.

Primes the model with "U: <your question>\nA:" and samples until the
blank-line turn separator. Because the model was trained from scratch on
the CryptoBlocks corpus alone, every answer it can produce is about
CryptoBlocks — there is nothing else in there.

Usage:
    python chat.py                       # interactive REPL
    python chat.py --ask "what is cryptoblocks"
    python chat.py --temperature 0.6
"""

from __future__ import annotations

import argparse
import os

import torch

from data import CharTokenizer
from model import GPT, load_config


def load(out_dir: str, device: str):
    cfg = load_config(os.path.join(out_dir, "config.json"))
    tok = CharTokenizer.load(os.path.join(out_dir, "vocab.json"))
    model = GPT(cfg).to(device)
    state = torch.load(os.path.join(out_dir, "model.pt"), map_location=device)
    model.load_state_dict(state)
    model.eval()
    return model, tok, cfg


def pick_device() -> str:
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def answer(model, tok, cfg, device, question: str, temperature: float,
           top_k: int) -> str:
    prompt = f"U: {question.strip()}\nA:"
    ids = torch.tensor([tok.encode(prompt)], dtype=torch.long, device=device)
    # Stop pair = two consecutive newlines (the turn separator).
    nl = tok.stoi.get("\n")
    stop = {(nl, nl)} if nl is not None else None
    out = model.generate(ids, max_new_tokens=400, temperature=temperature,
                         top_k=top_k, stop_ids=stop)
    text = tok.decode(out[0].tolist())
    # Take just this turn's answer.
    reply = text[len(prompt):]
    reply = reply.split("\n\n")[0].split("U:")[0].strip()
    return _trim_to_last_sentence(reply) or "(no answer)"


def _trim_to_last_sentence(reply: str) -> str:
    """The longest answers exceed the training context window, so the model
    never sees the \\n\\n stop token after them and rambles into periodless
    word-salad once the real answer ends. Since every fact ends in . ! or ?
    and the trailing garble does not, cut at the last sentence-ender — that
    keeps the full coherent answer and drops the tail. (Belt-and-suspenders
    with shorter corpus answers; see corpus.py.)"""
    end = max(reply.rfind("."), reply.rfind("!"), reply.rfind("?"))
    return reply[:end + 1].strip() if end != -1 else reply


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default="ckpt")
    ap.add_argument("--ask", default=None)
    ap.add_argument("--temperature", type=float, default=0.3)
    ap.add_argument("--top-k", type=int, default=10)
    args = ap.parse_args()

    device = pick_device()
    model, tok, cfg = load(args.out_dir, device)

    if args.ask is not None:
        print(answer(model, tok, cfg, device, args.ask,
                     args.temperature, args.top_k))
        return

    print("CryptoBlocks brain — ask me anything about CryptoBlocks.")
    print("(Ctrl-C or empty line to quit)\n")
    try:
        while True:
            q = input("you> ").strip()
            if not q:
                break
            print("cb >", answer(model, tok, cfg, device, q,
                                 args.temperature, args.top_k), "\n")
    except (KeyboardInterrupt, EOFError):
        print()


if __name__ == "__main__":
    main()
