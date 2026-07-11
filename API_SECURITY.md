# 🔐 API Endpoints de Sécurité

## Audit Logs (Admin uniquement)

### Récupérer les logs d'audit
```
GET /api/admin/audit-logs?limit=100
Authorization: Bearer <admin_token>
```

**Paramètres:**
- `limit` (optionnel): Nombre maximum d'entrées (défaut: 100, max: 1000)

**Réponse:**
```json
[
  {
    "timestamp": "2026-07-11T10:30:45.123Z",
    "action": "login_success",
    "user": "admin@example.com",
    "details": "Rôle: admin"
  },
  {
    "timestamp": "2026-07-11T10:25:12.456Z",
    "action": "product_created",
    "user": "admin@example.com",
    "details": "ID: p-xyz, Nom: Sérum Botanique"
  },
  {
    "timestamp": "2026-07-11T10:20:30.789Z",
    "action": "login_failed",
    "user": "user@example.com",
    "details": "Identifiants invalides"
  }
]
```

## Actions Tracées

### Authentification
| Action | Déclencheur | Détails |
|--------|-----------|---------|
| `login_success` | Login réussi | `Rôle: admin/client` |
| `login_failed` | Login échoué | `Identifiants invalides` |
| `user_created` | Nouvel utilisateur | `Rôle: admin/client` |
| `admin_creation_failed` | Tentative création admin échouée | `Clé admin manquante/invalide` |

### Produits
| Action | Déclencheur | Détails |
|--------|-----------|---------|
| `product_created` | Produit créé | `ID: p-xyz, Nom: ...` |
| `product_updated` | Produit modifié | `ID: p-xyz` |
| `product_deleted` | Produit supprimé | `ID: p-xyz` |

### Commandes
| Action | Déclencheur | Détails |
|--------|-----------|---------|
| `order_created` | Commande créée | `ID: cmd-xyz, Total: 150.50` |

## Headers de Sécurité Appliqués

Tous les endpoints retournent les headers suivants:

```
Cache-Control: no-store
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'self'
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Rate Limiting

Les limites suivantes sont appliquées:

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| POST /api/auth/login | 10 | 15 minutes |
| POST /api/auth/register | 5 | 1 heure |
| GET /api/products | 100 | 1 minute |
| GET /api/products/:id | 100 | 1 minute |
| POST /api/orders | 20 | 1 heure |

### Réponse Rate Limit Exceeded
```
HTTP 429 Too Many Requests
{
  "error": "Trop de requêtes. Réessayez dans quelques minutes."
}
```

## Validation des Entrées

### Schémas Zod Appliqués

**Email**
- Valide selon RFC 5322
- Max 254 caractères

**Password**
- Min 8 caractères
- Max 128 caractères
- Hash bcryptjs (salt: 12)

**Produits**
- Nom: 1-180 caractères
- Brand: 1-120 caractères
- Prix: 0-10,000,000
- Image: Max 8MB (base64)
- Catégorie: Parfum|Maquillage|Soin
- Badge: Nouveau|Best-seller|Promo|Épuisé
- Description: 1-2000 caractères

## Mécanismes de Protection

### 1. Timing-Safe Comparison
La clé d'admin est comparée de manière sécurisée (résistant aux timing attacks)

```javascript
timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
```

### 2. Cryptage des Mots de Passe
Tous les mots de passe sont hashés avec bcryptjs (salt=12)

### 3. Tokens JWT
- Validité: 7 jours
- Stockés en HttpOnly cookies
- SameSite=Strict

### 4. CSRF Protection
- Same-origin validation
- CSRF réactivé en Java (Spring Security)

### 5. Validation des Images
- Types MIME autorisés: JPEG, PNG, WebP
- Taille max: 8MB
- Uploadés via Cloudinary

## Dépannage

### "Trop de requêtes"
Attendez 15 minutes avant de réessayer, ou utilisez une autre IP/appareil.

### "Session invalide"
Votre token a expiré (7 jours max). Reconnectez-vous.

### "Clé de création admin invalide"
La clé d'admin transmise ne correspond pas à ADMIN_SETUP_KEY en production.

### "Identifiants invalides"
Email ou mot de passe incorrect.

---

**Voir aussi:** [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md)
