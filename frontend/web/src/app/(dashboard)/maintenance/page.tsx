export default function MaintenancePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(77,163,255,0.1)] flex items-center justify-center border border-[rgba(77,163,255,0.2)]">
        <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Maintenance Intelligence & RCA</h1>
      <p className="text-[var(--text-muted)] max-w-md">
        F3: Predictive maintenance recommendations and RCA fused from failure records, OEM manuals, and real-time sensor data.
      </p>
      <div className="px-4 py-2 mt-4 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-dim)]">
        Pending Implementation (Owner: Teammate 3)
      </div>
    </div>
  );
}
