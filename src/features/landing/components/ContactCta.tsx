import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <section className="bg-primary py-16 text-center text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-light">
          Une question ? Un besoin particulier ?
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/60">
          Notre équipe vous répond sous 24h
        </p>
        <Button asChild variant="secondary" size="lg" className="mt-6">
          <Link href="/inquiries/new">Contactez-nous</Link>
        </Button>
      </div>
    </section>
  );
}
