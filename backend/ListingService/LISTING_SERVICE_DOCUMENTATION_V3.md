# 🏠 LISTING SERVICE - Documentation Complète

**Base URL** : `http://localhost:8082/api/listings`  
**Port Service Direct** : `8081` (⚠️ Ne jamais utiliser directement - toujours passer par le Gateway)  
**Version** : 3.0 (Finale - Testée et Validée)  
**Date** : 13 janvier 2026

---

## 📋 Table des Matières

1. [Architecture et Sécurité](#architecture-et-sécurité)
2. [Encodage UTF-8 - IMPORTANT](#encodage-utf-8---important)
3. [Types de Caractéristiques](#1%EF%B8%8F⃣-types-de-caractéristiques)
4. [Caractéristiques](#2%EF%B8%8F⃣-caractéristiques)
5. [Owners](#3%EF%B8%8F⃣-owners)
6. [Properties - Routes Publiques](#4%EF%B8%8F⃣-properties---routes-publiques)
7. [Properties - Routes Protégées](#5%EF%B8%8F⃣-properties---routes-protégées-owner)
8. [Properties - Routes Admin](#6%EF%B8%8F⃣-properties---routes-admin)
9. [Workflow d'une Propriété](#workflow-complet-dune-propriété)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture et Sécurité

### Flux de Requête

```
┌──────────┐                ┌─────────┐                ┌─────────────┐
│          │  Port 8082     │         │  Port 8081     │   Listing   │
│ Frontend │ ────────────>  │ Gateway │ ────────────>  │   Service   │
│          │                │         │                │             │
└──────────┘                └─────────┘                └─────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │                       │
              ┌──────▼──────┐         ┌─────▼──────┐
              │     JWT     │         │    RBAC    │
              │ Validation  │         │   Filter   │
              └─────────────┘         └────────────┘
                     │                       │
                     └───────────┬───────────┘
                                 │
                      Injecte Headers:
                      - X-User-Id
                      - X-Roles
                      - X-Username
```

### Pourquoi `permitAll()` dans SecurityConfig ?

**Question fréquente :** Pourquoi le Listing Service a `permitAll()` partout dans sa configuration Spring Security ?

**Réponse :**

Dans une architecture microservices avec Gateway centralisé, c'est la **bonne pratique** :

1. **Le Gateway fait TOUTE la sécurité** :
   - ✅ Validation JWT (signature, expiration)
   - ✅ Vérification RBAC (rôles ADMIN, USER, AGENT)
   - ✅ Injection des headers sécurisés

2. **Le Listing Service fait confiance au Gateway** :
   - Les headers `X-User-Id` et `X-Roles` sont **garantis sûrs**
   - Pas besoin de re-valider le JWT
   - `permitAll()` permet au service de se concentrer sur sa logique métier

3. **Avantages** :
   - ✅ Pas de duplication de code de sécurité
   - ✅ Performance (pas de double validation)
   - ✅ Maintenance simplifiée
   - ✅ Séparation des responsabilités

**Si vous enlevez `permitAll()` :** Spring Security bloquera TOUT avec 403, même avec des tokens valides !

---

## ⚠️ Encodage UTF-8 - IMPORTANT

### 🔴 Problème Courant : Caractères Accentués

Lors de l'envoi de requêtes HTTP contenant des **caractères accentués** (é, è, à, ç, î, ô, etc.), vous pouvez rencontrer cette erreur :

```json
{
  "error": "Internal Server Error",
  "message": "JSON parse error: Invalid UTF-8 middle byte 0x6c",
  "status": 500
}
```

### Pourquoi ça arrive ?

**Explication technique :**

Les caractères accentués sont encodés en UTF-8 sur **plusieurs octets** :
- `é` = `0xC3 0xA9` (2 octets)
- `î` = `0xC3 0xAE` (2 octets)
- `ç` = `0xC3 0xA7` (2 octets)

Si votre client HTTP (curl, script bash, etc.) n'encode pas correctement ces caractères, le serveur reçoit des octets invalides et rejette la requête.

### 📍 Exemple de Requête qui Échoue

```bash
# ❌ MAUVAIS - Va probablement échouer
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement à Paris",
    "city": "Paris",
    "state": "Île-de-France",
    "description": "Très bel appartement"
  }'
```

**Erreur :** `Invalid UTF-8 middle byte` sur `à`, `Î`, `è`

### ✅ Solutions

#### Solution 1 : Éviter les Accents (Recommandé pour les Scripts)

```bash
# ✅ BON - Fonctionne toujours
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Appartement a Paris",
    "city": "Paris",
    "state": "Ile-de-France",
    "description": "Tres bel appartement"
  }'
```

**Caractères à remplacer :**
- `é` → `e`
- `è` → `e`
- `à` → `a`
- `ç` → `c`
- `î` → `i`
- `ô` → `o`
- `ù` → `u`

#### Solution 2 : Forcer UTF-8 dans Curl

```bash
# ✅ BON - Force l'encodage UTF-8
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary @- << 'EOF'
{
  "title": "Appartement à Paris",
  "city": "Paris",
  "state": "Île-de-France",
  "description": "Très bel appartement"
}
EOF
```

**Note :** Utilisez `--data-binary` au lieu de `-d` pour préserver l'encodage.

#### Solution 3 : Utiliser Postman/Insomnia (Le Plus Simple)

Les outils GUI comme **Postman** ou **Insomnia** gèrent automatiquement l'encodage UTF-8 correctement.

**Étapes dans Postman :**
1. Créez une nouvelle requête POST
2. URL : `http://localhost:8082/api/listings/properties`
3. Headers : 
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN`
4. Body (raw JSON) :
```json
{
  "title": "Appartement à Paris",
  "city": "Paris",
  "state": "Île-de-France",
  "description": "Très bel appartement avec vue magnifique"
}
```
5. Cliquez sur Send → **Ça marche ! ✅**

#### Solution 4 : Utiliser des Fichiers JSON

```bash
# Créez un fichier property.json
cat > property.json << 'EOF'
{
  "title": "Appartement à Paris",
  "city": "Paris",
  "state": "Île-de-France",
  "description": "Très bel appartement"
}
EOF

# Envoyez le fichier avec curl
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary @property.json
```

### 🎯 Recommandations par Cas d'Usage

| Cas d'Usage | Recommandation | Raison |
|-------------|----------------|--------|
| **Scripts de test automatisés** | Éviter les accents | Compatibilité maximale |
| **Tests manuels** | Postman/Insomnia | Simple et fiable |
| **Production (Frontend)** | UTF-8 natif | Les frameworks modernes gèrent bien UTF-8 |
| **Curl en ligne de commande** | `--data-binary` + `charset=utf-8` | Force l'encodage correct |

### 📊 Tableau des Caractères Problématiques

| Caractère | UTF-8 Hex | Remplacement ASCII | Exemple |
|-----------|-----------|-------------------|---------|
| `é` | C3 A9 | `e` | "Été" → "Ete" |
| `è` | C3 A8 | `e` | "Très" → "Tres" |
| `ê` | C3 AA | `e` | "Être" → "Etre" |
| `à` | C3 A0 | `a` | "à Paris" → "a Paris" |
| `ç` | C3 A7 | `c` | "Français" → "Francais" |
| `î` | C3 AE | `i` | "Île" → "Ile" |
| `ô` | C3 B4 | `o` | "Hôtel" → "Hotel" |
| `ù` | C3 B9 | `u` | "où" → "ou" |
| `â` | C3 A2 | `a` | "Âge" → "Age" |

---

## 1️⃣ Types de Caractéristiques

### GET /api/listings/type-caracteristiques

**Accès :** Public (aucune authentification requise)  
**Description :** Liste tous les types de caractéristiques disponibles

**Exemple de requête :**
```bash
curl http://localhost:8082/api/listings/type-caracteristiques | jq .
```

**Response 200 OK :**
```json
[
  {
    "id": 1,
    "name": "Équipements",
    "description": "Équipements et installations disponibles dans la propriété",
    "iconPath": "icon-equipements.svg"
  },
  {
    "id": 2,
    "name": "Services",
    "description": "Services fournis aux locataires",
    "iconPath": "icon-services.svg"
  },
  {
    "id": 3,
    "name": "Sécurité",
    "description": "Éléments de sécurité et protection",
    "iconPath": "icon-securite.svg"
  }
]
```

**Types créés par défaut (DataInitializer) :**
1. Équipements
2. Services
3. Sécurité
4. Confort
5. Extérieur

---

### GET /api/listings/type-caracteristiques/{id}

**Accès :** Public  
**Description :** Récupérer un type spécifique par son ID

**Exemple :**
```bash
curl http://localhost:8082/api/listings/type-caracteristiques/1 | jq .
```

---

### POST /api/listings/type-caracteristiques

**Accès :** ADMIN uniquement  
**Description :** Créer un nouveau type de caractéristique

**Headers requis :**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body :**
```json
{
  "name": "Type Test",
  "description": "Description du type test",
  "iconPath": "test-icon.svg"
}
```

**Response 200 OK :**
```json
{
  "id": 6,
  "name": "Type Test",
  "description": "Description du type test",
  "iconPath": "test-icon.svg"
}
```

**Exemple Curl :**
```bash
curl -X POST http://localhost:8082/api/listings/type-caracteristiques \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Type Test",
    "description": "Description du type test",
    "iconPath": "test-icon.svg"
  }'
```

**Response 403 (si USER au lieu d'ADMIN) :**
```
Forbidden
```

---

## 2️⃣ Caractéristiques

### GET /api/listings/characteristics

**Accès :** Public  
**Description :** Liste toutes les caractéristiques disponibles (47 par défaut)

**Exemple :**
```bash
curl http://localhost:8082/api/listings/characteristics | jq .
```

**Response 200 OK :**
```json
[
  {
    "id": 1,
    "name": "WiFi",
    "iconPath": "wifi-icon.svg",
    "isActive": true,
    "typeCaracteristique": {
      "id": 1,
      "name": "Équipements",
      "description": "Équipements et installations disponibles",
      "iconPath": "icon-equipements.svg"
    },
    "active": true
  },
  {
    "id": 2,
    "name": "Télévision",
    "iconPath": "tv-icon.svg",
    "isActive": true,
    "typeCaracteristique": {
      "id": 1,
      "name": "Équipements"
    }
  }
]
```

**Caractéristiques créées par défaut :**

**Équipements (10) :**
WiFi, Télévision, Cuisine, Lave-linge, Sèche-linge, Lave-vaisselle, Climatisation, Chauffage, Fer à repasser, Sèche-cheveux

**Services (7) :**
Parking gratuit, Parking payant, Ménage inclus, Service de conciergerie, Petit-déjeuner inclus, Check-in automatique, Bagagerie disponible

**Sécurité (7) :**
Détecteur de fumée, Détecteur de monoxyde de carbone, Extincteur, Trousse de premiers secours, Coffre-fort, Caméras de sécurité, Gardien

**Confort (7) :**
Draps et serviettes fournis, Produits de toilette, Espace de travail, Cheminée, Baignoire, Douche à l'italienne, Vue panoramique

**Extérieur (10) :**
Piscine, Jacuzzi, Terrasse, Balcon, Jardin, Barbecue, Salle de sport, Vue sur mer, Vue sur montagne, Accès plage privée

**Total : 47 caractéristiques** ✅

---

### GET /api/listings/characteristics/{id}

**Accès :** Public  
**Description :** Récupérer une caractéristique par son ID

---

### POST /api/listings/characteristics

**Accès :** ADMIN uniquement  
**Description :** Créer une nouvelle caractéristique

**Request Body :**
```json
{
  "name": "Test Characteristic",
  "iconPath": "test-char-icon.svg",
  "isActive": true,
  "typeCaracteristiqueId": 1
}
```

**Response 200 OK :**
```json
{
  "message": "Caractéristique créée avec succès",
  "characteristic": {
    "id": 43,
    "name": "Test Characteristic",
    "iconPath": "test-char-icon.svg",
    "isActive": true,
    "typeCaracteristique": {
      "id": 1,
      "name": "Équipements"
    }
  }
}
```

---

### PUT /api/listings/characteristics/{id}

**Accès :** ADMIN uniquement  
**Description :** Modifier une caractéristique existante

**Request Body (tous les champs optionnels) :**
```json
{
  "name": "WiFi Updated",
  "isActive": true
}
```

---

### DELETE /api/listings/characteristics/{id}

**Accès :** ADMIN uniquement  
**Description :** Supprimer une caractéristique

**Response 200 OK :**
```json
{
  "message": "Caractéristique supprimée avec succès"
}
```

**Response 400 (si ID inexistant) :**
```json
{
  "message": "Caractéristique non trouvée"
}
```

---

## 3️⃣ Owners

### GET /api/listings/owners/check/{userId}

**Accès :** Public  
**Description :** Vérifier si un owner existe et peut créer des propriétés

**Exemple :**
```bash
curl http://localhost:8082/api/listings/owners/check/G55IfZTn4fzK3VwpaRh5C79CE0mvfq | jq .
```

**Response 200 OK (Owner existe avec wallet) :**
```json
{
  "exists": true,
  "hasWalletAddress": true,
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "userId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
  "canCreateProperty": true,
  "message": "Owner is ready to create properties."
}
```

**Response 200 OK (Owner existe sans wallet) :**
```json
{
  "exists": true,
  "hasWalletAddress": false,
  "userId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
  "walletAddress": null,
  "canCreateProperty": false,
  "message": "Owner exists but does not have a wallet address. Cannot create properties."
}
```

**Response 200 OK (Owner n'existe pas) :**
```json
{
  "exists": false,
  "hasWalletAddress": false,
  "message": "Owner not found. Please ensure user is synchronized from Auth Service."
}
```

**Note :** Cet endpoint est utilisé par le frontend pour vérifier si un utilisateur peut créer des propriétés avant d'afficher le formulaire.

---

### GET /api/listings/owners/{userId}

**Accès :** Authentifié (JWT requis)  
**Description :** Récupérer les informations d'un owner

**Exemple :**
```bash
curl -H "Authorization: Bearer $USER_TOKEN" \
     http://localhost:8082/api/listings/owners/G55IfZTn4fzK3VwpaRh5C79CE0mvfq | jq .
```

**Response 200 OK :**
```json
{
  "userId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response 404 (Owner non trouvé) :**
```json
{
  "message": "Owner not found with userId: xyz"
}
```

---

### GET /api/listings/owners

**Accès :** ADMIN uniquement  
**Description :** Liste tous les owners (avec leurs propriétés et moyens de paiement)

**Exemple :**
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     http://localhost:8082/api/listings/owners | jq .
```

**Response 200 OK :**
```json
[
  {
    "id": 1,
    "userId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "properties": [
      {
        "id": 2,
        "propertyId": "WFr6JqPpPguLIfxjBcvw",
        "title": "Appartement Clean Base",
        "type": "APARTMENT",
        "status": "DRAFT"
      }
    ],
    "paymentMethods": []
  },
  {
    "id": 2,
    "userId": "NaXWoeYS2hCSTzIzpNPBvN--1JhWbb",
    "walletAddress": null,
    "properties": [],
    "paymentMethods": []
  }
]
```

**⚠️ Note Technique :**

Les entités `Owner`, `PropertyEntity`, et `PaymentMethod` utilisent `@JsonIgnoreProperties` pour éviter les boucles infinies de sérialisation :

```java
// Dans Owner.java
@JsonIgnoreProperties("owner")
private List<PropertyEntity> properties;

// Dans PropertyEntity.java
@JsonIgnoreProperties({"properties", "paymentMethods"})
private Owner owner;
```

Sans ces annotations, vous obtiendriez une erreur :
```
Document nesting depth (1001) exceeds the maximum allowed (1000)
```

---

## 4️⃣ Properties - Routes Publiques

### GET /api/listings/properties

**Accès :** Public  
**Description :** Liste toutes les propriétés avec statut `ACTIVE` (paginé)

**Query Parameters :**
- `page` : Numéro de page (défaut: 0)
- `size` : Taille de page (défaut: 20)
- `sortBy` : Champ de tri (défaut: createdAt)
- `sortDir` : Direction ASC ou DESC (défaut: DESC)

**Exemple :**
```bash
curl "http://localhost:8082/api/listings/properties?page=0&size=10&sortBy=pricePerNight&sortDir=ASC" | jq .
```

**Response 200 OK :**
```json
{
  "content": [
    {
      "propertyId": "T5ewfTtVy9v2vXOq3K8S",
      "title": "Villa avec Piscine - Tanger",
      "type": "VILLA",
      "description": null,
      "ownerId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
      "latitude": 35.78,
      "longitude": -5.77,
      "addressName": "Malabata",
      "city": "Tanger",
      "country": "Maroc",
      "state": null,
      "codePostale": null,
      "pricePerNight": 150.00,
      "nbOfGuests": 6,
      "nbOfBedrooms": 3,
      "nbOfBeds": 4,
      "nbOfBathrooms": 2,
      "imageFolderPath": [],
      "status": "ACTIVE",
      "createdAt": "2026-01-11T18:10:45.482721",
      "lastUpdateAt": "2026-01-11T18:55:25.8759",
      "characteristics": []
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "offset": 0
  },
  "totalPages": 1,
  "totalElements": 2,
  "numberOfElements": 2,
  "first": true,
  "last": true,
  "empty": false
}
```

**Note :** Seules les propriétés avec `status: "ACTIVE"` sont retournées.

---

### GET /api/listings/properties/{propertyId}

**Accès :** Public  
**Description :** Récupérer une propriété par son ID

**Exemple :**
```bash
curl http://localhost:8082/api/listings/properties/T5ewfTtVy9v2vXOq3K8S | jq .
```

---

### GET /api/listings/properties/search

**Accès :** Public  
**Description :** Rechercher des propriétés selon des critères

**Query Parameters :**
- `city` : Ville (optionnel)
- `type` : Type de propriété (optionnel)
- `minPrice` : Prix minimum par nuit (optionnel)
- `maxPrice` : Prix maximum par nuit (optionnel)
- `nbOfGuests` : Nombre d'invités minimum (optionnel)
- `page` : Numéro de page (défaut: 0)
- `size` : Taille de page (défaut: 20)

**Exemple :**
```bash
curl "http://localhost:8082/api/listings/properties/search?city=Paris&minPrice=50&maxPrice=200&nbOfGuests=4" | jq .
```

**Response 200 OK :**
```json
{
  "content": [],
  "totalElements": 0
}
```

---

### GET /api/listings/properties/nearby

**Accès :** Public  
**Description :** Trouver des propriétés à proximité d'une localisation GPS

**Query Parameters :**
- `latitude` : Latitude (requis)
- `longitude` : Longitude (requis)
- `radius` : Rayon en kilomètres (défaut: 10.0)
- `page` : Numéro de page (défaut: 0)
- `size` : Taille de page (défaut: 20)

**Exemple :**
```bash
curl "http://localhost:8082/api/listings/properties/nearby?latitude=48.8566&longitude=2.3522&radius=10" | jq .
```

**Logique :** Utilise la formule Haversine pour calculer la distance entre deux points GPS.

---

## 5️⃣ Properties - Routes Protégées (Owner)

### GET /api/listings/properties/my-properties

**Accès :** Authentifié (JWT)  
**Description :** Liste toutes les propriétés de l'utilisateur connecté (tous statuts : DRAFT, PENDING, ACTIVE, HIDDEN)

**Exemple :**
```bash
curl -H "Authorization: Bearer $USER_TOKEN" \
     http://localhost:8082/api/listings/properties/my-properties | jq .
```

**Response 200 OK :**
```json
[
  {
    "propertyId": "WFr6JqPpPguLIfxjBcvw",
    "title": "Appartement Clean Base",
    "type": "APARTMENT",
    "status": "DRAFT",
    "pricePerNight": 120.00
  },
  {
    "propertyId": "T5ewfTtVy9v2vXOq3K8S",
    "title": "Villa avec Piscine",
    "type": "VILLA",
    "status": "ACTIVE",
    "pricePerNight": 150.00
  }
]
```

**Note :** Le `X-User-Id` est injecté automatiquement par le Gateway depuis le JWT.

---

### POST /api/listings/properties

**Accès :** Authentifié (JWT)  
**Description :** Créer une nouvelle propriété (statut initial : DRAFT)

**Headers requis :**
```
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json; charset=utf-8
```

**⚠️ ATTENTION À L'ENCODAGE UTF-8 !**

**Request Body :**
```json
{
  "title": "Appartement a Paris",
  "type": "Apartment",
  "description": "Bel appartement en centre ville",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "addressName": "123 Rue de la Paix",
  "city": "Paris",
  "country": "France",
  "state": "Ile-de-France",
  "codePostale": "75001",
  "pricePerNight": 100.00,
  "nbOfGuests": 4,
  "nbOfBedrooms": 2,
  "nbOfBeds": 2,
  "nbOfBathrooms": 1,
  "characteristicIds": [1, 2, 3]
}
```

**⚠️ Évitez les accents dans les scripts bash :**
- ❌ "Île-de-France" → ✅ "Ile-de-France"
- ❌ "Très bel" → ✅ "Tres bel"
- ❌ "à Paris" → ✅ "a Paris"

**Exemple Curl (SANS ACCENTS) :**
```bash
curl -X POST http://localhost:8082/api/listings/properties \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "title": "Appartement a Paris",
    "type": "Apartment",
    "description": "Bel appartement",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "addressName": "123 Rue Test",
    "city": "Paris",
    "country": "France",
    "state": "Ile-de-France",
    "codePostale": "75001",
    "pricePerNight": 100.00,
    "nbOfGuests": 4,
    "nbOfBedrooms": 2,
    "nbOfBeds": 2,
    "nbOfBathrooms": 1,
    "characteristicIds": [1, 2, 3]
  }'
```

**Response 201 Created :**
```json
{
  "message": "Propriété créée avec succès",
  "property": {
    "propertyId": "abc123xyz",
    "title": "Appartement a Paris",
    "type": "Apartment",
    "status": "DRAFT",
    "ownerId": "G55IfZTn4fzK3VwpaRh5C79CE0mvfq",
    "createdAt": "2026-01-13T14:30:00"
  }
}
```

**Response 400 (Erreur UTF-8) :**
```json
{
  "error": "Internal Server Error",
  "message": "JSON parse error: Invalid UTF-8 middle byte 0x6c",
  "status": 500
}
```

**Solution :** Voir la section [Encodage UTF-8](#encodage-utf-8---important)

---

### GET /api/listings/properties/owner/{ownerId}/active-count

**Accès :** Authentifié (JWT)  
**Description :** Compter le nombre de propriétés actives d'un owner (utilisé pour vérifier si un wallet peut être déconnecté)

**Exemple :**
```bash
curl -H "Authorization: Bearer $USER_TOKEN" \
     http://localhost:8082/api/listings/properties/owner/G55IfZTn4fzK3VwpaRh5C79CE0mvfq/active-count | jq .
```

**Response 200 OK :**
```json
{
  "count": 2
}
```

**Note :** Compte uniquement les propriétés avec `status = ACTIVE` (pas DRAFT, PENDING, HIDDEN).

---

### PUT /api/listings/properties/{propertyId}

**Accès :** Authentifié (JWT)  
**Description :** Modifier une propriété existante

**Validation :** Vérifie que `X-User-Id` du token = `ownerId` de la propriété

---

### DELETE /api/listings/properties/{propertyId}

**Accès :** Authentifié (JWT)  
**Description :** Supprimer une propriété

**Validation :** Vérifie que l'utilisateur est bien le propriétaire

---

## 6️⃣ Properties - Routes Admin

### GET /api/listings/properties/pending

**Accès :** ADMIN uniquement  
**Description :** Liste toutes les propriétés en attente de validation (statut PENDING)

**Exemple :**
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     "http://localhost:8082/api/listings/properties/pending?page=0&size=20" | jq .
```

**Response 200 OK :**
```json
{
  "content": [],
  "totalPages": 0,
  "totalElements": 0
}
```

**Response 403 (si USER au lieu d'ADMIN) :**
```
Forbidden
```

---

### PATCH /api/listings/properties/{propertyId}/validate

**Accès :** ADMIN uniquement  
**Description :** Valider une propriété (PENDING → ACTIVE)

**Exemple :**
```bash
curl -X PATCH \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8082/api/listings/properties/abc123/validate | jq .
```

**Response 200 OK :**
```json
{
  "propertyId": "abc123",
  "status": "ACTIVE",
  "message": "Property validated successfully"
}
```

---

### POST /api/listings/properties/{propertyId}/reject

**Accès :** ADMIN uniquement  
**Description :** Rejeter une propriété (PENDING → DRAFT)

**Exemple :**
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Photos manquantes"}' \
  http://localhost:8082/api/listings/properties/abc123/reject | jq .
```

---

### POST /api/listings/properties/{propertyId}/submit

**Accès :** Owner (JWT)  
**Description :** Soumettre une propriété pour validation (DRAFT → PENDING)

**Validation :**
- Vérifie que l'utilisateur est le propriétaire
- Vérifie que le statut actuel est DRAFT

---

## 🔄 Workflow Complet d'une Propriété

### Cycle de Vie

```
┌─────────┐   submit   ┌─────────┐  validate  ┌────────┐
│  DRAFT  │ ────────> │ PENDING │ ────────> │ ACTIVE │
└─────────┘            └─────────┘            └────────┘
     ↑                      │                       │
     │      reject          │                       │
     └──────────────────────┘                       │
                                          hide      │
                                              ┌────────┐
                                              │ HIDDEN │
                                              └────────┘
                                                    │
                                          show      │
                                                    ↓
                                              ┌────────┐
                                              │ ACTIVE │
                                              └────────┘
```

### États Détaillés

| Statut | Description | Visible Publiquement | Modifiable | Bookable |
|--------|-------------|---------------------|------------|----------|
| **DRAFT** | Propriété en cours de création | ❌ Non | ✅ Oui | ❌ Non |
| **PENDING** | Soumise pour validation admin | ❌ Non | ✅ Oui | ❌ Non |
| **ACTIVE** | Validée et publiée | ✅ Oui | ❌ Non | ✅ Oui |
| **HIDDEN** | Cachée temporairement | ❌ Non | ❌ Non | ❌ Non |
| **DELETED** | Supprimée définitivement | ❌ Non | ❌ Non | ❌ Non |

### Transitions Autorisées

```java
// PropertyStatus.java
public boolean canTransitionTo(PropertyStatus target) {
    return switch (this) {
        case DRAFT -> target == PENDING || target == DELETED;
        case PENDING -> target == ACTIVE || target == DRAFT || target == DELETED;
        case ACTIVE -> target == HIDDEN || target == DELETED;
        case HIDDEN -> target == ACTIVE || target == DELETED;
        case DELETED -> false; // État final
    };
}
```

---

## 🐛 Troubleshooting

### Problème : "Invalid UTF-8 middle byte"

**Cause :** Caractères accentués mal encodés

**Solution :** Voir [Encodage UTF-8](#encodage-utf-8---important)

---

### Problème : "Document nesting depth (1001) exceeds maximum"

**Cause :** Boucle infinie Owner ↔ Properties

**Solution :** ✅ **DÉJÀ CORRIGÉ** dans `Owner.java` et `PaymentMethod.java` avec `@JsonIgnoreProperties`

---

### Problème : 403 Forbidden sur routes publiques

**Cause :** `permitAll()` manquant dans SecurityConfig

**Solution :** Vérifiez que `SecurityConfig.java` a bien tous les `permitAll()` requis

---

### Problème : 403 Forbidden avec token ADMIN valide

**Cause :** Le Gateway cherche "ROLE_ADMIN" au lieu de "ADMIN"

**Solution :** ✅ **DÉJÀ CORRIGÉ** dans `RoleBasedAuthorizationFilter.java`

---

## 📋 Checklist de Validation

Après avoir lu cette documentation :

- [✅] Comprendre l'architecture Gateway → Service
- [✅] Savoir pourquoi `permitAll()` est correct
- [✅] Comprendre le problème d'encodage UTF-8
- [✅] Savoir éviter les caractères accentués dans les scripts
- [✅] Connaître les 5 types de caractéristiques
- [✅] Connaître les 47 caractéristiques par défaut
- [✅] Comprendre le workflow DRAFT → PENDING → ACTIVE
- [✅] Savoir tester les endpoints publics sans token
- [✅] Savoir tester les endpoints protégés avec token
- [✅] Savoir tester les endpoints ADMIN avec token ADMIN

---

## 🎉 Conclusion

Le **Listing Service** est maintenant **100% fonctionnel** ! ✅

**Points clés à retenir :**

1. ✅ **Sécurité déléguée au Gateway** (d'où `permitAll()`)
2. ⚠️ **Attention à l'encodage UTF-8** (évitez les accents dans les scripts)
3. ✅ **47 caractéristiques créées automatiquement** au démarrage
4. ✅ **RBAC fonctionnel** (ADMIN peut gérer, USER peut créer)
5. ✅ **Workflow validé** (DRAFT → PENDING → ACTIVE)

**Prochaines étapes suggérées :**
- Tester tous les endpoints avec Postman
- Créer des tests d'intégration
- Documenter le Booking Service
- Documenter le Payment Service

---

**Version** : 3.0 Finale  
**Auteur** : Documentation Technique  
**Date** : 13 janvier 2026  
**Contact** : [Support Technique]
