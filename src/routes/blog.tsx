import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog — BLOSSOM" },
      { name: "description", content: "Inspirations beauté, conseils parfum et actualités Blossom." },
    ],
  }),
});

const articles = [
  {
    id: "1",
    title: "Les 5 parfums incontournables de l'été",
    excerpt:
      "Fraîcheur, légèreté et sensualité : découvrez notre sélection des parfums parfaits pour traverser la saison estivale avec élégance.",
    image: "https://picsum.photos/seed/blog-parfum-ete/600/400",
    category: "Parfum",
    date: "15 Mai 2026",
    readTime: "4 min",
    author: "Sophie M.",
  },
  {
    id: "2",
    title: "Comment choisir son parfum : le guide complet",
    excerpt:
      "Notes de tête, de cœur et de fond, familles olfactives, concentration… On vous explique tout pour trouver votre fragrance signature.",
    image: "https://picsum.photos/seed/blog-guide-parfum/600/400",
    category: "Guide",
    date: "28 Avril 2026",
    readTime: "7 min",
    author: "Emma L.",
  },
  {
    id: "3",
    title: "Routine soin : les essentiels pour une peau éclatante",
    excerpt:
      "Du nettoyage à la protection solaire, découvrez les étapes clés d'une routine beauté efficace pour révéler l'éclat naturel de votre peau.",
    image: "https://picsum.photos/seed/blog-soin-peau/600/400",
    category: "Soin",
    date: "10 Avril 2026",
    readTime: "5 min",
    author: "Claire D.",
  },
  {
    id: "4",
    title: "Tendances maquillage printemps 2026",
    excerpt:
      "Teintes pastels, eye-liners graphiques et gloss vitaminés : voici les tendances beauté à adopter dès maintenant.",
    image: "https://picsum.photos/seed/blog-makeup-trend/600/400",
    category: "Maquillage",
    date: "2 Mars 2026",
    readTime: "3 min",
    author: "Léa B.",
  },
  {
    id: "5",
    title: "Parfums de niche : pourquoi s'y intéresser ?",
    excerpt:
      "Origines artisanales, ingrédients rares, sillages uniques… Le marché du parfum de niche séduit de plus en plus de connaisseurs.",
    image: "https://picsum.photos/seed/blog-niche/600/400",
    category: "Parfum",
    date: "18 Février 2026",
    readTime: "6 min",
    author: "Sophie M.",
  },
  {
    id: "6",
    title: "Les bienfaits des huiles végétales pour la peau",
    excerpt:
      "Jojoba, argan, rose musquée… Chaque huile a ses vertus. Guide pour choisir celle adaptée à votre type de peau.",
    image: "https://picsum.photos/seed/blog-huiles/600/400",
    category: "Soin",
    date: "5 Janvier 2026",
    readTime: "4 min",
    author: "Claire D.",
  },
];

const categories = ["Tout", "Parfum", "Maquillage", "Soin", "Guide"];

function BlogPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Inspirations & Conseils</p>
        <h1 className="font-serif text-4xl italic md:text-5xl">Blog Blossom</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light">
          Conseils beauté, actualités parfum et inspirations mode de vie.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((c) => (
          <button
            key={c}
            className={`px-4 py-2 text-[11px] uppercase tracking-widest border transition-colors ${
              c === "Tout"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      <article className="mb-12 grid gap-6 md:grid-cols-2 md:items-center border border-border overflow-hidden">
        <div className="aspect-video overflow-hidden md:aspect-auto md:h-full">
          <img
            src={featured.image}
            alt={featured.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="p-6 md:p-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {featured.category}
          </span>
          <h2 className="mt-2 font-serif text-3xl italic md:text-4xl leading-snug">{featured.title}</h2>
          <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed">{featured.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{featured.date}</span>
            <span>·</span>
            <span>{featured.readTime} de lecture</span>
            <span>·</span>
            <span>Par {featured.author}</span>
          </div>
          <button className="mt-6 border border-foreground px-6 py-2.5 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
            Lire l'article
          </button>
        </div>
      </article>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <article key={article.id} className="group border border-border overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {article.category}
              </span>
              <h3 className="mt-1.5 font-serif text-xl italic leading-snug">{article.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground font-light line-clamp-2">{article.excerpt}</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{article.date}</span>
                <span>·</span>
                <span>{article.readTime}</span>
              </div>
              <button className="mt-4 text-[11px] uppercase tracking-widest underline underline-offset-4 hover:text-muted-foreground transition-colors">
                Lire la suite
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
