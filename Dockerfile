FROM node:22.12.0-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
# Coolify may pass NODE_ENV=production as a build-time variable.
# Force full dependency install here so Vite/TypeScript build tooling is available.
RUN NODE_ENV=development npm ci --include=dev --no-audit --no-fund

FROM node:22.12.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN NODE_ENV=development npm run build

FROM node:22.12.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

RUN npm prune --omit=dev --no-audit --no-fund

EXPOSE 8080

CMD ["npm", "run", "start"]
