import ModulePlaceholder from "@/components/shared/ModulePlaceholder";

export default function CompliancePage() {
  return (
    <ModulePlaceholder
      module="F4"
      title="Quality & Compliance Intelligence"
      tagline="Every regulation, mapped to every asset. Gaps flagged before the audit."
      description="Maps Factories Act, OISD, PESO and ISO 9001 requirements against procedures, inspections and equipment state. Detects compliance gaps automatically and assembles audit-ready evidence packs per asset."
      icon="ShieldCheck"
      features={[
        {
          icon: "ScanSearch",
          title: "Gap detection",
          description:
            "Joins the compliance register to live inspection records — GAP rows surface with their regulation and clause.",
        },
        {
          icon: "FileCheck",
          title: "Evidence packs",
          description:
            "One click gathers every linked document for an asset into an audit-ready bundle.",
        },
        {
          icon: "Siren",
          title: "Breach traceability",
          description:
            "NCR → CAPA chains linked to the exact regulation breached, straight from the graph.",
        },
      ]}
      reads={[
        "compliance_register.csv",
        "shared/graph.json (GOVERNED_BY edges)",
        "shared/documents.jsonl",
      ]}
      acceptance="Flags the P-101 inspection gap against Factories Act / OISD-STD-128 and generates its evidence pack."
    />
  );
}
