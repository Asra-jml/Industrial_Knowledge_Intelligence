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

    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-edge-strong">


      <CardHeader className="pb-3">
      <CardTitle>
    Analyze Equipment
      </CardTitle>
       </CardHeader>




      <CardContent className="pt-2">


        <form
          onSubmit={submit}
          className="grid gap-3 md:grid-cols-3"
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

            className="gap-2 shadow-sm"

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