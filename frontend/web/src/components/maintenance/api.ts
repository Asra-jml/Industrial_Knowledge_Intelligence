import { RCAResponse } from "./types";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";



export async function analyzeRCA(
  equipment: string,
  fault: string
): Promise<RCAResponse> {


  const response = await fetch(
    `${API_URL}/api/rca/analyze`,
    {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },


      body: JSON.stringify({

        equipment,

        fault,

      }),

    }
  );



  if (!response.ok) {


    const error =
      await response.text();


    throw new Error(
      error ||
      "Failed to analyze equipment"
    );

  }



  return await response.json();

}