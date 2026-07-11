# 🛡️ Guide de Sécurité pour Développeurs

## 📋 Table des matières
1. [Avant de commencer](#avant-de-commencer)
2. [Secrets et configuration](#secrets-et-configuration)
3. [Validation des entrées](#validation-des-entrées)
4. [Authentification](#authentification)
5. [Autorisation](#autorisation)
6. [Protection CSRF](#protection-csrf)
7. [Rate Limiting](#rate-limiting)
8. [Logs d'audit](#logs-daudit)
9. [Erreurs communes](#erreurs-communes)

## Avant de commencer

### ✅ Setup sécurisé

```bash
# 1. Installer les dépendances avec audit
npm audit
npm audit fix

# 2. Vérifier qu'on a les bonnes versions
node --version  # >= 22.12.0
npm --version

# 3. Générer les secrets
bash setup-production-secrets.sh

# 4. Ne JAMAIS commiter .env
echo ".env*" >> .gitignore
git add .gitignore
git commit -m "chore: ignore env files"
```

### 🚫 À JAMAIS faire

- Commiter des fichiers `.env`
- Exposer des secrets dans les logs
- Utiliser `console.log()` pour les données sensibles
- Désactiver la validation Zod
- Créer des endpoints sans authentification pour des données admin
- Stocker les mots de passe en clair

## Secrets et configuration

### ✅ Bon
```typescript
// Charger depuis variables d'environnement
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET manquant");
}

// Valider que c'est une vraie clé
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET trop court");
}
```

### ❌ Mauvais
```typescript
// Ne JAMAIS faire ça
const jwtSecret = "my-secret-key"; // Hardcoded!
const apiKey = "sk_test_12345"; // Exposé!

// Ne PAS logger les secrets
console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`);
```

## Validation des entrées

### ✅ Bon - Avec Zod
```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
});

const data = userSchema.parse(input); // Lève une erreur si invalide
```

### ❌ Mauvais - Pas de validation
```typescript
// Pas de validation!
function createUser(email: string, password: string, name: string) {
  // email peut avoir n'importe quoi
  // password peut être vide
  // name peut être très long
}
```

## Authentification

### ✅ Bon - JWT sécurisé
```typescript
import { timingSafeEqual } from "node:crypto";

// Vérification timing-safe
if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
  return error("Clé invalide", 403);
}

// Hash bcryptjs
const hashedPassword = await hash(password, 12);

// JWT avec expiration
const token = sign(
  { id, email, role },
  JWT_SECRET,
  { expiresIn: "7d" }
);
```

### ❌ Mauvais
```typescript
// Comparaison classique (timing attack!)
if (provided !== expected) {
  return error("Clé invalide", 403);
}

// Mot de passe en clair
await db.query("INSERT INTO users (password) VALUES ($1)", [password]);

// Token sans expiration
const token = sign({ id, email }, JWT_SECRET);
```

## Autorisation

### ✅ Bon - Vérifier le rôle
```typescript
function requireAdmin(request: Request) {
  const token = getRequestToken(request);
  const user = token ? verifyToken(token) : null;
  
  if (!user || user.role !== "admin") {
    throw new Response("Admin requis", { status: 401 });
  }
  
  return user;
}

// Utiliser dans chaque endpoint admin
if (method === "DELETE" && id) {
  const admin = requireAdmin(request);
  // ...
  addAuditLog("item_deleted", admin.email, `ID: ${id}`);
}
```

### ❌ Mauvais
```typescript
// Pas de vérification
if (method === "DELETE" && id) {
  await deleteItem(id);
}

// Vérifier seulement si token existe (pas le rôle)
if (token) {
  await deleteItem(id);
}
```

## Protection CSRF

### ✅ Bon - CSRF activé
```typescript
// Java: SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http
    .csrf(csrf -> csrf
      .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    )
    // ...
}

// Node.js: Same-origin validation
function validateSameOrigin(request: Request, url: URL, method: string) {
  if (!["POST", "PATCH", "DELETE"].includes(method)) return;
  
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    throw new Response("Origine refusée", { status: 403 });
  }
}
```

### ❌ Mauvais
```typescript
// CSRF désactivé!
http.csrf().disable()

// Pas de validation d'origine
if (method === "DELETE") {
  await deleteItem(id); // Vulnerable to CSRF!
}
```

## Rate Limiting

### ✅ Bon - Rate limit actif
```typescript
// Ajouter des limites à tous les endpoints sensibles
if (method === "POST" && parts[0] === "auth" && parts[1] === "login") {
  enforceRateLimit(request, "auth:login", 10, 15 * 60 * 1000);
  // ...
}

if (method === "GET" && !id) {
  enforceRateLimit(request, "api:products:list", 100, 60 * 1000);
  // ...
}
```

### ❌ Mauvais
```typescript
// Pas de rate limit
if (method === "POST" && parts[0] === "auth" && parts[1] === "login") {
  // Attaque par force brute possible!
  const user = await validatePassword(email, password);
}
```

## Logs d'audit

### ✅ Bon - Audit logging
```typescript
// Logger les actions sensibles
addAuditLog("product_created", admin.email, `ID: ${product.id}`);
addAuditLog("login_failed", email, "Identifiants invalides");
addAuditLog("product_deleted", admin.email, `ID: ${id}`);

// Récupérer les logs en admin
GET /api/admin/audit-logs?limit=100
```

### ❌ Mauvais
```typescript
// Pas de logging
const product = await createProduct(body);
return json(product);

// Données sensibles dans les logs
console.log(`Password hash: ${hashedPassword}`);
```

## Erreurs communes

### 1. Exposer les secrets

```typescript
// ❌ JAMAIS
process.env.JWT_SECRET

// ✅ OUI (avec rotation régulière)
getRequiredEnv("JWT_SECRET");

// ✅ Valider les secrets
function getJwtSecret() {
  const secret = getRequiredEnv("JWT_SECRET");
  if (secret.length < 32) {
    throw new Error("JWT_SECRET trop court");
  }
  return secret;
}
```

### 2. Mots de passe faibles

```typescript
// ❌ Accepter n'importe quoi
if (password.length > 0) { /* OK */ }

// ✅ Exiger une vraie complexité
const passwordSchema = z.string()
  .min(8, "Min 8 caractères")
  .max(128, "Max 128 caractères")
  .regex(/[A-Z]/, "Doit avoir une majuscule")
  .regex(/[0-9]/, "Doit avoir un chiffre");
```

### 3. Erreurs trop détaillées

```typescript
// ❌ Révèle trop d'info
return error(`Utilisateur ${email} non trouvé`, 404);

// ✅ Générique
return error("Identifiants invalides", 401);
```

### 4. No HTTPS check

```typescript
// ❌ Pas de vérification
return `${name}=value; Path=/`;

// ✅ Forcer Secure en production
const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
return `${name}=value; Path=/; Secure${secure}`;
```

### 5. Validation insuffisante

```typescript
// ❌ Pas de limites
const body = JSON.parse(await request.text());

// ✅ Avec limite de taille
async function readJson<T>(request: Request, maxBytes = 100_000) {
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new Error("Trop volumineux");
  }
  return JSON.parse(text) as T;
}
```

## Checklist de Sécurité

Avant de merger une PR:

- [ ] Pas de secrets hardcodés
- [ ] Validation Zod sur toutes les entrées
- [ ] `requireAdmin()` sur les endpoints admin
- [ ] Rate limiting sur les endpoints sensibles
- [ ] Audit logging des actions importantes
- [ ] Pas de `console.log()` avec données sensibles
- [ ] Headers de sécurité présents
- [ ] HTTPS en production
- [ ] Pas d'erreurs détaillées exposées

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Spring Security](https://spring.io/projects/spring-security)
- [Zod Documentation](https://zod.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Questions ?** Consultez les autres fichiers de sécurité:
- [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md)
- [API_SECURITY.md](API_SECURITY.md)
- [TOKEN_MANAGEMENT.md](TOKEN_MANAGEMENT.md)
