import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type MenuItem = {
  label: string;
  to: string;
  params?: { category: string };
};

type NavLink = {
  label: string;
  to: string;
  params?: { category: string };
  highlight?: boolean;
  menu?: {
    variant?: "simple" | "mega";
    columns: { title?: string; items: MenuItem[] }[];
  };
};

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="border border-border bg-card/80 text-foreground shadow-soft"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex h-dvh">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#3F1712]/55 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <div className="relative ml-0 flex h-dvh w-[86vw] max-w-sm animate-admin-slide flex-col overflow-hidden border-r border-border bg-card shadow-elegant">
            <div className="flex items-center justify-between border-b border-border bg-background/70 px-5 py-4">
              <div>
                <span className="font-serif text-xl tracking-[0.2em] text-foreground">BLOSSOM</span>
                <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                  Beauté &amp; Luxe
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-5">
                {links.map((l) => (
                  <li key={l.label}>
                    {l.menu ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveMenu(activeMenu === l.label ? null : l.label)}
                          className={`flex w-full items-center justify-between border-b border-border/45 pb-3 text-left text-sm uppercase tracking-widest transition-colors hover:text-foreground ${
                            l.highlight ? "font-semibold text-promo" : "text-muted-foreground"
                          }`}
                          aria-expanded={activeMenu === l.label}
                        >
                          {l.label}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              activeMenu === l.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {activeMenu === l.label && (
                          <div className="mt-4 space-y-5 border-l border-border bg-background/45 py-3 pl-4">
                            {l.menu.columns.map((column, index) => (
                              <div key={`${l.label}-${index}`} className="space-y-2">
                                {column.title && (
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                                    {column.title}
                                  </p>
                                )}
                                {column.items.map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.to}
                                    params={item.params}
                                    onClick={() => setOpen(false)}
                                    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={l.to}
                        params={l.params}
                        onClick={() => setOpen(false)}
                        className={`block border-b border-border/45 pb-3 text-sm uppercase tracking-widest transition-colors hover:text-foreground ${
                          l.highlight ? "font-semibold text-promo" : "text-muted-foreground"
                        }`}
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3 border-t border-border pt-6">
                <Link
                  to="/compte"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Mon compte
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Mes favoris
                </Link>
                <Link
                  to="/livraison"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Livraison
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
