import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineEvent } from "./types";

interface Props {
  timeline: TimelineEvent[];
}

function getColor(severity: string) {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-500";
    case "HIGH":
      return "bg-orange-500";
    case "RESOLVED":
      return "bg-green-500";
    case "NORMAL":
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
}

export default function Timeline({ timeline }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {timeline.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${getColor(
                    item.severity
                  )}`}
                />

                {index !== timeline.length - 1 && (
                  <div className="mt-1 h-10 w-0.5 bg-border" />
                )}
              </div>

              <div className="flex-1 rounded-lg border p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{item.event}</h3>

                  <span className="text-xs text-muted">
                    {item.date}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted">
                  Severity : {item.severity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}