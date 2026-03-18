import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
          <p className="text-sm">{establishment.description}</p>
        </CardContent>
      )}
      <CardFooter>
        <Link
          href={`/etablissements/${establishment.id}`}
          className="text-sm underline"
        >
          Voir détail
        </Link>
      </CardFooter>
    </Card>
  );
}
