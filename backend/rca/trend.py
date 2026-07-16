"""F3 — vibration trend model.

Fits a linear trend to each equipment's current degradation episode
(the trailing run of readings since the last healthy baseline) and
projects when it crosses the OEM alarm / trip limits from
equipment_master.csv. For P-101 the episode ended in the 2026-06-25 trip,
so the model back-tests itself: it reports the lead time an engineer
would have had if the alert had existed.
"""
from __future__ import annotations

from datetime import date, timedelta

import pandas as pd

from backend.core import config

_VIB_PATH = "08_inspection_calibration/condition_monitoring_vibration.csv"
_MASTER_PATH = "06_asset_register/equipment_master.csv"

_HEALTHY = {"normal", "normal_after_bearing_replaced"}


def _limits() -> dict[str, dict]:
    df = pd.read_csv(config.CORPUS_ROOT / _MASTER_PATH, dtype=str, keep_default_na=False)
    out = {}
    for row in df.to_dict(orient="records"):
        try:
            out[row["tag"]] = {
                "alarm": float(row["vibration_alarm_mm_s"]),
                "trip": float(row["vibration_trip_mm_s"]),
                "equipment_type": row.get("equipment_type", ""),
            }
        except (KeyError, ValueError):
            continue
    return out


def _series() -> pd.DataFrame:
    df = pd.read_csv(config.CORPUS_ROOT / _VIB_PATH, dtype=str, keep_default_na=False)
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df["value"] = df["DE_vibration_mm_s"].astype(float)
    return df.sort_values("date")


def _episode(rows: list[dict]) -> list[dict]:
    """Degradation episode to analyse.

    Active episode: the trailing run of readings since the last healthy
    baseline (anchor point included). If the equipment is currently healthy,
    fall back to the most recent COMPLETED episode that ended in a trip —
    that's the historical backtest (P-101's story)."""
    last_healthy = -1
    for i, r in enumerate(rows):
        if r["status"] in _HEALTHY:
            last_healthy = i
    if last_healthy != len(rows) - 1:
        return rows[max(0, last_healthy):]

    # currently healthy: look for the last trip and rebuild that episode
    trip_idx = next(
        (i for i in range(len(rows) - 1, -1, -1) if rows[i]["status"] == "trip"),
        None,
    )
    if trip_idx is None:
        return []
    baseline = 0
    for i in range(trip_idx):
        if rows[i]["status"] in _HEALTHY:
            baseline = i
    return rows[baseline: trip_idx + 1]


def _fit(episode: list[dict]) -> dict | None:
    if len(episode) < 3:
        return None
    x0 = episode[0]["date"]
    xs = [(r["date"] - x0).days for r in episode]
    ys = [r["value"] for r in episode]
    n = len(xs)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    ss_xy = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    ss_xx = sum((x - mean_x) ** 2 for x in xs)
    if ss_xx == 0:
        return None
    slope = ss_xy / ss_xx
    intercept = mean_y - slope * mean_x
    ss_tot = sum((y - mean_y) ** 2 for y in ys)
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in zip(xs, ys))
    r2 = 1 - ss_res / ss_tot if ss_tot else 0.0
    return {"slope_per_day": slope, "intercept": intercept, "origin": x0, "r2": r2}


def _cross_date(fit: dict, limit: float) -> date | None:
    if fit["slope_per_day"] <= 0:
        return None
    days = (limit - fit["intercept"]) / fit["slope_per_day"]
    return fit["origin"] + timedelta(days=days)


def equipment_list() -> list[dict]:
    df = _series()
    limits = _limits()
    out = []
    for tag, group in df.groupby("tag"):
        rows = group.to_dict(orient="records")
        latest = rows[-1]
        episode = _episode(rows)
        risk = "normal"
        if episode:
            statuses = {r["status"] for r in episode}
            if "trip" in statuses:
                risk = "tripped"
            elif "alarm" in statuses:
                risk = "alarm"
            elif "watch" in statuses:
                risk = "watch"
        out.append({
            "tag": tag,
            "readings": len(rows),
            "latest_value": latest["value"],
            "latest_date": latest["date"].isoformat(),
            "latest_status": latest["status"],
            "risk": risk,
            "alarm": limits.get(tag, {}).get("alarm"),
            "trip": limits.get(tag, {}).get("trip"),
        })
    order = {"tripped": 0, "alarm": 1, "watch": 2, "normal": 3}
    out.sort(key=lambda e: (order.get(e["risk"], 9), e["tag"]))
    return out


def trend(tag: str) -> dict | None:
    df = _series()
    group = df[df["tag"] == tag]
    if group.empty:
        return None
    limits = _limits().get(tag, {})
    alarm, trip = limits.get("alarm"), limits.get("trip")
    rows = group.to_dict(orient="records")
    series = [
        {"date": r["date"].isoformat(), "value": r["value"], "status": r["status"]}
        for r in rows
    ]

    episode = _episode(rows)
    fit = _fit(episode) if episode else None
    projection: list[dict] = []
    prediction: dict | None = None

    if fit and alarm and trip and fit["slope_per_day"] > 0:
        alarm_date = _cross_date(fit, alarm)
        trip_date = _cross_date(fit, trip)
        last = episode[-1]
        tripped = any(r["status"] == "trip" for r in episode)

        # projection line from episode start to (predicted or actual) trip
        end = trip_date or last["date"]
        span = max(1, (end - fit["origin"]).days)
        for step in range(0, span + 1, max(1, span // 12)):
            d = fit["origin"] + timedelta(days=step)
            projection.append({
                "date": d.isoformat(),
                "value": round(fit["intercept"] + fit["slope_per_day"] * step, 2),
            })

        if tripped:
            actual_trip = next(r["date"] for r in episode if r["status"] == "trip")
            alarm_cross = next(
                (r["date"] for r in episode if r["value"] >= alarm),
                actual_trip,
            )
            lead = (actual_trip - alarm_cross).days
            prediction = {
                "kind": "backtest",
                "predicted_trip": trip_date.isoformat() if trip_date else None,
                "actual_trip": actual_trip.isoformat(),
                "alarm_crossed": alarm_cross.isoformat(),
                "lead_days": lead,
                "note": (
                    f"Historical validation: DE vibration crossed the {alarm} mm/s "
                    f"alarm on {alarm_cross.isoformat()} — {lead} days before the "
                    f"{actual_trip.isoformat()} trip. A live alert would have "
                    "bought that lead time."
                ),
            }
        else:
            prediction = {
                "kind": "forecast",
                "predicted_alarm": alarm_date.isoformat() if alarm_date else None,
                "predicted_trip": trip_date.isoformat() if trip_date else None,
                "lead_days": (trip_date - last["date"]).days if trip_date else None,
                "note": (
                    f"At the current rate (+{fit['slope_per_day']:.03f} mm/s per day) "
                    f"{tag} crosses the {alarm} mm/s alarm "
                    + (f"around {alarm_date.isoformat()}" if alarm_date else "eventually")
                    + (f" and the {trip} mm/s trip around {trip_date.isoformat()}."
                       if trip_date else ".")
                ),
            }

    return {
        "tag": tag,
        "alarm": alarm,
        "trip": trip,
        "equipment_type": limits.get("equipment_type", ""),
        "series": series,
        "fit": {"slope_per_day": round(fit["slope_per_day"], 4), "r2": round(fit["r2"], 3)}
        if fit else None,
        "projection": projection,
        "prediction": prediction,
    }
