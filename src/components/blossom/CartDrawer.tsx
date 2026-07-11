import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatCfa } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, total } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-[92vw] sm:w-[440px] p-0 flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-serif text-xl">Mon panier</h2>
          <span className="text-sm text-muted-foreground">{items.length} article{items.length > 1 ? "s" : ""}</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Votre panier est vide</p>
            <Button onClick={close} variant="outline">Continuer mes achats</Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 p-5">
                  <img src={i.image} alt={i.name} className="h-24 w-20 rounded-md object-cover" loading="lazy" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{i.brand}</p>
                    <p className="font-serif text-base">{i.name}</p>
                    <p className="mt-1 text-sm font-medium">{formatCfa(i.price)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setQty(i.id, i.quantity - 1)}
                        aria-label="Diminuer"
                        className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <button
                        onClick={() => setQty(i.id, i.quantity + 1)}
                        aria-label="Augmenter"
                        className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        aria-label="Supprimer"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t bg-muted/30 p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatCfa(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="text-gold">Offerte</span>
              </div>
              <div className="flex justify-between border-t pt-4 text-base font-medium">
                <span>Total</span>
                <span>{formatCfa(total)}</span>
              </div>
              <Button asChild className="w-full bg-foreground text-background hover:bg-foreground/90" size="lg">
                <Link to="/checkout" onClick={close}>
                  Passer au paiement
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
