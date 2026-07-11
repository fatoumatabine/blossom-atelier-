import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — BLOSSOM" },
      { name: "description", content: "Toutes les réponses à vos questions sur Blossom." },
    ],
  }),
});

const faqs = [
  {
    section: "Commandes & Livraison",
    items: [
      {
        q: "Comment passer une commande sur Blossom ?",
        a: "Ajoutez vos produits au panier, puis cliquez sur « Passer au paiement ». Vous devrez renseigner vos informations de livraison et choisir votre mode de paiement. Une confirmation vous sera envoyée par email.",
      },
      {
        q: "Quels sont les délais de livraison ?",
        a: "Les délais de livraison sont généralement de 1 à 2 jours ouvrables à Dakar. Pour les régions et l'international, le délai est confirmé après la commande.",
      },
      {
        q: "La livraison est-elle gratuite ?",
        a: "Oui ! La livraison est offerte à partir de 49 000 FCFA sur les zones éligibles. En dessous de ce montant, les frais sont confirmés selon votre adresse.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Dès la préparation de votre commande, l'équipe Blossom confirme le suivi par WhatsApp ou par email.",
      },
    ],
  },
  {
    section: "Retours & Remboursements",
    items: [
      {
        q: "Quelle est votre politique de retour ?",
        a: "Vous disposez de 30 jours après réception pour retourner un produit non ouvert et dans son emballage d'origine. Les retours sont gratuits.",
      },
      {
        q: "Comment effectuer un retour ?",
        a: "Connectez-vous à votre compte, rendez-vous dans « Mes commandes » et sélectionnez « Retourner un article ». Suivez les instructions pour générer une étiquette de retour gratuite.",
      },
      {
        q: "Quand serai-je remboursé ?",
        a: "Le remboursement est effectué dans un délai de 5 à 10 jours ouvrables après réception de votre retour, sur le même moyen de paiement utilisé lors de l'achat.",
      },
    ],
  },
  {
    section: "Produits & Authenticité",
    items: [
      {
        q: "Les produits sont-ils authentiques ?",
        a: "Absolument. Tous nos produits sont 100% authentiques et certifiés. Nous travaillons exclusivement avec des distributeurs officiels et des marques de confiance.",
      },
      {
        q: "Comment conserver mes parfums ?",
        a: "Pour préserver la qualité de vos parfums, rangez-les à l'abri de la lumière et des variations de température. Évitez les salles de bain humides et préférez une armoire à l'abri de la chaleur.",
      },
      {
        q: "Puis-je recevoir des échantillons ?",
        a: "Oui ! Nous glissons systématiquement des échantillons dans chaque commande. Vous pouvez également en faire la demande lors de votre commande dans la section « Notes ».",
      },
    ],
  },
  {
    section: "Compte & Fidélité",
    items: [
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur l'icône « Compte » dans la barre de navigation, puis sur « Créer un compte ». Renseignez vos informations et validez. Vous recevrez un email de confirmation.",
      },
      {
        q: "Comment fonctionne le programme de fidélité ?",
        a: "En créant un compte, vous bénéficiez automatiquement de notre programme de fidélité. Chaque euro dépensé vous rapporte des points échangeables contre des réductions sur vos prochaines commandes.",
      },
      {
        q: "Comment utiliser mon code promo WELCOME10 ?",
        a: "Renseignez votre email pour rejoindre notre newsletter et recevez le code WELCOME10 offrant -10% sur votre première commande. Entrez ce code lors du paiement dans la case « Code promo ».",
      },
    ],
  },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
          Aide & support
        </p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Questions fréquentes</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light">
          Vous avez une question ? Trouvez la réponse ici.
        </p>
      </div>

      {faqs.map((section) => (
        <div key={section.section} className="mb-10">
          <h2 className="font-serif text-xl italic mb-4 pb-2 border-b border-border">
            {section.section}
          </h2>
          <Accordion type="single" collapsible className="space-y-0">
            {section.items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`${section.section}-${i}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-light leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}

      {/* Contact CTA */}
      <div className="mt-12 border border-border p-8 text-center">
        <h3 className="font-serif text-2xl italic">Vous n'avez pas trouvé votre réponse ?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Notre équipe est là pour vous aider.</p>
        <a
          href="/contact"
          className="mt-5 inline-flex border border-foreground px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
}
