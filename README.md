# Blossom Atelier

Guide de demarrage local et de deploiement Docker avec Neon.

## Stack

- Frontend: React 19 + TanStack Start
- Build: Vite
- API: routes serveur sous `/api`
- Base de donnees: Neon PostgreSQL via `DATABASE_URL`
- Media: Cloudinary
- CI/CD: GitHub Actions + Docker Hub

## Prerequis

- Node.js `22.12.0`
- Docker
- Une base Neon accessible via `DATABASE_URL`

Le projet verrouille Node dans [package.json](/home/dialibatoul-marakhib/Programation/blossom-atelier/package.json:6) et [.nvmrc](/home/dialibatoul-marakhib/Programation/blossom-atelier/.nvmrc:1).

## Configuration locale

```bash
cp .env.example .env
```

Variables attendues:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ADMIN_SETUP_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=...
NODE_ENV=development
SEED_DEMO_DATA=true
```

Notes:

- `DATABASE_URL` est obligatoire.
- `JWT_SECRET` doit faire au moins 32 caracteres.
- `ADMIN_SETUP_KEY` sert a creer le premier admin.
- Cloudinary est requis pour les uploads d'images en base64.

## Lancement local

```bash
nvm install
nvm use
npm ci
npm run dev
```

L'application est ensuite disponible sur l'URL affichee par Vite, generalement `http://localhost:8080`.

## Lancement Docker

Le `docker-compose.yml` ne demarre que l'application. La base reste votre instance Neon.

```bash
docker-compose up --build -d
```

Acces local:

- application: `http://localhost:8081`

Arret:

```bash
docker-compose down
```

Le conteneur charge les variables depuis `.env`.

## Premier compte admin

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-setup-key: VOTRE_ADMIN_SETUP_KEY" \
  -d '{
    "email": "admin@blossom.local",
    "password": "AdminPass123!",
    "name": "Admin Local",
    "role": "admin"
  }'
```

## CI/CD

Le pipeline GitHub est dans [.github/workflows/build-and-push.yml](/home/dialibatoul-marakhib/Programation/blossom-atelier/.github/workflows/build-and-push.yml:1) :

- build et push l'image Docker sur `main`, `develop` et les releases
- publie sur Docker Hub

Secrets GitHub attendus:

- `DATABASE_URL`
- `DOCKER_USERNAME`
- `DOCKER_TOKEN`

Variable GitHub optionnelle:

- `DOCKER_IMAGE_NAME`

## Commandes utiles

```bash
npm run dev
npm run build
npm run lint
npm run format
docker-compose up --build -d
docker-compose down
```
