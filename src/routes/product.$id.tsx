import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ProductSize } from "@/lib/products";
import { useCart } from "@/context/cart";
import { useWishlist } from "@/context/wishlist";
import { ProductCard } from "@/components/blossom/ProductCard";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus, Truck, ShieldCheck, Gift, ChevronDown } from "lucide-react";
import { useProductCatalog } from "@/hooks/useProductCatalog";
import { formatCfa } from "@/lib/format";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Produit introuvable.</p>
    </div>
  ),
  loader: ({ params }) => ({ id: params.id }),
  head: () => ({
    meta: [{ title: "Produit — BLOSSOM" }],
  }),
});

function ProductPage() {
  const { id } = Route.useLoaderData();
  const { products, loading } = useProductCatalog();
  const product = products.find((p) => p.id === id) ?? null;
  const { add } = useCart();
  const navigate = useNavigate();
  const { toggle, has } = useWishlist();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] ?? null);
  }, [product?.id, product?.sizes]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          {loading ? "Chargement du produit..." : "Produit introuvable."}
        </p>
      </div>
    );
  }

  const isFav = has(product.id);
  const similar = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const displayPrice = selectedSize?.price ?? product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
        <Link to="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link
          to="/collections/$category"
          params={{ category: product.category.toLowerCase() }}
          className="hover:text-foreground transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="overflow-hidden bg-muted/30 aspect-square relative">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <button className="absolute bottom-3 right-3 flex items-center justify-center h-8 w-8 bg-background/80 backdrop-blur">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197M15.803 15.803A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button className="overflow-hidden aspect-square border border-foreground bg-muted/30">
              <img
                src={product.image}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {product.brand}
          </p>
          <h1 className="mt-2 font-serif text-4xl italic md:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-foreground text-sm">{"★".repeat(5)}</div>
            <span className="text-xs text-muted-foreground">128 avis</span>
          </div>

          {product.scentFamily && (
            <p className="mt-3 text-sm text-muted-foreground italic">{product.scentFamily}</p>
          )}

          {product.notes && (
            <div className="mt-4 grid grid-cols-3 text-center border-y border-border py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest">Tête</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{product.notes.tete}</p>
              </div>
              <div className="border-x border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest">Cœur</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{product.notes.coeur}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest">Fond</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{product.notes.fond}</p>
              </div>
            </div>
          )}

          <p className="mt-6 text-3xl font-semibold">{formatCfa(displayPrice)}</p>

          <div className="mt-5 border-y border-border py-4">
            {product.problematic && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Problématique
                </span>
                <span className="bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                  {product.problematic}
                </span>
              </div>
            )}
            <p className="text-sm font-light leading-7 text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3">Taille</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s)}
                    className={`flex flex-col items-center border px-3 py-2 transition-colors ${
                      selectedSize?.label === s.label
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="text-[10px] mt-0.5">{formatCfa(s.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">En stock</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Livraison estimée entre 1 et 2 jours
          </p>

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Diminuer"
                className="flex h-12 w-10 items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Augmenter"
                className="flex h-12 w-10 items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                for (let i = 0; i < qty; i++) add(product);
              }}
              className="flex-1 bg-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-background hover:bg-foreground/80 transition-colors"
            >
              Ajouter au panier
            </button>
          </div>

          {/* Buy now */}
          <button
            onClick={() => {
              for (let i = 0; i < qty; i++) add(product);
              void navigate({ to: "/checkout" });
            }}
            className="mt-2 w-full border border-foreground py-3 text-[11px] font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            Acheter maintenant
          </button>

          {/* Wishlist */}
          <button
            onClick={() => toggle(product)}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-border py-3 text-[11px] uppercase tracking-widest hover:border-foreground transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-promo text-promo" : ""}`} />
            {isFav ? "Retirer de la wishlist" : "Ajouter dans ta Wishlist"}
          </button>

          {/* Preorder */}
          <button className="mt-2 flex w-full items-center justify-between border border-border px-4 py-3 text-xs hover:border-muted-foreground transition-colors">
            <span>Produit Épuisé? Précommandez-Le Ici 👉</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Benefits */}
          <ul className="mt-6 space-y-2.5 border-t border-border pt-5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-foreground shrink-0" />
              Livraison offerte dès 49 000 FCFA
            </li>
            <li className="flex items-center gap-2.5">
              <Gift className="h-4 w-4 text-foreground shrink-0" />
              Échantillons gratuits à chaque commande
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-foreground shrink-0" />
              Retour gratuit sous 30 jours
            </li>
          </ul>
        </div>
      </div>

      {/* Description tabs */}
      <div className="mt-16 border-t border-border">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-border">
          {["Description", "Conseils d'utilisation", "Bénéfices"].map((tab, i) => (
            <button
              key={tab}
              className={`whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-widest border-b-2 -mb-px flex-shrink-0 ${
                i === 0
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="py-8 max-w-2xl">
          <p className="text-sm font-light leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 border-t border-border pt-10">
        <h2 className="font-serif text-2xl italic md:text-3xl">Avis clients</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { n: "Léa P.", t: "Un produit divin, je recommande à 100%.", r: 5 },
            { n: "Marie K.", t: "La texture, le parfum, tout est parfait.", r: 5 },
            { n: "Anaïs B.", t: "Mon nouveau rituel beauté préféré.", r: 5 },
          ].map((r) => (
            <figure key={r.n} className="border border-border p-5">
              <div className="flex text-foreground text-sm">{"★".repeat(r.r)}</div>
              <blockquote className="mt-2 font-serif text-base italic">"{r.t}"</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">— {r.n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-serif text-2xl italic md:text-3xl">Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
