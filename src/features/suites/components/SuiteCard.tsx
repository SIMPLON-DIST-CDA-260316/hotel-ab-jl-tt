import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { priceFormatter } from "@/lib/formatters";

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

export function SuiteCard({ suite }: SuiteCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10]">
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
      {suite.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{suite.description}</p>
        </CardContent>
      )}
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link href={`/suites/${suite.id}`}>
            Voir la suite
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
