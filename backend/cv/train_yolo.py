"""Fine-tune YOLOv8n on the Digitize-PID symbol labels (CPU-friendly).

    python -m backend.cv.train_yolo            # defaults: 15 epochs, imgsz 640
    YOLO_EPOCHS=30 python -m backend.cv.train_yolo

Writes runs to backend/cv/runs/pid_symbols*/ (best.pt + results.csv with mAP).
"""
from __future__ import annotations

import os
from pathlib import Path

from backend.cv.prepare_dataset import DATASET_DIR, main as prepare

CV_DIR = Path(__file__).resolve().parent


def main() -> None:
    data_yaml = DATASET_DIR / "data.yaml"
    if not data_yaml.exists():
        data_yaml = prepare()

    from ultralytics import YOLO

    model = YOLO("yolov8n.pt")   # downloads the 6 MB base weights on first run
    results = model.train(
        data=str(data_yaml),
        epochs=int(os.getenv("YOLO_EPOCHS", "15")),
        imgsz=int(os.getenv("YOLO_IMGSZ", "640")),
        batch=int(os.getenv("YOLO_BATCH", "8")),
        device="cpu",
        workers=2,
        project=str(CV_DIR / "runs"),
        name="pid_symbols",
        exist_ok=True,
        verbose=True,
        plots=True,
    )
    metrics = getattr(results, "results_dict", {}) or {}
    print("[cv] training complete")
    print(f"[cv] mAP50: {metrics.get('metrics/mAP50(B)', 'see results.csv')}")
    print(f"[cv] best weights: {CV_DIR / 'runs' / 'pid_symbols' / 'weights' / 'best.pt'}")


if __name__ == "__main__":
    main()
