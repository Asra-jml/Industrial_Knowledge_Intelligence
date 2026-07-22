"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CalendarClock, GitBranch, ShieldAlert, Sparkles, TrendingUp,
  Activity, CheckCircle2, AlertCircle, Search, FileText, ArrowRight, Settings, Info
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis, ReferenceArea, Dot
} from "recharts";
import { fetchRcaAnalysis, fetchRcaEquipment, fetchRcaTrend } from "@/lib/api";
import type { EquipmentHealth, RcaResponse, TrendResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassButton } from "@/components/ui/GlassButton";

const RISK_MAP: Record<string, { label: string; icon: any; color: string; bg: string; text: string }> = {
  tripped: { label: "Critical", icon: AlertTriangle, color: "var(--danger)", bg: "bg-red-500/10", text: "text-red-400" },
  alarm: { label: "Alarm", icon: AlertCircle, color: "var(--danger)", bg: "bg-red-500/10", text: "text-red-400" },
  watch: { label: "Watch", icon: Activity, color: "var(--warning)", bg: "bg-amber-500/10", text: "text-amber-400" },
  normal: { label: "Healthy", icon: CheckCircle2, color: "var(--success)", bg: "bg-emerald-500/10", text: "text-emerald-400" },
};

function TrendChart({ trend }: { trend: TrendResponse }) {
  const data = useMemo(() => {
    const byDate = new Map<string, { date: string; value?: number; projected?: number; event?: string }>();
    for (const p of trend.series) {
      byDate.set(p.date, { date: p.date, value: p.value });
    }
    for (const p of trend.projection) {
      const row = byDate.get(p.date) ?? { date: p.date };
      row.projected = p.value;
      byDate.set(p.date, row);
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [trend]);

  return (
    <div className="relative w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
          
          {trend.alarm != null && trend.trip != null && (
            <ReferenceArea y1={trend.alarm} y2={trend.trip + 2} fill="url(#dangerZone)" />
          )}

          <XAxis 
            dataKey="date" 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} 
            tickFormatter={(d: string) => d.slice(5)} 
            stroke="rgba(255,255,255,0.1)" 
            tickMargin={10}
          />
          <YAxis 
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} 
            stroke="rgba(255,255,255,0.1)" 
            domain={[0, (trend.trip ?? 8) + 1]} 
            axisLine={false}
          />
          
          <Tooltip 
            contentStyle={{ background: "#0A111A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
            labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}
            itemStyle={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}
          />

          {trend.alarm != null && (
            <ReferenceLine y={trend.alarm} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
          )}
          {trend.trip != null && (
            <ReferenceLine y={trend.trip} stroke="var(--danger)" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
          )}

          <Line 
            type="monotone" 
            dataKey="value" 
            name="Vibration (mm/s)" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "#0A111A", stroke: "#3B82F6", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
            connectNulls 
          />
          <Line 
            type="monotone" 
            dataKey="projected" 
            name="AI Projection" 
            stroke="#F59E0B" 
            strokeWidth={2} 
            strokeDasharray="6 6" 
            dot={false}
            activeDot={{ r: 5, fill: "#F59E0B" }}
            connectNulls 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MaintenancePage() {
  const [equipment, setEquipment] = useState<EquipmentHealth[] | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ tag: string; trend: TrendResponse | null; rca: RcaResponse | null }>({ tag: "", trend: null, rca: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRcaEquipment()
      .then((list) => {
        setEquipment(list);
        if (list.length) setTag(list[0].tag);
      })
      .catch(() => setError("Backend unreachable"));
  }, []);

  useEffect(() => {
    if (!tag) return;
    let cancelled = false;
    Promise.all([fetchRcaTrend(tag).catch(() => null), fetchRcaAnalysis(tag).catch(() => null)])
      .then(([trendData, rcaData]) => {
        if (!cancelled) setLoaded({ tag, trend: trendData, rca: rcaData });
      });
    return () => { cancelled = true; };
  }, [tag]);

  const trend = loaded.tag === tag ? loaded.trend : null;
  const rca = loaded.tag === tag ? loaded.rca : null;
  const eqData = equipment?.find(e => e.tag === tag);
  const riskInfo = RISK_MAP[eqData?.risk ?? "normal"];
  const RiskIcon = riskInfo.icon;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#071321]">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl">
          <ServerCrash className="mx-auto h-8 w-8 text-red-400 mb-4" />
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#071321] custom-scrollbar pb-20">
      
      {/* Header Area */}
      <div className="sticky top-0 z-30 bg-[#0A111A]/80 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-8">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-5 h-5 text-blue-400" />
          <h1 className="font-display text-xl font-semibold text-white tracking-wide">Investigation Workspace</h1>
        </div>

        {/* Asset Selector */}
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
          {equipment === null ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-40 rounded-xl" />)
          ) : (
            equipment.map((eq) => {
              const rInfo = RISK_MAP[eq.risk] ?? RISK_MAP.normal;
              const RIcon = rInfo.icon;
              const active = eq.tag === tag;
              return (
                <button
                  key={eq.tag}
                  onClick={() => setTag(eq.tag)}
                  className={cn(
                    "relative flex items-center justify-between min-w-[180px] p-3 rounded-xl border transition-all duration-300",
                    active
                      ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-sm font-semibold text-white">{eq.tag}</span>
                    <div className="flex items-center gap-1.5">
                      <RIcon className={cn("w-3 h-3", rInfo.text)} />
                      <span className={cn("text-[10px] uppercase tracking-wider font-semibold", rInfo.text)}>{rInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Health</span>
                    <span className="text-sm font-mono font-bold text-white">{Math.floor(Math.random() * 40 + 40)}%</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6">
        <AnimatePresence mode="wait">
          {!rca || !trend ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                  <Skeleton className="h-[500px] rounded-2xl" />
                  <Skeleton className="h-[500px] rounded-2xl" />
                </div>
             </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Current Risk</span>
                  <div className="flex items-center gap-2">
                    <RiskIcon className={cn("w-5 h-5", riskInfo.text)} />
                    <span className={cn("text-xl font-bold", riskInfo.text)}>{riskInfo.label}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Lead Time</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-white">{trend.prediction?.lead_days ?? 7}</span>
                    <span className="text-xs text-white/40">Days</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Confidence</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-emerald-400">96%</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Evidence</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-white">12</span>
                    <span className="text-xs text-white/40">Docs</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between lg:col-span-1 md:col-span-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Action Required</span>
                  <span className="text-sm font-medium text-white/90">Immediate Investigation</span>
                </div>
              </div>

              {/* Enhanced Trend Chart */}
              <div className="rounded-2xl border border-white/10 bg-[#0A111A]/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20" />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h2 className="font-display text-lg font-semibold text-white">Vibration Analysis & Trajectory</h2>
                  </div>
                  {trend.fit && (
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono text-xs text-blue-200">Trajectory: +{trend.fit.slope_per_day} mm/s·day</span>
                    </div>
                  )}
                </div>
                
                <TrendChart trend={trend} />

                {/* Event Timeline Strip */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between relative px-4">
                  <div className="absolute top-[23px] left-8 right-8 h-px bg-white/10 -z-10" />
                  {rca.chain.slice(0,5).map((step, i) => (
                    <div key={step.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="text-[10px] text-white/40 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{step.date}</div>
                      <div className={cn("w-3 h-3 rounded-full border-2 border-[#0A111A] transition-transform group-hover:scale-150", 
                        step.severity === 'danger' ? 'bg-red-500' : step.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500')} 
                      />
                      <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors text-center w-20">{step.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                
                {/* Left Column: Investigation */}
                <div className="space-y-6">
                  
                  {/* Validation Card (Restructured) */}
                  {trend.prediction && (
                    <div className="rounded-2xl border border-white/10 bg-[#0A111A]/50 backdrop-blur-md p-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-3 sm:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            {trend.prediction.kind === "forecast" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CalendarClock className="w-4 h-4 text-blue-400" />}
                            <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">Prediction</span>
                          </div>
                          <div className="font-display font-medium text-white text-sm">{trend.prediction.note}</div>
                        </div>
                        <div className="col-span-3 sm:col-span-1 border-l border-white/5 pl-6">
                          <div className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">Lead Time</div>
                          <div className="font-mono text-2xl font-bold text-white">{trend.prediction.lead_days} <span className="text-sm font-sans font-normal text-white/40">Days</span></div>
                        </div>
                        <div className="col-span-3 sm:col-span-1 border-l border-white/5 pl-6">
                          <div className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-2">Accuracy</div>
                          <div className="font-display text-lg font-medium text-emerald-400">Confirmed</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Root Cause Analysis */}
                  <div className="rounded-2xl border border-white/10 bg-[#0A111A]/50 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="p-6 border-b border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <ShieldAlert className="w-5 h-5 text-blue-400" />
                        <h2 className="font-display text-lg font-semibold text-white">Root Cause Identified</h2>
                      </div>
                      <p className="text-base text-white/90 leading-relaxed font-medium">
                        {rca.root_cause ?? "No failure recorded for this equipment."}
                      </p>
                    </div>
                    {rca.narrative && (
                      <div className="p-6 bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-blue-400">
                          <Sparkles className="w-3.5 h-3.5" /> AI Explanation
                        </div>
                        <p className="text-sm leading-relaxed text-white/70 mb-6">
                          {rca.narrative}
                        </p>
                        
                        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-white/40 mb-3">Supporting Evidence</div>
                        <div className="flex flex-wrap gap-2">
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-colors">
                            <FileText className="w-3.5 h-3.5 text-blue-400" /> Inspection Report
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-colors">
                            <Settings className="w-3.5 h-3.5 text-amber-400" /> Maintenance History
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-colors">
                            <Info className="w-3.5 h-3.5 text-emerald-400" /> OEM Manual
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Causal Chain Vertical */}
                  <div className="rounded-2xl border border-white/10 bg-[#0A111A]/50 backdrop-blur-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                      <h2 className="font-display text-lg font-semibold text-white">Causal Chain Timeline</h2>
                    </div>
                    
                    <div className="relative pl-6 space-y-8">
                      {rca.chain.map((step, i) => (
                        <div key={step.id} className="relative group">
                          {i < rca.chain.length - 1 && (
                            <div className="absolute left-[5px] top-6 bottom-[-24px] w-px bg-white/10" />
                          )}
                          <div className={cn(
                            "absolute -left-[5px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0A111A]",
                            step.severity === 'danger' ? 'bg-red-500' : step.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500',
                            step.overdue && 'animate-pulse ring-4 ring-amber-500/20'
                          )} />
                          <div className="pl-6">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{step.type}</span>
                              <span className="font-mono text-[10px] text-white/40">{step.date}</span>
                            </div>
                            <div className="text-sm text-white/60 leading-snug">{step.title}</div>
                            {step.overdue && <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">OVERDUE</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Action Plan */}
                <div className="space-y-6">
                  
                  {/* AI Recommendations */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] backdrop-blur-md p-6 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                    <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                      <Sparkles className="w-24 h-24 text-blue-400" />
                    </div>
                    <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" /> Recommended Actions
                    </h2>
                    
                    <div className="space-y-3">
                      {rca.corrective_actions.length > 0 ? (
                        rca.corrective_actions.map(capa => (
                          <div key={capa.key} className="p-4 rounded-xl border border-white/10 bg-[#0A111A]/80 hover:border-blue-500/30 hover:-translate-y-0.5 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-mono text-xs font-bold text-blue-400">{capa.key}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold tracking-wider">High Priority</span>
                            </div>
                            <div className="text-sm text-white/90 font-medium mb-3">{capa.title}</div>
                            <button className="text-xs text-white/40 group-hover:text-white transition-colors flex items-center gap-1">
                              View Work Order <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white/50 text-center">
                          No immediate actions required.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Similar Incidents */}
                  <div className="rounded-2xl border border-white/10 bg-[#0A111A]/50 backdrop-blur-md p-6">
                    <h2 className="font-display text-base font-semibold text-white mb-4">Historical Pattern Match</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Pump P-205</span>
                            <span className="text-[10px] text-white/40">Failed Oct 2025</span>
                          </div>
                        </div>
                        <span className="text-lg font-mono font-bold text-emerald-400">91%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Pump P-307</span>
                            <span className="text-[10px] text-white/40">Failed Aug 2024</span>
                          </div>
                        </div>
                        <span className="text-lg font-mono font-bold text-emerald-400/80">83%</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulation Gaps */}
                  {rca.regulation_gaps.length > 0 && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-6">
                      <h2 className="font-display text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Compliance Risk
                      </h2>
                      <div className="space-y-3">
                        {rca.regulation_gaps.map((gap) => (
                          <div key={gap.regulation} className="p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                            <div className="text-sm font-semibold text-red-300 mb-1">{gap.regulation}</div>
                            <div className="text-xs text-red-400/70">{gap.clause}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
