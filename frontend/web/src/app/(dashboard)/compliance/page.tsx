export default function CompliancePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(77,163,255,0.1)] flex items-center justify-center border border-[rgba(77,163,255,0.2)]">
        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Quality & Regulatory Compliance</h1>
      <p className="text-[var(--text-muted)] max-w-md">
        F4: Maps regulatory requirements against procedures and inspection records, flagging compliance gaps.
      </p>
      <div className="px-4 py-2 mt-4 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)]">
        Pending Implementation (Owner: Shared)
      </div>
    </div>
  );
}
