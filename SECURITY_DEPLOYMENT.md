# 🔒 Checklist de Sécurité - Avant Déploiement Production

## Variables d'Environnement Critiques

### 1️⃣ Générer JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Ajouter à `.env.production`:
```
JWT_SECRET=<valeur_générée_64_chars_minimum>
```

### 2️⃣ Générer ADMIN_SETUP_KEY
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```
Ajouter à `.env.production`:
```
ADMIN_SETUP_KEY=<valeur_générée>
```

### 3️⃣ Configurer DATABASE_URL
- Utiliser une URL Neon ou PostgreSQL sécurisée
- Activer SSL/TLS (sslmode=require)
- Utiliser des identifiants différents de dev

### 4️⃣ Configurer Cloudinary (optionnel)
```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_FOLDER=production
```

### 5️⃣ Environnement
```
NODE_ENV=production
SEED_DEMO_DATA=false
```

## Améliorations Implémentées ✅

### 🔴 CRITIQUES (Maintenant corrigées)
- [x] **Timing-safe compare** pour ADMIN_SETUP_KEY → Protection contre timing attacks
- [x] **Import crypto.timingSafeEqual** ajouté
- [x] **HTTPS headers** → Strict-Transport-Security (HSTS)
- [x] **Rate limiting** sur:
  - GET /api/products (100/min)
  - GET /api/products/:id (100/min)
  - POST /api/orders (20/heure)
  - POST /auth/login (10/15min)
  - POST /auth/register (5/heure)
- [x] **Audit logging** pour:
  - Créations/modifications de produits
  - Tentatives de login (réussis/échoués)
  - Tentatives de création admin
  - Créations de commandes

### 🟡 IMPORTANTS (Améliorés)
- [x] **SameSite=Strict** sur cookies (anciennement Lax)
- [x] **CSRF réactivé** en Java (SecurityConfig.java)
- [x] **Validation MIME** pour images (fonction validateMimeType)
- [x] **Endpoint audit logs** → GET /api/admin/audit-logs?limit=100

### 🟠 RECOMMANDÉ (À considérer)
- [ ] Token blacklist/révocation (Redis recommandé)
- [ ] 2FA pour comptes admin
- [ ] Backup automatisé de la DB
- [ ] Monitoring et alertes sur les logs d'audit
- [ ] WAF (Web Application Firewall)

## Première Création d'Admin en Production

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-setup-key: $(echo $ADMIN_SETUP_KEY)" \
  -d '{
    "email": "admin@company.com",
    "password": "GeneratedSecurePassword123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

## Vérification de Sécurité Avant Déploiement

```bash
# 1. Vérifier qu'aucun secret n'est en dur dans le code
grep -r "change-me" src/ || echo "✓ Pas de secrets par défaut"
grep -r "your-secret" src/ || echo "✓ Pas de secrets par défaut"

# 2. Vérifier que NODE_ENV=production
echo $NODE_ENV  # Doit afficher: production

# 3. Vérifier que les secrets sont bien définis
test -n "$JWT_SECRET" && echo "✓ JWT_SECRET défini" || echo "✗ JWT_SECRET manquant"
test -n "$ADMIN_SETUP_KEY" && echo "✓ ADMIN_SETUP_KEY défini" || echo "✗ ADMIN_SETUP_KEY manquant"
test -n "$DATABASE_URL" && echo "✓ DATABASE_URL défini" || echo "✗ DATABASE_URL manquant"

# 4. Vérifier que HTTPS est forcé
grep "Strict-Transport-Security" src/routes/api.$.ts && echo "✓ HSTS activé"

# 5. Vérifier que CSRF est réactivé (Java)
grep -A5 "SecurityConfig" java-example/src/main/java/com/example/product/security/SecurityConfig.java | grep -q "csrf" && echo "✓ CSRF activé"
```

## Monitoring Post-Déploiement

1. **Vérifier les audit logs**
   ```bash
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://your-domain.com/api/admin/audit-logs?limit=50
   ```

2. **Alertes recommandées**
   - Trop de logins échoués (>5/min par IP)
   - Tentatives de création admin échouées
   - Erreurs 429 (rate limit exceeded)
   - Accès admin anormal

3. **Logs à monitorer**
   - Les fichiers de log (si logging en fichier)
   - Les erreurs de connexion DB
   - Les erreurs CORS

## Mise à jour .env.example

Votre fichier `.env.example` a été mise à jour avec:
```
JWT_SECRET=YOUR_SECRET_KEY_CHANGE_IN_PRODUCTION_MIN_32_CHARS
ADMIN_SETUP_KEY=YOUR_ADMIN_SETUP_KEY_CHANGE_IN_PRODUCTION
```

**NE JAMAIS commiter le fichier `.env` réel en production!**

## Configuration de Déploiement (Exemple Vercel/Cloudflare)

1. Ajouter les variables d'environnement dans le dashboard
2. Forcer HTTPS (habituellement automatique)
3. Ajouter les headers de sécurité recommandés

```javascript
// Si besoin dans vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    }
  }
})
```

## Questions ?

Pour toute question sur la sécurité, consultez:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Spring Security Docs](https://spring.io/projects/spring-security)

---

**Dernière révision:** 11 juillet 2026
