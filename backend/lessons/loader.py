import os
import json
from dotenv import load_dotenv


load_dotenv()


CORPUS_ROOT = os.getenv("CORPUS_ROOT")


DOCUMENT_FILE = os.path.join(
    CORPUS_ROOT,
    "shared",
    "documents.jsonl"
)


TARGET_FOLDERS = [
    "04_incident_reports",
    "07_work_orders",
    "08_inspection_calibration",
    "11_quality_compliance"
]


def load_lessons_documents():

    documents = []

    with open(DOCUMENT_FILE, "r", encoding="utf-8") as f:

        for line in f:

            doc = json.loads(line)

            path = doc.get("source_path", "")


            if any(folder in path for folder in TARGET_FOLDERS):

                documents.append(doc)


    return documents



if __name__ == "__main__":

    docs = load_lessons_documents()

    print("Total documents:", len(docs))


    for d in docs[:5]:

        print("\n----------------")
        print("Title:", d.get("title"))
        print("Type:", d.get("doc_type"))
        print("Path:", d.get("source_path"))