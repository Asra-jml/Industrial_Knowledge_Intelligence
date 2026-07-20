import chromadb
from sentence_transformers import SentenceTransformer


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


client = chromadb.PersistentClient(
    path="backend/lessons/chroma_db"
)


collection = client.get_collection(
    name="incident_lessons"
)



def search_incidents(query):

    vector = model.encode(
        query
    )


    result = collection.query(
        query_embeddings=[
            vector.tolist()
        ],
        n_results=5
    )


    return result



if __name__ == "__main__":


    query = "pressure system high risk accident"


    result = search_incidents(query)


    print("\nSimilar incidents:\n")


    for i, doc in enumerate(
        result["documents"][0]
    ):

        print(
            "----",
            i+1
        )

        print(doc)


        print(
            "Metadata:",
            result["metadatas"][0][i]
        )