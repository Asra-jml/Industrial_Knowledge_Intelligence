"use client";

import { useState } from "react";
import { Search, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";


interface RCAFormProps {
  onAnalyze: (
    equipment: string,
    fault: string
  ) => void;

  loading: boolean;
}


export default function RCAForm({
  onAnalyze,
  loading,
}: RCAFormProps) {


  const [equipment, setEquipment] =
    useState("P-101");


  const [fault, setFault] =
    useState("bearing vibration");



  function submit(
    e: React.FormEvent
  ) {

    e.preventDefault();


    if(
      !equipment.trim() ||
      !fault.trim()
    ){
      return;
    }


    onAnalyze(
      equipment,
      fault
    );

  }



  return (

    <Card>


      <CardHeader>

        <div>

          <Badge variant="accent">
            F3
          </Badge>


          <CardTitle className="mt-3 flex items-center gap-2">

            <Wrench className="h-5 w-5 text-accent" />

            Maintenance Intelligence & RCA

          </CardTitle>



          <p className="mt-2 text-sm text-muted-foreground">

            Predict failures and identify the real root cause using
            sensor data, work orders, inspection history and OEM knowledge.

          </p>


        </div>

      </CardHeader>




      <CardContent>


        <form
          onSubmit={submit}
          className="grid gap-4 md:grid-cols-3"
        >


          <Input

            value={equipment}

            onChange={
              (e)=>
              setEquipment(e.target.value)
            }

            placeholder="Equipment ID"

          />



          <Input

            value={fault}

            onChange={
              (e)=>
              setFault(e.target.value)
            }

            placeholder="Fault description"

          />



          <Button

            type="submit"

            disabled={loading}

            className="gap-2"

          >


            <Search className="h-4 w-4" />


            {
              loading
              ? "Analyzing..."
              : "Analyze RCA"
            }


          </Button>



        </form>


      </CardContent>


    </Card>

  );

}