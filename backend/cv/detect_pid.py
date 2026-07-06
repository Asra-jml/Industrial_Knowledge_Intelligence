"""P&ID symbol detection demo + OCR tag reading.

    python -m backend.cv.detect_pid                 # trained model if available
    python -m backend.cv.detect_pid --ground-truth  # render provided YOLO labels

Saves annotated sample images to backend/cv/samples/ and prints any
equipment-tag-shaped text OCR finds. The public Digitize-PID drawings don't
contain DRP plant tags (P-101 lives in the registers), so this demonstrates
the CV/OCR capability, per the PRD's degrade-gracefully note.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw

from backend.core import config
from backend.ingestion.parsers import ocr

CV_DIR = Path(__file__).resolve().parent
SAMPLES_DIR = CV_DIR / "samples"
BEST_WEIGHTS = CV_DIR / "runs" / "pid_symbols" / "weights" / "best.pt"
TAG_RE = re.compile(r"\b[A-Z]{1,3}-?\d{2,4}\b")


def _sample_images(n: int) -> list[Path]:
    images = sorted((config.CORPUS_ROOT / "01_pids" / "images").glob("*.jpg"),
                    key=lambda p: int(p.stem))
    step = max(1, len(images) // n)
    return images[::step][:n]


def detect_with_model(image_paths: list[Path]) -> None:
    from ultralytics import YOLO

    model = YOLO(str(BEST_WEIGHTS))
    for img in image_paths:
        results = model.predict(str(img), conf=0.25, device="cpu", verbose=False)
        out = SAMPLES_DIR / f"{img.stem}_detected.jpg"
        results[0].save(str(out))
        print(f"[cv] {img.name}: {len(results[0].boxes)} symbols -> {out.name}")


def render_ground_truth(image_paths: list[Path]) -> None:
    for img_path in image_paths:
        label = config.CORPUS_ROOT / "01_pids" / "labels" / f"{img_path.stem}.txt"
        img = Image.open(img_path).convert("RGB")
        draw = ImageDraw.Draw(img)
        w, h = img.size
        count = 0
        for line in label.read_text().splitlines():
            parts = line.split()
            if len(parts) != 5:
                continue
            _, cx, cy, bw, bh = parts
            cx, cy, bw, bh = float(cx) * w, float(cy) * h, float(bw) * w, float(bh) * h
            draw.rectangle([cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2],
                           outline=(255, 60, 60), width=2)
            count += 1
        out = SAMPLES_DIR / f"{img_path.stem}_groundtruth.jpg"
        img.save(out)
        print(f"[cv] {img_path.name}: {count} labelled symbols -> {out.name}")


def ocr_tags(image_paths: list[Path]) -> None:
    if not ocr.available():
        print("[cv] Tesseract not available - skipping OCR pass")
        return
    for img_path in image_paths:
        text = ocr.image_to_text(Image.open(img_path))
        tags = sorted(set(TAG_RE.findall(text)))
        print(f"[cv] OCR {img_path.name}: {len(tags)} tag-shaped tokens "
              f"{tags[:12] if tags else ''}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ground-truth", action="store_true",
                    help="render provided YOLO labels instead of model inference")
    ap.add_argument("-n", type=int, default=5, help="number of sample images")
    args = ap.parse_args()

    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    samples = _sample_images(args.n)

    if not args.ground_truth and BEST_WEIGHTS.exists():
        detect_with_model(samples)
    else:
        if not args.ground_truth:
            print("[cv] no trained weights yet - rendering ground-truth labels")
        render_ground_truth(samples)
    ocr_tags(samples)


if __name__ == "__main__":
    main()
