import json
import os
from dotenv import load_dotenv
load_dotenv()


GRAPH_PATH = os.path.join(
    os.getenv("CORPUS_ROOT"),
    "shared",
    "graph.json"
)






def add_lessons_to_graph(analysis):

    with open(GRAPH_PATH,"r") as f:
        graph = json.load(f)


    edges = graph["edges"]


    pattern = (
        "FailurePattern:"
        + analysis["pattern_found"]
    )


    for cause in analysis["root_causes"]:

        edges.append(
            {
                "source": pattern,
                "target": "RootCause:" + cause,
                "rel": "CAUSED_BY",
                "props": {}
            }
        )


    for lesson in analysis["lessons_learned"]:

        edges.append(
            {
                "source": pattern,
                "target": "Lesson:" + lesson,
                "rel": "HAS_LESSON",
                "props": {}
            }
        )


    for action in analysis["preventive_actions"]:

        edges.append(
            {
                "source": pattern,
                "target": "Action:" + action,
                "rel": "RECOMMENDS",
                "props": {}
            }
        )


    graph["edge_count"] = len(edges)


    with open(GRAPH_PATH,"w") as f:

        json.dump(
            graph,
            f,
            indent=2
        )


    print(
        "Lessons added to graph"
    )



if __name__=="__main__":


    sample_analysis={

        "pattern_found":
        "Pressurized Systems failure",

        "root_causes":[
            "Inadequate maintenance",
            "Insufficient training"
        ],

        "lessons_learned":[
            "Regular maintenance and inspections are crucial"
        ],

        "preventive_actions":[
            "Implement regular maintenance schedules"
        ]
    }


    add_lessons_to_graph(
        sample_analysis
    )