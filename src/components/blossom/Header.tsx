import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "@/context/cart";
import { useWishlist } from "@/context/wishlist";

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

const navLinks: NavLink[] = [
  {
    label: "Découvrir",
    to: "/collections/$category",
    params: { category: "all" },
    menu: {
      columns: [
        {
          items: [
            { label: "Nouveautés", to: "/collections/$category", params: { category: "all" } },
            { label: "Best Sellers", to: "/collections/$category", params: { category: "all" } },
            {
              label: "Tendances 🔥 📱 💻",
              to: "/collections/$category",
              params: { category: "all" },
            },
            {
              label: "Cartes-cadeaux",
              to: "/collections/$category",
              params: { category: "bons-plans" },
            },
            { label: "Astuces Beauté", to: "/blog" },
            {
              label: "Trouver ma fragrance",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "Parfum",
    to: "/collections/$category",
    params: { category: "parfum" },
    menu: {
      variant: "mega",
      columns: [
        {
          items: [
            {
              label: "Parfums Femme",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Parfums Homme",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Parfums Mixte",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Parfums de Niche",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
          ],
        },
        {
          title: "Concentration",
          items: [
            {
              label: "Eau de parfum",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Eau de toilette",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Extrait de parfum",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Eau de cologne",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
          ],
        },
        {
          title: "Notes olfactives",
          items: [
            {
              label: "Parfum vanillé",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Parfum floral",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            { label: "Parfum sucré", to: "/collections/$category", params: { category: "parfum" } },
            {
              label: "Parfum fruité",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Parfum poudré",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            { label: "Parfum boisé", to: "/collections/$category", params: { category: "parfum" } },
          ],
        },
        {
          items: [
            {
              label: "Coffret parfum",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
            {
              label: "Fragrance finder",
              to: "/collections/$category",
              params: { category: "parfum" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "Maquillage",
    to: "/collections/$category",
    params: { category: "maquillage" },
    menu: {
      columns: [
        {
          items: [
            { label: "Teint", to: "/collections/$category", params: { category: "maquillage" } },
            { label: "Lèvres", to: "/collections/$category", params: { category: "maquillage" } },
            { label: "Yeux", to: "/collections/$category", params: { category: "maquillage" } },
            { label: "Ongles", to: "/collections/$category", params: { category: "maquillage" } },
            {
              label: "Accessoires maquillage",
              to: "/collections/$category",
              params: { category: "maquillage" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "Soin & Maison",
    to: "/collections/$category",
    params: { category: "soin" },
    menu: {
      columns: [
        {
          items: [
            { label: "Soin du visage", to: "/collections/$category", params: { category: "soin" } },
            { label: "Soin du corps", to: "/collections/$category", params: { category: "soin" } },
            {
              label: "Soin des cheveux",
              to: "/collections/$category",
              params: { category: "soin" },
            },
            {
              label: "Accessoires visage",
              to: "/collections/$category",
              params: { category: "soin" },
            },
            {
              label: "Accessoires cheveux",
              to: "/collections/$category",
              params: { category: "soin" },
            },
            {
              label: "Bougies parfumées",
              to: "/collections/$category",
              params: { category: "soin" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "Marques",
    to: "/collections/$category",
    params: { category: "marques" },
    menu: {
      columns: [
        {
          items: [
            {
              label: "Toutes les marques",
              to: "/collections/$category",
              params: { category: "marques" },
            },
            {
              label: "Marques françaises",
              to: "/collections/$category",
              params: { category: "marques" },
            },
            {
              label: "Marques de niche",
              to: "/collections/$category",
              params: { category: "marques" },
            },
            {
              label: "Nouveaux créateurs",
              to: "/collections/$category",
              params: { category: "marques" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "🎁 Bons Plans",
    to: "/collections/$category",
    params: { category: "bons-plans" },
    highlight: true,
    menu: {
      columns: [
        {
          items: [
            {
              label: "Promotions",
              to: "/collections/$category",
              params: { category: "bons-plans" },
            },
            {
              label: "Coffrets cadeaux",
              to: "/collections/$category",
              params: { category: "bons-plans" },
            },
            {
              label: "Offres limitées",
              to: "/collections/$category",
              params: { category: "bons-plans" },
            },
            {
              label: "Petits prix",
              to: "/collections/$category",
              params: { category: "bons-plans" },
            },
          ],
        },
      ],
    },
  },
  {
    label: "Nos Services",
    to: "/livraison",
    menu: {
      columns: [
        {
          items: [
            { label: "Livraison", to: "/livraison" },
            { label: "Retours", to: "/retours" },
            { label: "FAQ", to: "/faq" },
            { label: "Contact", to: "/contact" },
          ],
        },
      ],
    },
  },
];

function MenuLink({
  item,
  onClick,
  className,
}: {
  item: MenuItem;
  onClick: () => void;
  className: string;
}) {
  return (
    <Link to={item.to} params={item.params} onClick={onClick} className={className}>
      {item.label}
    </Link>
  );
}

export function Header() {
  const { open, count } = useCart();
  const { count: wishCount } = useWishlist();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (!navRef.current?.contains(target) && !megaMenuRef.current?.contains(target)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-xl">
      {/* Announcement bar */}
      <div className="bg-promo text-background py-2 text-center text-[11px] tracking-widest uppercase">
        -10% offerts avec WELCOME10 · En vous inscrivant à la newsletter
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 md:px-8 lg:flex lg:justify-between">
          {/* Mobile: hamburger */}
          <div className="flex min-w-10 items-center lg:hidden">
            <MobileMenu links={navLinks} />
          </div>

          {/* Logo */}
          <Link to="/" className="flex min-w-0 flex-col items-center leading-none lg:flex-none">
              <span className="font-serif text-2xl tracking-[0.3em] font-medium text-foreground md:text-3xl">
                BLOSSOM
              </span>
            <span className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mt-0.5">
              Beauté &amp; Luxe
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            ref={navRef}
            className="hidden items-center gap-6 text-[11px] tracking-widest uppercase lg:flex xl:gap-7"
          >
            {navLinks.map((l) => (
              <div key={l.label} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === l.label ? null : l.label)}
                  className={`border-b-2 py-1 transition-colors hover:text-foreground ${
                    activeMenu === l.label
                      ? "border-promo text-promo"
                      : "border-transparent"
                  } ${l.highlight ? "font-semibold text-promo" : "text-muted-foreground"}`}
                  aria-expanded={activeMenu === l.label}
                  aria-haspopup="menu"
                >
                  {l.label}
                </button>

                {activeMenu === l.label && l.menu?.variant !== "mega" && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-44 border border-border bg-card px-4 py-3 text-[12px] normal-case tracking-normal shadow-elegant">
                    {l.menu?.columns[0]?.items.map((item) => (
                      <MenuLink
                        key={item.label}
                        item={item}
                        onClick={() => setActiveMenu(null)}
                        className="block whitespace-nowrap py-2 text-muted-foreground transition-colors hover:text-foreground"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex min-w-10 items-center justify-end gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rechercher"
              className="hidden sm:inline-flex"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Favoris" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="h-[18px] w-[18px]" />
                {wishCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-promo text-[9px] text-background font-medium">
                    {wishCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mon compte"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link to="/compte">
                <User className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Panier"
              onClick={open}
              className="relative"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-promo text-[9px] text-background font-medium">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {activeMenu && navLinks.find((l) => l.label === activeMenu)?.menu?.variant === "mega" && (
        <div
          ref={megaMenuRef}
          className="absolute left-0 top-full z-40 hidden w-full border-b border-border bg-card shadow-elegant lg:block"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-12 px-8 py-8">
            {navLinks
              .find((l) => l.label === activeMenu)
              ?.menu?.columns.map((column, index) => (
                <div key={`${activeMenu}-${index}`} className="space-y-4">
                  {column.title && (
                    <p className="text-[12px] font-bold uppercase tracking-[0.35em]">
                      {column.title}
                    </p>
                  )}
                  <div className="space-y-3">
                    {column.items.map((item) => (
                      <MenuLink
                        key={item.label}
                        item={item}
                        onClick={() => setActiveMenu(null)}
                        className={
                          column.title
                            ? "block text-sm normal-case tracking-normal text-muted-foreground transition-colors hover:text-foreground"
                            : "block text-[12px] font-bold uppercase tracking-[0.35em] transition-colors hover:text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
