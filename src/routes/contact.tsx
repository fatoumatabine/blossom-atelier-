import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Clock, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contactez-nous — BLOSSOM" },
      { name: "description", content: "Contactez l'équipe Blossom pour toute question ou demande." },
    ],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Nous sommes là</p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Contactez-nous</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light max-w-md mx-auto">
          Une question sur une commande, un produit ou notre service ? Notre équipe vous répond rapidement.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Info */}
        <div>
          <h2 className="font-serif text-2xl italic mb-6">Informations de contact</h2>
          <div className="space-y-6">
            {[
              { icon: Phone, label: "Téléphone", value: "787932424", sub: "Du lundi au vendredi, 9h – 18h" },
              { icon: Mail, label: "Email", value: "info@blossom.com", sub: "Réponse sous 24h ouvrables" },
              { icon: Clock, label: "Horaires", value: "Lun – Ven : 9h00 – 18h00", sub: "Sam : 10h00 – 14h00" },
              { icon: MapPin, label: "Adresse", value: "123 Rue de la Beauté", sub: "Dakar, Sénégal" },
            ].map((i) => (
              <div key={i.label} className="flex items-start gap-4 border-b border-border pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
                  <i.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-semibold">{i.label}</p>
                  <p className="mt-0.5 text-sm text-foreground">{i.value}</p>
                  <p className="text-xs text-muted-foreground">{i.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="font-serif text-2xl italic mb-6">Envoyez-nous un message</h2>
          {sent ? (
            <div className="border border-border p-8 text-center">
              <Send className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-serif text-xl italic">Message envoyé !</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 border border-border px-6 py-2.5 text-[11px] uppercase tracking-widest hover:border-foreground transition-colors"
              >
                Nouveau message
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSending(true);
                setError("");

                const form = new FormData(e.currentTarget);
                try {
                  const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      firstName: String(form.get("firstName") ?? ""),
                      lastName: String(form.get("lastName") ?? ""),
                      email: String(form.get("email") ?? ""),
                      subject: String(form.get("subject") ?? "Autre"),
                      message: String(form.get("message") ?? ""),
                    }),
                  });
                  const data = (await response.json().catch(() => ({}))) as { error?: string };
                  if (!response.ok) {
                    throw new Error(data.error ?? "Impossible d'envoyer le message.");
                  }
                  setSent(true);
                } catch (sendError) {
                  setError(sendError instanceof Error ? sendError.message : "Impossible d'envoyer le message.");
                } finally {
                  setSending(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest mb-1.5">Prénom</label>
                  <input
                    name="firstName"
                    required
                    type="text"
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest mb-1.5">Nom</label>
                  <input
                    name="lastName"
                    required
                    type="text"
                    className="w-full border border-border px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5">Email</label>
                <input
                  name="email"
                  required
                  type="email"
                  className="w-full border border-border px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5">Sujet</label>
                <select name="subject" className="w-full border border-border px-3 py-2.5 text-sm focus:border-foreground focus:outline-none bg-background">
                  <option value="">Choisir un sujet</option>
                  <option>Commande & Livraison</option>
                  <option>Retour & Remboursement</option>
                  <option>Produit & Conseil</option>
                  <option>Programme fidélité</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:border-foreground focus:outline-none resize-none"
                  placeholder="Votre message..."
                />
              </div>
              {error && <p className="text-sm text-promo">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-foreground text-background py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-foreground/80 transition-colors"
              >
                {sending ? "Envoi..." : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
