export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">
        Politique de confidentialité
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            1. Responsable du traitement
          </h2>
          <p className="mt-2">
            Hôtels Clair de Lune, chaîne hôtelière rurale — Centre de la
            France. Contact : contact@clairdelune.fr.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Données collectées
          </h2>
          <p className="mt-2">
            Nous collectons les données suivantes : nom, prénom, adresse email,
            numéro de téléphone et informations de réservation. Ces données sont
            nécessaires à la gestion de vos réservations et à la communication
            relative à votre séjour.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            3. Finalités du traitement
          </h2>
          <p className="mt-2">
            Vos données sont utilisées pour la gestion des réservations,
            l&apos;envoi de confirmations, la communication commerciale (avec
            votre consentement) et l&apos;amélioration de nos services.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            4. Vos droits
          </h2>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification, de suppression et de portabilité de vos données. Pour
            exercer ces droits, contactez-nous à contact@clairdelune.fr.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            5. Cookies
          </h2>
          <p className="mt-2">
            Le site utilise des cookies techniques nécessaires à son bon
            fonctionnement. Aucun cookie publicitaire n&apos;est utilisé sans
            votre consentement explicite.
          </p>
        </section>
      </div>
    </main>
  );
}
