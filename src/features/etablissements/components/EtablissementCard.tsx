import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EtablissementCardProps = {
  etablissement: {
    id: string;
    name: string;
    city: string;
    address: string;
    description: string | null;
    image: string | null;
  };
};

export function EtablissementCard({ etablissement }: EtablissementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{etablissement.name}</CardTitle>
        <CardDescription>
          {etablissement.city} — {etablissement.address}
        </CardDescription>
      </CardHeader>
      {etablissement.description && (
        <CardContent>
          <p className="text-sm">{etablissement.description}</p>
        </CardContent>
      )}
      <CardFooter>
        <Link
          href={`/etablissements/${etablissement.id}`}
          className="text-sm underline"
        >
          Voir détail
        </Link>
      </CardFooter>
    </Card>
  );
}
