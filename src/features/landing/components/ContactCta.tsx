import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <section className="bg-gradient-to-b from-primary to-[oklch(0.20_0.09_303.5)] py-24 text-center text-primary-foreground">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Une question ? Un besoin particulier ?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-primary-foreground/60">
          Notre équipe vous répond sous 24h pour vous aider à préparer votre
          séjour idéal.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-accent px-10 text-base font-bold text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/inquiries/new">Contactez-nous</Link>
        </Button>
      </div>
    </section>
  );
}
