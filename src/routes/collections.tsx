import { createFileRoute, Link } from "@tanstack/react-router";
import { categorySubcategories } from "@/lib/products";
import { ProductCard } from "@/components/blossom/ProductCard";
import { useState } from "react";
import { SlidersHorizontal, Grid2x2, List } from "lucide-react";
import { useProductCatalog } from "@/hooks/useProductCatalog";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
  head: () => ({
    meta: [
      { title: "Tous les produits — BLOSSOM" },
      { name: "description", content: "Découvrez toute la sélection Blossom : parfums, maquillage et soins." },
    ],
  }),
});

const allSubcats = Object.values(categorySubcategories).flat();

function CollectionsPage() {
  const { products, loading } = useProductCatalog();
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");

  const filtered = activeSubcat
    ? products.filter((p) => p.subcategory === activeSubcat || p.category === activeSubcat)
    : products;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Notre sélection</p>
        <h1 className="mt-2 font-serif text-4xl italic md:text-5xl">Tous les produits</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground font-light">
          Avec Blossom, découvrez une sélection raffinée de parfums, soins et maquillage haut de gamme.
        </p>
      </div>

      <section className="mb-7 border-y border-border py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Catégories
          </p>
          {activeSubcat && (
            <button
              onClick={() => setActiveSubcat(null)}
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {["Tout", "Parfum", "Maquillage", "Soin", ...allSubcats].map((item) => {
            const value = item === "Tout" ? null : item;
            const active = activeSubcat === value;
            return (
              <button
                key={item}
                onClick={() => setActiveSubcat(value)}
                className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  active
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sort + count */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Synchronisation du catalogue..." : `${sorted.length} produit${sorted.length > 1 ? "s" : ""}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[11px] uppercase tracking-wider bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">Mis en avant</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
          <button className="border border-foreground bg-foreground p-2 text-background" aria-label="Vue grille">
            <Grid2x2 className="h-4 w-4" />
          </button>
          <button className="border border-border p-2" aria-label="Vue liste">
            <List className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Aucun produit dans cette catégorie.</p>
          <button
            onClick={() => setActiveSubcat(null)}
            className="mt-4 border border-foreground px-6 py-2.5 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            Voir tous les produits
          </button>
        </div>
      )}
    </div>
  );
}
