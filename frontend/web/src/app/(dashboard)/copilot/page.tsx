export default function CopilotPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(77,163,255,0.1)] flex items-center justify-center border border-[rgba(77,163,255,0.2)]">
        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Expert Knowledge Copilot</h1>
      <p className="text-[var(--text-muted)] max-w-md">
        F2: Conversational AI answering queries across the full corpus with citations, confidence scores, and links to source documents.
      </p>
      <div className="px-4 py-2 mt-4 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)]">
        Pending Implementation (Owner: Teammate 2)
      </div>
    </div>
  );
}
