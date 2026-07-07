export default function LessonsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(77,163,255,0.1)] flex items-center justify-center border border-[rgba(77,163,255,0.2)]">
        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Lessons Learned & Failure Intelligence</h1>
      <p className="text-[var(--text-muted)] max-w-md">
        F5: Surfaces systemic patterns from incident reports and external industry databases.
      </p>
      <div className="px-4 py-2 mt-4 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)]">
        Pending Implementation (Owner: Shared)
      </div>
    </div>
  );
}
