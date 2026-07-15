import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RCAResponse } from "./types";

interface Props {
  result: RCAResponse;
}

export default function AnalysisSummary({ result }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Analysis Summary</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-dim">Total Work Orders</p>
          <p className="text-3xl font-bold">
            {result.work_order_analysis.total}
          </p>
        </div>

        <div>
          <p className="text-xs text-dim">Preventive</p>
          <p className="text-3xl font-bold text-green-600">
            {result.work_order_analysis.preventive}
          </p>
        </div>

        <div>
          <p className="text-xs text-dim">Corrective</p>
          <p className="text-3xl font-bold text-orange-600">
            {result.work_order_analysis.corrective}
          </p>
        </div>

        <div>
          <p className="text-xs text-dim">Overdue</p>
          <p className="text-3xl font-bold text-red-600">
            {result.work_order_analysis.overdue}
          </p>
        </div>

        <div>
          <p className="text-xs text-dim">Repeat Failures</p>
          <p className="text-2xl font-semibold">
            {result.failure_analysis.repeat_failures}
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-xs text-dim">Failure Trend</p>
          <p className="font-medium">
            {result.failure_analysis.trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}