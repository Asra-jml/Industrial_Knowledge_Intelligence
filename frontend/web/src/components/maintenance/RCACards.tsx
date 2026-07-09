import { Activity, AlertTriangle, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RCAResponse } from "./types";


interface Props {
  result: RCAResponse;
}


export default function RCACards({
  result,
}: Props) {


  return (

    <div className="mt-6 grid gap-6 lg:grid-cols-3">



      {/* Executive Summary */}

      <Card className="lg:col-span-3">

        <CardHeader>

          <CardTitle>
            Executive Summary
          </CardTitle>

        </CardHeader>


        <CardContent>

          <p className="text-muted">
            {result.executive_summary}
          </p>

        </CardContent>


      </Card>






      {/* Root Cause */}


      <Card>


        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Wrench className="h-5 w-5 text-accent" />

            Root Cause

          </CardTitle>


        </CardHeader>



        <CardContent className="space-y-4">


          <Badge variant="warning">

            {result.root_cause?.cause || "Unknown"}

          </Badge>




          <div>

            <p className="text-xs text-dim">
              Evidence
            </p>


            <p className="mt-1 font-mono text-sm text-fg">

              {
                result.root_cause?.evidence
                || "Not available"
              }

            </p>


          </div>





          <div>

            <p className="text-xs text-dim">
              Finding
            </p>


            <p className="mt-1 text-sm text-muted">

              {
                result.root_cause?.finding
                || "No finding available"
              }

            </p>


          </div>


        </CardContent>


      </Card>








      {/* Prediction */}



      <Card>


        <CardHeader>


          <CardTitle className="flex items-center gap-2">


            <AlertTriangle
              className="h-5 w-5 text-warning"
            />


            Prediction


          </CardTitle>


        </CardHeader>





        <CardContent className="space-y-5">
          <Badge
            variant={
              result.prediction?.risk === "LOW"
                ? "success"
                : result.prediction?.risk === "MEDIUM"
                  ? "warning"
                  : "accent"
            }
          >
            {result.prediction?.risk}
          </Badge>

          <div>
            <p className="text-xs text-dim">Failure Mode</p>

            <p className="mt-1 font-semibold">
              {result.prediction?.failure_mode || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-dim">Failure Probability</p>

            <p className="text-2xl font-bold">
              {result.prediction?.probability != null
                ? `${(result.prediction.probability * 100).toFixed(0)}%`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-dim">Lead Time</p>

            <p className="text-2xl font-bold">
              {result.prediction?.lead_time_days != null
                ? `${result.prediction.lead_time_days} Days`
                : "No Immediate Risk"}
            </p>
          </div>

          <div>
            <p className="text-xs text-dim">AI Recommendation</p>

            <p className="text-sm text-muted">
              {result.prediction?.message}
            </p>
          </div>
        </CardContent>


      </Card>










      {/* Current Status */}



      <Card>


        <CardHeader>


          <CardTitle className="flex items-center gap-2">


            <Activity
              className="h-5 w-5 text-success"
            />


            Current Status


          </CardTitle>


        </CardHeader>





        <CardContent className="space-y-4">



          <Badge

            variant={
              result.vibration?.condition === "NORMAL"
                ?
                "success"
                :
                "warning"
            }

          >

            {result.vibration?.condition}


          </Badge>






          <div>

            <p className="text-xs text-dim">
              Equipment
            </p>


            <p className="font-semibold text-fg">

              {result.equipment}

            </p>


          </div>





          <div>

            <p className="text-xs text-dim">
              Current Vibration
            </p>


            <p className="text-3xl font-bold text-fg">

              {result.vibration?.current_vibration}
              {" "}
              mm/s

            </p>


          </div>





          <div>

            <p className="text-xs text-dim">
              Confidence Score
            </p>


            <p className="text-2xl font-bold text-fg">

              {result.confidence_score}%

            </p>


          </div>



        </CardContent>


      </Card>









      {/* Work Orders */}



      {
        result.work_orders?.length > 0 && (


          <Card className="lg:col-span-3">


            <CardHeader>

              <CardTitle>
                Maintenance Work Orders
              </CardTitle>


            </CardHeader>




            <CardContent className="grid gap-4 md:grid-cols-2">


              {
                result.work_orders.map(
                  (wo, index) => (


                    <div
                      key={index}
                      className="rounded-lg border p-4"
                    >


                      <Badge variant="accent">

                        {wo.source}

                      </Badge>




                      <div className="mt-3 space-y-2 text-sm">


                        {
                          Object.entries(
                            wo.details || {}
                          )
                            .map(([key, value]) => (


                              <p key={key}>


                                <span className="font-semibold">

                                  {key}:

                                </span>


                                {" "}

                                {String(value)}


                              </p>


                            ))
                        }


                      </div>



                    </div>


                  )
                )
              }



            </CardContent>


          </Card>


        )
      }









      {/* Failure History */}



      {
        result.failure_history?.length > 0 && (


          <Card className="lg:col-span-3">


            <CardHeader>

              <CardTitle>
                Failure History
              </CardTitle>

            </CardHeader>



            <CardContent className="space-y-4">


              {
                result.failure_history.map(
                  (item, index) => (


                    <div
                      key={index}
                      className="rounded-lg border p-4"
                    >


                      <Badge variant="warning">

                        {item.source}

                      </Badge>



                      <div className="mt-3 text-sm space-y-2">


                        {
                          Object.entries(
                            item.record || {}
                          )
                            .map(([key, value]) => (


                              <p key={key}>


                                <span className="font-semibold">

                                  {key}:

                                </span>


                                {" "}

                                {String(value)}


                              </p>


                            ))
                        }


                      </div>



                    </div>


                  )
                )
              }



            </CardContent>


          </Card>


        )
      }









      {/* OEM Guidelines */}



      {
        result.oem_guidelines?.length > 0 && (


          <Card className="lg:col-span-3">


            <CardHeader>

              <CardTitle>
                OEM Maintenance Guidelines
              </CardTitle>

            </CardHeader>




            <CardContent className="space-y-4">


              {
                result.oem_guidelines.map(
                  (item, index) => (


                    <div
                      key={index}
                      className="rounded-lg border p-4"
                    >


                      <h3 className="font-semibold">

                        {item.manual}

                      </h3>



                      <p className="mt-2 text-sm text-muted">

                        {item.recommendation}

                      </p>



                    </div>


                  )
                )
              }



            </CardContent>


          </Card>


        )
      }





    </div>

  );

}