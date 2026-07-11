import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/retours")({
  component: RetoursPage,
  head: () => ({
    meta: [
      { title: "Retours & Remboursements — BLOSSOM" },
      { name: "description", content: "Politique de retour et de remboursement de Blossom." },
    ],
  }),
});

function RetoursPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Service client</p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Retours & Remboursements</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light">
          Votre satisfaction est notre priorité. Nous vous offrons 30 jours pour retourner vos achats.
        </p>
      </div>

      {/* Key points */}
      <div className="grid gap-4 md:grid-cols-3 mb-12">
        {[
          { icon: Clock, t: "30 jours", s: "Pour effectuer votre retour" },
          { icon: RefreshCw, t: "Retour gratuit", s: "Étiquette prépayée fournie" },
          { icon: CheckCircle, t: "Remboursement", s: "Sous 5–10 jours ouvrables" },
        ].map((i) => (
          <div key={i.t} className="border border-border p-5 text-center">
            <i.icon className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-semibold">{i.t}</p>
            <p className="mt-1 text-xs text-muted-foreground">{i.s}</p>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl italic mb-5 pb-2 border-b border-border">Conditions de retour</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" /> Produits acceptés
            </h3>
            <ul className="text-sm text-muted-foreground font-light space-y-1.5 pl-6">
              <li>• Produit non ouvert, dans son emballage d'origine</li>
              <li>• Produit reçu dans les 30 derniers jours</li>
              <li>• Produit accompagné de son ticket ou bon de commande</li>
              <li>• Emballage en parfait état (non endommagé, non griffé)</li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-500" /> Produits non remboursables
            </h3>
            <ul className="text-sm text-muted-foreground font-light space-y-1.5 pl-6">
              <li>• Produit ouvert ou utilisé (hygiène)</li>
              <li>• Produit endommagé par le client</li>
              <li>• Produit retourné après 30 jours</li>
              <li>• Échantillons et produits offerts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl italic mb-5 pb-2 border-b border-border">Comment effectuer un retour ?</h2>
        <div className="space-y-0">
          {[
            { step: "01", t: "Initiez la demande", d: "Connectez-vous à votre compte, allez dans « Mes commandes » et sélectionnez « Retourner un article »." },
            { step: "02", t: "Imprimez l'étiquette", d: "Téléchargez et imprimez l'étiquette de retour prépayée envoyée par email." },
            { step: "03", t: "Emballez votre retour", d: "Remettez le produit dans son emballage d'origine avec votre bon de commande." },
            { step: "04", t: "Déposez le colis", d: "Déposez votre colis dans n'importe quel point relais ou bureau de poste." },
          ].map((s, i) => (
            <div key={s.step} className={`flex gap-5 p-5 border border-border ${i > 0 ? "border-t-0" : ""}`}>
              <span className="font-serif text-2xl italic text-muted-foreground shrink-0 w-8">{s.step}</span>
              <div>
                <p className="text-sm font-semibold">{s.t}</p>
                <p className="mt-0.5 text-sm text-muted-foreground font-light">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Refund */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl italic mb-5 pb-2 border-b border-border">Remboursement</h2>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          Une fois votre retour reçu et vérifié, le remboursement est effectué dans un délai de{" "}
          <strong className="text-foreground">5 à 10 jours ouvrables</strong> sur le même moyen de paiement
          utilisé lors de l'achat. Vous recevrez un email de confirmation lors du traitement de votre remboursement.
        </p>
        <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed">
          Si vous avez payé par carte bancaire, le délai peut varier selon votre établissement bancaire.
        </p>
      </section>

      {/* CTA */}
      <div className="border border-border p-7 text-center">
        <p className="text-sm text-muted-foreground mb-4">Des questions sur votre retour ?</p>
        <Link
          to="/contact"
          className="inline-flex border border-foreground px-7 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          Contacter le service client
        </Link>
      </div>
    </div>
  );
}
