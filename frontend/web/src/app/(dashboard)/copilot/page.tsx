import ModulePlaceholder from "@/components/shared/ModulePlaceholder";

export default function CopilotPage() {
  return (
    <ModulePlaceholder
      module="F2"
      title="Expert Knowledge Copilot"
      tagline="Ask the plant anything. Get answers with receipts."
      description="Conversational AI over the full corpus — manuals, work orders, inspections, emails and regulations. Every answer arrives with citations to source documents and a confidence score, so engineers can trust it on the plant floor."
      icon="MessagesSquare"
      features={[
        {
          icon: "FileSearch",
          title: "Grounded retrieval",
          description:
            "RAG over 8,050 indexed chunks with equipment tags and record IDs on every passage.",
        },
        {
          icon: "Quote",
          title: "Citations built in",
          description:
            "Answers link back to the exact document, page and row they came from. No hallucinated facts.",
        },
        {
          icon: "Gauge",
          title: "Confidence scores",
          description:
            "Each response is scored so a technician knows when to double-check the source.",
        },
      ]}
      reads={["shared/corpus_index.jsonl", "GET /api/graph/node/{id}"]}
      acceptance="What's the status of P-101? — returns a cited answer drawing from inspection + email + work order + manual."
    />
  );
}
