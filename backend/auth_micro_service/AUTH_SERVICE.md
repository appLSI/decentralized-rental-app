# 🔐 AUTH SERVICE - Documentation Frontend

**Base URL** : `http://localhost:8082/api/auth`  
**Version** : 2.1 (Complète et Corrigée)  
**Date** : 13 janvier 2026

> ⚠️ **Version corrigée** - Cette documentation reflète exactement le code source du backend.

---

## 📋 Table des Matières

1. [Système de Permissions](#-système-de-permissions---important)
2. [Schéma Base de Données](#-schéma-base-de-données-complet)
3. [Endpoints Publics](#-endpoints-publics-sans-auth)
4. [Endpoints Protégés](#-endpoints-protégés-authentification-requise)
5. [Gestion des Agents (ADMIN)](#-gestion-des-agents-admin-uniquement)
6. [Gestion des Wallets](#-gestion-des-wallets)
7. [Événements Kafka](#-événements-kafka)
8. [Cas d'Usage Frontend](#-cas-dusage-frontend)
9. [Sécurité et Bonnes Pratiques](#️-points-dattention)

---

## 🎭 Système de Permissions - IMPORTANT

### ❗ Distinction Roles vs Types

Le système utilise **DEUX** concepts distincts qu'il ne faut PAS confondre :

#### **Roles (Rôles Globaux)**
Définissent les **permissions système** :

| Role | Description | Permissions | Email Verification |
|------|-------------|-------------|-------------------|
| `USER` | Utilisateur standard | Accès de base à l'application | ✅ Requis |
| `AGENT` | Agent immobilier | Fonctionnalités agent (futures) | ✅ Requis |
| `ADMIN` | Administrateur | Validation propriétés, gestion agents | ✅ Requis |

> 🔴 **IMPORTANT** : **TOUS les rôles (USER, AGENT, ADMIN) doivent vérifier leur email avant de pouvoir se connecter !**

#### **Types (Types Métier)**
Définissent le **comportement dans l'application de location** :

| Type | Description | Requis | Auto-ajouté |
|------|-------------|--------|-------------|
| `CLIENT` | Peut réserver des propriétés | Non | ✅ Oui (défaut) |
| `HOST` | Peut publier des propriétés | Wallet obligatoire | ✅ Si wallet connecté |

#### Exemples Concrets

```json
// Utilisateur lambda qui réserve
{
  "roles": ["USER"],
  "types": ["CLIENT"],
  "emailVerificationStatus": true  // ✅ Vérifié
}

// Propriétaire qui loue (avec wallet)
{
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"],  // ⚠️ "HOST" pas "OWNER" !
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "emailVerificationStatus": true
}

// Agent créé par admin
{
  "roles": ["AGENT"],
  "types": ["CLIENT"],
  "emailVerificationStatus": false  // ⚠️ Doit vérifier son email !
}

// Admin qui peut tout faire
{
  "roles": ["ADMIN", "USER"],
  "types": ["CLIENT", "HOST"],
  "emailVerificationStatus": true
}
```

> 🚨 **ERREURS COURANTES** :
> - Ne confondez pas `OWNER` (n'existe pas !) avec `HOST`
> - Un AGENT doit vérifier son email même si créé par un admin
> - Le type `HOST` est ajouté automatiquement lors de la connexion du wallet

---

## 📊 Schéma Base de Données COMPLET

### Table: `users`

| Champ | Type | Description | Obligatoire | Unique | Default |
|-------|------|-------------|-------------|--------|---------|
| `id` | Long | ID auto-incrémenté | ✅ | ✅ | Auto |
| `userId` | String(50) | UUID utilisateur | ✅ | ✅ | Généré |
| `firstname` | String(50) | Prénom | ✅ | ❌ | - |
| `lastname` | String(50) | Nom | ✅ | ❌ | - |
| `email` | String(120) | Email | ✅ | ✅ | - |
| `phone` | String(20) | Téléphone | ❌ | ❌ | null |
| `country` | String(60) | Pays | ❌ | ❌ | null |
| `city` | String(60) | Ville | ❌ | ❌ | null |
| `state` | String(60) | État/Région | ❌ | ❌ | null |
| `date_of_birth` | Date | Date de naissance | ❌ | ❌ | null |
| `address` | String(255) | Adresse complète | ❌ | ❌ | null |
| `profile_image` | String(255) | URL image de profil | ❌ | ❌ | null |
| `walletAddress` | String(42) | Adresse Ethereum | ❌ | ✅ | null |
| `encrypted_password` | String(255) | Mot de passe hashé (BCrypt) | ✅ | ❌ | - |
| `emailVerificationStatus` | Boolean | Email vérifié | ✅ | ❌ | **false** |
| `verificationCode` | String(6) | Code OTP inscription | ❌ | ❌ | null |
| `verificationCodeExpiresAt` | DateTime | Expiration OTP inscription | ❌ | ❌ | null |
| `passwordResetCode` | String(6) | Code OTP reset password | ❌ | ❌ | null |
| `passwordResetCodeExpiresAt` | DateTime | Expiration reset password | ❌ | ❌ | null |

### Table: `user_roles`

| Champ | Type | Valeurs Possibles |
|-------|------|-------------------|
| `user_id` | Long | FK vers users.id |
| `role` | Enum | `USER`, `AGENT`, `ADMIN` |

### Table: `user_types`

| Champ | Type | Valeurs Possibles |
|-------|------|-------------------|
| `user_id` | Long | FK vers users.id |
| `type` | Enum | `CLIENT`, `HOST` |

### Table: `owners` (Synchronisation asynchrone via Kafka)

Créée automatiquement dans le **Listing Service** lors de la connexion d'un wallet :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | ID auto-incrémenté |
| `userId` | String(50) | UUID de l'utilisateur |
| `walletAddress` | String(42) | Adresse Ethereum |

---

## 🌐 Endpoints Publics (Sans Auth)

### 1. Inscription

**Créer un nouveau compte utilisateur**

```http
POST /api/auth/users
Content-Type: application/json
```

**Request Body**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+212600000000"
}
```

**Validation**
- `firstname` : 2-50 caractères, requis
- `lastname` : 2-50 caractères, requis
- `email` : Format email valide, unique, requis
- `password` : Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial, requis
- `phone` : Optionnel, format international recommandé

**Response 201 Created**
```json
{
  "message": "Utilisateur créé avec succès. Un code de vérification a été envoyé à votre email.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Email déjà utilisé"
}
```

**Logique Métier**
1. Validation format email et unicité
2. Hash du mot de passe avec BCrypt (10 rounds)
3. Génération userId (UUID aléatoire)
4. Génération code OTP **6 chiffres aléatoires**
5. Expiration OTP : **15 minutes**
6. Envoi email avec code OTP via service email
7. Création utilisateur :
   - `emailVerificationStatus = false` ⚠️
   - `roles = ["USER"]` (par défaut)
   - `types = ["CLIENT"]` (par défaut)

> ⚠️ **L'utilisateur ne peut PAS se connecter tant que `emailVerificationStatus = false`**

---

### 2. Vérification OTP

**Vérifier l'email avec le code reçu**

```http
POST /api/auth/users/verify-otp
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Response 200 OK**
```json
{
  "message": "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Code de vérification incorrect.",
  "status": "error"
}
```

**Response 400 Bad Request (Code expiré)**
```json
{
  "message": "Le code de vérification a expiré. Veuillez en demander un nouveau.",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Vérification que `emailVerificationStatus = false`
3. Vérification code OTP (comparaison stricte)
4. Vérification expiration (15 min depuis création)
5. Si valide :
   - `emailVerificationStatus = true` ✅
   - `verificationCode = null`
   - `verificationCodeExpiresAt = null`

---

### 3. Renvoyer OTP

**Renvoyer un nouveau code de vérification**

```http
POST /api/auth/users/resend-otp?email=john.doe@example.com
```

**Query Parameters**
- `email` : Email de l'utilisateur (requis)

**Response 200 OK**
```json
{
  "message": "Un nouveau code de vérification a été envoyé à votre email.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Cet email a déjà été vérifié",
  "status": "error"
}
```

**Logique Métier**
1. Vérification que email existe
2. Vérification que `emailVerificationStatus = false`
3. Génération nouveau code OTP (6 chiffres)
4. Nouvelle expiration (15 min à partir de maintenant)
5. Envoi email avec nouveau code

---

### 4. Login

**Connexion avec email et mot de passe**

```http
POST /api/auth/users/login
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response 200 OK**

> ⚠️ **IMPORTANT** : Les informations sont dans les **HEADERS** ET dans le **BODY** !

**Headers**
```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
user_id: 550e8400-e29b-41d4-a716-446655440000
```

**Body**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "phone": "+212600000000",
    "roles": ["USER"],
    "types": ["CLIENT", "HOST"],
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  "message": "Connexion réussie"
}
```

**Response 401 Unauthorized**
```json
{
  "timestamp": "2026-01-13T12:26:02.628+00:00",
  "status": 401,
  "error": "Unauthorized",
  "path": "/users/login"
}
```

**Response 403 Forbidden (Email non vérifié)**
```json
{
  "message": "Veuillez vérifier votre email avant de vous connecter",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. ⚠️ **Vérification CRITIQUE : `emailVerificationStatus = true`**
3. Vérification mot de passe avec BCrypt
4. Génération JWT token :
   - Algorithme: **HS512** (pas HS256)
   - Secret: Variable d'environnement `JWT_SECRET`
   - Expiration: **24 heures** (86400000 ms)
   - Claims inclus:
      - `sub`: email de l'utilisateur
      - `userId`: UUID de l'utilisateur
      - `roles`: Liste des rôles (["USER"], ["ADMIN"], etc.)
      - `types`: Liste des types (["CLIENT"], ["HOST"], etc.)
      - `exp`: Timestamp d'expiration

5. Retour du token dans headers ET body
6. Retour des informations utilisateur (sans mot de passe)

> 🔴 **IMPORTANT** : Si `emailVerificationStatus = false`, la connexion est **REFUSÉE** avec 403

---

### 5. Mot de Passe Oublié

**Demander la réinitialisation du mot de passe**

```http
POST /api/auth/users/forgot-password
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com"
}
```

**Response 200 OK**
```json
{
  "message": "Un code de réinitialisation a été envoyé à votre email.",
  "status": "success"
}
```

**Response 404 Not Found**
```json
{
  "message": "Aucun utilisateur trouvé avec cet email",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Génération code OTP 6 chiffres
3. Expiration : 15 minutes
4. Stockage dans `passwordResetCode` et `passwordResetCodeExpiresAt`
5. Envoi email avec code

> ⚠️ Le code de réinitialisation est **différent** du code de vérification email

---

### 6. Réinitialiser le Mot de Passe

**Réinitialiser avec le code OTP**

```http
POST /api/auth/users/reset-password
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john.doe@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response 200 OK**
```json
{
  "message": "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
  "status": "success"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Code de réinitialisation incorrect.",
  "status": "error"
}
```

**Logique Métier**
1. Recherche utilisateur par email
2. Vérification code OTP
3. Vérification expiration (15 min)
4. Hash nouveau mot de passe avec BCrypt
5. Mise à jour `encrypted_password`
6. Suppression code : `passwordResetCode = null`, `passwordResetCodeExpiresAt = null`

---

## 🔒 Endpoints Protégés (Authentification Requise)

> ⚠️ **Header requis** : `Authorization: Bearer <token>`

### 7. Récupérer un Utilisateur

**Obtenir les informations d'un utilisateur par son ID**

```http
GET /api/auth/users/{userId}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "phone": "+212600000000",
  "country": "Morocco",
  "city": "Casablanca",
  "state": "Casablanca-Settat",
  "date_of_birth": null,
  "address": "123 Rue Mohammed V",
  "profile_image": null,
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"],
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response 401 Unauthorized**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Token invalide ou expiré"
}
```

**Response 404 Not Found**
```json
{
  "message": "Utilisateur non trouvé"
}
```

**Permissions**
- ✅ Tout utilisateur authentifié peut accéder à cet endpoint
- ℹ️ Restriction métier : Un utilisateur ne devrait accéder qu'à ses propres données (à implémenter côté frontend)

---

### 8. Mettre à Jour un Utilisateur

**Modifier les informations d'un utilisateur**

```http
PUT /api/auth/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "phone": "+33612345678",
  "country": "France",
  "city": "Paris",
  "state": "Île-de-France",
  "address": "123 Rue de la Paix",
  "date_of_birth": "1990-01-15",
  "profile_image": "https://example.com/images/profile.jpg"
}
```

**Champs Modifiables**
- `firstname`, `lastname`, `phone`, `country`, `city`, `state`, `address`, `date_of_birth`, `profile_image`

**Champs NON Modifiables**
- ❌ `email` (unique, identifiant)
- ❌ `password` (utiliser reset-password)
- ❌ `userId` (immuable)
- ❌ `roles` (gestion admin uniquement)
- ❌ `types` (auto-géré par le système)
- ❌ `walletAddress` (endpoints dédiés)

**Response 200 OK**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "john.doe@example.com",
  "phone": "+33612345678",
  "country": "France",
  "city": "Paris",
  "state": "Île-de-France",
  "address": "123 Rue de la Paix",
  "date_of_birth": "1990-01-15",
  "roles": ["USER"],
  "types": ["CLIENT", "HOST"]
}
```

**Permissions**
- ✅ Tout utilisateur authentifié peut modifier ses propres données
- ℹ️ Restriction métier à implémenter : userId du token = userId du path

---

### 9. Supprimer un Utilisateur (ADMIN uniquement)

**Supprimer un utilisateur du système**

```http
DELETE /api/auth/users/{id}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "message": "Delete user with ID: 123"
}
```

**Response 403 Forbidden**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Accès refusé"
}
```

**Permissions**
- 🔴 **ADMIN uniquement**
- Le Gateway vérifie le rôle ADMIN avant de transmettre la requête

> ⚠️ **Note** : Actuellement, cet endpoint ne fait qu'un mock. L'implémentation complète nécessiterait de vérifier les contraintes métier (réservations actives, propriétés, etc.)

---

## 👥 Gestion des Agents (ADMIN Uniquement)

### 10. Créer un Agent

**Créer un nouveau compte agent (par un administrateur)**

```http
POST /api/auth/users/admin/agents
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "agent@example.com",
  "password": "AgentPass123!",
  "firstname": "Marie",
  "lastname": "Agent",
  "phone": "+212600000000"
}
```

**Response 201 Created**
```json
{
  "message": "Agent créé avec succès.",
  "agentId": "Dx4LYJRLSIEyOkQa-cShw5vgNL4pMj",
  "email": "agent@example.com",
  "roles": ["AGENT"]
}
```

**Response 403 Forbidden**
```json
{
  "status": 403,
  "error": "Forbidden"
}
```

**Logique Métier**
1. ⚠️ Seul un **ADMIN** peut créer des agents
2. Le rôle `AGENT` est forcé automatiquement
3. Le type `CLIENT` est ajouté par défaut
4. L'agent est créé avec :
   - `emailVerificationStatus = false` ⚠️
   - Un code OTP est envoyé par email
   - **L'agent DOIT vérifier son email** avant de pouvoir se connecter

**Workflow Complet pour un Agent**

```
1. Admin crée l'agent → POST /admin/agents
2. Agent reçoit un email avec code OTP
3. Agent vérifie son email → POST /verify-otp
4. Agent peut maintenant se connecter → POST /login
```

**Permissions**
- 🔴 **ADMIN uniquement**
- Le `RoleBasedAuthorizationFilter` du Gateway vérifie le rôle

---

### 11. Lister Tous les Agents

**Récupérer la liste de tous les agents**

```http
GET /api/auth/users/admin/agents
Authorization: Bearer <ADMIN_TOKEN>
```

**Response 200 OK**
```json
[
  {
    "userId": "Dx4LYJRLSIEyOkQa-cShw5vgNL4pMj",
    "email": "agent1@example.com",
    "firstname": "Marie",
    "lastname": "Agent",
    "phone": "+212600000000",
    "roles": ["AGENT"],
    "types": ["CLIENT"],
    "emailVerificationStatus": false
  },
  {
    "userId": "AFDtprbmiBsjQqKvRzWsyqJCHUtChU",
    "email": "agent2@example.com",
    "firstname": "Pierre",
    "lastname": "Immobilier",
    "phone": "+212611111111",
    "roles": ["AGENT"],
    "types": ["CLIENT"],
    "emailVerificationStatus": true
  }
]
```

**Response 403 Forbidden**
```json
{
  "status": 403,
  "error": "Forbidden"
}
```

**Permissions**
- 🔴 **ADMIN uniquement**

---

### 12. Supprimer un Agent

**Supprimer un agent du système**

```http
DELETE /api/auth/users/admin/agents/{agentId}
Authorization: Bearer <ADMIN_TOKEN>
```

**Response 200 OK**
```json
{
  "message": "Agent supprimé avec succès.",
  "agentId": "Dx4LYJRLSIEyOkQa-cShw5vgNL4pMj"
}
```

**Response 404 Not Found**
```json
{
  "message": "Agent non trouvé.",
  "status": "error"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Cet utilisateur n'est pas un agent.",
  "status": "error"
}
```

**Logique Métier**
1. Vérification que l'utilisateur existe
2. Vérification que l'utilisateur a le rôle `AGENT`
3. Suppression de l'agent de la base de données

**Permissions**
- 🔴 **ADMIN uniquement**

---

## 💳 Gestion des Wallets

### 13. Connecter un Wallet

**Associer une adresse Ethereum à un utilisateur**

```http
POST /api/auth/users/{userId}/wallet/connect
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response 200 OK**
```json
{
  "message": "Wallet connecté avec succès",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response 400 Bad Request**
```json
{
  "message": "Adresse wallet invalide",
  "status": "error"
}
```

**Response 409 Conflict**
```json
{
  "message": "Cette adresse wallet est déjà utilisée par un autre compte",
  "status": "error"
}
```

**Logique Métier**
1. Validation format adresse Ethereum (0x + 40 caractères hexa)
2. Vérification unicité de l'adresse
3. Vérification que userId du token = userId du path (sécurité)
4. Mise à jour `walletAddress` dans users
5. **Ajout automatique du type `HOST`**
6. Publication événement Kafka : `user.wallet.connected`

**Permissions**
- ✅ Utilisateur authentifié
- ℹ️ Un utilisateur ne peut connecter un wallet que sur son propre compte

**Événement Kafka Publié**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "eventType": "WALLET_CONNECTED",
  "timestamp": 1704970800000
}
```

---

### 14. Statut du Wallet

**Vérifier si un utilisateur a un wallet connecté**

```http
GET /api/auth/users/{userId}/wallet/status
Authorization: Bearer <token>
```

**Response 200 OK (Wallet connecté)**
```json
{
  "exists": true,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200 OK (Pas de wallet)**
```json
{
  "exists": false,
  "walletAddress": null,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 404 Not Found**
```json
{
  "message": "Utilisateur non trouvé",
  "status": "error"
}
```

**Permissions**
- ✅ Utilisateur authentifié
- ℹ️ Cet endpoint est aussi utilisé par les autres microservices (Listing, Booking, Payment)

---

### 15. Déconnecter un Wallet

**Supprimer l'association wallet d'un utilisateur**

```http
DELETE /api/auth/users/{userId}/wallet/disconnect
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "message": "Wallet déconnecté avec succès",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 409 Conflict (Contraintes métier)**
```json
{
  "message": "Impossible de déconnecter le wallet : vous avez 2 propriété(s) active(s). Masquez-les d'abord (statut HIDDEN).",
  "status": "blocked"
}
```

**Logique Métier - Contraintes STRICTES**

Avant de permettre la déconnexion, le système vérifie via appels inter-services :

1. **Listing Service** : Pas de propriétés avec statut `ACTIVE`
2. **Booking Service** : Pas de réservations futures en tant que host
3. **Booking Service** : Pas de réservations actives en tant que client

Si **toutes** les conditions sont OK :
- `walletAddress = null`
- Retrait du type `HOST`
- Publication événement Kafka : `user.wallet.disconnected`

**Événement Kafka Publié**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": null,
  "eventType": "WALLET_DISCONNECTED",
  "timestamp": 1704970800000
}
```

**Permissions**
- ✅ Utilisateur authentifié
- ℹ️ Contraintes métier vérifiées en temps réel

---

## 📡 Événements Kafka

Le Auth Service publie des événements sur le topic **`user-events`** pour notifier les autres services.

### Événement: `user.wallet.connected`

Publié lors de la connexion d'un wallet

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "eventType": "WALLET_CONNECTED",
  "timestamp": 1704970800000
}
```

**Consommateurs** :
- **Listing Service** : Crée automatiquement un `Owner` dans la table `owners`
   - Permet à l'utilisateur de créer des propriétés

---

### Événement: `user.wallet.disconnected`

Publié lors de la déconnexion d'un wallet

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": null,
  "eventType": "WALLET_DISCONNECTED",
  "timestamp": 1704970800000
}
```

**Consommateurs** :
- **Listing Service** : Supprime l'`Owner` (si aucune propriété active)

---

## 🎯 Cas d'Usage Frontend

### Workflow 1: Inscription Utilisateur Classique

```javascript
// ========== ÉTAPE 1: Inscription ==========
const signupResponse = await fetch('http://localhost:8082/api/auth/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    phone: '+212600000000'
  })
});

const { userId, email } = await signupResponse.json();
// Afficher : "Code de vérification envoyé à votre email"

// ========== ÉTAPE 2: Vérification OTP ==========
const otpResponse = await fetch('http://localhost:8082/api/auth/users/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    code: '123456' // Code saisi par l'utilisateur
  })
});

if (otpResponse.ok) {
  alert("Email vérifié ! Vous pouvez vous connecter.");
  window.location.href = '/login';
}

// ========== ÉTAPE 3: Login ==========
const loginResponse = await fetch('http://localhost:8082/api/auth/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    password: 'SecurePass123!'
  })
});

if (loginResponse.ok) {
  // ⚠️ IMPORTANT : Token dans les HEADERS !
  const token = loginResponse.headers.get('Authorization'); // "Bearer eyJ..."
  const userId = loginResponse.headers.get('user_id');
  
  // Body contient les infos utilisateur
  const responseData = await loginResponse.json();
  const userData = responseData.user;
  
  console.log(userData.roles);  // ["USER"]
  console.log(userData.types);  // ["CLIENT"]
  
  // ========== ÉTAPE 4: Stocker le token ==========
  localStorage.setItem('authToken', token);
  localStorage.setItem('userId', userId);
  localStorage.setItem('userRoles', JSON.stringify(userData.roles));
  localStorage.setItem('userTypes', JSON.stringify(userData.types));
  localStorage.setItem('userData', JSON.stringify(userData));
  
  window.location.href = '/dashboard';
} else if (loginResponse.status === 403) {
  alert("Veuillez vérifier votre email avant de vous connecter");
  window.location.href = '/verify-email';
}
```

---

### Workflow 2: Création d'Agent par Admin

```javascript
// ⚠️ Nécessite un token ADMIN

// ========== ÉTAPE 1: Admin crée l'agent ==========
const createAgentResponse = await fetch(
  'http://localhost:8082/api/auth/users/admin/agents',
  {
    method: 'POST',
    headers: {
      'Authorization': adminToken,  // Token ADMIN
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'agent@example.com',
      password: 'AgentPass123!',
      firstname: 'Marie',
      lastname: 'Agent',
      phone: '+212600000000'
    })
  }
);

if (createAgentResponse.ok) {
  const { agentId, email } = await createAgentResponse.json();
  alert(`Agent créé ! Un email de vérification a été envoyé à ${email}`);
  
  // L'agent doit maintenant :
  // 1. Vérifier son email (POST /verify-otp)
  // 2. Se connecter (POST /login)
}

// ========== ÉTAPE 2: L'agent vérifie son email ==========
// (Même processus que pour un utilisateur normal)
const agentOtpResponse = await fetch(
  'http://localhost:8082/api/auth/users/verify-otp',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agent@example.com',
      code: '123456'
    })
  }
);

// ========== ÉTAPE 3: L'agent se connecte ==========
const agentLoginResponse = await fetch(
  'http://localhost:8082/api/auth/users/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'agent@example.com',
      password: 'AgentPass123!'
    })
  }
);

if (agentLoginResponse.ok) {
  const token = agentLoginResponse.headers.get('Authorization');
  const responseData = await agentLoginResponse.json();
  console.log(responseData.user.roles);  // ["AGENT"]
}
```

---

### Workflow 3: Connecter MetaMask (Devenir HOST)

```javascript
// ========== ÉTAPE 1: Demander connexion MetaMask ==========
if (typeof window.ethereum === 'undefined') {
  alert("Veuillez installer MetaMask");
  return;
}

const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});
const walletAddress = accounts[0];
console.log("Wallet connecté:", walletAddress);

// ========== ÉTAPE 2: Vérifier le réseau ==========
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (chainId !== '0x89') {  // Polygon Mainnet
  alert("Veuillez connecter MetaMask au réseau Polygon");
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }]
    });
  } catch (error) {
    console.error("Erreur changement réseau:", error);
    return;
  }
}

// ========== ÉTAPE 3: Envoyer au backend ==========
const response = await fetch(
  `http://localhost:8082/api/auth/users/${userId}/wallet/connect`,
  {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ walletAddress })
  }
);

if (response.ok) {
  const data = await response.json();
  alert("Wallet connecté avec succès !");
  
  // ⚠️ L'utilisateur devient maintenant HOST
  // Mettre à jour le localStorage
  const currentTypes = JSON.parse(localStorage.getItem('userTypes'));
  if (!currentTypes.includes('HOST')) {
    currentTypes.push('HOST');
    localStorage.setItem('userTypes', JSON.stringify(currentTypes));
  }
  
  // Peut maintenant créer des propriétés
  window.location.href = '/create-property';
} else if (response.status === 409) {
  alert("Cette adresse wallet est déjà utilisée par un autre compte");
} else {
  const error = await response.json();
  alert(`Erreur: ${error.message}`);
}
```

---

### Workflow 4: Lister les Agents (Admin)

```javascript
// ⚠️ Nécessite un token ADMIN

const response = await fetch(
  'http://localhost:8082/api/auth/users/admin/agents',
  {
    method: 'GET',
    headers: {
      'Authorization': adminToken
    }
  }
);

if (response.ok) {
  const agents = await response.json();
  
  // Afficher dans un tableau
  agents.forEach(agent => {
    console.log(`
      ID: ${agent.userId}
      Email: ${agent.email}
      Nom: ${agent.firstname} ${agent.lastname}
      Email vérifié: ${agent.emailVerificationStatus ? 'Oui' : 'Non'}
      Rôles: ${agent.roles.join(', ')}
    `);
  });
} else if (response.status === 403) {
  alert("Accès refusé : vous devez être administrateur");
}
```

---

## ⚠️ Points d'Attention

### Sécurité

1. **Token JWT dans les Headers**
   ```javascript
   // ❌ FAUX - Le token n'est PAS dans le body
   const { token } = await response.json();
   
   // ✅ CORRECT - Token dans les headers
   const token = response.headers.get('Authorization');
   ```

2. **Vérifier l'expiration du token**
   ```javascript
   // Token expire après 24h
   const decodeToken = (token) => {
     const base64Url = token.split('.')[1];
     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
     const jsonPayload = decodeURIComponent(
       atob(base64).split('').map(c => 
         '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
       ).join('')
     );
     return JSON.parse(jsonPayload);
   };
   
   const payload = decodeToken(token.replace('Bearer ', ''));
   const isExpired = Date.now() >= payload.exp * 1000;
   
   if (isExpired) {
     localStorage.clear();
     window.location.href = '/login';
   }
   ```

3. **Ne jamais exposer le token dans les URLs**
   ```javascript
   // ❌ DANGEREUX
   window.location.href = `/profile?token=${token}`;
   
   // ✅ CORRECT
   // Token uniquement dans headers ou localStorage
   ```

4. **Vérifier le rôle côté frontend**
   ```javascript
   const userRoles = JSON.parse(localStorage.getItem('userRoles'));
   
   // Afficher menu admin uniquement si ADMIN
   if (userRoles.includes('ADMIN')) {
     showAdminMenu();
   }
   
   // Afficher "Créer propriété" uniquement si HOST
   const userTypes = JSON.parse(localStorage.getItem('userTypes'));
   if (userTypes.includes('HOST')) {
     showCreatePropertyButton();
   }
   ```

---

### Validation Côté Frontend

Avant d'envoyer les requêtes :

```javascript
// Validation email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation mot de passe
const isValidPassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && 
         hasNumber && hasSpecial;
};

// Validation wallet Ethereum
const isValidWallet = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validation code OTP
const isValidOTP = (code) => {
  return /^\d{6}$/.test(code);
};
```

---

### Gestion des Erreurs

```javascript
const handleAuthError = async (response) => {
  const error = await response.json().catch(() => ({}));
  
  switch (response.status) {
    case 400:
      alert(`Erreur: ${error.message || 'Données invalides'}`);
      break;
      
    case 401:
      // Token invalide ou expiré
      localStorage.clear();
      window.location.href = '/login';
      break;
      
    case 403:
      if (error.message && error.message.includes('vérifier')) {
        alert("Veuillez vérifier votre email avant de continuer");
        window.location.href = '/verify-email';
      } else {
        alert("Accès refusé : droits insuffisants");
      }
      break;
      
    case 404:
      alert("Ressource non trouvée");
      break;
      
    case 409:
      alert(`Conflit: ${error.message || 'Ressource déjà existante'}`);
      break;
      
    case 500:
      alert("Erreur serveur. Veuillez réessayer plus tard.");
      break;
      
    default:
      alert("Une erreur est survenue. Veuillez réessayer.");
  }
};

// Utilisation
try {
  const response = await fetch('http://localhost:8082/api/auth/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    await handleAuthError(response);
    return;
  }
  
  // Traiter le succès
  const token = response.headers.get('Authorization');
  // ...
  
} catch (error) {
  console.error("Network error:", error);
  alert("Impossible de se connecter au serveur");
}
```

---

## 🐛 Problèmes Courants

### "Email déjà vérifié"
**Cause** : Tentative de re-vérifier un email déjà validé  
**Solution** : Rediriger directement vers login

### "Token expired"
**Cause** : Token JWT expiré (24h)  
**Solution** : Redemander login (pas de refresh token implémenté)

### "Wallet déjà utilisé"
**Cause** : Adresse déjà associée à un autre compte  
**Solution** : Utiliser un autre wallet ou contacter support

### "Cannot disconnect wallet"
**Cause** : Propriétés actives ou réservations en cours  
**Solution** :
1. Masquer toutes les propriétés (statut HIDDEN)
2. Attendre la fin des réservations
3. Puis déconnecter le wallet

### "Veuillez vérifier votre email"
**Cause** : Tentative de connexion avec `emailVerificationStatus = false`  
**Solution** :
1. Vérifier l'email avec le code OTP reçu
2. Ou demander un nouveau code (resend-otp)

### "Agent ne peut pas se connecter"
**Cause** : Agent créé par admin n'a pas vérifié son email  
**Solution** : L'agent doit :
1. Vérifier son email avec le code OTP reçu lors de sa création
2. Ensuite se connecter normalement

---

## 📊 Enums - Référence Rapide

### UserRole
```java
ADMIN   // Administrateur système (validation propriétés, gestion agents)
AGENT   // Agent immobilier (créé uniquement par admin, doit vérifier email)
USER    // Utilisateur standard (défaut à l'inscription)
```

### UserType
```java
HOST    // Peut publier des propriétés (wallet obligatoire, ajouté auto)
CLIENT  // Peut réserver (défaut, ajouté automatiquement)
```

### EmailVerificationStatus
```java
true    // Email vérifié → peut se connecter
false   // Email non vérifié → connexion refusée (403)
```

---

## 🔄 Diagramme de Séquence - Login Flow

```
Frontend          Gateway          Auth Service       Database
   |                 |                  |                |
   |-- POST /login --|                  |                |
   |                 |-- Forward ------>|                |
   |                 |                  |-- Query ------>|
   |                 |                  |<-- User -------|
   |                 |                  |                |
   |                 |                  |--(Check Email) |
   |                 |                  |   Verified?    |
   |                 |                  |                |
   |                 |                  |--(BCrypt)------|
   |                 |                  |   Check pwd    |
   |                 |                  |                |
   |                 |                  |--(Generate JWT)|
   |                 |                  |   + roles      |
   |                 |                  |   + types      |
   |                 |                  |                |
   |                 |<-- Headers ------|                |
   |                 |   + Body         |                |
   |<-- Headers +----|                  |                |
   |    Body         |                  |                |
   |                 |                  |                |
```

---

## 🔄 Diagramme de Séquence - Agent Creation Flow

```
Admin Frontend    Gateway       Auth Service      Email Service    Agent
   |                |                |                  |            |
   |--POST /agents--|                |                  |            |
   |                |--Forward------>|                  |            |
   |                |                |--Create Agent--->|            |
   |                |                |  (role=AGENT)    |            |
   |                |                |  (verified=false)|            |
   |                |                |                  |            |
   |                |                |--Generate OTP--->|            |
   |                |                |                  |            |
   |                |                |--Send Email----->|            |
   |                |                |                  |--Email---->|
   |                |<--201 Created--|                  |            |
   |<--201----------|                |                  |            |
   |                |                |                  |            |
   |                                                                  |
   |                                                    |--Enter OTP-|
   |                                                    |            |
   |                                        POST /verify-otp         |
   |                                                    |            |
   |                                        (verified=true)          |
   |                                                    |            |
   |                                        POST /login              |
   |                                                    |            |
   |                                        (Token + User Data)      |
```

---

## 🎯 Checklist d'Intégration Frontend

### Phase 1: Authentification de Base
- [ ] Implémentation de l'inscription (POST /users)
- [ ] Implémentation de la vérification OTP (POST /verify-otp)
- [ ] Implémentation du renvoi d'OTP (POST /resend-otp)
- [ ] Implémentation du login (POST /login)
- [ ] Extraction et stockage du token depuis headers
- [ ] Gestion de l'expiration du token (24h)
- [ ] Redirection si email non vérifié (403)

### Phase 2: Gestion du Profil
- [ ] Récupération du profil utilisateur (GET /users/{id})
- [ ] Mise à jour du profil (PUT /users/{id})
- [ ] Affichage conditionnel selon roles/types

### Phase 3: Reset Password
- [ ] Demande de réinitialisation (POST /forgot-password)
- [ ] Réinitialisation avec code (POST /reset-password)

### Phase 4: Wallets (Si applicable)
- [ ] Intégration MetaMask
- [ ] Connexion wallet (POST /wallet/connect)
- [ ] Vérification statut (GET /wallet/status)
- [ ] Déconnexion wallet (DELETE /wallet/disconnect)
- [ ] Affichage conditionnel "Créer propriété" si HOST

### Phase 5: Admin (Si applicable)
- [ ] Création d'agents (POST /admin/agents)
- [ ] Liste des agents (GET /admin/agents)
- [ ] Suppression d'agents (DELETE /admin/agents/{id})
- [ ] Protection des routes admin (vérifier rôle ADMIN)

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du Gateway (niveau DEBUG activé)
2. Vérifier les logs du Auth-Service
3. Tester les endpoints avec les scripts CURL fournis
4. Consulter le fichier ANALYSE_PROBLEME_403.md pour le troubleshooting

---

**Version** : 2.1 (Complète et Corrigée)  
**Date** : 13 janvier 2026  
**Auteur** : Documentation Technique  
**Prochaine étape** : [LISTING_SERVICE.md](LISTING_SERVICE.md)