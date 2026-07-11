import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cgv")({
  component: CgvPage,
  head: () => ({
    meta: [
      { title: "Conditions Générales de Vente — BLOSSOM" },
      { name: "description", content: "Conditions générales de vente de Blossom." },
    ],
  }),
});

const sections = [
  {
    title: "Article 1 — Objet",
    content: `Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les ventes conclues sur le site blossom.com entre la société Blossom et tout consommateur ou professionnel souhaitant procéder à un achat. L'acheteur déclare avoir pris connaissance et accepté les présentes CGV avant de passer commande.`,
  },
  {
    title: "Article 2 — Produits",
    content: `Les produits proposés à la vente sont ceux qui figurent sur le site, dans la limite des stocks disponibles. Blossom se réserve le droit de modifier à tout moment l'assortiment de produits. Les photographies et descriptions des produits sont présentées à titre illustratif et ne sont pas contractuelles.`,
  },
  {
    title: "Article 3 — Prix",
    content: `Les prix des produits sont indiqués en euros, toutes taxes comprises (TTC). Blossom se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de l'enregistrement des commandes. Les prix comprennent les taxes applicables en vigueur au jour de la commande. Les frais de livraison sont indiqués séparément et récapitulés avant la validation de la commande.`,
  },
  {
    title: "Article 4 — Commandes",
    content: `Pour passer commande, l'acheteur doit créer un compte ou passer commande en tant qu'invité, renseigner les informations demandées et valider son panier. La vente est réputée conclue à réception du paiement. Blossom se réserve le droit d'annuler ou de refuser toute commande en cas de litige relatif au paiement d'une commande antérieure ou de suspicion de fraude.`,
  },
  {
    title: "Article 5 — Paiement",
    content: `Le paiement est dû immédiatement à la commande. Le paiement peut se faire par carte bancaire (Visa, Mastercard), PayPal ou tout autre moyen indiqué sur le site. En cas de paiement par carte bancaire, les données de paiement sont sécurisées par un système de cryptage SSL.`,
  },
  {
    title: "Article 6 — Livraison",
    content: `Les produits sont livrés à l'adresse de livraison indiquée par l'acheteur lors de la commande. Les délais de livraison sont indiqués à titre indicatif. Tout retard de livraison ne peut donner lieu à des dommages et intérêts en faveur de l'acheteur, ou annulation de la commande, sauf si le retard excède 30 jours.`,
  },
  {
    title: "Article 7 — Droit de rétractation",
    content: `Conformément à la législation en vigueur, l'acheteur dispose d'un délai de 14 jours à compter de la réception du produit pour exercer son droit de rétractation. Ce droit ne s'applique pas aux produits qui ont été ouverts ou utilisés. Pour exercer ce droit, l'acheteur doit notifier sa décision à Blossom par email ou via son espace compte.`,
  },
  {
    title: "Article 8 — Garanties",
    content: `Tous les produits vendus sur Blossom bénéficient de la garantie légale de conformité et de la garantie légale contre les vices cachés. Blossom s'engage à fournir des produits authentiques et en parfait état.`,
  },
  {
    title: "Article 9 — Responsabilité",
    content: `Blossom ne peut être tenu pour responsable des dommages résultant d'une mauvaise utilisation du produit acheté. La responsabilité de Blossom ne pourra pas être engagée pour tous les inconvénients ou dommages inhérents à l'utilisation du réseau Internet.`,
  },
  {
    title: "Article 10 — Données personnelles",
    content: `Blossom s'engage à protéger les données personnelles de ses clients conformément à la réglementation en vigueur (RGPD). Les données collectées sont utilisées uniquement pour le traitement des commandes et l'amélioration du service. Pour plus d'informations, consultez notre Politique de Confidentialité.`,
  },
  {
    title: "Article 11 — Droit applicable",
    content: `Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera soumis aux tribunaux compétents.`,
  },
];

function CgvPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Mentions légales</p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Conditions Générales de Vente</h1>
        <p className="mt-3 text-xs text-muted-foreground">Dernière mise à jour : Janvier {new Date().getFullYear()}</p>
      </div>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="border-b border-border pb-8">
            <h2 className="font-serif text-xl italic mb-3">{s.title}</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">{s.content}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground text-center">
        Pour toute question relative aux présentes CGV, contactez-nous à{" "}
        <a href="mailto:legal@blossom.com" className="underline hover:text-foreground">legal@blossom.com</a>
      </p>
    </div>
  );
}
