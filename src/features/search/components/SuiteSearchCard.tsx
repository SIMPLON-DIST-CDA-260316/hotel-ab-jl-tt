import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

interface SuiteSearchCardProps {
  suite: SuiteSearchResult;
}

export function SuiteSearchCard({ suite }: SuiteSearchCardProps) {
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(suite.price));

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10]">
        <Image
          src={suite.mainImage}
          alt={suite.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{suite.title}</h3>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {suite.capacity}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Badge variant="secondary" className="text-xs font-normal">
            {suite.establishmentName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            · {suite.city}
          </span>
        </div>
        {suite.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {suite.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
        <p>
          <span className="font-semibold">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground"> / nuit</span>
        </p>
        <Button asChild size="sm">
          <Link href={`/suites/${suite.id}`}>Voir la suite</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
