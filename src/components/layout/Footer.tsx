import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-primary-foreground/10 bg-[oklch(0.16_0.08_303.5)] text-primary-foreground/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-semibold text-primary-foreground">
              Hôtels Clair de Lune
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              Chaîne hôtelière rurale
              <br />
              Centre de la France
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">
              Nos établissements
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Bourges
                </Link>
              </li>
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Clermont-Ferrand
                </Link>
              </li>
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Limoges
                </Link>
              </li>
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Orléans
                </Link>
              </li>
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Tours
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">
              Navigation
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Tous les établissements
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Inscription
                </Link>
              </li>
              <li>
                <Link
                  href="/inquiries/new"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">Contact</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>contact@clairdelune.fr</li>
              <li>01 23 45 67 89</li>
            </ul>
            <h3 className="mt-6 font-semibold text-primary-foreground">
              Légal
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href="/legal/terms"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Conditions générales d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/sales"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} Hôtels Clair de Lune — Tous droits
          réservés
        </div>
      </div>
    </footer>
  );
}
