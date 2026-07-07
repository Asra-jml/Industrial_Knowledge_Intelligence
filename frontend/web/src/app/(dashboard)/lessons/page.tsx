import ModulePlaceholder from "@/components/shared/ModulePlaceholder";

export default function LessonsPage() {
  return (
    <ModulePlaceholder
      module="F5"
      title="Lessons Learned & Failure Intelligence"
      tagline="The pattern nobody sees across three pumps and two years."
      description="Clusters internal incidents and near-misses with external databases — CSB investigations, OISD case studies — to surface systemic failure patterns and push proactive warnings before they repeat."
      icon="Lightbulb"
      features={[
        {
          icon: "Repeat2",
          title: "Pattern clustering",
          description:
            "Groups incidents by failure mode across internal records and industry precedents.",
        },
        {
          icon: "Radar",
          title: "Sibling-asset watch",
          description:
            "SAME_CLASS_AS edges connect P-102's near-miss and P-101's failure to P-205 — whose vibration is rising now.",
        },
        {
          icon: "BellRing",
          title: "Proactive alerts",
          description:
            "Warnings pushed with the external case studies that prove the failure mode is real.",
        },
      ]}
      reads={[
        "shared/corpus_index.jsonl (incident chunks)",
        "shared/graph.json (SAME_CLASS_AS)",
        "CSB · OISD · IHM databases",
      ]}
      acceptance="Connects P-102 near-miss + P-101 failure → warns P-205 before recurrence, citing external precedents."
    />
  );
}
