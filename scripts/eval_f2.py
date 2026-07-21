"""F2 benchmark evaluation — runs the 15 domain-expert questions from
SharedCorpus/eval/benchmark_questions.md through the copilot and scores them.

A question passes when BOTH hold:
  cited   — at least one expected source document appears in the citations
  correct — at least half of the expected answer terms appear in the answer

PRD §2 target: >= 12/15 correct + cited.

Usage:  python scripts/eval_f2.py [--verbose]
"""
from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.core import config                       # noqa: E402
from backend.rag.answer import ask                    # noqa: E402

BENCHMARK = config.CORPUS_ROOT / "eval" / "benchmark_questions.md"

_Q_RE = re.compile(
    r"### Q(\d+)\.\s*(.+?)\n- expected_sources:\s*(.+?)\n- expected_answer_terms:\s*(.+?)(?:\n|$)",
    re.DOTALL,
)


def load_benchmark() -> list[dict]:
    text = BENCHMARK.read_text(encoding="utf-8")
    questions = []
    for m in _Q_RE.finditer(text):
        questions.append({
            "n": int(m.group(1)),
            "question": " ".join(m.group(2).split()),
            "sources": [s.strip() for s in m.group(3).split(",")],
            "terms": [t.strip() for t in m.group(4).split(",")],
        })
    return questions


def score(q: dict, response: dict) -> dict:
    cited_docs = " ".join(c["doc_id"] for c in response["citations"])
    cited = any(src in cited_docs for src in q["sources"])
    answer_lower = response["answer"].lower()
    hits = [t for t in q["terms"] if t.lower() in answer_lower]
    correct = len(hits) * 2 >= len(q["terms"])
    return {
        "cited": cited,
        "correct": correct,
        "passed": cited and correct,
        "term_hits": hits,
        "mode": response["mode"],
        "confidence": response["confidence"],
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    questions = load_benchmark()
    if len(questions) != 15:
        print(f"WARNING: expected 15 questions, parsed {len(questions)}")

    passed = 0
    print("F2 BENCHMARK — 15 domain-expert questions")
    print("=" * 64)
    for q in questions:
        response = ask(q["question"])
        result = score(q, response)
        passed += result["passed"]
        flag = "PASS" if result["passed"] else (
            "MISS-CITE" if not result["cited"] else "MISS-FACT"
        )
        print(f"  {flag:9s} Q{q['n']:>2}  {q['question'][:58]}")
        if args.verbose and not result["passed"]:
            print(f"            terms hit: {result['term_hits']} / {q['terms']}")
            print(f"            cited: {[c['doc_id'] for c in response['citations']][:4]}")
            print(f"            answer: {response['answer'][:220]}")
        time.sleep(5)   # pace for free-tier tokens-per-minute limits

    print("=" * 64)
    target = "MET" if passed >= 12 else "NOT MET"
    print(f"RESULT: {passed}/15 correct + cited  (PRD target >= 12/15: {target})")
    return 0 if passed >= 12 else 1


if __name__ == "__main__":
    main = main  # noqa: PLW0127
    sys.exit(main())
