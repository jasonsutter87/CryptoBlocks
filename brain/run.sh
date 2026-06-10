#!/usr/bin/env bash
# Build the corpus, train the CryptoBlocks brain from scratch, then chat.
set -euo pipefail
cd "$(dirname "$0")"

PY="${PY:-../../werbosLLM/werbos/.venv/bin/python}"
TARGET_MB="${TARGET_MB:-3}"
ITERS="${ITERS:-6000}"

echo "==> generating corpus (${TARGET_MB} MB)"
"$PY" corpus.py --target-mb "$TARGET_MB"

echo "==> training from scratch (${ITERS} iters)"
"$PY" train.py --iters "$ITERS" --block-size 128 --batch-size 64 \
    --eval-every 500 --out-dir ckpt

echo "==> done. chat with it:"
echo "    $PY chat.py --out-dir ckpt"
