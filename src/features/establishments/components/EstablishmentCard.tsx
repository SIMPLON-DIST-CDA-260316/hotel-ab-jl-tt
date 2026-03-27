import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EstablishmentCardProps = {
  establishment: {
    id: string;
    name: string;
    city: string;
    address: string;
    description: string | null;
    image: string | null;
  };
};

export function EstablishmentCard({ establishment }: EstablishmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{establishment.name}</CardTitle>
        <CardDescription>
          {establishment.city} — {establishment.address}
        </CardDescription>
      </CardHeader>
      {establishment.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{establishment.description}</p>
        </CardContent>
      )}
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link href={`/establishments/${establishment.id}`}>
            Voir détail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
