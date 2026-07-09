import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { GraphReasoning as GraphType } from "./types";

interface Props {
  graph: GraphType;
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function GraphReasoning({ graph }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Graph Reasoning</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        <div>
          <h3 className="font-semibold">Summary</h3>

          <p className="mt-2 text-muted">
            {graph.summary}
          </p>
        </div>

        <Section
          title="Inspections"
          items={graph.inspection}
        />

        <Section
          title="Work Orders"
          items={graph.work_orders}
        />

        <Section
          title="Failures"
          items={graph.failures}
        />

        <Section
          title="Related Assets"
          items={graph.related_assets}
        />

        <Section
          title="Manuals"
          items={graph.manuals}
        />

        <Section
          title="Spare Parts"
          items={graph.spare_parts}
        />

        <Section
          title="Permits"
          items={graph.permits}
        />

        <div>
          <h3 className="mb-2 font-semibold">
            Regulations
          </h3>

          <div className="space-y-3">
            {graph.regulations.map((reg, index) => (
              <div
                key={index}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">

                  <span className="font-semibold">
                    {reg.name}
                  </span>

                  <Badge
                    variant={
                      reg.status === "PASS"
                        ? "success"
                        : "warning"
                    }
                  >
                    {reg.status}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-muted">
                  {reg.gap}
                </p>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}