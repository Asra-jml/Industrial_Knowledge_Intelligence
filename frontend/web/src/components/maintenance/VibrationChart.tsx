"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface Props {
  history: number[];
  alarmLimit?: number;
  tripLimit?: number;
}


export default function VibrationChart({
  history,
  alarmLimit = 4.5,
  tripLimit = 7.1,
}: Props) {


  if (!history || history.length === 0) {

    return (
      <Card className="mt-6">

        <CardHeader>
          <CardTitle>
            Vibration Trend
          </CardTitle>
        </CardHeader>


        <CardContent>
          No vibration data available
        </CardContent>

      </Card>
    );

  }



  const data = history.map((value, index) => ({
    sample: index + 1,
    vibration: value,
  }));



  return (

    <Card className="mt-6">


      <CardHeader>
        <CardTitle>
          Vibration Trend
        </CardTitle>
      </CardHeader>



      <CardContent>


        <div className="h-[380px]">


          <ResponsiveContainer
            width="100%"
            height="100%"
          >


            <LineChart data={data}>


              <CartesianGrid
                strokeDasharray="3 3"
              />



              <XAxis
                dataKey="sample"
                label={{
                  value: "Sample",
                  position: "insideBottom",
                  offset: -5,
                }}
              />



              <YAxis
                label={{
                  value: "mm/s",
                  angle: -90,
                  position: "insideLeft",
                }}
              />



              <Tooltip />

              <Legend />



              {/* Alarm Threshold */}

              <ReferenceLine
                y={alarmLimit}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label="Alarm"
              />



              {/* Trip Threshold */}

              <ReferenceLine
                y={tripLimit}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label="Trip"
              />



              {/* Actual Vibration Trend */}

              <Line

                type="monotone"

                dataKey="vibration"

                stroke="#3b82f6"

                strokeWidth={3}

                dot={{
                  r: 5
                }}

                activeDot={{
                  r: 8
                }}

              />


            </LineChart>


          </ResponsiveContainer>


        </div>


      </CardContent>


    </Card>

  );

}