import LessonDashboard from "@/components/lessons/LessonDashboard";

export default function LessonsPage() {
  return (
    <main className="space-y-8">

      <div className="space-y-3">

        <h1 className="text-4xl font-bold tracking-tight text-white">
          Lessons Learned & Failure Intelligence Engine
        </h1>

        <p className="max-w-4xl text-zinc-400 leading-7">
          Analyze incident reports, near-miss records, audit findings,
          quality non-conformances, and historical operational data to
          identify recurring failure patterns. The AI engine detects
          systemic risks across organizational knowledge, generates
          lessons learned, and proactively recommends preventive actions
          before similar conditions recur.
        </p>

      </div>

      <LessonDashboard />

    </main>
  );
}