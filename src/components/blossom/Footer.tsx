import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-background">
      {/* USP strip */}
      <div className="border-b border-background/10 bg-blossom-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 divide-x divide-border md:grid-cols-4">
          {[
            { t: "Produits", s: "authentiques et certifiés" },
            { t: "Livraison 24h", s: "1–2 jours ouvrables" },
            { t: "Emballage", s: "soigné et personnalisé" },
            { t: "Échantillons", s: "à tester sans modération" },
          ].map((u) => (
            <div key={u.t} className="px-5 py-5 text-center">
              <p className="text-xs font-semibold text-promo">{u.t}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{u.s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-background/10 bg-promo/15 py-8">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <p className="text-center text-sm text-background/60 mb-3">
            Inscrivez-vous et recevez <strong className="text-background">-10%</strong> sur votre 1ère commande
          </p>
          <form
            className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="E-mail ici"
              aria-label="Votre email"
              className="flex-1 border border-background/20 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/40 focus:border-background/60 focus:outline-none"
            />
            <button className="bg-background text-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-gold transition-colors">
              S'abonner
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-serif text-2xl tracking-[0.25em]">BLOSSOM</p>
            <p className="text-[9px] tracking-[0.3em] text-background/50 uppercase mt-0.5">
              Beauté &amp; Luxe
            </p>
            <p className="mt-4 text-sm text-background/60 leading-relaxed">
              Beauté, parfumerie et soins haut de gamme. L'élégance au naturel.
            </p>
            <div className="mt-5 flex gap-4">
              <a href="#" aria-label="Instagram" className="text-background/50 hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-background/50 hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Snapchat" className="text-background/50 hover:text-background transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Blossom & Vous */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4">Blossom &amp; Vous</p>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/about" className="hover:text-background transition-colors">À propos de nous</Link></li>
              <li><Link to="/compte" className="hover:text-background transition-colors">Mon Compte</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contactez-nous</Link></li>
              <li><Link to="/livraison" className="hover:text-background transition-colors">Suivre mon colis</Link></li>
              <li><Link to="/faq" className="hover:text-background transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Mentions légales + Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4">Mentions légales</p>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/cgv" className="hover:text-background transition-colors">CGV</Link></li>
              <li><Link to="/confidentialite" className="hover:text-background transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/livraison" className="hover:text-background transition-colors">Livraison</Link></li>
              <li><Link to="/retours" className="hover:text-background transition-colors">Retours et remboursements</Link></li>
              <li><Link to="/blog" className="hover:text-background transition-colors">Blog</Link></li>
            </ul>
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-widest mb-2">Contact</p>
              <p className="text-sm text-background/60">787932424</p>
              <p className="text-sm text-background/60">info@blossom.com</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-2xl tracking-[0.25em] text-background/30">BLOSSOM</p>
          <p className="text-xs text-background/40">
            © {new Date().getFullYear()} Blossom — Beauté &amp; Luxe. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
