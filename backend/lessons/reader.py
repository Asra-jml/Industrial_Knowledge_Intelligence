import pandas as pd
from backend.lessons.loader import load_lessons_documents


def read_csv_file(path):

    try:
        df = pd.read_csv(path)

        print("\nFILE:", path)

        print("\nColumns:")
        print(df.columns.tolist())

        print("\nSample:")
        print(df.head(3).to_string())

        return df

    except Exception as e:
        print("Error:", e)



if __name__ == "__main__":

    docs = load_lessons_documents()

    for doc in docs:

        path = doc.get("source_path", "")

        if path.endswith(".csv"):

            read_csv_file(path)

            break