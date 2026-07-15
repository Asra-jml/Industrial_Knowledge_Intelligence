import pandas as pd
from backend.lessons.loader import load_lessons_documents


def process_csv(path):

    df = pd.read_csv(path)

    records = []

    for _, row in df.iterrows():

        text = f"""
Industry sector: {row.get('Local Industry Sector', 'Unknown')}

Accident level:
{row.get('Accident Level')}

Potential accident level:
{row.get('Potential Accident Level')}

Critical risk:
{row.get('Risco Critico')}

Employee type:
{row.get('Employee ou Terceiro')}
"""

        records.append(
            {
                "type": "incident",
                "text": text.strip(),
                "metadata": {
                    "sector": row.get('Local Industry Sector', 'Unknown'),
                    "risk": row.get('Risco Critico'),
                    "level": row.get('Accident Level')
                }
            }
        )

    return records



if __name__ == "__main__":

    docs = load_lessons_documents()

    for doc in docs:

        path = doc.get("source_path", "")

        if path.endswith(".csv"):

            data = process_csv(path)

            print("Total records:", len(data))

            print("\nSample:")
            print(data[0])

            break