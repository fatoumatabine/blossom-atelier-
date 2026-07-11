import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCart } from "@/context/cart";
import { formatCfa } from "@/lib/format";
import {
  ChevronRight,
  Lock,
  CheckCircle,
  Truck,
  CreditCard,
  Package,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Commande — BLOSSOM" },
      { name: "description", content: "Finalisez votre commande Blossom." },
    ],
  }),
});

// ── Schemas ──────────────────────────────────────────────────────────────────

const shippingSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Adresse e-mail invalide"),
  phone: z.string().min(8, "Numéro invalide"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal requis"),
  country: z.string().min(2, "Pays requis"),
});

const paymentSchema = z.object({
  promoCode: z.string().optional(),
});

type ShippingData = z.infer<typeof shippingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

const whatsappOrderNumber = "221787932424";

function absoluteAssetUrl(src: string) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return "Image envoyée depuis l'administration";
  if (typeof window === "undefined") return src;
  return new URL(src, window.location.origin).toString();
}

function buildWhatsappOrderMessage({
  orderId,
  shippingData,
  items,
  promoApplied,
  total,
}: {
  orderId?: string;
  shippingData: ShippingData;
  items: ReturnType<typeof useCart>["items"];
  promoApplied: boolean;
  total: number;
}) {
  const discount = promoApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;

  const lines = [
    "Nouvelle commande BLOSSOM",
    "",
    `Commande: ${orderId ?? "En attente"}`,
    `Client: ${shippingData.firstName} ${shippingData.lastName}`,
    `Téléphone: ${shippingData.phone}`,
    `Email: ${shippingData.email}`,
    `Adresse: ${shippingData.address}, ${shippingData.postalCode} ${shippingData.city}, ${shippingData.country}`,
    "",
    "Produits:",
    ...items.flatMap((item, index) => [
      `${index + 1}. ${item.name}`,
      `Marque: ${item.brand}`,
      `Quantité: ${item.quantity}`,
      `Prix unitaire: ${formatCfa(item.price)}`,
      `Sous-total produit: ${formatCfa(item.price * item.quantity)}`,
      `Image: ${absoluteAssetUrl(item.image)}`,
      "",
    ]),
    `Sous-total: ${formatCfa(total)}`,
    promoApplied ? `Réduction WELCOME10: -${formatCfa(discount)}` : "",
    "Livraison: Offerte",
    `Total: ${formatCfa(finalTotal)}`,
  ].filter(Boolean);

  return lines.join("\n");
}

function redirectOrderToWhatsapp(message: string) {
  const url = `https://wa.me/${whatsappOrderNumber}?text=${encodeURIComponent(message)}`;
  window.location.href = url;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest mb-1.5 text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-promo">{error}</p>}
    </div>
  );
}

function StepInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full border px-3 py-3 text-sm focus:outline-none transition-colors ${
        error ? "border-promo focus:border-promo" : "border-border focus:border-foreground"
      } ${props.className ?? ""}`}
    />
  );
}

function OrderSummary({ promoApplied }: { promoApplied?: boolean }) {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="border border-border p-6 text-center text-sm text-muted-foreground">
        Votre panier est vide.
      </div>
    );
  }

  const discount = promoApplied ? total * 0.1 : 0;
  const finalTotal = total - discount;

  return (
    <div className="border border-border overflow-hidden">
      <div className="bg-muted/40 px-5 py-4 border-b border-border">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest">
          Résumé de la commande
        </h3>
      </div>
      <ul className="divide-y divide-border max-h-64 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 p-4">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background font-semibold">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">{item.brand}</p>
            </div>
            <p className="text-sm font-medium shrink-0">{formatCfa(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-border p-5 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span>{formatCfa(total)}</span>
        </div>
        {promoApplied && (
          <div className="flex justify-between text-sm text-promo">
            <span>Code WELCOME10 (-10%)</span>
            <span>-{formatCfa(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className="text-gold">Offerte</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatCfa(finalTotal)}</span>
        </div>
      </div>

      {/* Reassurances */}
      <div className="border-t border-border px-5 py-4 space-y-2">
        {[
          { icon: Lock, label: "Commande confirmée par WhatsApp" },
          { icon: Truck, label: "Livraison offerte dès 49 000 FCFA" },
          { icon: Package, label: "Retour gratuit 30 jours" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <r.icon className="h-3.5 w-3.5 shrink-0" />
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Shipping ──────────────────────────────────────────────────────────

function ShippingForm({ onNext }: { onNext: (data: ShippingData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({ resolver: zodResolver(shippingSchema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Prénom *" error={errors.firstName?.message}>
          <StepInput {...register("firstName")} placeholder="Aminata" error={!!errors.firstName} />
        </FieldRow>
        <FieldRow label="Nom *" error={errors.lastName?.message}>
          <StepInput {...register("lastName")} placeholder="Diop" error={!!errors.lastName} />
        </FieldRow>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Email *" error={errors.email?.message}>
          <StepInput
            {...register("email")}
            type="email"
            placeholder="aminata@email.com"
            error={!!errors.email}
          />
        </FieldRow>
        <FieldRow label="Téléphone *" error={errors.phone?.message}>
          <StepInput
            {...register("phone")}
            type="tel"
            placeholder="+221 77 000 00 00"
            error={!!errors.phone}
          />
        </FieldRow>
      </div>

      <FieldRow label="Adresse *" error={errors.address?.message}>
        <StepInput
          {...register("address")}
          placeholder="Avenue Cheikh Anta Diop"
          error={!!errors.address}
        />
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldRow label="Code postal *" error={errors.postalCode?.message}>
          <StepInput {...register("postalCode")} placeholder="00000" error={!!errors.postalCode} />
        </FieldRow>
        <FieldRow label="Ville *" error={errors.city?.message}>
          <StepInput {...register("city")} placeholder="Dakar" error={!!errors.city} />
        </FieldRow>
        <FieldRow label="Pays *" error={errors.country?.message}>
          <select
            {...register("country")}
            defaultValue=""
            className={`w-full border px-3 py-3 text-sm bg-background focus:outline-none transition-colors ${
              errors.country ? "border-promo" : "border-border focus:border-foreground"
            }`}
          >
            <option value="" disabled>
              Choisir...
            </option>
            <option value="SN">Sénégal</option>
            <option value="MR">Mauritanie</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="ML">Mali</option>
            <option value="GN">Guinée</option>
            <option value="FR">France</option>
            <option value="MA">Maroc</option>
            <option value="OTHER">Autre</option>
          </select>
          {errors.country && <p className="mt-1 text-xs text-promo">{errors.country.message}</p>}
        </FieldRow>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-foreground text-background py-3.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-foreground/80 transition-colors flex items-center justify-center gap-2"
        >
          Continuer vers la validation <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────

function PaymentForm({
  onNext,
  onBack,
  onPromoApply,
}: {
  onNext: (data: PaymentData) => void;
  onBack: () => void;
  onPromoApply: (applied: boolean) => void;
}) {
  const { register, handleSubmit, watch } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
  });

  const promoCode = watch("promoCode");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handlePromoCheck = () => {
    if (promoCode?.toUpperCase() === "WELCOME10") {
      setPromoStatus("valid");
      onPromoApply(true);
    } else {
      setPromoStatus("invalid");
      onPromoApply(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 text-foreground" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest">
              Paiement à confirmer
            </p>
            <p className="mt-2 text-sm font-light leading-6 text-muted-foreground">
              Votre commande sera enregistrée puis envoyée sur WhatsApp avec le détail des produits.
              Le paiement se confirme ensuite avec l'équipe Blossom.
            </p>
          </div>
        </div>
      </div>

      {/* Promo code */}
      <div>
        <label className="block text-[11px] uppercase tracking-widest mb-1.5">Code promo</label>
        <div className="flex gap-2">
          <StepInput {...register("promoCode")} placeholder="WELCOME10" className="uppercase" />
          <button
            type="button"
            onClick={handlePromoCheck}
            className="shrink-0 border border-border px-4 py-3 text-[11px] uppercase tracking-widest hover:border-foreground transition-colors whitespace-nowrap"
          >
            Appliquer
          </button>
        </div>
        {promoStatus === "valid" && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Code appliqué — -10%
          </p>
        )}
        {promoStatus === "invalid" && (
          <p className="mt-1 text-xs text-promo">Code invalide ou expiré.</p>
        )}
      </div>

      <div className="flex items-center gap-2 border border-border p-3 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        Aucune donnée bancaire n'est demandée ni stockée sur cette page.
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          className="w-full bg-foreground text-background py-3.5 text-[11px] font-semibold uppercase tracking-widest hover:bg-foreground/80 transition-colors flex items-center justify-center gap-2"
        >
          <Lock className="h-3.5 w-3.5" /> Confirmer et envoyer sur WhatsApp
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full border border-border py-3 text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à la livraison
        </button>
      </div>
    </form>
  );
}

// ── Step 3: Confirmation ──────────────────────────────────────────────────────

function ConfirmationStep({ email, orderId }: { email: string; orderId?: string }) {
  const navigate = useNavigate();
  const orderNumber = orderId ?? `BLS-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="py-6 text-center space-y-6">
      {/* Animated check */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-foreground/10 animate-glow-orb" />
        <CheckCircle className="h-10 w-10 text-foreground" />
      </div>

      <div>
        <h2 className="font-serif text-3xl italic">Commande confirmée !</h2>
        <p className="mt-2 text-sm text-muted-foreground font-light">Merci pour votre confiance.</p>
      </div>

      <div className="border border-border p-6 text-left space-y-3 max-w-md mx-auto">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Numéro de commande</span>
          <span className="font-medium font-serif italic">{orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Confirmation envoyée à</span>
          <span className="font-medium text-xs">{email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Délai de livraison</span>
          <span className="font-medium">1 – 2 jours ouvrables</span>
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        {[
          { icon: Package, label: "Préparation de la commande sous 24h" },
          { icon: Truck, label: "Expédition avec numéro de suivi" },
          { icon: CheckCircle, label: "Echantillons gratuits inclus" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 text-sm text-muted-foreground">
            <s.icon className="h-4 w-4 shrink-0 text-foreground" />
            {s.label}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigate({ to: "/" })}
          className="border border-foreground px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          Retour à l'accueil
        </button>
        <Link
          to="/collections/$category"
          params={{ category: "all" }}
          className="bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground/80 transition-colors inline-flex items-center justify-center"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { items: cartItems, total: cartTotal } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);
  const [emailForConfirmation, setEmailForConfirmation] = useState<string>("");
  const [orderId, setOrderId] = useState<string | undefined>();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>("");

  const cartItemsForApi = () =>
    cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

  const STEPS = [
    { n: 1, label: "Livraison", icon: Truck },
    { n: 2, label: "Validation", icon: CreditCard },
    { n: 3, label: "Confirmation", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex flex-col items-center leading-none">
            <span className="font-serif text-2xl tracking-[0.3em] font-medium">BLOSSOM</span>
            <span className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mt-0.5">
              Commande sécurisée
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SSL sécurisé</span>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex items-center py-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div
                  className={`flex items-center gap-2 text-[11px] uppercase tracking-wider transition-colors ${
                    s.n === step
                      ? "text-foreground font-semibold"
                      : s.n < step
                        ? "text-muted-foreground"
                        : "text-muted-foreground/40"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                      s.n < step
                        ? "border-foreground bg-foreground text-background"
                        : s.n === step
                          ? "border-foreground text-foreground"
                          : "border-border text-muted-foreground/40"
                    }`}
                  >
                    {s.n < step ? "✓" : s.n}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="mx-2 h-4 w-4 text-border md:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        {step === 3 ? (
          <ConfirmationStep email={shippingData?.email ?? emailForConfirmation} orderId={orderId} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left – form */}
            <div>
              <h1 className="font-serif text-3xl italic mb-8 md:text-4xl">
                {step === 1 ? "Informations de livraison" : "Confirmation de commande"}
              </h1>
              {orderError && (
                <p className="mb-5 border border-promo/30 bg-promo/5 px-4 py-3 text-sm text-promo">
                  {orderError}
                </p>
              )}

              {step === 1 && (
                <ShippingForm
                  onNext={(data) => {
                    setShippingData(data);
                    setStep(2);
                  }}
                />
              )}

              {step === 2 && (
                <PaymentForm
                  onNext={async (paymentData) => {
                    if (!shippingData) return;
                    if (placingOrder) return;

                    const items = cartItemsForApi();
                    if (items.length === 0) {
                      setOrderError("Votre panier est vide.");
                      return;
                    }

                    setPlacingOrder(true);
                    setOrderError("");
                    setEmailForConfirmation(shippingData.email);

                    try {
                      const response = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          customer: `${shippingData.firstName} ${shippingData.lastName}`,
                          email: shippingData.email,
                          address: `${shippingData.address}, ${shippingData.postalCode} ${shippingData.city}, ${shippingData.country}`,
                          items,
                          promoCode: paymentData.promoCode?.trim().toUpperCase() || undefined,
                        }),
                      });

                      const data = (await response.json().catch(() => ({}))) as {
                        id?: string;
                        error?: string;
                      };

                      if (!response.ok) {
                        throw new Error(
                          typeof data?.error === "string"
                            ? data.error
                            : "Impossible de confirmer la commande.",
                        );
                      }

                      const confirmedOrderId = (data?.id as string) ?? undefined;
                      setOrderId(confirmedOrderId);
                      setStep(3);
                      redirectOrderToWhatsapp(
                        buildWhatsappOrderMessage({
                          orderId: confirmedOrderId,
                          shippingData,
                          items: cartItems,
                          promoApplied,
                          total: cartTotal,
                        }),
                      );
                    } catch (e) {
                      setOrderError(
                        e instanceof Error ? e.message : "Impossible de confirmer la commande.",
                      );
                    } finally {
                      setPlacingOrder(false);
                    }
                  }}
                  onBack={() => setStep(1)}
                  onPromoApply={setPromoApplied}
                />
              )}
            </div>

            {/* Right – order summary (desktop) */}
            <div className="hidden lg:block">
              <h2 className="font-serif text-xl italic mb-5">Votre commande</h2>
              <OrderSummary promoApplied={promoApplied} />
            </div>
          </div>
        )}

        {/* Mobile order summary */}
        {step < 3 && (
          <details className="mt-8 lg:hidden border border-border">
            <summary className="flex items-center justify-between px-5 py-4 text-[11px] uppercase tracking-widest cursor-pointer select-none">
              <span>Voir le résumé de commande</span>
              <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
            </summary>
            <div className="px-4 pb-4">
              <OrderSummary promoApplied={promoApplied} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
