# CleanPress – Application de gestion de pressing

> Votre linge mérite une attention impeccable. CleanPress prend soin de vos vêtements, de la réception au dernier pli.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Comptes de test](#comptes-de-test)
4. [Fonctionnalités](#fonctionnalités)
5. [Architecture](#architecture)
6. [Sauvegarde & restauration](#sauvegarde--restauration)
7. [Déploiement local (XAMPP/WAMP)](#déploiement-local)
8. [Recommandations](#recommandations)

---

## Prérequis

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** ou **yarn**

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-depot>
cd cleanpress
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE app_db;
```

Configurez le fichier `.env` :

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=votre-cle-secrete-ici
```

### 4. Appliquer le schéma

```bash
npx drizzle-kit push
```

### 5. Initialiser les données de test

Après le premier lancement, appuyez sur le bouton « Initialiser les données » sur la page d'accueil, ou utilisez l'API :

```bash
curl -X POST http://localhost:3000/api/seed
```

### 6. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`

---

## Comptes de test

| Rôle           | Email                   | Mot de passe  |
|----------------|-------------------------|---------------|
| Administrateur | admin@cleanpress.bj     | password123   |
| Gérant         | marie@cleanpress.bj     | password123   |
| Réceptionniste | sophie@cleanpress.bj    | password123   |
| Agent          | paul@cleanpress.bj      | password123   |

---

## Fonctionnalités

### MVP (Sprint 0-3)

- ✅ **US-01** : Enregistrement d'un dépôt en 3 min avec ticket unique (CP-2026-XXXXXX)
- ✅ **US-02** : Encaissement (espèces / mobile money) avec vérification avant remise
- ✅ **US-03** : Facturation automatique séquentielle (FAC-2026-XXXXXX), imprimable
- ✅ **US-04** : Recherche par nom, prénom ou numéro de ticket
- ✅ **US-05** : Liste de traitement triée par date de retrait, mise à jour des statuts
- ✅ **US-06** : Ticket de retrait imprimable
- ✅ **US-07** : Tableau de bord temps réel (CA, commandes, impayés, satisfaction)

### Extended (Sprint 4)

- ✅ **US-08** : Suivi client en ligne par numéro de ticket (timeline)
- ✅ **US-09** : Gestion de la grille tarifaire, comptes et droits
- ✅ **US-10** : Notification SMS (simulée) + notation du service (1-5 étoiles)

### Statuts d'une commande

```
Déposée → En traitement → Prête → Remise
```

**Règle métier** : La remise est interdite si la commande n'est pas entièrement payée.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Accueil public
│   ├── layout.tsx                  # Layout racine
│   ├── globals.css                 # Design system
│   ├── connexion/page.tsx          # Page de connexion
│   ├── services/page.tsx           # Services & tarifs (public)
│   ├── suivi/page.tsx              # Suivi de ticket (public)
│   ├── suivi/[ticket]/page.tsx     # Notation après remise
│   ├── depot-en-ligne/page.tsx     # Demande de dépôt en ligne
│   ├── reception/                  # Espace Réceptionniste
│   │   ├── page.tsx                # Accueil réception
│   │   ├── nouveau-depot/          # Nouveau dépôt
│   │   ├── recherche/              # Recherche commandes
│   │   ├── commande/[id]/          # Détail + paiement + impression
│   │   └── demandes/               # Demandes en ligne
│   ├── agent/page.tsx              # Espace Agent de traitement
│   ├── gerant/                     # Espace Gérant
│   │   ├── page.tsx                # Dashboard
│   │   ├── commandes/              # Liste commandes
│   │   ├── services/               # Grille tarifaire
│   │   ├── utilisateurs/           # Comptes & droits
│   │   ├── avis/                   # Avis clients
│   │   └── journal/                # Journal d'actions
│   ├── admin/                      # Espace Administrateur
│   │   ├── page.tsx                # Dashboard global
│   │   ├── sites/                  # Gestion des sites
│   │   ├── utilisateurs/           # Gestion des comptes
│   │   └── journal/                # Journal global
│   └── api/                        # Routes API
│       ├── auth/                   # Login, logout, me
│       ├── seed/                   # Initialisation données
│       ├── commandes/              # CRUD commandes
│       ├── clients/                # Gestion clients
│       ├── services/               # Grille tarifaire
│       ├── paiements/              # Encaissements
│       ├── dashboard/              # Statistiques
│       ├── avis/                   # Notes & commentaires
│       ├── demandes-depot/         # Demandes en ligne
│       ├── sites/                  # CRUD sites
│       ├── utilisateurs/           # CRUD utilisateurs
│       └── journal/                # Audit log
├── components/
│   ├── Navbar.tsx                  # Navigation publique
│   ├── Footer.tsx                  # Pied de page
│   ├── Sidebar.tsx                 # Latérale interne
│   └── AppLayout.tsx               # Layout authentifié
├── db/
│   ├── schema.ts                   # Schéma Drizzle ORM (11 tables)
│   └── index.ts                    # Connexion DB
└── lib/
    ├── auth.ts                     # JWT (jose)
    ├── sms.ts                      # Module SMS (simulé)
    ├── seed.ts                     # Données de test
    └── db-helpers.ts               # Utilitaires (tickets, factures, etc.)
```

---

## Sauvegarde & restauration

### Sauvegarde automatique quotidienne

```bash
# Script de backup (à planifier via cron / tâche planifiée)
pg_dump -U postgres app_db > backup/cleanpress_$(date +%Y%m%d).sql
```

### Restauration

```bash
psql -U postgres app_db < backup/cleanpress_20260115.sql
```

---

## Déploiement local (XAMPP/WAMP)

Pour un déploiement sur poste de comptoir :

1. Installer PostgreSQL (ou utiliser le PostgreSQL intégré)
2. Configurer le `.env` avec les credentials locaux
3. Lancer en mode production :
   ```bash
   npm run build
   npm run start
   ```
4. Accéder via `http://localhost:3000`

---

## ⚡ Recommandations importantes

### Onduleur au comptoir
**Indispensable** : un onduleur (UPS) au poste de comptoir pour :
- Prévenir les pertes de données lors des coupures de courant
- Maintenir le fonctionnement pendant 15-30 min le temps de sauvegarder
- Protéger le matériel contre les surtensions

### Mode hors ligne
L'application fonctionne entièrement en local. Aucune connexion internet n'est requise pour :
- Enregistrer les dépôts
- Effectuer les recherches
- Enregistrer les paiements
- Imprimer tickets et factures
- Mettre à jour les statuts

### Impression
Les tickets et factures sont générés en HTML pour impression directe. Configurez votre imprimante en format reçu (80mm) pour les tickets.

---

## Technologies

| Composant        | Technologie           |
|------------------|-----------------------|
| Frontend         | React 19, Next.js 16  |
| Base de données  | PostgreSQL + Drizzle ORM |
| Authentification | JWT (jose)            |
| Styles           | Tailwind CSS 4        |
| Hachage          | bcryptjs              |
| SMS              | Module simulé (extensible) |

---

© 2026 CleanPress – Le soin textile, avec clarté.