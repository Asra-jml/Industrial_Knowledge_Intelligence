import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  WorkOrder,
  FailureHistory,
} from "./types";



interface Props {

  workOrders: WorkOrder[];

  failures: FailureHistory[];

}



export default function MaintenanceHistory({
  workOrders,
  failures,
}: Props) {


  return (

    <div className="mt-6 grid gap-6 lg:grid-cols-2">



      {/* Work Orders */}


      <Card>


        <CardHeader>

          <CardTitle>
            Maintenance Work Orders
          </CardTitle>

        </CardHeader>



        <CardContent className="space-y-4">


          {
            workOrders.length === 0 && (

              <p className="text-muted">
                No work order found
              </p>

            )
          }



          {
            workOrders.map((wo,index)=>(

              <div
                key={index}
                className="
                rounded-lg
                border
                p-4
                "
              >


                <p className="font-semibold">

                  {wo.source}

                </p>


                <pre
                  className="
                  mt-2
                  text-xs
                  whitespace-pre-wrap
                  text-muted
                  "
                >

                  {JSON.stringify(
                    wo.details,
                    null,
                    2
                  )}

                </pre>


              </div>


            ))
          }



        </CardContent>


      </Card>





      {/* Failure History */}


      <Card>


        <CardHeader>

          <CardTitle>
            Failure History
          </CardTitle>

        </CardHeader>




        <CardContent className="space-y-4">


          {
            failures.length === 0 && (

              <p className="text-muted">
                No previous failure found
              </p>

            )
          }




          {
            failures.map((failure,index)=>(


              <div

                key={index}

                className="
                rounded-lg
                border
                p-4
                "

              >


                <p className="font-semibold">

                  {failure.source}

                </p>



                <pre

                  className="
                  mt-2
                  text-xs
                  whitespace-pre-wrap
                  text-muted
                  "

                >

                  {JSON.stringify(
                    failure.record,
                    null,
                    2
                  )}

                </pre>



              </div>



            ))
          }



        </CardContent>


      </Card>



    </div>

  );

}