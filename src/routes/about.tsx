import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/blossom/AnimatedSection";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "À propos — BLOSSOM" },
      {
        name: "description",
        content: "Découvrez l'histoire de Blossom, maison de beauté et parfumerie haut de gamme.",
      },
    ],
  }),
});

const STATS = [
  { end: 500, suffix: "+", label: "Produits sélectionnés" },
  { end: 50, suffix: "+", label: "Marques partenaires" },
  { end: 10, suffix: "K+", label: "Clients satisfaits" },
  { end: 5, suffix: "★", label: "Note moyenne" },
];

const VALUES = [
  {
    title: "Authenticité",
    desc: "Tous nos produits sont 100% authentiques et certifiés. Nous travaillons directement avec les marques et distributeurs officiels.",
  },
  {
    title: "Excellence",
    desc: "Nous sélectionnons chaque produit avec soin, en privilégiant la qualité, la durabilité et l'expérience sensorielle.",
  },
  {
    title: "Service",
    desc: "Votre satisfaction est notre priorité. De l'emballage soigné à la livraison rapide, nous prenons soin de chaque détail.",
  },
];

function StatCounter({
  end,
  suffix,
  label,
  isVisible,
}: {
  end: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) {
  const value = useAnimatedCounter(end, 1800, isVisible);
  return (
    <div className="py-8 border border-border text-center hover-lift transition-all duration-300">
      <p className="font-serif text-4xl italic text-foreground animate-count">
        {value}
        {suffix}
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function AboutPage() {
  const statsReveal = useScrollReveal();

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <img
          src="https://picsum.photos/seed/about-blossom/1400/500"
          alt="À propos de Blossom"
          className="h-[420px] w-full object-cover opacity-35"
        />
        {/* Glow orbs */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/3 h-64 w-64 rounded-full animate-glow-orb"
          style={
            {
              background: "radial-gradient(circle, oklch(0.74 0.13 85 / 0.2) 0%, transparent 70%)",
              "--orb-duration": "7s",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p
            className="text-[10px] uppercase tracking-[0.4em] text-background/60 mb-3 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Notre histoire
          </p>
          <h1
            className="font-serif text-5xl italic md:text-6xl animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            À propos de nous
          </h1>
          <p
            className="mt-3 text-sm text-background/60 font-light max-w-sm animate-fade-up"
            style={{ animationDelay: "500ms" }}
          >
            La beauté authentique, curatée avec passion.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        {/* ── STORY ────────────────────────────────────────── */}
        <section className="mb-16 grid gap-10 md:grid-cols-2 md:items-center">
          <AnimatedSection direction="left">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3">
              Notre histoire
            </p>
            <h2 className="font-serif text-3xl italic md:text-4xl">
              L'élégance au cœur de tout ce que nous faisons
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
              Blossom est née d'une passion profonde pour la beauté authentique et les fragrances
              d'exception. Fondée par des passionnés de parfumerie et de cosmétique, notre maison
              s'est donnée pour mission de vous proposer une sélection soigneusement curatée de
              produits haut de gamme.
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
              Chaque produit est sélectionné selon des critères stricts de qualité, d'authenticité
              et d'élégance. Nous collaborons avec les meilleures maisons de parfumerie et de
              cosmétique pour vous offrir ce qu'il se fait de mieux dans l'univers de la beauté
              de luxe.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={100}>
            <div className="aspect-square overflow-hidden bg-muted group">
              <img
                src="https://picsum.photos/seed/about-story/500/500"
                alt="Notre histoire"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </AnimatedSection>
        </section>

        {/* ── VALUES ───────────────────────────────────────── */}
        <section className="mb-16 border-t border-border pt-14">
          <AnimatedSection>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3 text-center">
              Ce qui nous guide
            </p>
            <h2 className="font-serif text-3xl italic text-center md:text-4xl mb-10">
              Nos valeurs
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 120}>
                <div className="border border-border p-7 hover-lift transition-all duration-300 h-full">
                  <h3 className="font-serif text-xl italic mb-3">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* ── STATS (animated counters) ─────────────────────── */}
        <section className="mb-16 border-t border-border pt-14">
          <div ref={statsReveal.ref} className="grid grid-cols-2 gap-0 md:grid-cols-4">
            {STATS.map((s) => (
              <StatCounter
                key={s.label}
                end={s.end}
                suffix={s.suffix}
                label={s.label}
                isVisible={statsReveal.isVisible}
              />
            ))}
          </div>
        </section>

        {/* ── TEAM / PROMISE ───────────────────────────────── */}
        <section className="mb-16 border-t border-border pt-14">
          <AnimatedSection>
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3">
                  Notre promesse
                </p>
                <h2 className="font-serif text-3xl italic md:text-4xl">
                  L'art de la sélection
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
                  Chaque produit Blossom est le fruit d'une sélection rigoureuse. Nous testons,
                  comparons et validons avant toute mise en vente. Aucun compromis sur la
                  qualité — car vous méritez ce qu'il se fait de mieux.
                </p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
                  Nous travaillons en direct avec les marques et les distributeurs officiels
                  pour garantir l'authenticité de chaque article. Votre confiance, notre
                  engagement.
                </p>
              </div>
              <div className="aspect-[4/3] overflow-hidden bg-muted group">
                <img
                  src="https://picsum.photos/seed/about-promise/600/400"
                  alt="Notre promesse"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="border-t border-border pt-14 text-center">
          <AnimatedSection>
            <h2 className="font-serif text-3xl italic md:text-4xl">
              Rejoignez la communauté Blossom
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-light max-w-md mx-auto">
              Inscrivez-vous à notre newsletter et bénéficiez de -10% sur votre première commande.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Link
                to="/collections/$category"
                params={{ category: "all" }}
                className="border border-foreground px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors text-center"
              >
                Découvrir la boutique
              </Link>
              <Link
                to="/contact"
                className="border border-border px-8 py-3 text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-colors text-center"
              >
                Nous contacter
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </div>
  );
}
