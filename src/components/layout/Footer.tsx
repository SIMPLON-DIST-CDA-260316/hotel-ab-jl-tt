import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">Hôtels Clair de Lune</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Chaîne hôtelière rurale
              <br />
              Centre de la France
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Navigation</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link
                  href="/establishments"
                  className="transition-colors hover:text-white"
                >
                  Nos établissements
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="transition-colors hover:text-white"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="transition-colors hover:text-white"
                >
                  Inscription
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>contact@clairdelune.fr</li>
              <li>01 23 45 67 89</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Hôtels Clair de Lune — Tous droits
          réservés
        </div>
      </div>
    </footer>
  );
}
