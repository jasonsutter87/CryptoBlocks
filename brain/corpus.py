"""Generate the synthetic training corpus for the CryptoBlocks brain.

A from-scratch char-level model has to learn English AND the facts from
this text alone. The trick is combinatorial templating: every fact gets
asked many ways and answered many ways, so the model sees enough varied
English to become fluent while every sentence reinforces the same small
closed world — CryptoBlocks and nothing else.

Format is a simple chat transcript the model learns to continue:

    U: <question>
    A: <answer>

(blank line between turns). At inference we prime with "U: ...\nA:" and
sample until the blank line. See chat.py.

Usage:
    python corpus.py                  # ~3 MB to corpus.txt
    python corpus.py --target-mb 6    # bigger = more fluent, slower train
    python corpus.py --out other.txt
"""

from __future__ import annotations

import argparse
import random

import facts as F

SEP = "\n\n"          # turn separator
U, A = "U: ", "A: "   # speaker tags


def _turn(q: str, a: str) -> str:
    return f"{U}{q}\n{A}{a}{SEP}"


# DETERMINISTIC answer starts. An earlier version randomized these
# ("Good question.", "So,", "Yes!" ...) which decoupled the answer from
# the question right at the A: junction — the model learned fluent
# CryptoBlocks English but picked a *random* fact instead of the matching
# one. A factual brain wants one answer per question, varied only on the
# QUESTION side. So: every answer is now a deterministic function of its
# question. Yes/no questions get a single fixed "Yes. " lead.
AFFIRM = ["Yes. "]
LEAD = [""]


def _cap(s: str) -> str:
    return s[:1].upper() + s[1:] if s else s


def feature_turns(rng: random.Random) -> list[str]:
    """Q&A over every real product feature, asked and answered many ways."""
    out: list[str] = []
    q_templates = [
        "what is {t}",
        "whats {t}",
        "what's {t}",
        "tell me about {t}",
        "does cryptoblocks have {t}",
        "do you have {t}",
        "how does {t} work in cryptoblocks",
        "how does {t} work",
        "can you explain {t}",
        "what can you tell me about {t}",
        "is there {t} in cryptoblocks",
        "is there {t}",
        "i want to know about {t}",
        "what about {t}",
        "how do i use {t}",
        "{t}?",
    ]
    for topic, desc in F.FEATURES:
        for qt in q_templates:
            q = qt.format(t=topic)
            lead = rng.choice(LEAD)
            if qt.startswith(("does", "is there", "can you")):
                ans = rng.choice(AFFIRM) + lead + desc
            else:
                ans = lead + desc
            out.append(_turn(q, _cap(ans.strip())))
    return out


def company_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    c = F.COMPANY
    pairs = [
        (["when was cryptoblocks founded", "what year did cryptoblocks "
          "start", "how old is cryptoblocks", "when did cryptoblocks begin"],
         c["founded"]),
        (["where is cryptoblocks based", "where is cryptoblocks located",
          "where are you based", "what city is cryptoblocks in",
          "where is cryptoblocks headquartered"], c["hq"]),
        (["how big is the cryptoblocks team", "how many people work at "
          "cryptoblocks", "how large is cryptoblocks"], c["team_size"]),
        (["what is the mission of cryptoblocks", "what is cryptoblocks "
          "trying to do", "why does cryptoblocks exist", "what is the goal "
          "of cryptoblocks"], c["mission"]),
        (["who founded cryptoblocks", "who made cryptoblocks", "who is the "
          "founder", "who created cryptoblocks", "who built cryptoblocks",
          "who made this", "who made it", "who built this", "who created this",
          "who is behind cryptoblocks", "who is behind this", "who runs "
          "cryptoblocks", "who owns cryptoblocks"],
         c["founder"]),
        (["how do i contact support", "what is the support email", "how do "
          "i get help", "how can i reach you", "contact"],
         c["support_email"]),
        (["what is the website", "where is cryptoblocks online", "what is "
          "the url"], c["website"]),
        (["what are your values", "what will cryptoblocks never do", "what "
          "does cryptoblocks stand for"], c["values"]),
    ]
    for questions, ans in pairs:
        for q in questions:
            out.append(_turn(q, _cap(rng.choice(LEAD) + ans)))
    # Values, one per turn too.
    for v in F.VALUES_LIST:
        for q in ["what is a value of cryptoblocks", "tell me a value",
                  "what does cryptoblocks promise"]:
            out.append(_turn(q, v))
    return out


def pricing_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    for plan, desc in F.PRICING:
        for q in [f"what is in the {plan} plan", f"tell me about the {plan} "
                  f"plan", f"what does the {plan} plan include",
                  f"{plan} plan"]:
            out.append(_turn(q, _cap(rng.choice(LEAD) + desc)))
    for q in ["how much does cryptoblocks cost", "how much does it cost",
              "how much is it", "how much is cryptoblocks", "whats the cost",
              "what is the cost", "is cryptoblocks free", "is it free",
              "is it really free", "is there a free version", "is it paid",
              "is cryptoblocks paid", "does it cost anything", "do i have to pay",
              "do i need to pay", "do you have to pay", "what are the plans",
              "what is the pricing", "what does it cost", "how do i pay"]:
        ans = ("CryptoBlocks has three plans. " + F.PRICING[0][1] + " " +
               F.PRICING[1][1] + " " + F.PRICING[2][1])
        out.append(_turn(q, ans))
    for q in ["how does cryptoblocks make money", "what is the business "
              "model", "what is free and what is paid"]:
        out.append(_turn(q, F.MONETIZATION_LINE))
    return out


def pitch_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    pitch = " ".join(F.PITCH_STEPS)
    for q in ["what is cryptoblocks", "what is cryptoblocks about",
              "explain cryptoblocks", "give me the pitch", "what do you do",
              "what is this", "describe cryptoblocks", "tell me about "
              "cryptoblocks"]:
        out.append(_turn(q, F.TAGLINE + " " + pitch))
    for q in ["how does it work", "how do i use cryptoblocks", "what are the "
              "steps", "how do i get started", "what is the flow"]:
        out.append(_turn(q, pitch))
    # Each pitch step on its own.
    step_qs = ["what is step one", "what is step two", "what is step three",
               "what is step four"]
    for q, step in zip(step_qs, F.PITCH_STEPS):
        out.append(_turn(q, step))
    return out


def origin_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    for q in ["what is the origin story", "how did cryptoblocks start",
              "where did cryptoblocks come from", "tell me the backstory",
              "why is it called cryptoblocks", "what is the history"]:
        out.append(_turn(q, F.ORIGIN_STORY))
    return out


def category_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    listing = ", ".join(F.CATEGORIES) + "."
    for q in ["what categories are there", "list the block categories",
              "what kinds of blocks are there", "what are the categories",
              "how many categories are there"]:
        out.append(_turn(q, "The 24 block categories are " + listing))
    for cat in F.CATEGORIES:
        for q in [f"is there a {cat} category", f"do you have {cat} blocks"]:
            out.append(_turn(q, f"Yes, {cat} is one of the 24 block "
                                f"categories in CryptoBlocks."))
    return out


def tech_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    for layer, tech in F.TECH_STACK:
        for q in [f"what powers {layer}", f"what tech is {layer}",
                  f"what is {layer} built with", f"what does {layer} use"]:
            out.append(_turn(q, _cap(f"{layer} uses {tech}.")))
    for q in ["what is the tech stack", "what is cryptoblocks built with",
              "what technology does cryptoblocks use"]:
        ans = "CryptoBlocks is built with " + ", ".join(
            t for _, t in F.TECH_STACK[:5]) + ", and more."
        out.append(_turn(q, ans))
    return out


def compare_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    for c in F.COMPARISONS:
        for q in ["how is cryptoblocks different from scratch", "cryptoblocks "
                  "vs scratch", "why not just use scratch", "what makes "
                  "cryptoblocks different", "how does it compare to scratch"]:
            out.append(_turn(q, c))
    return out


def identity_turns(rng: random.Random) -> list[str]:
    out: list[str] = []
    for q in ["who are you", "what are you", "what is your name", "introduce "
              "yourself", "hello", "hi", "hey"]:
        out.append(_turn(q, F.IDENTITY))
    return out


# Off-topic deflection. The model literally cannot know these answers, so
# we teach it the honest move: say it only knows CryptoBlocks. The closed
# vocabulary keeps it on-world even when refusing.
OFFTOPIC_Q = [
    "what is the weather", "who is the president", "what is the capital of "
    "france", "tell me a joke", "what time is it", "what is the stock price",
    "who won the game", "what is your favorite movie", "how do i cook rice",
    "what is the meaning of life", "do you know python pandas", "write me a "
    "poem about love", "what is the news today", "how old am i",
]
DEFLECT = (
    "I only know about CryptoBlocks, the visual coding platform. Ask me "
    "anything about CryptoBlocks and I will help."
)


def offtopic_turns(rng: random.Random) -> list[str]:
    return [_turn(q, DEFLECT) for q in OFFTOPIC_Q]


def _fixed(questions: list[str], ans: str) -> list[str]:
    """Many question phrasings -> one fixed answer."""
    return [_turn(q, ans) for q in questions]


def language_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "what languages can i use", "what languages does it support",
        "what programming languages", "what programming languages does it use",
        "what languages does cryptoblocks use", "is it javascript or python",
        "does it teach python", "does it support python", "can i write python",
        "can i use python", "does it teach javascript", "can i write javascript",
        "can i use javascript", "does it use real code", "is it real code",
        "what code does it output", "what language do the blocks make",
    ], F.DUAL_LANGUAGE)


def blocks_count_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "how many blocks are there", "how many blocks", "how many blocks does "
        "cryptoblocks have", "how many blocks does it have", "number of blocks",
        "how many total blocks", "what is the block count",
    ], F.BLOCKS_COUNT)


def age_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "what age is it for", "what ages is it for", "what age is cryptoblocks "
        "for", "how old do you have to be", "how old do i have to be",
        "is it for kids", "is it for adults", "is it for teens", "is it for "
        "beginners", "is it good for beginners", "what grade level", "who is "
        "cryptoblocks for", "who is it for", "can my kid use this", "can my "
        "child use it", "is it for young kids", "is it too hard for kids",
    ], F.AGES)


def platform_turns(rng: random.Random) -> list[str]:
    out = _fixed([
        "does it work in a browser", "what browsers work", "does it work on "
        "chromebook", "does it work on a chromebook", "does it run on "
        "chromebooks", "do i need to install anything", "do i have to install "
        "anything", "what do i need to run it", "what devices work", "what "
        "devices does it work on", "does it work on windows", "does it work on "
        "mac", "does it work on linux",
    ], F.BROWSER_SUPPORT)
    out += _fixed([
        "can i use it offline", "does it work offline", "is there an offline "
        "mode", "does it need internet", "is there a desktop app", "is there a "
        "desktop version", "can i install it", "can i download it",
    ], F.OFFLINE)
    out += _fixed([
        "do you have a mobile app", "is there a mobile app", "is there an app",
        "do you have an app", "does it have an app", "does it work on my phone",
        "can i use it on my phone", "can i use it on a tablet", "does it work "
        "on mobile", "is there an ios app", "is there an android app",
        "is there an iphone app",
    ], F.MOBILE)
    return out


def privacy_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "is my data safe", "is my data secure", "is it safe", "is it safe for "
        "kids", "is it secure", "do you sell my data", "do you sell user data",
        "do you show ads", "are there ads", "is it private", "what about "
        "privacy", "how do you handle data", "how do you handle my data",
        "what do you do with my data", "is it child safe", "is it coppa "
        "compliant",
    ], F.PRIVACY)


def saving_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "how do i save my work", "how do i save", "does it save my work",
        "can i save my project", "can i save my work", "is there autosave",
        "does it autosave", "will i lose my work", "can i undo", "can i go "
        "back", "is there version control", "can i roll back", "can i see my "
        "history",
    ], F.SAVING)


def roadmap_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "whats new", "what is new", "what's new", "what is coming next",
        "what is coming", "what is on the roadmap", "what is the roadmap",
        "what are you working on", "what is next for cryptoblocks", "what is "
        "next", "future features", "what features are coming",
    ], F.WHATS_NEW)


def teacher_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "can teachers use it", "is there anything for teachers", "is it good "
        "for classrooms", "can i use this in my classroom", "can i use it in "
        "class", "is there a teacher mode", "do you support schools", "is it "
        "for schools", "can schools use it", "is there a classroom version",
        "what do you have for teachers",
    ], F.TEACHERS)


def sharing_turns(rng: random.Random) -> list[str]:
    return _fixed([
        "can i share my project", "how do i share", "how do i share my "
        "project", "can i publish my project", "how do i publish", "can other "
        "people see my project", "can i share my work", "can others use my "
        "blocks", "how do i put my project online",
    ], F.SHARING)


GENERATORS = [
    feature_turns, company_turns, pricing_turns, pitch_turns, origin_turns,
    category_turns, tech_turns, compare_turns, identity_turns, offtopic_turns,
    language_turns, blocks_count_turns, age_turns, platform_turns,
    privacy_turns, saving_turns, roadmap_turns, teacher_turns, sharing_turns,
]


def build(target_mb: float, seed: int = 1234) -> str:
    rng = random.Random(seed)
    base: list[str] = []
    for gen in GENERATORS:
        base.extend(gen(rng))
    # Repeat the base set (reshuffled each pass) until we hit the target
    # size. Repetition with shuffling is exactly what lets a tiny model
    # memorize the facts while still seeing them in varied local context.
    target_bytes = int(target_mb * 1024 * 1024)
    chunks: list[str] = []
    size = 0
    while size < target_bytes:
        rng.shuffle(base)
        for t in base:
            chunks.append(t)
            size += len(t)
            if size >= target_bytes:
                break
    return "".join(chunks)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--target-mb", type=float, default=3.0)
    ap.add_argument("--out", default="corpus.txt")
    ap.add_argument("--seed", type=int, default=1234)
    args = ap.parse_args()

    text = build(args.target_mb, args.seed)
    with open(args.out, "w") as f:
        f.write(text)

    vocab = sorted(set(text))
    n_turns = text.count(SEP)
    print(f"wrote {args.out}: {len(text)/1024/1024:.2f} MB, "
          f"{n_turns} turns, vocab {len(vocab)} chars")
    print("vocab:", "".join(vocab).replace("\n", "\\n"))


if __name__ == "__main__":
    main()
