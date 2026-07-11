#!/bin/bash

# 🔍 Script de Vérification de Sécurité
# Usage: bash security-check.sh

echo "🔐 Vérification de la Sécurité - Petal Pouch Beauty"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0
SUCCESS=0

check_pass() {
  echo "✅ $1"
  ((SUCCESS++))
}

check_warn() {
  echo "⚠️  $1"
  ((WARNINGS++))
}

check_fail() {
  echo "❌ $1"
  ((ERRORS++))
}

# 1. Vérifier les imports de sécurité
echo "1️⃣  Vérification des imports..."
if grep -q "timingSafeEqual" src/routes/api.$.ts; then
  check_pass "timingSafeEqual importé"
else
  check_fail "timingSafeEqual manquant"
fi

if grep -q "bcryptjs" src/lib/neon-backend.server.ts; then
  check_pass "bcryptjs disponible"
else
  check_fail "bcryptjs manquant"
fi
echo ""

# 2. Vérifier les secrets par défaut
echo "2️⃣  Vérification des secrets par défaut..."
# Chercher change-me en dur (pas dans les validations)
if grep -r "change-me" src/ 2>/dev/null | grep -v "secret ===" | grep -v node_modules > /dev/null; then
  check_fail "Secrets 'change-me' trouvés dans le code"
else
  check_pass "Pas de secrets 'change-me' en dur"
fi

# Chercher des secrets par défaut (pas dans les validations/comparaisons)
if grep -r "your-secret-key-change" src/ 2>/dev/null | grep -v "defaultJwtSecret" | grep -v "secret ===" | grep -v node_modules > /dev/null; then
  check_fail "Secret par défaut trouvé"
else
  check_pass "Pas de secret par défaut exposé"
fi
echo ""

# 3. Vérifier les protections
echo "3️⃣  Vérification des protections..."
if grep -q "timingSafeEqual" src/routes/api.$.ts; then
  check_pass "Timing-safe compare implémenté"
else
  check_fail "Timing-safe compare manquant"
fi

if grep -q "SameSite=Strict" src/routes/api.$.ts; then
  check_pass "SameSite=Strict configuré"
else
  check_fail "SameSite=Strict non trouvé"
fi

if grep -q "Strict-Transport-Security" src/routes/api.$.ts; then
  check_pass "HSTS header présent"
else
  check_fail "HSTS header manquant"
fi
echo ""

# 4. Vérifier les rate limits
echo "4️⃣  Vérification des rate limits..."
if grep -q "enforceRateLimit.*auth:login" src/routes/api.$.ts; then
  check_pass "Rate limit sur login"
else
  check_fail "Rate limit login manquant"
fi

if grep -q "enforceRateLimit.*api:products" src/routes/api.$.ts; then
  check_pass "Rate limit sur produits"
else
  check_fail "Rate limit produits manquant"
fi

if grep -q "enforceRateLimit.*api:orders" src/routes/api.$.ts; then
  check_pass "Rate limit sur commandes"
else
  check_fail "Rate limit commandes manquant"
fi
echo ""

# 5. Vérifier l'audit logging
echo "5️⃣  Vérification de l'audit logging..."
if grep -q "addAuditLog" src/routes/api.$.ts; then
  check_pass "Audit logging implémenté"
else
  check_fail "Audit logging manquant"
fi

if grep -q "audit-logs" src/routes/api.$.ts; then
  check_pass "Endpoint audit logs présent"
else
  check_fail "Endpoint audit logs manquant"
fi
echo ""

# 6. Vérifier Java CSRF
echo "6️⃣  Vérification CSRF (Java)..."
if grep -q "csrf" java-example/src/main/java/com/example/product/security/SecurityConfig.java; then
  if ! grep -q "csrf().disable()" java-example/src/main/java/com/example/product/security/SecurityConfig.java; then
    check_pass "CSRF réactivé en Java"
  else
    check_fail "CSRF désactivé en Java!"
  fi
else
  check_warn "Configuration CSRF non trouvée en Java"
fi
echo ""

# 7. Vérifier les fichiers gitignore
echo "7️⃣  Vérification .gitignore..."
if grep -q ".env" .gitignore; then
  check_pass ".env ignoré"
else
  check_fail ".env pas ignoré"
fi

if grep -q ".env.production" .gitignore; then
  check_pass ".env.production ignoré"
else
  check_fail ".env.production pas ignoré"
fi
echo ""

# 8. Vérifier les fichiers de documentation
echo "8️⃣  Vérification de la documentation..."
DOCS=(
  "SECURITY_DEPLOYMENT.md"
  "API_SECURITY.md"
  "TOKEN_MANAGEMENT.md"
  "SECURITY_DEVELOPER_GUIDE.md"
  "SECURITY_FIXES_SUMMARY.md"
  ".env.example"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    check_pass "$doc présent"
  else
    check_fail "$doc manquant"
  fi
done
echo ""

# 9. Vérifier validation Zod
echo "9️⃣  Vérification de la validation..."
if grep -q "z.string().*email" src/routes/api.$.ts; then
  check_pass "Validation email avec Zod"
else
  check_fail "Validation email manquante"
fi

if grep -q "password.*min(8" src/routes/api.$.ts; then
  check_pass "Validation password avec Zod (min 8 chars)"
else
  check_fail "Validation password manquante"
fi
echo ""

# 10. Vérifier les headers de sécurité
echo "🔟 Vérification des headers de sécurité..."
HEADERS=(
  "Cache-Control"
  "Content-Security-Policy"
  "X-Content-Type-Options"
  "X-Frame-Options"
  "Strict-Transport-Security"
)

for header in "${HEADERS[@]}"; do
  if grep -q "$header" src/routes/api.$.ts; then
    check_pass "Header $header présent"
  else
    check_fail "Header $header manquant"
  fi
done
echo ""

# 11. Vérifier les scripts d'aide
echo "1️⃣1️⃣  Vérification des scripts..."
if [ -f "setup-production-secrets.sh" ]; then
  check_pass "Script setup-production-secrets.sh présent"
else
  check_fail "Script setup-production-secrets.sh manquant"
fi
echo ""

# Résumé
echo "=================================================="
echo "📊 RÉSUMÉ"
echo "=================================================="
echo "✅ Réussis: $SUCCESS"
echo "⚠️  Avertissements: $WARNINGS"
echo "❌ Erreurs: $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo "🎉 EXCELLENT! Tous les contrôles de sécurité sont OK!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. bash setup-production-secrets.sh"
    echo "2. Déployer les secrets en variables d'environnement"
    echo "3. npm run build && npm run preview"
    echo "4. Tester en production mode"
    exit 0
  else
    echo "⚠️  Quelques avertissements, mais OK pour continuer"
    exit 0
  fi
else
  echo "❌ Des erreurs ont été détectées! Merci de les corriger avant production."
  exit 1
fi
