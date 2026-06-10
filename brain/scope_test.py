"""Prove the brain only knows CryptoBlocks.

Asks a batch of ON-topic questions (should get real CryptoBlocks facts)
and a batch of OFF-topic questions (should deflect or, at worst, produce
CryptoBlocks word-salad — never a coherent answer about the outside
world, because no such text exists in its weights).

    python scope_test.py --out-dir ckpt
"""

from __future__ import annotations

import argparse

import torch

from chat import answer, load, pick_device

ON_TOPIC = [
    "what is cryptoblocks",
    "what is shareplace",
    "how much does cryptoblocks cost",
    "who founded cryptoblocks",
    "where is cryptoblocks based",
    "how many blocks are there",
    "what is the sprite editor",
    "how is cryptoblocks different from scratch",
]

OFF_TOPIC = [
    "what are pancakes",
    "what is the weather today",
    "who is the president",
    "how do i fix my car",
    "what is the capital of japan",
    "tell me about quantum physics",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default="ckpt")
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--top-k", type=int, default=40)
    args = ap.parse_args()

    device = pick_device()
    model, tok, cfg = load(args.out_dir, device)

    def ask(q):
        return answer(model, tok, cfg, device, q, args.temperature,
                      args.top_k)

    print("=" * 70)
    print("ON-TOPIC — should return real CryptoBlocks facts")
    print("=" * 70)
    for q in ON_TOPIC:
        print(f"\n  Q: {q}\n  A: {ask(q)}")

    print("\n" + "=" * 70)
    print("OFF-TOPIC — should deflect, or fall back to CryptoBlocks salad.")
    print("It has NO coherent answer about any of these — by construction.")
    print("=" * 70)
    for q in OFF_TOPIC:
        print(f"\n  Q: {q}\n  A: {ask(q)}")
    print()


if __name__ == "__main__":
    main()
