import type { LessonsResponse } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function analyzeLessons(
  query: string
): Promise<LessonsResponse> {

  const res = await fetch(
    `${API_BASE}/api/lessons/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to analyze lessons.");
  }

  return res.json();
}