import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Evidence } from "./types";


interface Props {
  data: Evidence[];
}


export default function EvidenceChain({
  data,
}: Props) {


  return (

    <Card className="mt-6">


      <CardHeader>

        <CardTitle>
          Evidence Chain
        </CardTitle>

      </CardHeader>



      <CardContent className="space-y-4">


        {data.map((item,index)=>(


          <div
            key={index}
            className="
            rounded-lg
            border
            p-4
            "
          >


            <p className="font-semibold text-fg">

              {item.source}

            </p>



            <p className="mt-2 text-sm text-muted">

              {item.finding}

            </p>



            <p className="mt-2 text-xs text-dim">

              Relation: {item.relation}

            </p>


          </div>


        ))}



      </CardContent>


    </Card>

  );

}