import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categorySubcategories } from "@/lib/products";
import { ProductCard } from "@/components/blossom/ProductCard";
import { useState } from "react";
import { SlidersHorizontal, Grid2x2, List, ChevronDown } from "lucide-react";
import { useProductCatalog } from "@/hooks/useProductCatalog";

const categoryMeta: Record<
  string,
  { title: string; description: string; label: string; eyebrow?: string }
> = {
  parfum: {
    label: "Parfums",
    eyebrow: "Notre collection",
    title: "Parfums — BLOSSOM",
    description:
      "Avec Blossom, le parfum est bien plus qu'une fragrance ! Exprimez votre personnalité avec notre sélection de parfums d'exception.",
  },
  maquillage: {
    label: "Maquillage",
    eyebrow: "Notre collection",
    title: "Maquillage — BLOSSOM",
    description:
      "Découvrez notre collection de maquillage haut de gamme : rouges à lèvres, fonds de teint, palettes yeux.",
  },
  soin: {
    label: "Soins & Rituels",
    eyebrow: "Notre collection",
    title: "Soins — BLOSSOM",
    description:
      "Rituels naturels et soins d'exception pour une peau lumineuse. Sérums, crèmes et huiles précieuses.",
  },
  marques: {
    label: "Nos Marques",
    eyebrow: "Partenaires beauté",
    title: "Nos marques — BLOSSOM",
    description: "Découvrez toutes les marques disponibles chez Blossom.",
  },
  "bons-plans": {
    label: "Bons Plans",
    eyebrow: "Offres exclusives",
    title: "Bons Plans & Promos — BLOSSOM",
    description: "Les meilleures offres et promotions sélectionnées pour vous.",
  },
  all: {
    label: "Tous les produits",
    eyebrow: "Notre sélection",
    title: "Catalogue — BLOSSOM",
    description:
      "Avec Blossom, découvrez une sélection raffinée de parfums, soins et maquillage haut de gamme.",
  },
};

const mainCategories = ["Parfum", "Maquillage", "Soin"];
const allSubcats = Object.values(categorySubcategories).flat();

export const Route = createFileRoute("/collections/$category")({
  component: CategoryPage,
  loader: ({ params }) => {
    const meta = categoryMeta[params.category.toLowerCase()];
    return { category: params.category.toLowerCase(), meta: meta ?? null };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.meta
      ? [
          { title: loaderData.meta.title },
          { name: "description", content: loaderData.meta.description },
        ]
      : [{ title: "Collection — BLOSSOM" }],
  }),
});

function CategoryPage() {
  const { category, meta } = Route.useLoaderData();
  const { products, loading } = useProductCatalog();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const subcats = categorySubcategories[catLabel] ?? [];

  // Determine base products
  let base = products;
  if (category === "bons-plans") {
    base = products.filter((p) => p.badge === "Promo" || p.originalPrice);
  } else if (category !== "all" && category !== "marques") {
    base = products.filter((p) => p.category.toLowerCase() === category);
  }

  // Filter
  const filtered = activeFilter
    ? base.filter(
        (p) =>
          p.subcategory === activeFilter ||
          p.category === activeFilter
      )
    : base;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  const displayMeta = meta ?? { label: catLabel, title: catLabel, description: "", eyebrow: "Collection" };

  // Compute which filter tabs to show
  const filterTabs: string[] =
    category === "all"
      ? [...mainCategories, ...allSubcats]
      : subcats;

  const showFilters = filterTabs.length > 0;

  return (
    <div>
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="border-b border-border bg-blossom-cream py-14 px-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground mb-3">
          {displayMeta.eyebrow ?? "Collection"}
        </p>
        <h1 className="font-serif text-5xl italic md:text-6xl">{displayMeta.label}</h1>
        {displayMeta.description && (
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground font-light leading-relaxed">
            {displayMeta.description}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* ── FILTER TABS ─────────────────────────────────── */}
        {showFilters && (
          <section className="border-y border-border py-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Catégories
              </p>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Tout", ...filterTabs].map((tab) => {
                const value = tab === "Tout" ? null : tab;
                const active = activeFilter === value;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(value)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                      active
                        ? "border-promo bg-promo text-background shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-promo/50 hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── SORT + COUNT BAR ─────────────────────────────── */}
        <div className="mt-5 mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sorted.length}</span>{" "}
            {loading ? "produits, synchronisation..." : `produit${sorted.length > 1 ? "s" : ""}`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort select */}
            <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 hover:border-promo/50 transition-colors group cursor-pointer">
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-[11px] uppercase tracking-wider bg-transparent focus:outline-none cursor-pointer text-muted-foreground"
              >
                <option value="featured">Mis en avant</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 border-r border-border transition-all ${
                  viewMode === "grid"
                    ? "bg-promo text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                aria-label="Vue grille"
              >
                <Grid2x2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-all ${
                  viewMode === "list"
                    ? "bg-promo text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                aria-label="Vue liste"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── PRODUCT GRID / LIST ──────────────────────────── */}
        {sorted.length > 0 ? (
          viewMode === "grid" ? (
            <div
              key={`grid-${activeFilter}`}
              className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-7"
            >
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div
              key={`list-${activeFilter}`}
              className="divide-y divide-border border-t border-border"
            >
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <ProductCard product={p} horizontal />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl italic text-muted-foreground mb-2">Aucun résultat</p>
            <p className="text-sm text-muted-foreground mb-6">Aucun produit dans cette catégorie.</p>
            <button
              onClick={() => setActiveFilter(null)}
              className="border border-promo bg-promo px-8 py-3 text-[11px] uppercase tracking-widest text-background hover:bg-foreground transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
