FROM node:22.12.0-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22.12.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22.12.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 8080

CMD ["npm", "run", "start"]
