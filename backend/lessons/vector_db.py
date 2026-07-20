import chromadb

from sentence_transformers import SentenceTransformer

from backend.lessons.processor import process_csv
from backend.lessons.loader import load_lessons_documents


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


client = chromadb.PersistentClient(
    path="backend/lessons/chroma_db"
)


collection = client.get_or_create_collection(
    name="incident_lessons"
)


def store_incidents(records):

    texts = [
        r["text"]
        for r in records
    ]

    metadata = [
        r["metadata"]
        for r in records
    ]


    ids = [
        str(i)
        for i in range(len(records))
    ]


    vectors = model.encode(
        texts
    )


    collection.add(
        ids=ids,
        documents=texts,
        embeddings=vectors.tolist(),
        metadatas=metadata
    )


    print(
        "Stored:",
        len(records)
    )



if __name__ == "__main__":


    docs = load_lessons_documents()


    for doc in docs:

        path = doc.get("source_path","")


        if path.endswith(".csv"):

            records = process_csv(path)

            store_incidents(records)

            break