from sentence_transformers import SentenceTransformer
from backend.lessons.processor import process_csv
from backend.lessons.loader import load_lessons_documents


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def create_embeddings(records):

    texts = [
        r["text"]
        for r in records
    ]

    vectors = model.encode(
        texts
    )

    return vectors



if __name__ == "__main__":

    docs = load_lessons_documents()


    for doc in docs:

        path = doc.get("source_path", "")

        if path.endswith(".csv"):

            records = process_csv(path)

            vectors = create_embeddings(records)


            print("Total records:", len(records))

            print(
                "Vector dimension:",
                len(vectors[0])
            )

            print(
                "First vector:",
                vectors[0][:5]
            )

            break