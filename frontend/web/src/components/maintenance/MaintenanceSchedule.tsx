import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  schedule: {
    inspection: string;
    lubrication: string;
    alignment: string;
    bearing_check: string;
  };

  maintenance: {
    urgent: string;
    preventive: string;
  };
}

export default function MaintenanceSchedule({
  schedule,
  maintenance,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Schedule</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6 md:grid-cols-2">

        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">
            Optimized Schedule
          </h3>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Inspection</span>
              <span className="font-semibold">
                {schedule.inspection}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Lubrication</span>
              <span className="font-semibold">
                {schedule.lubrication}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Alignment</span>
              <span className="font-semibold">
                {schedule.alignment}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Bearing Check</span>
              <span className="font-semibold">
                {schedule.bearing_check}
              </span>
            </div>

          </div>
        </div>

        <div className="rounded-lg border p-4">

          <h3 className="mb-3 font-semibold">
            Maintenance Recommendation
          </h3>

          <div className="space-y-4">

            <div>
              <p className="text-xs text-dim">
                Urgent Action
              </p>

              <p className="font-semibold">
                {maintenance.urgent}
              </p>
            </div>

            <div>
              <p className="text-xs text-dim">
                Preventive Plan
              </p>

              <p className="font-semibold">
                {maintenance.preventive}
              </p>
            </div>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}