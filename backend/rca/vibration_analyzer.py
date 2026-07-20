from pathlib import Path

import pandas as pd

from backend.core import config


ALARM_LIMIT = 4.5
TRIP_LIMIT = 7.1


def analyze_vibration(equipment_id: str):

    csv_path = (
        Path(config.CORPUS_ROOT)
        / "08_inspection_calibration"
        / "condition_monitoring_vibration.csv"
    )


    df = pd.read_csv(csv_path)


    df = df[
        df["tag"] == equipment_id
    ]


    if df.empty:
        return {
            "error": f"No vibration data found for {equipment_id}"
        }


    # sort chronologically if date column exists

    date_columns = [
        col for col in df.columns
        if "date" in col.lower()
        or "time" in col.lower()
    ]


    if date_columns:
        df = df.sort_values(
            by=date_columns[0]
        )


    # latest actual reading

    vibration_values = (
        df["DE_vibration_mm_s"]
        .astype(float)
        .tolist()
    )


    latest_vibration = vibration_values[-1]


    if latest_vibration >= TRIP_LIMIT:

        condition = "TRIP"


    elif latest_vibration >= ALARM_LIMIT:

        condition = "ALARM"


    else:

        condition = "NORMAL"



    return {

    "equipment": equipment_id,

    "current_vibration": latest_vibration,

    "condition": condition,

    "alarm_limit": ALARM_LIMIT,

    "trip_limit": TRIP_LIMIT,

    "history": vibration_values,

    "latest_status": df.iloc[-1].get("status", None),

    "trend":
        "INCREASING"
        if vibration_values[-1] > vibration_values[0]
        else "STABLE"

}