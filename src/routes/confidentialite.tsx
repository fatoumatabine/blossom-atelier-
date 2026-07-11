import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  component: ConfidentialitePage,
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — BLOSSOM" },
      { name: "description", content: "Politique de confidentialité et de protection des données personnelles de Blossom." },
    ],
  }),
});

const sections = [
  {
    title: "1. Qui sommes-nous ?",
    content: `Blossom est une boutique en ligne spécialisée dans la vente de parfums, maquillage et soins haut de gamme. Nous agissons en tant que responsable du traitement de vos données personnelles.`,
  },
  {
    title: "2. Quelles données collectons-nous ?",
    content: `Nous collectons les données que vous nous fournissez directement : nom, prénom, adresse email, adresse postale, numéro de téléphone, informations de paiement (de manière sécurisée). Nous collectons également des données de navigation (cookies, adresse IP, pages visitées) pour améliorer votre expérience.`,
  },
  {
    title: "3. Pourquoi collectons-nous vos données ?",
    content: `Vos données sont utilisées pour : traiter et suivre vos commandes, gérer votre compte client, vous envoyer des communications commerciales (avec votre consentement), améliorer nos services et personnaliser votre expérience, respecter nos obligations légales et comptables.`,
  },
  {
    title: "4. Base légale du traitement",
    content: `Le traitement de vos données repose sur : l'exécution du contrat de vente, votre consentement (pour les newsletters et cookies non essentiels), nos obligations légales, et nos intérêts légitimes (prévention de la fraude, amélioration de nos services).`,
  },
  {
    title: "5. Partage de vos données",
    content: `Nous ne vendons jamais vos données à des tiers. Nous pouvons partager vos données avec : nos prestataires de livraison (pour expédier vos commandes), nos prestataires de paiement (Stripe, PayPal), nos outils d'analyse (Google Analytics, anonymisé), et nos partenaires légaux si requis.`,
  },
  {
    title: "6. Durée de conservation",
    content: `Nous conservons vos données personnelles pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, et au minimum pendant la durée légale applicable : 3 ans pour les données clients actifs, 10 ans pour les données comptables et de facturation.`,
  },
  {
    title: "7. Vos droits",
    content: `Conformément au RGPD, vous disposez des droits suivants : droit d'accès, de rectification, d'effacement, d'opposition, de portabilité et de limitation du traitement. Pour exercer ces droits, contactez-nous à privacy@blossom.com ou par courrier. Vous pouvez également adresser une réclamation à la CNIL.`,
  },
  {
    title: "8. Cookies",
    content: `Nous utilisons des cookies essentiels au fonctionnement du site, des cookies analytiques (avec votre consentement) pour mesurer l'audience, et des cookies marketing (avec votre consentement) pour personnaliser les publicités. Vous pouvez gérer vos préférences de cookies via le bandeau de cookies ou les paramètres de votre navigateur.`,
  },
  {
    title: "9. Sécurité",
    content: `Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Les données de paiement sont chiffrées via TLS/SSL.`,
  },
  {
    title: "10. Modifications",
    content: `Nous nous réservons le droit de modifier cette politique à tout moment. Toute modification substantielle vous sera notifiée par email ou par un message visible sur notre site.`,
  },
];

function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Mentions légales</p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Politique de confidentialité</h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Dernière mise à jour : Janvier {new Date().getFullYear()}
        </p>
      </div>

      <p className="mb-8 text-sm text-muted-foreground font-light leading-relaxed border-l-2 border-border pl-4">
        Chez Blossom, la protection de vos données personnelles est une priorité. Cette politique explique quelles données nous collectons, comment nous les utilisons et vos droits en tant qu'utilisateur.
      </p>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="border-b border-border pb-8">
            <h2 className="font-serif text-xl italic mb-3">{s.title}</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">{s.content}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground text-center">
        Contact DPO :{" "}
        <a href="mailto:privacy@blossom.com" className="underline hover:text-foreground">privacy@blossom.com</a>
      </p>
    </div>
  );
}
