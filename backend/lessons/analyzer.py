import os
import json
from dotenv import load_dotenv
from groq import Groq


load_dotenv()


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_pattern(incidents):

    text = "\n\n".join(incidents)


    prompt = f"""
You are an industrial safety expert.

Analyze these historical incidents.

Find:

1. Common failure patterns
2. Repeated risks
3. Possible root causes
4. Lessons learned
5. Preventive actions


Incidents:

{text}


Return ONLY valid JSON.

Format:

{{
"pattern_found":"",
"root_causes":[],
"repeated_risks":[],
"lessons_learned":[],
"preventive_actions":[]
}}
"""


    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0
    )


    output = response.choices[0].message.content


    return json.loads(output)



if __name__ == "__main__":

    sample = [

        "Critical risk: Pressurized Systems, Accident level I",

        "Critical risk: Pressurized Systems, Third Party worker",

        "Critical risk: Pressed equipment failure"
    ]


    result = analyze_pattern(sample)


    print(json.dumps(
        result,
        indent=2
    ))