import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface Props {

  data:string[];

}



export default function Recommendations({
  data,
}:Props){


return (

<Card className="mt-6">


<CardHeader>

<CardTitle>
Maintenance Recommendations
</CardTitle>

</CardHeader>



<CardContent>


<ul className="space-y-3">


{
data.map((item,index)=>(


<li
key={index}
className="
rounded-lg
border
p-3
text-sm
"
>

{item}

</li>


))
}



</ul>


</CardContent>


</Card>


);


}