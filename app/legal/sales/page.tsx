export default function SalesTermsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">
        Conditions générales de vente
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Dernière mise à jour : mars 2026
      </p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            1. Objet
          </h2>
          <p className="mt-2">
            Les présentes conditions générales de vente s&apos;appliquent à
            toute réservation effectuée sur le site Hôtels Clair de Lune. Elles
            définissent les droits et obligations des parties dans le cadre de
            la prestation de services d&apos;hébergement.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Tarifs et paiement
          </h2>
          <p className="mt-2">
            Les tarifs sont indiqués en euros, toutes taxes comprises. Le
            paiement est exigible au moment de la réservation. Les moyens de
            paiement acceptés sont les cartes bancaires Visa, Mastercard et
            American Express.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            3. Annulation et remboursement
          </h2>
          <p className="mt-2">
            Toute annulation effectuée plus de 3 jours avant la date
            d&apos;arrivée donne lieu à un remboursement intégral. En deçà de ce
            délai, le montant de la première nuitée sera retenu.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            4. Arrivée et départ
          </h2>
          <p className="mt-2">
            Les horaires d&apos;arrivée et de départ sont définis par chaque
            établissement et communiqués lors de la confirmation de réservation.
            Tout départ anticipé ne donne pas lieu à remboursement.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">
            5. Réclamations
          </h2>
          <p className="mt-2">
            Toute réclamation doit être adressée par email à
            contact@clairdelune.fr dans un délai de 30 jours suivant la fin du
            séjour.
          </p>
        </section>
      </div>
    </main>
  );
}
