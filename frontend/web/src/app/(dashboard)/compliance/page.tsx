"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck, ScrollText, ShieldCheck,
  Sparkles, Search, Filter, X, ArrowUp, ArrowDown, Activity, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, ShieldAlert, CalendarClock,
  History, GitMerge
} from "lucide-react";
import { fetchComplianceNarrative, fetchComplianceRegister } from "@/lib/api";
import type { ComplianceRegister, ComplianceRequirement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  COMPLIANT: { label: "Compliant", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  GAP: { label: "Critical Gap", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  OPEN: { label: "Pending Review", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

function KPICard({ label, value, sub, trend, trendUp, colorClass }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:bg-white/4 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16 blur-2xl pointer-events-none" />
      <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-3">{label}</div>
      <div className="flex items-end justify-between">
        <div className={cn("font-display text-3xl font-bold", colorClass || "text-white")}>{value}</div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md", trendUp ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10")}>
            {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      {sub && <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-white/40">{sub}</div>}
    </div>
  );
}

function TraceabilityTimeline({ requirement }: { requirement: ComplianceRequirement }) {
  const steps = [
    { label: "Requirement", status: "done", icon: ShieldCheck },
    { label: "Inspection", status: "done", icon: Search },
    { label: "NCR Raised", status: requirement.status === 'COMPLIANT' ? "done" : "active", icon: AlertTriangle },
    { label: "CAPA Created", status: requirement.status === 'COMPLIANT' ? "done" : (requirement.status === 'GAP' ? 'pending' : 'active'), icon: GitMerge },
    { label: "Resolved", status: requirement.status === 'COMPLIANT' ? "done" : "pending", icon: CheckCircle2 }
  ];

  return (
    <div className="flex items-center justify-between relative mt-4 mb-8">
      <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10 -translate-y-1/2 z-0" />
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center gap-2 relative z-10">
          <div className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500 bg-[#071321]",
            step.status === 'done' ? "border-emerald-500 text-emerald-400" :
            step.status === 'active' ? "border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" :
            "border-white/10 text-white/20"
          )}>
            <step.icon className="w-3.5 h-3.5" />
          </div>
          <span className={cn(
            "text-[10px] uppercase tracking-wider font-semibold",
            step.status === 'done' ? "text-emerald-400/80" :
            step.status === 'active' ? "text-blue-400" :
            "text-white/30"
          )}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceRegister | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ComplianceRequirement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchComplianceRegister()
      .then((register) => setData(register))
      .catch(() => setError("Backend unreachable"));
    fetchComplianceNarrative().then(setNarrative).catch(() => undefined);
  }, []);

  const filteredRequirements = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data.requirements;
    const lower = searchTerm.toLowerCase();
    return data.requirements.filter(req => 
      req.req_id.toLowerCase().includes(lower) || 
      req.regulation.toLowerCase().includes(lower) || 
      req.requirement.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const handleRowClick = (req: ComplianceRequirement) => {
    setSelected(req);
    setDrawerOpen(true);
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#071321]">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-4" />
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#071321] relative flex flex-col">
      <div className="fixed top-0 right-0 w-3/4 h-screen pointer-events-none opacity-[0.05] mix-blend-screen z-0" style={{ backgroundImage: 'url(/11_acceptance_check.svg)', backgroundPosition: 'bottom right', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 relative z-10">
        
        {/* Header & Sticky Title */}
        <div className="sticky top-0 z-30 bg-[#0A111A]/80 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="font-display text-xl font-semibold text-white tracking-wide">Audit & Compliance Command Center</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <CalendarClock className="w-3.5 h-3.5 text-blue-400" /> Audit Cycle: FY-26 Q3
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
          
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {!data ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : (
              <>
                <KPICard label="Requirements Tracked" value={data.summary.total} trend="2 This Month" trendUp={true} sub="Across 4 Regulations" />
                <KPICard label="Overall Compliant" value={`${Math.round((data.summary.compliant / data.summary.total) * 100)}%`} colorClass="text-emerald-400" trend="5.2%" trendUp={true} sub={`${data.summary.compliant} Requirements Satisfied`} />
                <KPICard label="Critical Gaps" value={data.summary.gaps} colorClass="text-red-400" trend="1 New" trendUp={false} sub="Requires Immediate Action" />
                <KPICard label="Pending Actions" value={data.summary.open} colorClass="text-amber-400" sub="Due within 14 Days" />
              </>
            )}
          </div>

          {/* Middle Section: Summary & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            
            {/* AI Executive Summary & Meters */}
            <div className="rounded-2xl border border-blue-500/20 bg-[#0A111A]/60 backdrop-blur-md overflow-hidden relative shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <ShieldCheck className="w-48 h-48" />
              </div>
              <div className="p-6 border-b border-white/5 bg-blue-500/[0.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-blue-400">
                    <Sparkles className="w-4 h-4" /> Executive Summary
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-white/50">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 3 Immediate Actions</span>
                  </div>
                </div>
                {!narrative ? <Skeleton className="h-20 w-full" /> : (
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {narrative}
                  </p>
                )}
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-black/20">
                <div className="col-span-2 md:col-span-4 text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Compliance Health Distribution</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-white/60"><span>Factories Act</span> <span className="text-emerald-400">92%</span></div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: '92%' }}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-white/60"><span>OISD</span> <span className="text-amber-400">71%</span></div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: '71%' }}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-white/60"><span>ISO 55001</span> <span className="text-emerald-400">83%</span></div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: '83%' }}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-white/60"><span>OSHA</span> <span className="text-emerald-400">100%</span></div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: '100%' }}></div></div>
                </div>
              </div>
            </div>

            {/* AI Recommendations Panel */}
            <div className="rounded-2xl border border-white/10 bg-[#0A111A]/60 backdrop-blur-md p-6 relative overflow-hidden flex flex-col">
              <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Prioritized Actions
              </h2>
              <div className="flex-1 space-y-3">
                <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-xs font-bold text-red-400 mb-1 uppercase tracking-wider">Critical Priority</div>
                    <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Inspect Pump P-101 for Vibration</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-1 uppercase tracking-wider">High Priority</div>
                    <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Complete overdue bearing lubrication</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Medium Priority</div>
                    <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Review calibration records for Q3</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Register & Filters */}
          <div className="rounded-2xl border border-white/10 bg-[#0A111A]/80 backdrop-blur-md overflow-hidden flex flex-col min-h-[500px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search requirements, regulations..." 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors">
                <Filter className="w-4 h-4" /> Filters
              </button>
              
              {/* Mini Trend Chart */}
              <div className="ml-auto flex items-center gap-3 px-4 py-1.5 rounded-lg bg-black/20 border border-white/5">
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Compliance Trend</div>
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 bg-emerald-400/40 rounded-full" style={{ height: '70%' }}></div>
                  <div className="w-1.5 bg-emerald-400/50 rounded-full" style={{ height: '80%' }}></div>
                  <div className="w-1.5 bg-emerald-400/30 rounded-full" style={{ height: '60%' }}></div>
                  <div className="w-1.5 bg-emerald-400/80 rounded-full" style={{ height: '90%' }}></div>
                  <div className="w-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ height: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              {!data ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-semibold text-white/40 uppercase tracking-widest bg-black/20">
                      <th className="py-4 px-6 font-medium">Requirement</th>
                      <th className="py-4 px-4 font-medium">Regulation</th>
                      <th className="py-4 px-4 font-medium">Asset</th>
                      <th className="py-4 px-4 font-medium">Due Date</th>
                      <th className="py-4 px-6 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRequirements.map(req => {
                      const status = STATUS_BADGE[req.status] || STATUS_BADGE.OPEN;
                      const isSelected = selected?.req_id === req.req_id;
                      
                      // Mocking severity icon based on status
                      const SeverityIcon = req.status === 'GAP' ? AlertTriangle : (req.status === 'COMPLIANT' ? CheckCircle2 : Clock);
                      const severityColor = req.status === 'GAP' ? 'text-red-400' : (req.status === 'COMPLIANT' ? 'text-emerald-400' : 'text-amber-400');

                      return (
                        <tr 
                          key={req.req_id}
                          onClick={() => handleRowClick(req)}
                          className={cn(
                            "group cursor-pointer transition-colors",
                            isSelected ? "bg-blue-500/4" : "hover:bg-white/2"
                          )}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <SeverityIcon className={cn("w-4 h-4 mt-0.5 shrink-0", severityColor)} />
                              <div>
                                <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{req.req_id}</div>
                                <div className="text-xs text-white/50 line-clamp-1 max-w-md mt-0.5">{req.requirement}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-white/70">
                            {req.regulation} <span className="text-white/30 ml-1">{req.clause}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-xs px-2 py-1 bg-white/5 rounded text-white/70">{req.applies_to}</span>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-white/50">
                            {req.status === 'COMPLIANT' ? '—' : 'In 14 Days'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider", status.bg, status.color)}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requirement Detail Drawer (Sheet) */}
      <AnimatePresence>
        {drawerOpen && selected && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-2xl h-full bg-[#0A111A] border-l border-white/10 z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#071321]">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    selected.status === 'COMPLIANT' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    selected.status === 'GAP' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  )}>
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{selected.req_id}</h2>
                    <div className="text-sm text-white/50 font-mono">{selected.regulation} · {selected.clause}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                
                {/* Traceability Panel */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" /> Traceability Graph
                  </h3>
                  <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                    <TraceabilityTimeline requirement={selected} />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40">Requirement Text</h3>
                  <p className="text-sm leading-relaxed text-white/80 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    {selected.requirement}
                  </p>
                  {selected.gap_note && (
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 mt-4">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-red-400 mb-1 uppercase tracking-wider">Gap Identified</div>
                        <p className="text-sm text-red-200/80 leading-relaxed">{selected.gap_note}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence Pack */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> Evidence Pack
                    </h3>
                    <span className="text-xs font-mono text-white/50">{selected.evidence.length} Items Attached</span>
                  </div>
                  
                  <div className="space-y-4 border-l-2 border-white/5 pl-4 ml-2 py-2">
                    {selected.evidence.length === 0 && (
                      <div className="text-sm text-white/30 italic">No linked records found in Knowledge Graph.</div>
                    )}
                    {selected.evidence.map((item, i) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-[23px] top-4 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-[#0A111A]" />
                        <div className="p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{item.role}</span>
                            {item.date && <span className="text-[10px] font-mono text-white/40">{item.date}</span>}
                          </div>
                          
                          {item.title && <div className="text-sm font-medium text-white/90 mb-2">{item.title}</div>}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">98% Confidence</span>
                            </div>
                            {item.in_graph ? (
                              <Link href={`/knowledge-graph?focus=${encodeURIComponent(item.id)}`} className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Open Graph <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-xs font-mono text-white/30">{item.key}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions inside Drawer */}
                {selected.status !== 'COMPLIANT' && (
                  <div className="space-y-4 pb-8">
                    <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" /> Recommended Resolution
                    </h3>
                    <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col gap-4">
                      <div className="text-sm font-medium text-amber-200">Initiate corrective action workflow in SAP PM to satisfy requirement `{selected.req_id}`.</div>
                      <button className="self-start px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors">
                        Create CAPA Draft
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
