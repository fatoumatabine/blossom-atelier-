import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, User, Package, Heart, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/compte")({
  component: ComptePage,
  head: () => ({
    meta: [
      { title: "Mon compte — BLOSSOM" },
      { name: "description", content: "Gérez votre compte Blossom, vos commandes et vos préférences." },
    ],
  }),
});

function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (loggedIn) {
    return (
      <div className="py-10">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">{user?.name ?? "Client Blossom"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
        <div className="grid gap-3">
          {[
            { icon: Package, label: "Mes commandes", desc: "Consultez et suivez vos commandes" },
            { icon: Heart, label: "Ma wishlist", desc: "Vos produits favoris" },
            { icon: User, label: "Mes informations", desc: "Gérez vos données personnelles" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-4 border border-border p-4 text-left hover:border-foreground transition-colors"
            >
              <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => {
              window.localStorage.removeItem("blossom_client_session");
              setLoggedIn(false);
              setUser(null);
            }}
            className="flex items-center gap-4 border border-border p-4 text-left hover:border-foreground transition-colors text-muted-foreground"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <p className="text-sm">Se déconnecter</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(e.currentTarget);
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: String(form.get("email") ?? ""),
              password: String(form.get("password") ?? ""),
            }),
          });
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
            token?: string;
            user?: { name: string; email: string };
          };
          if (!response.ok || !data.user || !data.token) {
            throw new Error(data.error ?? "Connexion impossible.");
          }
          window.localStorage.setItem("blossom_client_session", JSON.stringify(data));
          setUser(data.user);
          setLoggedIn(true);
        } catch (loginError) {
          setError(loginError instanceof Error ? loginError.message : "Connexion impossible.");
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-[11px] uppercase tracking-widest mb-1.5">Adresse email</label>
        <input
          name="email"
          required
          type="email"
          placeholder="votre@email.com"
          className="w-full border border-border px-3 py-3 text-sm focus:border-foreground focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-widest mb-1.5">Mot de passe</label>
        <div className="relative">
          <input
            name="password"
            required
            type={showPwd ? "text" : "password"}
            placeholder="Votre mot de passe"
            className="w-full border border-border px-3 py-3 pr-10 text-sm focus:border-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground">
          Mot de passe oublié ?
        </button>
      </div>
      {error && <p className="text-sm text-promo">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-foreground text-background py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-foreground/80 transition-colors"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        const form = new FormData(e.currentTarget);
        try {
          const firstName = String(form.get("firstName") ?? "").trim();
          const lastName = String(form.get("lastName") ?? "").trim();
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${firstName} ${lastName}`.trim(),
              email: String(form.get("email") ?? ""),
              password: String(form.get("password") ?? ""),
              role: "client",
            }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) {
            throw new Error(data.error ?? "Création de compte impossible.");
          }
          setMessage("Compte créé. Vous pouvez vous connecter.");
          e.currentTarget.reset();
        } catch (registerError) {
          setError(registerError instanceof Error ? registerError.message : "Création de compte impossible.");
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-1.5">Prénom</label>
          <input
            name="firstName"
            required
            type="text"
            placeholder="Votre prénom"
            className="w-full border border-border px-3 py-3 text-sm focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-1.5">Nom</label>
          <input
            name="lastName"
            required
            type="text"
            placeholder="Votre nom"
            className="w-full border border-border px-3 py-3 text-sm focus:border-foreground focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-widest mb-1.5">Adresse email</label>
        <input
          name="email"
          required
          type="email"
          placeholder="votre@email.com"
          className="w-full border border-border px-3 py-3 text-sm focus:border-foreground focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-widest mb-1.5">Mot de passe</label>
        <div className="relative">
          <input
            name="password"
            required
            type={showPwd ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            className="w-full border border-border px-3 py-3 pr-10 text-sm focus:border-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" id="newsletter" className="mt-0.5" />
        <label htmlFor="newsletter" className="text-xs text-muted-foreground">
          J'accepte de recevoir les offres et nouveautés Blossom par email (code <strong>WELCOME10</strong> offert)
        </label>
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" required id="cgv" className="mt-0.5" />
        <label htmlFor="cgv" className="text-xs text-muted-foreground">
          J'accepte les{" "}
          <a href="/cgv" className="underline hover:text-foreground">Conditions Générales de Vente</a>
          {" "}et la{" "}
          <a href="/confidentialite" className="underline hover:text-foreground">Politique de confidentialité</a>
        </label>
      </div>
      {(message || error) && (
        <p className={`text-sm ${error ? "text-promo" : "text-green-700"}`}>{error || message}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-foreground text-background py-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-foreground/80 transition-colors"
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}

function ComptePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-14 md:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Espace personnel</p>
        <h1 className="font-serif text-4xl italic">Mon compte</h1>
      </div>

      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent border-b border-border h-auto mb-8">
          <TabsTrigger
            value="login"
            className="rounded-none border-b-2 border-transparent py-3 text-[11px] uppercase tracking-widest data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground"
          >
            Se connecter
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="rounded-none border-b-2 border-transparent py-3 text-[11px] uppercase tracking-widest data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground"
          >
            Créer un compte
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
