import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/cart";
import { useWishlist } from "@/context/wishlist";
import { Link } from "@tanstack/react-router";
import { formatCfa } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  horizontal?: boolean;
}

export function ProductCard({ product, horizontal = false }: ProductCardProps) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const isFav = has(product.id);

  const badgeClass =
    product.badge === "Promo"
      ? "bg-promo text-white"
      : product.badge === "Épuisé"
        ? "bg-muted-foreground text-white"
        : "bg-foreground text-background";

  if (horizontal) {
    return (
      <article className="group flex gap-5 py-5 px-1">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="product-zoom relative flex-shrink-0 block overflow-hidden bg-muted/50 w-24 h-24 md:w-32 md:h-32 shadow-soft"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          {product.badge && (
            <span className={`absolute left-2 top-2 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${badgeClass}`}>
              {product.badge}
            </span>
          )}
        </Link>
        <div className="flex flex-1 items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            {product.scentFamily && (
              <p className="text-[11px] text-muted-foreground italic">{product.scentFamily}</p>
            )}
            <Link to="/product/$id" params={{ id: product.id }}>
              <h3 className="font-serif text-base leading-tight hover:text-promo transition-colors duration-300 truncate">{product.name}</h3>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">{product.brand}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold">{formatCfa(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCfa(product.originalPrice)}
                </span>
              )}
            </div>
            {product.notes && (
              <div className="mt-2 flex gap-4 text-[10px]">
                {[
                  { label: "Tête", value: product.notes.tete },
                  { label: "Cœur", value: product.notes.coeur },
                  { label: "Fond", value: product.notes.fond },
                ].map((n) => (
                  <div key={n.label}>
                    <span className="font-semibold text-foreground/70 uppercase tracking-[0.1em]">{n.label} </span>
                    <span className="text-muted-foreground">{n.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button
              aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={(e) => { e.preventDefault(); toggle(product); }}
              className="flex h-8 w-8 items-center justify-center border border-border bg-card transition-all hover:border-promo hover:scale-110"
            >
              <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-promo text-promo" : "text-foreground"}`} />
            </button>
            <button
              aria-label={`Ajouter ${product.name} au panier`}
              onClick={(e) => { e.preventDefault(); add(product); }}
              className="flex items-center gap-1.5 border border-promo px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-promo hover:bg-promo hover:text-background transition-colors"
            >
              <ShoppingCart className="h-3 w-3" /> Ajouter
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      {/* Image */}
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="product-zoom relative block overflow-hidden bg-muted/50 aspect-[3/4] shadow-soft transition-shadow duration-500 group-hover:shadow-elegant"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-promo opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none" />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${badgeClass}`}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist button */}
        <button
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-background/90 backdrop-blur-sm shadow-soft transition-all duration-300 hover:bg-background hover:scale-110 hover:text-promo"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isFav ? "fill-promo text-promo" : "text-foreground"}`}
          />
        </button>

        {/* Full-width slide-up add to cart */}
        <button
          aria-label={`Ajouter ${product.name} au panier`}
          onClick={(e) => {
            e.preventDefault();
            add(product);
          }}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-promo/95 backdrop-blur-sm py-3 text-background text-[10px] font-semibold uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Ajouter au panier
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col pt-4 px-0.5">
        {product.scentFamily && (
          <p className="text-[11px] text-muted-foreground italic tracking-wide mb-0.5">
            {product.scentFamily}
          </p>
        )}
        <h3 className="font-serif text-base leading-tight group-hover:text-promo transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
          {product.brand}
        </p>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatCfa(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCfa(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Notes */}
        {product.notes && (
          <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-3 text-center text-[10px]">
            {[
              { label: "Tête", value: product.notes.tete },
              { label: "Cœur", value: product.notes.coeur },
              { label: "Fond", value: product.notes.fond },
            ].map((n) => (
              <div key={n.label}>
                <p className="font-semibold text-foreground/70 uppercase tracking-[0.12em]">{n.label}</p>
                <p className="mt-0.5 text-muted-foreground">{n.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
