import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { CartProvider } from "@/context/cart";
import { WishlistProvider } from "@/context/wishlist";
import { Header } from "@/components/blossom/Header";
import { Footer } from "@/components/blossom/Footer";
import { CartDrawer } from "@/components/blossom/CartDrawer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Erreur 404</p>
        <h1 className="mt-4 font-serif text-7xl">Page introuvable</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BLOSSOM — Beauté & Luxe" },
      {
        name: "description",
        content:
          "Découvrez Blossom : parfums, maquillage et soins haut de gamme. Élégance et beauté naturelle.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          {!isAdmin && <Header />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAdmin && <Footer />}
          {!isAdmin && <CartDrawer />}
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
