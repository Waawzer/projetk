# Studio Music - Application Web

Une application web moderne pour un studio d'enregistrement musical, permettant aux utilisateurs de découvrir les services, consulter les tarifs, contacter le studio et réserver des sessions.

## Fonctionnalités

- **Page d'accueil** : Présentation du studio avec un player audio intégré permettant d'afficher la pochette des morceaux produits et de les lire facilement.
- **Page Tarifs** : Présentation des différentes formules avec une interface propre et claire.
- **Page Contact** : Formulaire de contact avec champs pour nom, email, message et type de prestation.
- **Système de réservation** : Les utilisateurs peuvent réserver des créneaux horaires avec paiement d'acompte en ligne.
- **Back-office** : Interface d'administration pour gérer les tarifs, les morceaux et les réservations.

## Technologies utilisées

- **Frontend** : React.js, Next.js, TailwindCSS
- **Backend** : API Routes de Next.js
- **Base de données** : MongoDB avec Mongoose
- **Paiement** : Intégration PayPal et Stripe
- **Calendrier** : Intégration Google Calendar API

## Prérequis

- Node.js 18.0.0 ou supérieur
- MongoDB (local ou Atlas)
- Compte Google pour l'API Calendar (optionnel)
- Comptes PayPal et Stripe pour les paiements (optionnel)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-utilisateur/studio-music.git
cd studio-music
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env.local` à la racine du projet avec les variables d'environnement suivantes :
```
MONGODB_URI=votre_uri_mongodb
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=votre_cle_publique_stripe
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
NEXT_PUBLIC_PAYPAL_CLIENT_ID=votre_client_id_paypal
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
GOOGLE_CALENDAR_ID=votre_id_calendrier_google
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_nextauth
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
studio-music/
├── public/            # Fichiers statiques
│   ├── src/
│   │   ├── app/           # Pages de l'application
│   │   │   ├── api/       # Routes API
│   │   │   ├── admin/     # Interface d'administration
│   │   │   ├── contact/   # Page de contact
│   │   │   ├── reservation/ # Page de réservation
│   │   │   └── tarifs/    # Page des tarifs
│   │   ├── components/    # Composants React réutilisables
│   │   ├── lib/           # Utilitaires et fonctions
│   │   └── models/        # Modèles Mongoose
│   └── ...
```

## Déploiement

L'application peut être déployée sur Vercel, Netlify ou tout autre service compatible avec Next.js.

```bash
npm run build
```

## Fonctionnalités à venir

- Système d'authentification pour les clients réguliers
- Historique des sessions pour les clients
- Galerie de photos et vidéos du studio
- Blog avec des articles sur la production musicale

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter à contact@studiomusic.fr.
