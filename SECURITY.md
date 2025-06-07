# 🔒 Guide de Sécurité - Projet K

## 📋 Checklist de Sécurité

### ✅ Corrections Appliquées

#### 🚨 Sécurité Critique

- [x] **Configuration Next.js sécurisée** : ESLint et TypeScript activés en production
- [x] **En-têtes de sécurité** : X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] **Authentification admin renforcée** : Hashage des mots de passe avec SHA-256
- [x] **Protection contre les attaques par timing** : Utilisation de `timingSafeEqual`
- [x] **Tokens JWT sécurisés** : Durée de vie réduite (2h), algorithme spécifié
- [x] **Validation des entrées** : Validation stricte des montants, emails, services
- [x] **Logs sécurisés** : Suppression des logs sensibles en production

#### 🔄 Redondances Éliminées

- [x] **Configurations ESLint** : Suppression des doublons (.eslintrc.js, .eslintrc.json)
- [x] **Fonctions dupliquées** : Centralisation dans `/src/lib/services.ts`
- [x] **Code clipboard** : Utilitaire partagé dans `/src/lib/clipboard.ts`
- [x] **Système de logging** : Logger unifié dans `/src/lib/logger.ts`

#### 🧹 Nettoyage

- [x] **Fichiers temporaires** : Suppression de `tsconfig.tsbuildinfo`
- [x] **Logs sensibles** : Suppression du dossier `/logs`
- [x] **Gitignore mis à jour** : Exclusion des logs et fichiers sensibles

## 🔧 Configuration Requise

### Variables d'Environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Base de données
MONGODB_URI=mongodb://...

# JWT (générez une clé forte de 32+ caractères)
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe

# Admin (utilisez le script pour générer le hash)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=hash_généré_par_le_script

# Paiements
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...

# Email
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@example.com

# Google Calendar
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_CALENDAR_ID=...
```

### Génération du Hash Admin

```bash
# 1. Définir JWT_SECRET dans .env.local
# 2. Générer le hash
npm run generate-admin-hash votre_mot_de_passe

# 3. Copier le hash généré dans ADMIN_PASSWORD_HASH
# 4. Supprimer ADMIN_PASSWORD de .env.local
```

## 🛡️ Mesures de Sécurité Implémentées

### Authentification

- Hashage SHA-256 avec salt (JWT_SECRET)
- Protection contre les attaques par timing
- Délai anti-brute force (1 seconde)
- Tokens JWT avec durée de vie limitée (2h)

### Validation des Données

- Validation stricte des montants (0-10000€)
- Validation des emails avec regex
- Validation des services contre une liste blanche
- Sanitisation des logs (suppression des données sensibles)

### En-têtes de Sécurité

- `X-Frame-Options: DENY` (protection contre clickjacking)
- `X-Content-Type-Options: nosniff` (protection MIME)
- `Referrer-Policy: origin-when-cross-origin`

### Logging Sécurisé

- Logs sensibles uniquement en développement
- Sanitisation automatique des mots de passe/tokens
- Exclusion des logs du contrôle de version

## 🔍 Vérifications Régulières

### Scripts de Sécurité

```bash
# Vérifier les vulnérabilités et dépendances obsolètes
npm run security-check

# Linter pour détecter les problèmes de code
npm run lint

# Build pour vérifier les erreurs TypeScript
npm run build
```

### Audits Recommandés

1. **Mensuel** : `npm audit` pour les vulnérabilités
2. **Trimestriel** : Mise à jour des dépendances
3. **Semestriel** : Révision des tokens et secrets
4. **Annuel** : Audit de sécurité complet

## 🚨 En Cas d'Incident

1. **Compromission de token** : Régénérer JWT_SECRET et tous les tokens
2. **Fuite de données** : Vérifier les logs, changer les mots de passe
3. **Vulnérabilité découverte** : Appliquer les correctifs immédiatement

## 📞 Contact Sécurité

Pour signaler une vulnérabilité de sécurité, contactez l'équipe de développement.

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0
