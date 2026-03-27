import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
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
    <Card className="overflow-hidden py-0">
      {establishment.image && (
        <div className="relative aspect-[16/10]">
          <Image
            src={establishment.image}
            alt={establishment.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold">{establishment.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {establishment.city} — {establishment.address}
        </p>
        {establishment.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {establishment.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end px-4 pb-4 pt-0">
        <Button asChild size="sm">
          <Link href={`/establishments/${establishment.id}`}>
            Voir détail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
