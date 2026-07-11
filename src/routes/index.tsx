import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import catSoin from "@/assets/product-cream.jpg";
import { brands, type Product } from "@/lib/products";
import { ProductCard } from "@/components/blossom/ProductCard";
import { AnimatedSection } from "@/components/blossom/AnimatedSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductCatalog } from "@/hooks/useProductCatalog";

const HERO_VIDEO_URL =
  "https://v1.pinimg.com/videos/mc/720p/63/33/6d/63336d877493b2ce8f2f5d68d26659fd.mp4";
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Leaf,
  Droplets,
  Shield,
  Truck,
  BadgeCheck,
  CreditCard,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "BLOSSOM — Parfumerie & Beauté de luxe" },
      {
        name: "description",
        content: "Parfums, maquillage et soins d'exception. Découvrez la sélection Blossom.",
      },
    ],
  }),
});

const categories = [
  { name: "PROMOS", isPromo: true, to: "/collections/bons-plans" },
  { name: "PARFUMS", category: "Parfum", to: "/collections/parfum" },
  { name: "VISAGE", category: "Soin", to: "/collections/soin" },
  { name: "CORPS", category: "Soin", to: "/collections/soin" },
  { name: "MAQUILLAGE", category: "Maquillage", to: "/collections/maquillage" },
];

const collectionBanners = [
  {
    eyebrow: "Routine experte",
    title: "SkinCare Signature",
    subtitle: "Sérums éclat, crèmes fondantes et textures fraîches pour un rituel visage raffiné.",
    cta: "DÉCOUVRIR LES SOINS",
    to: "/collections/$category",
    params: { category: "soin" },
  },
  {
    eyebrow: "Coffrets précieux",
    title: "Offrir le Glow",
    subtitle: "Des attentions beauté prêtes à offrir, pensées pour illuminer chaque moment.",
    cta: "VOIR LES COFFRETS",
    to: "/collections/$category",
    params: { category: "bons-plans" },
  },
];

function firstProductImage(catalog: Product[], predicate: (product: Product) => boolean) {
  return catalog.find((product) => predicate(product) && product.image)?.image;
}

function firstProduct(
  catalog: Product[],
  predicate: (product: Product) => boolean,
  excludedImages: string[] = [],
) {
  return catalog.find(
    (product) => predicate(product) && product.image && !excludedImages.includes(product.image),
  );
}

const parfumTabs = ["Parfums Homme", "Parfums Femme", "Parfums de Niche", "Parfums Mixte"];

const MARQUEE_ITEMS = [
  "BLOSSOM BEAUTÉ",
  "·",
  "PARFUMS D'EXCEPTION",
  "·",
  "SOINS PRÉCIEUX",
  "·",
  "MAQUILLAGE LUXE",
  "·",
  "LIVRAISON OFFERTE DÈS 49 000 FCFA",
  "·",
  "CODE WELCOME10",
  "·",
  "NOUVEAUTÉS PRINTEMPS",
  "·",
  "SKINCARE EXPERTS",
  "·",
];

// Pre-defined particles (no random = no SSR mismatch)
const HERO_PARTICLES = [
  { left: "7%", delay: "0s", duration: "12s", size: 5 },
  { left: "13%", delay: "2.5s", duration: "9s", size: 3 },
  { left: "20%", delay: "5s", duration: "14s", size: 7 },
  { left: "27%", delay: "1s", duration: "11s", size: 4 },
  { left: "34%", delay: "3.5s", duration: "10s", size: 6 },
  { left: "42%", delay: "0.5s", duration: "13s", size: 3 },
  { left: "49%", delay: "4s", duration: "8s", size: 5 },
  { left: "57%", delay: "1.5s", duration: "12s", size: 8 },
  { left: "63%", delay: "6s", duration: "10s", size: 4 },
  { left: "70%", delay: "2s", duration: "14s", size: 6 },
  { left: "77%", delay: "3s", duration: "9s", size: 3 },
  { left: "84%", delay: "4.5s", duration: "11s", size: 7 },
  { left: "91%", delay: "0.8s", duration: "13s", size: 5 },
  { left: "96%", delay: "5.5s", duration: "10s", size: 4 },
];

const RITUAL_STEPS = [
  { icon: Droplets, label: "Nettoyer", desc: "Purifiez en douceur" },
  { icon: Sparkles, label: "Traiter", desc: "Ciblez vos besoins" },
  { icon: Leaf, label: "Nourrir", desc: "Hydratez en profondeur" },
  { icon: Shield, label: "Protéger", desc: "Préservez l'éclat" },
];

const SERVICE_PROMISES = [
  {
    icon: Truck,
    label: "Livraison rapide",
    desc: "Préparation soignée et suivi de commande.",
    to: "/livraison",
  },
  {
    icon: BadgeCheck,
    label: "Produits authentiques",
    desc: "Sélection contrôlée depuis le catalogue Blossom.",
    to: "/about",
  },
  {
    icon: CreditCard,
    label: "Paiement simple",
    desc: "Commande claire, panier fluide et prix en FCFA.",
    to: "/checkout",
  },
  {
    icon: MessageCircle,
    label: "Conseil beauté",
    desc: "Une question sur un soin ou un parfum ?",
    to: "/contact",
  },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {HERO_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full bg-background/30 animate-particle"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              "--particle-delay": p.delay,
              "--particle-duration": p.duration,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Home() {
  const [artTab, setArtTab] = useState("Parfums Homme");
  const { products } = useProductCatalog();

  const bestSellers = products.filter((p) => p.badge === "Best-seller");
  const promos = products.filter((p) => p.badge === "Promo");
  const offres = products.filter((p) => p.originalPrice);
  const parfums = products.filter((p) => p.category === "Parfum");
  const skincareProducts = products.filter((p) => p.category === "Soin");
  const featuredProducts = bestSellers.length > 0 ? bestSellers : products;
  const promoProducts = promos.length > 0 ? promos : products.filter((p) => p.originalPrice);
  const offerProducts = offres.length > 0 ? offres : promoProducts;
  const categoryImages = {
    PARFUMS: firstProductImage(products, (p) => p.category === "Parfum"),
    VISAGE: firstProductImage(products, (p) => p.category === "Soin"),
    CORPS: firstProductImage(
      products,
      (p) => p.category === "Soin" && /corps|body/i.test(`${p.name} ${p.subcategory ?? ""}`),
    ),
    MAQUILLAGE: firstProductImage(products, (p) => p.category === "Maquillage"),
  };
  const skincareBannerProduct = firstProduct(
    products,
    (p) => p.category === "Soin" && p.badge !== "Promo" && !p.originalPrice,
  );
  const giftBannerProduct =
    firstProduct(
      products,
      (p) => p.badge === "Promo" || Boolean(p.originalPrice),
      skincareBannerProduct?.image ? [skincareBannerProduct.image] : [],
    ) ??
    firstProduct(
      products,
      (p) => p.id !== skincareBannerProduct?.id,
      skincareBannerProduct?.image ? [skincareBannerProduct.image] : [],
    );
  const bannerImages = {
    soin: skincareBannerProduct?.image,
    promo: giftBannerProduct?.image,
  };

  const filteredParfums = parfumTabs.includes(artTab)
    ? parfums
        .filter((p) => p.subcategory === artTab)
        .concat(parfums)
        .slice(0, 4)
    : parfums.slice(0, 4);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="relative min-h-[88vh] md:min-h-screen">
          {/* Background skincare video */}
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-75"
            autoPlay
            muted
            loop
            playsInline
            poster={catSoin}
            aria-label="Rituel skincare Blossom"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 via-[#800000]/20 to-[#3f1712]/82" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_38%,rgb(63_23_18_/_0.56)_100%)]" />

          {/* Floating particles */}
          <FloatingParticles />

          {/* Skincare light ribbons */}
          <div
            className="pointer-events-none absolute left-[-12%] top-[18%] h-28 w-[58%] rotate-[-16deg] bg-background/20 blur-2xl animate-skincare-ribbon"
            style={{ "--ribbon-rotate": "-16deg" } as React.CSSProperties}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-[-10%] bottom-[24%] h-24 w-[48%] rotate-[18deg] bg-gold/25 blur-2xl animate-skincare-ribbon"
            style={{ animationDelay: "1.5s", "--ribbon-rotate": "18deg" } as React.CSSProperties}
            aria-hidden="true"
          />

          {/* Hero text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-background text-center px-4">
            <p
              className="text-xs uppercase tracking-[0.4em] text-background/80 mb-3 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Nouveau rituel visage
            </p>
            <h1
              className="font-serif text-5xl italic leading-tight md:text-7xl lg:text-8xl animate-fade-up"
              style={{ animationDelay: "400ms" }}
            >
              SkinCare Glow
            </h1>
            <p
              className="mt-4 max-w-md text-sm text-background/80 font-light animate-fade-up"
              style={{ animationDelay: "600ms" }}
            >
              Sérums, crèmes et rituels d'exception pour une peau fraîche, lumineuse et douce.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up"
              style={{ animationDelay: "800ms" }}
            >
              <Link
                to="/collections/$category"
                params={{ category: "soin" }}
                className="inline-flex items-center border border-background bg-background px-8 py-3.5 text-[11px] uppercase tracking-widest text-foreground shadow-elegant hover:bg-gold transition-colors"
              >
                DÉCOUVRIR LES SOINS
              </Link>
              <Link
                to="/collections/$category"
                params={{ category: "all" }}
                className="inline-flex items-center border border-background/60 bg-foreground/20 px-8 py-3.5 text-[11px] uppercase tracking-widest text-background hover:border-background hover:bg-background/10 transition-colors"
              >
                VOIR LA ROUTINE
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-background/50">
            <span className="text-[9px] uppercase tracking-widest">Défiler</span>
            <ChevronDown className="h-4 w-4 animate-bounce-down" />
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-8 right-6 flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${i === 0 ? "h-6 w-1.5 bg-background" : "h-1.5 w-1.5 bg-background/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ───────────────────────────────── */}
      <div className="overflow-hidden border-y border-border/70 py-3.5 bg-background/80">
        <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className={
                item === "·"
                  ? "text-gold text-base"
                  : "text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground"
              }
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── DÉCOUVREZ ────────────────────────────────────── */}
      <section className="py-14 bg-background/70">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <h2 className="mb-8 text-center font-serif text-4xl italic md:text-5xl">
              Découvrez...
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="flex items-start gap-4 overflow-x-auto scrollbar-hide pb-2 md:justify-center md:gap-8">
              {categories.map((c, i) => (
                <Link
                  key={c.name}
                  to={c.to}
                  className="group flex flex-col items-center gap-3 flex-shrink-0"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div
                    className={`relative h-[90px] w-[90px] overflow-hidden rounded-full md:h-[110px] md:w-[110px] ring-2 ring-background shadow-soft group-hover:ring-promo/35 transition-all duration-500 ${
                      c.isPromo ? "bg-promo" : "bg-muted"
                    }`}
                  >
                    {c.isPromo ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-serif text-3xl text-background italic">%</span>
                      </div>
                    ) : categoryImages[c.name as keyof typeof categoryImages] ? (
                      <img
                        src={categoryImages[c.name as keyof typeof categoryImages]}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="font-serif text-2xl italic text-muted-foreground">
                          {c.name.slice(0, 1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground">
                    {c.name}
                  </span>
                </Link>
              ))}
              <button className="flex flex-shrink-0 items-center self-center">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── À LA UNE ─────────────────────────────────────── */}
      <section className="py-14 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <div className="mb-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground mb-3">
                Coup de cœur
              </p>
              <h2 className="font-serif text-4xl italic md:text-5xl">À la une...</h2>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <Tabs defaultValue="best-sellers">
              <TabsList className="mx-auto flex w-full max-w-xl justify-center gap-0 bg-transparent border-b border-border rounded-none h-auto pb-0">
                {[
                  { value: "best-sellers", label: "Best Sellers" },
                  { value: "promos", label: "Jusqu'à -40%" },
                  { value: "offres", label: "Offres de la semaine" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="rounded-none border-b-2 border-transparent px-5 py-3 text-[11px] font-semibold uppercase tracking-widest data-[state=active]:border-promo data-[state=active]:bg-transparent data-[state=active]:text-promo text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {[
                { value: "best-sellers", items: featuredProducts.concat(products).slice(0, 4) },
                { value: "promos", items: promoProducts.concat(products).slice(0, 4) },
                { value: "offres", items: offerProducts.concat(products).slice(0, 4) },
              ].map(({ value, items }) => (
                <TabsContent key={value} value={value} className="mt-10">
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
                    {items.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-fade-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <ProductCard product={item} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="mt-12 text-center">
              <Link
                to="/collections/$category"
                params={{ category: "all" }}
                className="group inline-flex items-center gap-3 border border-promo bg-promo px-10 py-3.5 text-[11px] uppercase tracking-widest text-background shadow-soft hover:bg-foreground transition-colors"
              >
                VOIR TOUS LES PRODUITS
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── SERVICE PROMISES ─────────────────────────────── */}
      <section className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
              {SERVICE_PROMISES.map((promise) => (
                <Link
                  key={promise.label}
                  to={promise.to}
                  className="group flex min-h-36 flex-col justify-between bg-card p-5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <promise.icon className="h-5 w-5 text-promo" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground">
                      {promise.label}
                    </p>
                    <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                      {promise.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── L'ART DU PARFUM ──────────────────────────────── */}
      <section className="py-16 border-t border-border bg-blossom-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground mb-3">
                Notre sélection
              </p>
              <h2 className="font-serif text-4xl italic md:text-5xl lg:text-6xl">
                L'Art du Parfum
              </h2>
              <div className="mt-5 flex items-center justify-center gap-4">
                <span className="block h-px w-10 bg-gold/50" />
                <p className="text-sm text-muted-foreground font-light">
                  Un monde de senteurs raffinées pour chaque style.
                </p>
                <span className="block h-px w-10 bg-gold/50" />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="flex overflow-x-auto scrollbar-hide border-b border-border mb-10">
              {parfumTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setArtTab(tab)}
                  className={`whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-widest transition-all flex-shrink-0 border-b-2 -mb-px ${
                    artTab === tab
                      ? "border-promo text-promo"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {filteredParfums.map((p, i) => (
              <AnimatedSection key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={150}>
            <div className="mt-12 text-center">
              <Link
                to="/collections/$category"
                params={{ category: "parfum" }}
                className="group inline-flex items-center gap-3 border border-promo bg-promo px-10 py-3.5 text-[11px] uppercase tracking-widest text-background hover:bg-foreground transition-colors"
              >
                VOIR TOUS LES PRODUITS
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── COLLECTION BANNERS ───────────────────────────── */}
      <section className="border-t border-border bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Collections éditoriales
                </p>
                <h2 className="mt-2 font-serif text-4xl italic md:text-5xl">Beauté en scène</h2>
              </div>
              <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                Des univers visuels plus clairs, premium et orientés produit pour guider la cliente
                vers les soins et les coffrets.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-5 lg:grid-cols-2">
            {collectionBanners.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 100}>
                <div className="group grid min-h-[440px] overflow-hidden luxe-panel md:grid-cols-[0.95fr_1.05fr]">
                  <div className="flex flex-col justify-between p-7 md:p-9">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                        {b.eyebrow}
                      </p>
                      <h3 className="mt-4 font-serif text-4xl italic leading-tight md:text-5xl">
                        {b.title}
                      </h3>
                      <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                        {b.subtitle}
                      </p>
                    </div>
                    <Link
                      to={b.to}
                      params={b.params}
                      className="mt-8 inline-flex w-fit items-center gap-2 border border-promo bg-promo px-6 py-3 text-[11px] uppercase tracking-widest text-background transition-colors hover:bg-foreground"
                    >
                      {b.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="relative min-h-[280px] overflow-hidden bg-blossom-blush">
                    {i === 0 ? (
                      bannerImages.soin ? (
                        <img
                          src={bannerImages.soin}
                          alt={b.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : null
                    ) : bannerImages.promo ? (
                      <img
                        src={bannerImages.promo}
                        alt={b.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-background/10" />
                    <div className="absolute bottom-5 left-5 border border-background/35 bg-background/85 px-4 py-3 backdrop-blur">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                        Sélection Blossom
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── RITUEL SOIN (NEW) ─────────────────────────────── */}
      <section className="py-16 border-t border-border bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
                Rituel Beauté
              </p>
              <h2 className="font-serif text-4xl italic md:text-5xl">Soins & Rituels</h2>
              <p className="mt-3 text-sm text-muted-foreground font-light max-w-xl mx-auto">
                Sublimez votre peau avec nos soins d'exception — formulés pour nourrir, régénérer et
                révéler votre éclat naturel.
              </p>
            </div>
          </AnimatedSection>

          {/* Ritual steps */}
          <AnimatedSection delay={100}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-10">
              {RITUAL_STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className="flex flex-col items-center gap-2 border border-border bg-card p-5 text-center hover-lift transition-all duration-300"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                    <step.icon className="h-4 w-4 text-promo" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Skincare product grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {skincareProducts.slice(0, 4).map((p, i) => (
              <AnimatedSection key={p.id} delay={i * 100}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={200}>
            <div className="mt-10 text-center">
              <Link
                to="/collections/$category"
                params={{ category: "soin" }}
                className="inline-flex items-center gap-2 border border-promo bg-promo px-8 py-3 text-[11px] uppercase tracking-widest text-background hover:bg-foreground transition-colors"
              >
                VOIR TOUS LES SOINS <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── BRAND STORY SHOWCASE ─────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border bg-foreground py-24">
        {/* Animated glow orbs */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full animate-glow-orb"
          style={
            {
              background: "radial-gradient(circle, rgb(218 212 181 / 0.28) 0%, transparent 70%)",
              "--orb-duration": "6s",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-1/4 right-1/5 h-52 w-52 rounded-full animate-glow-orb"
          style={
            {
              background:
                "radial-gradient(circle, rgb(152 43 28 / 0.32) 0%, transparent 70%)",
              "--orb-duration": "9s",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1/2 right-1/3 h-36 w-36 rounded-full animate-glow-orb"
          style={
            {
              background: "radial-gradient(circle, rgb(242 232 198 / 0.2) 0%, transparent 70%)",
              "--orb-duration": "11s",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-background">
          <AnimatedSection>
            <p className="text-[10px] uppercase tracking-[0.5em] text-background/50 mb-5">
              Notre philosophie
            </p>
            <h2 className="font-serif text-5xl italic leading-tight md:text-7xl">
              La beauté comme
              <br />
              <span className="text-gold">art de vivre</span>
            </h2>
            <p className="mt-8 text-sm text-background/60 font-light max-w-xl mx-auto leading-relaxed">
              Depuis notre création, Blossom sélectionne les plus belles fragrances et les soins les
              plus précieux. Chaque produit est une promesse d'exception, pensée pour sublimer votre
              quotidien.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-background/40 px-8 py-3.5 text-[11px] uppercase tracking-widest text-background hover:border-background hover:bg-background/10 transition-all"
              >
                Notre histoire <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/collections/$category"
                params={{ category: "all" }}
                className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 text-[11px] uppercase tracking-widest hover:bg-background/90 transition-all"
              >
                Découvrir la boutique
              </Link>
            </div>
          </AnimatedSection>

          {/* Floating metric pills */}
          <AnimatedSection delay={200}>
            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { n: "500+", l: "Produits" },
                { n: "50+", l: "Marques" },
                { n: "10K+", l: "Clients" },
                { n: "5★", l: "Note" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="border border-background/10 py-5 text-center hover:border-gold/40 transition-colors"
                >
                  <p className="font-serif text-3xl italic text-gold">{s.n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-background/50">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── BRANDS ───────────────────────────────────────── */}
      <section className="py-14 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection>
            <p className="mb-8 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Nos marques
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {brands.map((b) => (
                <Link
                  key={b}
                  to="/collections/$category"
                  params={{ category: "marques" }}
                  className="font-serif text-lg text-muted-foreground hover:text-foreground transition-colors md:text-xl"
                >
                  {b}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────── */}
      <section className="border-t border-border py-16">
        <AnimatedSection>
          <div className="mx-auto max-w-xl px-4 text-center">
            <p className="font-serif text-3xl italic md:text-4xl">BLOSSOM</p>
            <h2 className="mt-2 text-sm font-semibold uppercase tracking-widest">
              Rejoignez le programme de fidélité
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              -10% sur votre première commande avec le code :{" "}
              <strong className="text-foreground">WELCOME10</strong>
            </p>
            <form
              className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Votre adresse e-mail"
                aria-label="Votre email"
                className="flex-1 border border-border px-4 py-3 text-sm focus:border-foreground focus:outline-none"
              />
              <button className="bg-promo px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-background hover:bg-foreground transition-colors">
                S'inscrire
              </button>
            </form>
          </div>
        </AnimatedSection>
      </section>

      {/* ── PROMO BANNER ─────────────────────────────────── */}
      {bannerImages.promo && (
        <section className="border-t border-border">
          <div className="relative overflow-hidden group">
            <img
              src={bannerImages.promo}
              alt="Coffrets Blossom"
              className="h-[280px] w-full object-cover md:h-[380px] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/70 flex flex-col items-center justify-center text-background text-center px-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-background/70 mb-2">
                Offre spéciale
              </p>
              <h3 className="font-serif text-4xl italic">Coffrets Précieux</h3>
              <p className="mt-2 text-sm text-background/70 font-light">
                Une attention parfumée, soigneusement sélectionnée.
              </p>
              <Link
                to="/collections/$category"
                params={{ category: "bons-plans" }}
                className="mt-6 inline-flex items-center gap-2 border border-background px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-background hover:text-foreground transition-colors"
              >
                Découvrir les coffrets <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
