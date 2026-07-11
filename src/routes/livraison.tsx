import { createFileRoute } from "@tanstack/react-router";
import { Truck, Package, Clock, MapPin, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/livraison")({
  component: LivraisonPage,
  head: () => ({
    meta: [
      { title: "Livraison — BLOSSOM" },
      {
        name: "description",
        content: "Tout savoir sur la livraison et le suivi de vos commandes Blossom.",
      },
    ],
  }),
});

const zones = [
  { zone: "Dakar", delai: "1 – 2 jours ouvrables", prix: "Offerte dès 49 000 FCFA" },
  { zone: "Sénégal régions", delai: "2 – 4 jours ouvrables", prix: "À confirmer" },
  { zone: "Mauritanie", delai: "3 – 6 jours ouvrables", prix: "À confirmer" },
  { zone: "International", delai: "7 – 14 jours ouvrables", prix: "À confirmer" },
];

function LivraisonPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
          Expédition & Suivi
        </p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Livraison</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light max-w-md mx-auto">
          Nous nous occupons de tout pour que vos produits arrivent en parfait état, rapidement.
        </p>
      </div>

      {/* Key info */}
      <div className="grid gap-4 md:grid-cols-4 mb-14">
        {[
          { icon: Truck, t: "Livraison offerte", s: "Dès 49 000 FCFA" },
          { icon: Package, t: "Emballage soigné", s: "Protège vos produits" },
          { icon: Clock, t: "Livraison express", s: "1–2 jours ouvrables" },
          { icon: RefreshCw, t: "Retours gratuits", s: "Sous 30 jours" },
        ].map((i) => (
          <div key={i.t} className="border border-border p-5 text-center">
            <i.icon className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider">{i.t}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{i.s}</p>
          </div>
        ))}
      </div>

      {/* Zones et tarifs */}
      <section className="mb-14">
        <h2 className="font-serif text-2xl italic mb-6">Zones et tarifs de livraison</h2>
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-semibold">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-semibold">
                  Délai estimé
                </th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-semibold">
                  Tarif
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr
                  key={z.zone}
                  className={`border-b border-border ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3 font-medium">{z.zone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{z.delai}</td>
                  <td className="px-4 py-3 text-muted-foreground">{z.prix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          * Les délais indiqués sont des estimations et peuvent varier selon les transporteurs.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-14">
        <h2 className="font-serif text-2xl italic mb-6">Comment ça marche ?</h2>
        <div className="space-y-0">
          {[
            {
              step: "01",
              title: "Commande validée",
              desc: "Votre commande est traitée et préparée par notre équipe sous 24h ouvrables.",
            },
            {
              step: "02",
              title: "Emballage soigné",
              desc: "Vos produits sont soigneusement emballés dans un packaging élégant, avec des échantillons offerts.",
            },
            {
              step: "03",
              title: "Expédition",
              desc: "Votre colis est remis au transporteur. Vous recevez un email avec votre numéro de suivi.",
            },
            {
              step: "04",
              title: "Livraison",
              desc: "Votre commande arrive à l'adresse indiquée dans les délais prévus.",
            },
          ].map((s, i) => (
            <div
              key={s.step}
              className={`flex items-start gap-6 p-6 border border-border ${i > 0 ? "border-t-0" : ""}`}
            >
              <span className="font-serif text-3xl italic text-muted-foreground shrink-0">
                {s.step}
              </span>
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-light">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suivi de colis */}
      <section className="border border-border p-8">
        <h2 className="font-serif text-2xl italic mb-3">Suivre mon colis</h2>
        <p className="text-sm text-muted-foreground mb-5 font-light">
          Entrez votre numéro de commande ou de suivi pour localiser votre colis.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Numéro de commande ou de suivi"
            className="flex-1 border border-border px-4 py-3 text-sm focus:border-foreground focus:outline-none"
          />
          <button className="bg-foreground text-background px-6 py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-foreground/80 transition-colors whitespace-nowrap flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Suivre
          </button>
        </form>
      </section>
    </div>
  );
}
