# 🔐 Gestion des Tokens JWT

## Vue d'ensemble

Les tokens JWT sont utilisés pour l'authentification dans l'API Blossom. Voici comment ils sont gérés:

### Génération
- **Validité**: 7 jours
- **Algorithme**: HS256
- **Payload**: `{ id, email, role }`
- **Secret**: `JWT_SECRET` (min 32 caractères)

### Stockage
- **Client**: HttpOnly Cookie (SameSite=Strict)
- **Transmission**: Header `Authorization: Bearer <token>` OU Cookie
- **Sécurité**: Chiffré en transit (HTTPS en production)

## Endpoints d'Authentification

### Enregistrement
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "client"  // Optionnel, défaut: "client"
}

# Pour créer un admin, ajouter le header:
x-admin-setup-key: <ADMIN_SETUP_KEY>
```

**Réponse:**
```json
{
  "user": {
    "id": "usr-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "created_at": "2026-07-11T10:00:00Z"
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Réponse:**
```json
{
  "user": {
    "id": "usr-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "created_at": "2026-07-11T10:00:00Z"
  }
}
```

**Set-Cookie:**
```
blossom_session=<token>; Path=/; Max-Age=604800; HttpOnly; SameSite=Strict; Secure
```

### Me (Profil courant)
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "user": {
    "id": "usr-xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Logout
```
POST /api/auth/logout
```

**Réponse:**
```json
{
  "ok": true
}
```

**Set-Cookie:**
```
blossom_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure
```

## Utilisation dans le Frontend

### Automatique (Cookies)
Les cookies HttpOnly sont automatiquement envoyés avec chaque requête.

```javascript
// Pas besoin de passer le token manuellement
const response = await fetch('/api/admin/summary');
```

### Manuel (Authorization Header)
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/admin/summary', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Expiration et Renouvellement

**Comportement actuel:**
- Token expire après 7 jours
- Pas de renouvellement automatique
- L'utilisateur doit se reconnecter

**Avenir (recommandé):**
- Implémenter refresh tokens
- Auto-renouvellement des tokens avant expiration
- Token blacklist pour révocation

## Implémentation d'une Token Blacklist (Future)

Si vous avez besoin de révoquer les tokens avant expiration:

```typescript
// Option 1: Redis
const tokenBlacklist = new Set<string>(); // Utiliser Redis en production
export function revokeToken(token: string) {
  tokenBlacklist.add(token);
  // Avec Redis: await redis.setex(`blacklist:${token}`, 604800, '1')
}

// Option 2: Base de données
export async function revokeToken(token: string) {
  await sql`INSERT INTO token_blacklist (token, revoked_at) VALUES (${token}, now())`;
}
```

## Sécurité

### ✅ Bonnes pratiques implémentées
- JWT signé avec secret fort
- Tokens stockés en HttpOnly cookies
- SameSite=Strict protection CSRF
- Pas d'exposition du token en logs
- Timestamps d'expiration

### 🔒 Améliorations futures
- [ ] Refresh tokens
- [ ] Token rotation
- [ ] Token blacklist
- [ ] Device fingerprinting
- [ ] Géolocalisation des accès

## Débogage

### Le token ne fonctionne pas
1. Vérifier que le token n'a pas expiré (7 jours)
2. Vérifier le format: `Authorization: Bearer <token>`
3. Vérifier que `JWT_SECRET` est correct

### Session perdue après redéploiement
- Les tokens générés avec l'ancien `JWT_SECRET` deviennent invalides
- Les utilisateurs doivent se reconnecter
- C'est normal et souhaitable en production

### Rate limit atteint
- Attendre 15 minutes (login) ou 1 heure (register)
- Ou utiliser une autre IP/appareil

---

**Voir aussi:**
- [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md)
- [API_SECURITY.md](API_SECURITY.md)
