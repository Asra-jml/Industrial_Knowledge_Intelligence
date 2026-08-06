"use client";

import { useEffect, useState } from "react";
import {
  BellRing, BookMarked, Lightbulb, Radar, Repeat2, Activity,
  Database, Network, BrainCircuit, ShieldCheck, Settings, ArrowRight,
  GitBranch, CheckCircle2, FileText, AlertTriangle, Search,
  type LucideIcon
} from "lucide-react";
import { fetchLessonsAlerts, fetchLessonsPatterns } from "@/lib/api";
import type { FailurePattern, LessonsAlert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

function KPICard({ label, value, icon: Icon, colorClass, bgClass }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-5 flex flex-col justify-between hover:bg-white/4 transition-colors relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Icon className="w-20 h-20" />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", bgClass, colorClass.replace('text-', 'border-'))}>
          <Icon className={cn("w-4 h-4", colorClass)} />
        </div>
        <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">{label}</div>
      </div>
      <div className="font-display text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function AIReasoningTimeline() {
  const steps = [
    { text: "Matched Bearing Failure Pattern", highlight: true },
    { text: "Similar vibration trend detected" },
    { text: "Shared maintenance history" },
    { text: "Same equipment class (Centrifugal Pump)" },
    { text: "Recurring inspection gap identified", highlight: true },
  ];

  return (
    <div className="relative pl-6 space-y-5 mt-6">
      {steps.map((step, i) => (
        <div key={i} className="relative">
          {i < steps.length - 1 && (
            <div className="absolute left-0.75 top-4 -bottom-5 w-0.5 bg-white/10" />
          )}
          <div className={cn(
            "absolute -left-1.25 top-1.5 w-2 h-2 rounded-full ring-4 ring-[#0A111A]",
            step.highlight ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/30"
          )} />
          <div className={cn("text-sm pl-4", step.highlight ? "text-white font-medium" : "text-white/60")}>
            {step.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeEvolutionTimeline() {
  const steps = [
    { label: "Incident", icon: AlertTriangle, color: "text-blue-400" },
    { label: "Investigation", icon: Search, color: "text-blue-400" },
    { label: "Root Cause", icon: GitBranch, color: "text-blue-400" },
    { label: "CAPA", icon: FileText, color: "text-blue-400" },
    { label: "Lesson Created", icon: Lightbulb, color: "text-blue-400" },
    { label: "Applied to P-205", icon: Settings, color: "text-blue-400" },
    { label: "Risk Prevented", icon: ShieldCheck, color: "text-blue-400" }
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-6 overflow-hidden">
      <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 mb-8 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-400" /> Knowledge Evolution Timeline
      </h3>
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute top-3.75 left-8 right-8 h-px bg-white/10 -z-10" />
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full bg-[#0A111A] border-2 border-white/10 flex items-center justify-center transition-colors hover:border-white/30", step.color)}>
              <step.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/50 text-center max-w-20">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LessonsPage() {
  const [alerts, setAlerts] = useState<LessonsAlert[] | null>(null);
  const [patterns, setPatterns] = useState<FailurePattern[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchLessonsAlerts().catch(() => null),
      fetchLessonsPatterns().catch(() => null),
    ]).then(([alertData, patternData]) => {
      if (alertData === null && patternData === null) {
        setError("Backend unreachable");
        return;
      }
      setAlerts(alertData ?? []);
      setPatterns(patternData ?? []);
    });
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#071321]">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/2 p-8 text-center backdrop-blur-xl">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-4" />
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#071321] custom-scrollbar pb-20 relative">
      <div className="fixed top-0 right-0 w-3/4 h-screen pointer-events-none opacity-[0.05] mix-blend-screen z-0" style={{ backgroundImage: 'url(/12_document_types.svg)', backgroundPosition: 'bottom right', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
      <div className="relative z-10">
      
      {/* Enhanced Hero Section */}
      <div className="sticky top-0 z-30 bg-[#0A111A]/80 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white tracking-wide">Enterprise Knowledge Intelligence Hub</h1>
              <p className="text-xs text-white/50 mt-0.5">Systemic patterns extracted from internal records & industry databases</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Knowledge Confidence: 96%</span>
          </div>
        </div>

        {/* Intelligence Summary Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
            <Database className="w-3.5 h-3.5 text-blue-400" /> 475 Documents Analyzed
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
            <Network className="w-3.5 h-3.5 text-blue-400" /> 589 Graph Relationships
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> 21 Historical Incidents
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 space-y-8">
        
        {/* Learning Impact KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {!alerts ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <KPICard label="Lessons Generated" value="32" icon={Lightbulb} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
              <KPICard label="Assets Protected" value="18" icon={ShieldCheck} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
              <KPICard label="Recurring Patterns" value="9" icon={Repeat2} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
              <KPICard label="Preventive Recommendations" value="14" icon={CheckCircle2} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
            </>
          )}
        </div>

        {alerts?.map((alert, idx) => (
          <div key={idx} className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            
            {/* Left Column: Proactive Alert & Reasoning */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <BellRing className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">Proactive Alert</h2>
                    <div className="text-xs text-red-300 font-medium">Act Now</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Affected Asset</div>
                    <div className="font-mono text-lg font-bold text-white">{alert.target}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Current Risk</div>
                    <div className="font-display text-lg font-bold text-amber-400">Watch</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Pattern Match</div>
                    <div className="font-mono text-sm font-bold text-white">P-101, P-102</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Similarity</div>
                    <div className="font-display text-lg font-bold text-blue-400">94%</div>
                  </div>
                </div>

                <p className="text-sm text-white/80 leading-relaxed mb-6">
                  {alert.rationale}
                </p>
                
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40 flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-4 h-4 text-blue-400" /> Why am I seeing this?
                  </h3>
                  <AIReasoningTimeline />
                </div>
              </div>

              {/* Pattern Confidence Bar */}
              <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-white/40">Pattern Confidence</h3>
                  <span className="text-sm font-bold text-emerald-400">96%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                  <div className="h-full bg-linear-to-r from-blue-500 to-emerald-400" style={{ width: '96%' }} />
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span>8 Evidence Sources</span>
                  <span>5 Historical Events</span>
                  <span>2 Industry Cases</span>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Evidence */}
            <div className="space-y-6">
              
              {/* Preventive Actions */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/2 backdrop-blur-md p-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" /> Recommended Preventive Actions
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-white/10 bg-[#0A111A]/80 hover:bg-white/4 transition-colors flex items-center justify-between group cursor-pointer">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-red-400 mb-1">High Priority</div>
                      <div className="text-sm font-medium text-white/90">Inspect bearing for excessive wear</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      Draft Work Order
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-[#0A111A]/80 hover:bg-white/4 transition-colors flex items-center justify-between group cursor-pointer">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-1">Medium Priority</div>
                      <div className="text-sm font-medium text-white/90">Review lubrication schedule</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      View SOP
                    </button>
                  </div>
                </div>
              </div>

              {/* Similar Assets Panel */}
              <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Radar className="w-4 h-4 text-blue-400" /> Similar Assets at Risk
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-mono text-sm font-bold text-white">P-101</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">96% Match</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-mono text-sm font-bold text-white">P-102</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400/80">91% Match</span>
                  </div>
                </div>
              </div>

              {/* Knowledge Cards (Evidence & Precedents) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-5">
                  <h3 className="text-[11px] uppercase tracking-widest font-semibold text-white/40 mb-4 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Internal Evidence
                  </h3>
                  <div className="space-y-3">
                    {alert.evidence.map(ev => (
                      <div key={ev.id} className="p-3 rounded-lg border border-white/5 bg-white/2 hover:border-blue-500/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[11px] font-bold text-blue-400">{ev.key}</span>
                          <span className="text-[10px] text-white/30">{ev.date}</span>
                        </div>
                        <div className="text-xs text-white/70 line-clamp-2 mb-2">{ev.summary}</div>
                        <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Document <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-5">
                  <h3 className="text-[11px] uppercase tracking-widest font-semibold text-white/40 mb-4 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-blue-400" /> Industry Precedents
                  </h3>
                  <div className="space-y-3">
                    {alert.precedents.map(pr => (
                      <div key={pr.doc_id} className="p-3 rounded-lg border border-white/5 bg-white/2 hover:border-blue-500/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[11px] font-bold text-blue-400">CSB / OISD</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/50">91%</span>
                        </div>
                        <div className="text-xs text-white/70 line-clamp-2 mb-2 font-medium">{pr.title}</div>
                        <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Read Case <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}

        {/* Knowledge Evolution Timeline */}
        <KnowledgeEvolutionTimeline />

        {/* Recurring Patterns Timeline */}
        <div className="rounded-2xl border border-white/5 bg-[#0A111A]/60 backdrop-blur-md p-6">
          <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Repeat2 className="h-5 w-5 text-purple-400" /> Recurring Patterns
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {['#Bearing', '#Inspection', '#Lubrication', '#Maintenance', '#Vibration', '#Safety', '#Reliability'].map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-6">
            {!patterns ? (
               <Skeleton className="h-40 w-full rounded-xl" />
            ) : patterns.length === 0 ? (
               <div className="text-sm text-white/50">No recurring patterns detected.</div>
            ) : patterns.map(pattern => (
               <div key={pattern.pattern} className="p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors" />
                 
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-display text-base font-semibold text-white capitalize">{pattern.title}</h3>
                   <div className="flex gap-2">
                     {pattern.equipment.map(tag => (
                       <span key={tag} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px] uppercase font-bold">Class: {tag}</span>
                     ))}
                   </div>
                 </div>

                 {/* Horizontal Event Timeline */}
                 <div className="flex items-center justify-between relative px-2">
                   <div className="absolute top-3 left-6 right-6 h-px bg-white/10 -z-10" />
                   {pattern.members.map((member) => (
                     <div key={member.id} className="flex flex-col items-center gap-2 group/step cursor-pointer">
                       <div className="w-6 h-6 rounded-full bg-[#0A111A] border-2 border-white/20 group-hover/step:border-purple-400 transition-colors flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-white/20 group-hover/step:bg-purple-400 transition-colors" />
                       </div>
                       <div className="flex flex-col items-center">
                         <span className="font-mono text-[10px] text-white/40 mb-0.5">{member.date}</span>
                         <span className="font-mono text-[11px] font-bold text-purple-400">{member.key}</span>
                         <span className="text-[10px] text-white/50 w-20 text-center truncate">{member.summary}</span>
                       </div>
                     </div>
                   ))}
                   <div className="flex flex-col items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-[#0A111A] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                       <Lightbulb className="w-3 h-3 text-purple-400" />
                     </div>
                     <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Lesson Generated</span>
                   </div>
                 </div>
               </div>
            ))}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
