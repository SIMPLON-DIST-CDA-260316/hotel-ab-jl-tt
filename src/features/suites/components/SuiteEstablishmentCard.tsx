import Link from "next/link";

type SuiteEstablishmentCardProps = {
  establishment: { id: string; name: string };
};

export function SuiteEstablishmentCard({ establishment }: SuiteEstablishmentCardProps) {
  return (
    <section className="border-b border-zinc-100 pb-10 mb-10" aria-labelledby="establishment-heading">
      <Link
        href={`/establishments/${establishment.id}`}
        className="flex items-start gap-6 group"
      >
        <div className="shrink-0 size-24 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
          <svg className="size-8" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-zinc-400 tracking-widest uppercase mb-1">
            L&apos;établissement
          </p>
          <h2 id="establishment-heading" className="text-base font-semibold text-zinc-800 mb-2">
            {establishment.name}
          </h2>
          <p className="text-sm font-light text-zinc-400 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1 underline underline-offset-2">
            Voir l&apos;établissement
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </p>
        </div>
      </Link>
    </section>
  );
}
