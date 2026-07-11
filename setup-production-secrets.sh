#!/bin/bash

# 🔒 Script de Configuration Sécurisée - Production
# Usage: bash setup-production-secrets.sh

set -e

echo "🔐 Configuration des secrets de production pour Petal Pouch Beauty"
echo "=================================================="
echo ""

# Vérifier si on est en production
if [ "$NODE_ENV" != "production" ]; then
    read -p "NODE_ENV n'est pas 'production'. Continuer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Fonction pour générer une clé sécurisée
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

echo "1️⃣  Génération du JWT_SECRET..."
JWT_SECRET=$(generate_secret)
echo "✓ JWT_SECRET généré (64 caractères)"
echo ""

echo "2️⃣  Génération de l'ADMIN_SETUP_KEY..."
ADMIN_SETUP_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")
echo "✓ ADMIN_SETUP_KEY généré (48 caractères)"
echo ""

echo "3️⃣  Vérification du DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL non défini!"
    echo "   Ajouter: DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require"
    read -p "   Entrer votre DATABASE_URL: " DATABASE_URL
else
    echo "✓ DATABASE_URL détecté"
fi
echo ""

echo "4️⃣  Configuration Cloudinary (optionnel)..."
if [ -z "$CLOUDINARY_CLOUD_NAME" ]; then
    read -p "   Entrer CLOUDINARY_CLOUD_NAME (ou laisser vide): " CLOUDINARY_CLOUD_NAME
fi
echo ""

echo "5️⃣  Vérification Node.js version..."
NODE_VERSION=$(node -v)
echo "✓ Node.js ${NODE_VERSION}"
echo ""

# Créer le fichier de configuration
CONFIG_FILE=".env.production.local"

echo "6️⃣  Création du fichier de configuration..."
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Fichier $CONFIG_FILE existe déjà!"
    read -p "   Remplacer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   ✗ Annulé"
        exit 1
    fi
fi

cat > "$CONFIG_FILE" << EOF
# Configuration de Production - $(date)
# ⚠️  NE PAS COMMITER CE FICHIER !

# Database
DATABASE_URL=${DATABASE_URL}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Admin Setup Key
ADMIN_SETUP_KEY=${ADMIN_SETUP_KEY}

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-}
CLOUDINARY_FOLDER=production

# Environment
NODE_ENV=production
SEED_DEMO_DATA=false
EOF

echo "✓ Fichier $CONFIG_FILE créé"
echo ""

# Afficher les détails
echo "📋 Résumé de la Configuration:"
echo "================================"
echo "JWT_SECRET: ${JWT_SECRET:0:10}...${JWT_SECRET: -10}"
echo "ADMIN_SETUP_KEY: ${ADMIN_SETUP_KEY:0:10}...${ADMIN_SETUP_KEY: -10}"
echo "DATABASE_URL: $(echo $DATABASE_URL | sed 's/:\/\/.*@/:\/\/***@/')"
echo ""

# Vérifications
echo "🔍 Vérifications de Sécurité:"
echo "=============================="

# Vérifier NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "✓ NODE_ENV=production"
else
    echo "✗ NODE_ENV n'est pas production"
fi

# Vérifier qu'on n'a pas de secrets en dur dans le code
if ! grep -r "change-me" src/ 2>/dev/null | grep -v node_modules > /dev/null; then
    echo "✓ Aucun secret par défaut dans le code"
else
    echo "✗ Des secrets par défaut trouvés dans le code!"
fi

# Vérifier que .env.production.local ne sera pas commité
if grep -q ".env.production" .gitignore 2>/dev/null; then
    echo "✓ .env.production* dans .gitignore"
else
    echo "⚠️  .env.production* pas dans .gitignore"
fi

echo ""
echo "🚀 Prêt pour le déploiement !"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Sauvegarder ADMIN_SETUP_KEY en lieu sûr (dernière utilisation: création du premier admin)"
echo "   2. Ne JAMAIS partager JWT_SECRET"
echo "   3. Vérifier que $CONFIG_FILE n'est pas versionné"
echo "   4. Déployer le fichier de manière sécurisée (env vars recommandé)"
echo ""
echo "Configuration terminée ✓"
