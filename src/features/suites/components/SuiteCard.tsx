import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuiteCardProps = {
  suite: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    mainImage: string;
    capacity: number;
  };
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function SuiteCard({ suite }: SuiteCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={suite.mainImage}
          alt={suite.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{suite.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {priceFormatter.format(Number(suite.price))} / nuit —{" "}
          {suite.capacity} personne{suite.capacity > 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        {suite.description && (
          <p className="text-sm">{suite.description}</p>
        )}
        <Link
          href={`/suites/${suite.id}`}
          className="mt-3 inline-block text-sm underline"
        >
          Voir la suite
        </Link>
      </CardContent>
    </Card>
  );
}
