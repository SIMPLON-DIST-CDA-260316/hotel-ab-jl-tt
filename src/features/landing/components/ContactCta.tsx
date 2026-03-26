import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <section className="bg-gray-900 py-16 text-center text-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-light">
          Une question ? Un besoin particulier ?
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Notre équipe vous répond sous 24h
        </p>
        <Button asChild variant="secondary" size="lg" className="mt-6">
          <Link href="/inquiries/new">Contactez-nous</Link>
        </Button>
      </div>
    </section>
  );
}
