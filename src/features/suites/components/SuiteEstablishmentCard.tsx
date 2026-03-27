import Link from "next/link";
import { ImageIcon, ChevronRight } from "lucide-react";

type SuiteEstablishmentCardProps = {
  establishment: { id: string; name: string };
};

export function SuiteEstablishmentCard({ establishment }: SuiteEstablishmentCardProps) {
  return (
    <section className="mb-10 border-b border-border pb-10" aria-labelledby="establishment-heading">
      <Link
        href={`/establishments/${establishment.id}`}
        className="group flex items-start gap-6"
      >
        <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ImageIcon className="size-8" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            L&apos;établissement
          </p>
          <h2 id="establishment-heading" className="mb-2 text-base font-semibold text-foreground">
            {establishment.name}
          </h2>
          <p className="inline-flex items-center gap-1 text-sm font-light text-muted-foreground underline underline-offset-2 transition-colors group-hover:text-foreground">
            Voir l&apos;établissement
            <ChevronRight className="size-3.5" aria-hidden />
          </p>
        </div>
      </Link>
    </section>
  );
}
