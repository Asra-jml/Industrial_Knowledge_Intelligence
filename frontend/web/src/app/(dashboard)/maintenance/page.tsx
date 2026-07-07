import ModulePlaceholder from "@/components/shared/ModulePlaceholder";

export default function MaintenancePage() {
  return (
    <ModulePlaceholder
      module="F3"
      title="Maintenance Intelligence & RCA"
      tagline="Predict the failure. Prove the root cause."
      description="Fuses vibration trends, work-order history, failure records and OEM limits into predictive alerts and evidence-backed root cause analysis — the module that would have caught P-101 seven days early."
      icon="Wrench"
      features={[
        {
          icon: "Activity",
          title: "Trend prediction",
          description:
            "Vibration model over condition-monitoring data against the 4.5 mm/s alarm and 7.1 mm/s trip limits.",
        },
        {
          icon: "GitBranch",
          title: "Graph-traversal RCA",
          description:
            "Walks the knowledge graph from failure to overdue inspection to staffing decision — the full causal chain.",
        },
        {
          icon: "TimerReset",
          title: "Lead-time alerts",
          description:
            "Predictive warnings with an estimated time-to-failure, not just a red light after the trip.",
        },
      ]}
      reads={[
        "shared/graph.json",
        "condition_monitoring_vibration.csv",
        "AI4I 2020 · NASA C-MAPSS",
      ]}
      acceptance="Bearing fault on P-101 — root cause = missed inspection; predicts failure ~7 days ahead from the vibration trend."
    />
  );
}
