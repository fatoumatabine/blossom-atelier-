# API Blossom

Cette application expose l'API via TanStack Start sous le préfixe `/api`.

## Variables d'environnement

```env
DATABASE_URL=postgresql://...
JWT_SECRET=change-me
ADMIN_SETUP_KEY=change-me
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=blossom
```

`ADMIN_SETUP_KEY` est requis en production pour créer un compte admin.

## Endpoints publics

- `GET /api/health`
- `GET /api/products?category=Soin&q=serum`
- `GET /api/products/:id`
- `POST /api/orders`
- `POST /api/contact`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Endpoints admin

Ajouter l'en-tête `Authorization: Bearer <token>` avec un compte `admin`.

- `GET /api/admin/summary`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id`
- `GET /api/contact`
- `GET /api/inventory`
- `GET /api/inventory/categories`
- `POST /api/inventory`
- `GET /api/inventory/:id`
- `PATCH /api/inventory/:id`
- `DELETE /api/inventory/:id`

## Payloads principaux

Commande:

```json
{
  "customer": "Sophie Martin",
  "email": "sophie@email.com",
  "address": "12 Rue de la Paix, 75001 Paris, FR",
  "items": [{ "productId": "p1", "quantity": 1 }]
}
```

Contact:

```json
{
  "firstName": "Sophie",
  "lastName": "Martin",
  "email": "sophie@email.com",
  "subject": "Commande & Livraison",
  "message": "Bonjour..."
}
```

Produit:

```json
{
  "name": "Sérum Botanique",
  "brand": "Blossom Nature",
  "price": 64,
  "originalPrice": 78,
  "image": "https://...",
  "category": "Soin",
  "subcategory": "Visage",
  "badge": "Nouveau",
  "description": "..."
}
```
