import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface Props {
  parts: string[];
}

export default function SpareParts({
  parts,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Spare Parts</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex flex-wrap gap-3">

          {parts.map((part, index) => (
            <Badge
              key={index}
              variant="outline"
            >
              {part}
            </Badge>
          ))}

        </div>

      </CardContent>
    </Card>
  );
}