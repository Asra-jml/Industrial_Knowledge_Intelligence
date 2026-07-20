from backend.rca.vibration_analyzer import analyze_vibration


def predict_failure(equipment_id: str):

    data = analyze_vibration(equipment_id)

    if "error" in data:
        return {
            "risk": "UNKNOWN",
            "failure_mode": "Unknown",
            "probability": 0.0,
            "lead_time_days": None,
            "message": data["error"]
        }

    history = data.get("history", [])
    current = data.get("current_vibration", 0)
    status = data.get("latest_status")

    peak = max(history) if history else current

    # Equipment already repaired
    if status == "normal_after_bearing_replaced":

        return {
            "risk": "LOW",
            "failure_mode": "Bearing degradation (resolved)",
            "probability": 0.15,
            "lead_time_days": 30,
            "message": "Bearing replaced successfully. Equipment is healthy. Continue preventive monitoring."
        }

    # High Risk
    if current >= 7.1:

        return {
            "risk": "HIGH",
            "failure_mode": "Bearing Failure",
            "probability": 0.95,
            "lead_time_days": 7,
            "message": "Trip limit exceeded. Immediate shutdown and inspection recommended."
        }

    # Medium Risk
    if current >= 4.5:

        return {
            "risk": "MEDIUM",
            "failure_mode": "Bearing Degradation",
            "probability": 0.70,
            "lead_time_days": 14,
            "message": "Alarm limit exceeded. Schedule maintenance within two weeks."
        }

    # Historical degradation
    if peak >= 7.1:

        return {
            "risk": "MEDIUM",
            "failure_mode": "Historical Bearing Degradation",
            "probability": 0.75,
            "lead_time_days": 14,
            "message": "Historical vibration crossed trip limit. Continue close monitoring."
        }

    # Normal
    return {
        "risk": "LOW",
        "failure_mode": "No Active Failure",
        "probability": 0.10,
        "lead_time_days": 30,
        "message": "Equipment operating normally."
    }