import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "@/context/wishlist";
import { useCart } from "@/context/cart";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { formatCfa } from "@/lib/format";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Ma Wishlist — BLOSSOM" },
      { name: "description", content: "Vos produits favoris Blossom." },
    ],
  }),
});

function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="font-serif text-3xl italic">Votre wishlist est vide</h1>
        <p className="mt-2 text-sm text-muted-foreground font-light max-w-xs">
          Ajoutez des produits à votre liste de souhaits en cliquant sur le cœur.
        </p>
        <Link
          to="/collections/$category"
          params={{ category: "all" }}
          className="mt-7 inline-flex border border-foreground px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-1">
            Mes favoris
          </p>
          <h1 className="font-serif text-3xl italic md:text-4xl">Ma Wishlist</h1>
        </div>
        <span className="text-sm text-muted-foreground">
          {items.length} produit{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-0 border border-border overflow-hidden">
        {items.map((product, i) => (
          <div
            key={product.id}
            className={`flex items-center gap-4 p-4 md:p-5 ${i < items.length - 1 ? "border-b border-border" : ""}`}
          >
            {/* Image */}
            <Link to="/product/$id" params={{ id: product.id }} className="shrink-0">
              <div className="h-20 w-20 overflow-hidden bg-muted md:h-24 md:w-24">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </p>
              <Link to="/product/$id" params={{ id: product.id }}>
                <h3 className="font-serif text-lg italic hover:underline underline-offset-4 leading-tight">
                  {product.name}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold">{formatCfa(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCfa(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.badge && (
                <span
                  className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    product.badge === "Promo"
                      ? "bg-promo text-white"
                      : "bg-foreground text-background"
                  }`}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => add(product)}
                className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2.5 text-[11px] uppercase tracking-widest hover:bg-foreground/80 transition-colors"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ajouter au panier</span>
              </button>
              <button
                onClick={() => toggle(product)}
                className="flex items-center justify-center gap-1.5 border border-border px-4 py-2.5 text-[11px] text-muted-foreground uppercase tracking-widest hover:border-foreground hover:text-foreground transition-colors"
                aria-label="Retirer des favoris"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Retirer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center border border-border p-5">
        <p className="text-sm text-muted-foreground">
          Ajoutez tous les articles de votre wishlist au panier
        </p>
        <button
          onClick={() => items.forEach((p) => add(p))}
          className="bg-foreground text-background px-7 py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-foreground/80 transition-colors whitespace-nowrap"
        >
          Tout ajouter au panier
        </button>
      </div>
    </div>
  );
}
