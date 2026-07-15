from backend.lessons.search import search_incidents
from backend.lessons.analyzer import analyze_pattern



def generate_alert(query):

    result = search_incidents(query)


    incidents = result.get(
        "documents",
        [[]]
    )[0]


    if len(incidents) >= 3:

        analysis = analyze_pattern(
            incidents
        )


        if len(incidents) >= 5:
            risk = "HIGH"
        else:
            risk = "MEDIUM"


        return {
            "risk": risk,

            "message":
            "Similar historical incidents detected",

            "matched_cases":
            len(incidents),

            "analysis":
            analysis
        }


    return {
        "risk":"LOW",

        "message":
        "No significant historical pattern found",

        "matched_cases":
        len(incidents)
    }



if __name__ == "__main__":

    import json


    alert = generate_alert(
        "pressure system leakage"
    )


    print(
        json.dumps(
            alert,
            indent=2
        )
    )