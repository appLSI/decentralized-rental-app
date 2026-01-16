# 🏠 LISTING SERVICE - Documentation Frontend (CORRIGÉE v2.0)

**Base URL** : `http://localhost:8082/api/listings`

> ⚠️ **Version corrigée** - Cette documentation reflète exactement le code source du backend.

---

## 📊 Schémas Base de Données COMPLETS

### Table: `properties`

| Champ | Type | Description | Obligatoire | Unique | Default |
|-------|------|-------------|-------------|--------|---------|
| `id` | Long | ID auto-incrémenté | ✅ | ✅ | Auto |
| `propertyId` | String(50) | UUID propriété | ✅ | ✅ | Généré |
| `title` | String(100) | Titre de l'annonce | ✅ | ❌ | - |
| `type` | String(50) | Type de bien | ✅ | ❌ | - |
| `description` | Text | **50-2000 caractères REQUIS** | ✅ | ❌ | - |
| `owner_id` | Long | **FK vers owners.id** | ✅ | ❌ | Auto |
| `owner_user_id` | String(50) | **UUID Auth Service** | ✅ | ❌ | - |
| `latitude` | Double | Coordonnée GPS | ✅ | ❌ | - |
| `longitude` | Double | Coordonnée GPS | ✅ | ❌ | - |
| `addressName` | String(200) | Adresse complète | ✅ | ❌ | - |
| `city` | String(100) | Ville | ✅ | ❌ | - |
| `country` | String(100) | Pays | ✅ | ❌ | - |
| `state` | String(100) | État/Région | ❌ | ❌ | null |
| `codePostale` | String(20) | Code postal | ❌ | ❌ | null |
| `pricePerNight` | Decimal(10,2) | Prix par nuit | ✅ | ❌ | - |
| `nbOfGuests` | Integer | Nombre d'invités max | ✅ | ❌ | - |
| `nbOfBedrooms` | Integer | Nombre de chambres | ✅ | ❌ | - |
| `nbOfBeds` | Integer | Nombre de lits | ✅ | ❌ | - |
| `nbOfBathrooms` | Integer | Nombre de salles de bain | ✅ | ❌ | - |
| `status` | Enum | PropertyStatus **(incl. DELETED)** | ✅ | ❌ | DRAFT |
| `createdAt` | DateTime | Date de création | ✅ | ❌ | Auto |
| `lastUpdateAt` | DateTime | Dernière modification | ✅ | ❌ | Auto |

### Table: `property_images`

| Champ | Type | Description |
|-------|------|-------------|
| `property_id` | Long | FK vers properties.id |
| `image_path` | String(500) | URL ou chemin fichier |

### Table: `characteristics`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | ID auto-incrémenté |
| `name` | String(100) | Nom (ex: WiFi, Piscine) |
| `iconPath` | String(255) | Chemin de l'icône |
| `isActive` | Boolean | Actif ou non |
| `typeCaracteristique_id` | Long | FK vers type_caracteristique |

### Table: `type_caracteristique`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | ID auto-incrémenté |
| `name` | String(100) | Nom du type (Équipements, Services) |
| `description` | Text | Description optionnelle |
| `iconPath` | String(100) | Chemin icône type |

### Table: `owners`

Créée automatiquement via RabbitMQ depuis Auth Service :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | ID auto-incrémenté |
| `userId` | String(50) | UUID Auth Service |
| `walletAddress` | String(42) | Adresse Ethereum |

---

## 📋 Enum PropertyStatus (COMPLET)

```java
DRAFT      → Brouillon (owner travaille dessus)
PENDING    → En attente validation admin
ACTIVE     → Validé et visible publiquement
HIDDEN     → Validé mais caché temporairement
DELETED    → Supprimé (soft delete) ⚠️
```

### Transitions Autorisées

```
DRAFT ────────► PENDING ────────► ACTIVE ◄────► HIDDEN
  │                │                 │              │
  │                │                 │              │
  └────────────────┴─────────────────┴──────────────┘
                          ▼
                       DELETED (état final)
```

**Règles de transition** :
- `DRAFT` → `PENDING`, `DELETED`
- `PENDING` → `ACTIVE`, `DRAFT`, `DELETED`
- `ACTIVE` → `HIDDEN`, `DELETED`
- `HIDDEN` → `ACTIVE`, `DELETED`
- `DELETED` → ❌ **Aucune** (état final)

### Méthodes Helper (Business Logic)

```java
// Disponibles dans PropertyStatus enum
status.isPubliclyVisible()    // true si ACTIVE
status.canAcceptBookings()    // true si ACTIVE
status.isEditable()           // true si DRAFT ou PENDING
status.isDeleted()            // true si DELETED
status.needsValidation()      // true si PENDING
status.canTransitionTo(newStatus)  // Vérifie transitions autorisées
```

---

## 🌐 Endpoints Publics (Sans Auth)

### 1. Lister Toutes les Propriétés

**Récupérer les propriétés validées et visibles**

```http
GET /api/listings/properties?page=0&size=20&sortBy=createdAt&sortDir=DESC
```

**Query Parameters**
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `page` | Integer | 0 | Numéro de page (commence à 0) |
| `size` | Integer | 20 | Éléments par page |
| `sortBy` | String | createdAt | Champ de tri |
| `sortDir` | String | DESC | Direction (ASC/DESC) |

**Response 200 OK**
```json
{
  "content": [
    {
      "propertyId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Villa Moderne à Casablanca",
      "type": "VILLA",
      "description": "Belle villa spacieuse avec vue sur mer...",
      "pricePerNight": 1500.00,
      "city": "Casablanca",
      "country": "Morocco",
      "latitude": 33.5731,
      "longitude": -7.5898,
      "nbOfGuests": 6,
      "nbOfBedrooms": 3,
      "nbOfBeds": 4,
      "nbOfBathrooms": 2,
      "status": "ACTIVE",
      "images": [
        "uploads/properties/prop123/image1.jpg",
        "uploads/properties/prop123/image2.jpg"
      ],
      "characteristics": [
        { "id": 1, "name": "WiFi", "iconPath": "wifi.svg" },
        { "id": 2, "name": "Piscine", "iconPath": "pool.svg" }
      ],
      "ownerId": "660e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-01-10T10:30:00",
      "lastUpdateAt": "2026-01-11T14:20:00"
    }
  ],
  "totalPages": 10,
  "totalElements": 200,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

**Logique Métier**
- Seules les propriétés avec `status = ACTIVE` sont retournées
- Exclut : `DRAFT`, `PENDING`, `HIDDEN`, `DELETED`
- Tri par défaut : plus récentes d'abord
- Pagination automatique

---

### 2. Détails d'une Propriété

**Récupérer les informations complètes d'une propriété**

```http
GET /api/listings/properties/{propertyId}
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Villa Moderne à Casablanca",
  "type": "VILLA",
  "description": "Belle villa spacieuse avec vue sur mer, piscine privée, jardin tropical. Idéale pour familles.",
  "addressName": "123 Rue des Palmiers",
  "city": "Casablanca",
  "country": "Morocco",
  "state": "Casablanca-Settat",
  "codePostale": "20000",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "pricePerNight": 1500.00,
  "nbOfGuests": 6,
  "nbOfBedrooms": 3,
  "nbOfBeds": 4,
  "nbOfBathrooms": 2,
  "status": "ACTIVE",
  "images": [
    "uploads/properties/prop123/villa1.jpg",
    "uploads/properties/prop123/villa2.jpg"
  ],
  "characteristics": [
    { "id": 1, "name": "WiFi", "iconPath": "wifi.svg" },
    { "id": 2, "name": "Piscine", "iconPath": "pool.svg" },
    { "id": 3, "name": "Parking", "iconPath": "parking.svg" }
  ],
  "ownerId": "660e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-01-10T10:30:00",
  "lastUpdateAt": "2026-01-11T14:20:00"
}
```

**Response 404 Not Found**
```json
{
  "message": "Propriété non trouvée"
}
```

---

### 3. Rechercher des Propriétés

**Recherche avec filtres multiples**

```http
GET /api/listings/properties/search?city=Casablanca&type=VILLA&minPrice=1000&maxPrice=2000&nbOfGuests=4&page=0&size=20
```

**Query Parameters**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `city` | String | ❌ | Ville (case-insensitive) |
| `type` | String | ❌ | Type de bien (VILLA, APARTMENT, etc.) |
| `minPrice` | Decimal | ❌ | Prix minimum par nuit |
| `maxPrice` | Decimal | ❌ | Prix maximum par nuit |
| `nbOfGuests` | Integer | ❌ | Nombre d'invités minimum |
| `page` | Integer | ❌ | Numéro de page (défaut: 0) |
| `size` | Integer | ❌ | Taille page (défaut: 20) |

**Response 200 OK**
```json
{
  "content": [ ... ],
  "totalPages": 3,
  "totalElements": 45,
  "number": 0,
  "size": 20
}
```

**Logique Métier**
- Tous les filtres sont optionnels (AND logique)
- Seules les propriétés `ACTIVE` sont retournées
- Recherche city : case-insensitive avec LIKE

---

### 4. Propriétés à Proximité

**Recherche géographique par rayon**

```http
GET /api/listings/properties/nearby?latitude=33.5731&longitude=-7.5898&radius=10&page=0&size=20
```

**Query Parameters**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `latitude` | Double | ✅ | Latitude du point central |
| `longitude` | Double | ✅ | Longitude du point central |
| `radius` | Double | ❌ | Rayon en km (défaut: 10) |
| `page` | Integer | ❌ | Numéro de page |
| `size` | Integer | ❌ | Taille page |

**Response 200 OK**
```json
{
  "content": [
    {
      "propertyId": "...",
      "title": "Appartement Centre-ville",
      "distance": 2.5,
      ...
    }
  ],
  "totalElements": 12
}
```

**Logique Métier**
- Calcul de distance avec formule Haversine
- Tri par distance croissante
- Distance en kilomètres

---

## 🔒 Endpoints Protégés - Propriétaire

**Header requis**
```http
Authorization: Bearer <token>
```

---

### 5. Créer une Propriété

**Créer une nouvelle annonce**

```http
POST /api/listings/properties
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "title": "Villa Moderne à Casablanca",
  "type": "VILLA",
  "description": "Belle villa spacieuse avec vue sur mer, piscine privée et jardin tropical. Idéale pour familles nombreuses cherchant confort et tranquillité.",
  "addressName": "123 Rue des Palmiers",
  "city": "Casablanca",
  "country": "Morocco",
  "state": "Casablanca-Settat",
  "codePostale": "20000",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "pricePerNight": 1500.00,
  "nbOfGuests": 6,
  "nbOfBedrooms": 3,
  "nbOfBeds": 4,
  "nbOfBathrooms": 2,
  "characteristics": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ]
}
```

**⚠️ Validation STRICTE**
- `title` : 5-100 caractères, requis
- `type` : Non vide, requis
- `description` : **50-2000 caractères REQUIS** ⚠️
- `pricePerNight` : > 0, requis
- `nbOfGuests` : > 0, requis
- `nbOfBedrooms` : ≥ 0, requis
- `nbOfBeds` : ≥ 0, requis
- `nbOfBathrooms` : ≥ 0, requis
- `latitude` : -90 à 90, requis
- `longitude` : -180 à 180, requis
- `characteristics` : Array d'objets `[{"id": 1}, {"id": 2}]`

**Response 201 Created**
```json
{
  "message": "Propriété créée avec succès",
  "property": {
    "propertyId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "DRAFT",
    "title": "Villa Moderne à Casablanca",
    ...
  }
}
```

**Response 400 Bad Request**
```json
{
  "message": "Description must be between 50 and 2000 characters"
}
```

**Response 403 Forbidden**
```json
{
  "message": "Vous devez connecter un wallet pour créer une propriété"
}
```

**Logique Métier**
1. Vérification que l'utilisateur a un wallet connecté
2. Génération UUID unique pour propertyId
3. Status initial : `DRAFT`
4. Timestamps automatiques (createdAt, lastUpdateAt)
5. Association automatique avec l'owner via `owner_user_id`
6. Liaison des caractéristiques via IDs fournis
7. **Pas d'images dans cette étape** (upload séparé)

**Prérequis**
- Utilisateur doit avoir un `walletAddress` (Auth Service)
- Utilisateur doit avoir le type `HOST` (Auth Service)

---

### 6. Mes Propriétés

**Récupérer toutes les propriétés du propriétaire connecté**

```http
GET /api/listings/properties/my-properties
Authorization: Bearer <token>
```

**Response 200 OK**
```json
[
  {
    "propertyId": "...",
    "title": "Villa Moderne",
    "status": "ACTIVE",
    ...
  },
  {
    "propertyId": "...",
    "title": "Appartement Centre",
    "status": "DRAFT",
    ...
  },
  {
    "propertyId": "...",
    "title": "Maison Plage",
    "status": "PENDING",
    ...
  }
]
```

**Logique Métier**
- Retourne toutes les propriétés **SAUF `DELETED`**
- Inclut : `DRAFT`, `PENDING`, `ACTIVE`, `HIDDEN`
- Utilise le X-User-Id du JWT
- Tri par date de création décroissante

---

### 7. Mettre à Jour une Propriété

**Modifier une propriété existante**

```http
PUT /api/listings/properties/{propertyId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (tous les champs sont optionnels)
```json
{
  "title": "Villa Moderne - Mise à jour",
  "pricePerNight": 1600.00,
  "description": "Description mise à jour d'au moins 50 caractères pour passer la validation...",
  "characteristics": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 },
    { "id": 5 }
  ]
}
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Villa Moderne - Mise à jour",
  "pricePerNight": 1600.00,
  ...
}
```

**Response 403 Forbidden**
```json
{
  "message": "Vous n'êtes pas le propriétaire de cette propriété"
}
```

**Logique Métier**
- Seul le propriétaire peut modifier
- Modifications autorisées si `status.isEditable()` → `DRAFT` ou `PENDING`
- Si `ACTIVE` : certaines modifications sont limitées
- `lastUpdateAt` mis à jour automatiquement

---

### 8. Soumettre pour Validation

**Soumettre une propriété en brouillon pour validation admin**

```http
POST /api/listings/properties/{propertyId}/submit
Authorization: Bearer <token>
```

**Conditions**
- Status actuel doit être `DRAFT`
- Utilisateur doit être le propriétaire
- Validation complète de la propriété

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "message": "Propriété soumise pour validation"
}
```

**Response 400 Bad Request**
```json
{
  "error": "Only DRAFT properties can be submitted. Current status: ACTIVE"
}
```

**Logique Métier**
1. Vérification ownership
2. Vérification status = `DRAFT`
3. Vérification données complètes (description, images, etc.)
4. Transition : `DRAFT` → `PENDING`
5. Notification admin (optionnel)

---

### 9. Cacher une Propriété

**Masquer temporairement une propriété active**

```http
POST /api/listings/properties/{propertyId}/hide
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "HIDDEN",
  "message": "Propriété cachée"
}
```

**Logique Métier**
- Transition : `ACTIVE` → `HIDDEN`
- La propriété n'apparaît plus dans les recherches publiques
- Les réservations existantes restent valides
- Le propriétaire peut toujours la voir dans "Mes propriétés"
- Peut être réactivée via `/show`

---

### 10. Afficher une Propriété Cachée

**Rendre visible une propriété cachée**

```http
POST /api/listings/properties/{propertyId}/show
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "message": "Propriété visible"
}
```

**Logique Métier**
- Transition : `HIDDEN` → `ACTIVE`
- La propriété redevient visible publiquement

---

### 11. Supprimer une Propriété

**⚠️ Soft Delete - Marquer comme supprimée**

```http
DELETE /api/listings/properties/{propertyId}
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "message": "Propriété supprimée avec succès"
}
```

**Response 409 Conflict**
```json
{
  "message": "Cannot delete property with active bookings"
}
```

**⚠️ IMPORTANT : Comportement Soft Delete**

Cette opération ne supprime **PAS** physiquement la propriété de la base de données.

**Logique Métier**
1. Vérification ownership
2. Vérification absence de bookings actifs (optionnel)
3. Transition : `[ANY]` → `DELETED`
4. La propriété reste en base de données
5. N'apparaît plus dans aucune liste publique
6. N'apparaît plus dans "Mes propriétés"
7. **Images ne sont PAS supprimées** du stockage
8. Récupérable par admin (future feature)

**État Final**
- `status = DELETED`
- Aucune transition possible depuis `DELETED`

---

### 12A. Compter Toutes les Propriétés (Non-Deleted)

**Compter les propriétés d'un owner**

```http
GET /api/listings/properties/owner/{ownerId}/count
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "count": 5
}
```

**Logique Métier**
- Compte : `DRAFT` + `PENDING` + `ACTIVE` + `HIDDEN`
- Exclut : `DELETED`

---

### 12B. Compter Propriétés Actives (Pour Wallet Disconnect)

**Compter les propriétés actives d'un owner**

```http
GET /api/listings/properties/owner/{ownerId}/active-count
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "count": 3
}
```

**Logique Métier**
- Compte **UNIQUEMENT** : `status = ACTIVE`
- **Usage** : Appelé par Auth Service pour valider déconnexion wallet
- Si count > 0 → Impossible de déconnecter le wallet

---

## 🔑 Endpoints Admin

**Nécessite le rôle ADMIN**

---

### 13. Propriétés en Attente

**Lister toutes les propriétés en attente de validation**

```http
GET /api/listings/properties/pending?page=0&size=20
Authorization: Bearer <admin_token>
```

**Response 200 OK**
```json
{
  "content": [
    {
      "propertyId": "...",
      "title": "Villa à valider",
      "status": "PENDING",
      "ownerId": "...",
      "createdAt": "2026-01-11T10:00:00",
      "description": "...",
      "images": [...]
    }
  ],
  "totalElements": 15
}
```

**Logique Métier**
- Seules les propriétés avec `status = PENDING`
- Tri par date de création décroissante
- Vérification rôle ADMIN dans controller

---

### 14. Valider une Propriété

**Approuver une propriété en attente**

```http
PATCH /api/listings/properties/{propertyId}/validate
Authorization: Bearer <admin_token>
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "message": "Propriété validée"
}
```

**Response 403 Forbidden**
```json
{
  "error": "Admin only"
}
```

**Logique Métier**
1. Vérification rôle ADMIN (via X-Roles header)
2. Vérification status = `PENDING`
3. Transition : `PENDING` → `ACTIVE`
4. La propriété devient visible publiquement
5. Notification au propriétaire (optionnel)

---

### 15. Rejeter une Propriété

**Refuser une propriété en attente**

```http
POST /api/listings/properties/{propertyId}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body** (optionnel)
```json
{
  "reason": "Images de mauvaise qualité"
}
```

**Response 200 OK**
```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "message": "Propriété rejetée"
}
```

**Logique Métier**
1. Vérification rôle ADMIN
2. Vérification status = `PENDING`
3. Transition : `PENDING` → `DRAFT`
4. Le propriétaire peut modifier et resoumettre
5. Notification au propriétaire avec raison (optionnel)

---

## ✨ Caractéristiques

### 16. Lister Caractéristiques

**Récupérer toutes les caractéristiques disponibles**

```http
GET /api/listings/characteristics
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "name": "WiFi",
    "iconPath": "wifi.svg",
    "isActive": true,
    "typeCaracteristique": {
      "id": 1,
      "name": "Équipements"
    }
  },
  {
    "id": 2,
    "name": "Piscine",
    "iconPath": "pool.svg",
    "isActive": true,
    "typeCaracteristique": {
      "id": 2,
      "name": "Services"
    }
  }
]
```

**Logique Métier**
- Utilisé pour afficher les checkboxes lors de la création
- Seules les caractéristiques `isActive = true` sont utilisables
- Groupées par type pour meilleure UX

---

### 17. Types de Caractéristiques

**Récupérer les catégories de caractéristiques**

```http
GET /api/listings/type-caracteristiques
```

**Response 200 OK**
```json
[
  { "id": 1, "name": "Équipements", "iconPath": "equipment.svg" },
  { "id": 2, "name": "Services", "iconPath": "services.svg" },
  { "id": 3, "name": "Sécurité", "iconPath": "security.svg" }
]
```

---

## 📸 Gestion des Images

### Upload d'Images (Endpoint Séparé)

**⚠️ Les images sont uploadées APRÈS la création de la propriété**

```http
POST /api/listings/properties/{propertyId}/images
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**
```
images: [file1.jpg, file2.jpg, file3.jpg]
```

**Validation**
- Type : image/* uniquement (jpg, jpeg, png, webp)
- Taille max : 10MB par fichier
- Total max : 50MB par requête
- Nombre max : 10 images par propriété

**Response 200 OK**
```json
{
  "message": "Images uploadées avec succès",
  "imagePaths": [
    "uploads/properties/prop123/img1.jpg",
    "uploads/properties/prop123/img2.jpg",
    "uploads/properties/prop123/img3.jpg"
  ]
}
```

### Stockage des Images

Le service supporte **deux modes** :

#### 1. Stockage Local (Défaut - Développement)
- Chemin : `uploads/properties/{propertyId}/`
- Noms générés : UUID + extension
- ⚠️ Non recommandé en production

#### 2. AWS S3 (Production)
- Bucket : `rental-app-images`
- Dossier : `properties/`
- Configuration via variables d'environnement :
  ```properties
  aws.bucketName=rental-app-images
  aws.user.profile.folder=properties/
  ```

---

## 📡 Événements RabbitMQ (Communication Asynchrone)

Le Listing Service publie des événements vers les autres microservices :

### Exchange: `property.exchange`

#### Événement: `user.type.upgraded`
Publié quand un user crée sa **première** property

```json
{
  "userId": "550e8400...",
  "newType": "HOST",
  "timestamp": 1704970800000
}
```

**Consommateur** : Auth Service (ajoute type `HOST`)

---

#### Événement: `property.created`
Publié à la création d'une propriété

```json
{
  "propertyId": "prop123",
  "ownerId": "user456",
  "status": "DRAFT",
  "timestamp": 1704970800000
}
```

---

#### Événement: `property.status.changed`
Publié lors d'un changement de status

```json
{
  "propertyId": "prop123",
  "oldStatus": "PENDING",
  "newStatus": "ACTIVE",
  "timestamp": 1704970800000
}
```

**Consommateurs** : Booking Service, Notification Service

---

#### Événement: `property.validated`
Publié quand admin valide une propriété

```json
{
  "propertyId": "prop123",
  "ownerId": "user456",
  "status": "ACTIVE",
  "timestamp": 1704970800000
}
```

---

#### Événement: `property.deleted`
Publié lors d'une suppression (soft delete)

```json
{
  "propertyId": "prop123",
  "ownerId": "user456",
  "timestamp": 1704970800000
}
```

---

## 🎯 Cas d'Usage Frontend CORRIGÉS

### Workflow Complet : Créer et Publier une Propriété

```javascript
// ========== ÉTAPE 1: Vérifier Wallet ==========
const walletResponse = await fetch(
  `http://localhost:8082/api/auth/users/${userId}/wallet/status`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { exists } = await walletResponse.json();

if (!exists) {
  alert("Vous devez connecter votre wallet MetaMask");
  return;
}

// ========== ÉTAPE 2: Récupérer Caractéristiques ==========
const charsResponse = await fetch(
  'http://localhost:8082/api/listings/characteristics'
);
const characteristics = await charsResponse.json();
// Afficher dans le formulaire avec checkboxes

// ========== ÉTAPE 3: Créer la Propriété ==========
const propertyData = {
  title: "Villa Moderne à Casablanca",
  type: "VILLA",
  description: "Belle villa spacieuse avec vue sur mer, piscine privée et jardin tropical. Idéale pour familles nombreuses cherchant le confort et la tranquillité dans un cadre exceptionnel.",  // ⚠️ Min 50 caractères !
  addressName: "123 Rue des Palmiers",
  city: "Casablanca",
  country: "Morocco",
  state: "Casablanca-Settat",
  codePostale: "20000",
  latitude: 33.5731,
  longitude: -7.5898,
  pricePerNight: 1500.00,
  nbOfGuests: 6,
  nbOfBedrooms: 3,
  nbOfBeds: 4,
  nbOfBathrooms: 2,
  characteristics: [  // ✅ Format CORRECT : objets avec id
    { "id": 1 },  // WiFi
    { "id": 2 },  // Piscine
    { "id": 3 }   // Parking
  ]
  // ⚠️ Pas d'images ici !
};

const createResponse = await fetch(
  'http://localhost:8082/api/listings/properties',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(propertyData)
  }
);

if (!createResponse.ok) {
  const error = await createResponse.json();
  alert(`Erreur: ${error.message}`);
  return;
}

const { property } = await createResponse.json();
console.log("Propriété créée:", property.propertyId);
// property.status = "DRAFT"

// ========== ÉTAPE 4: Upload Images ==========
const formData = new FormData();
formData.append('images', selectedFile1);
formData.append('images', selectedFile2);
formData.append('images', selectedFile3);

const uploadResponse = await fetch(
  `http://localhost:8082/api/listings/properties/${property.propertyId}/images`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // ⚠️ Pas de Content-Type pour FormData !
    },
    body: formData
  }
);

const { imagePaths } = await uploadResponse.json();
console.log("Images uploadées:", imagePaths);

// ========== ÉTAPE 5: Soumettre pour Validation ==========
const submitResponse = await fetch(
  `http://localhost:8082/api/listings/properties/${property.propertyId}/submit`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

if (submitResponse.ok) {
  alert("Propriété soumise pour validation !");
  // property.status = "PENDING"
  // Attendre validation admin
} else {
  const error = await submitResponse.json();
  alert(`Erreur: ${error.error}`);
}
```

---

### Recherche avec Filtres

```javascript
const filters = {
  city: 'Casablanca',
  type: 'VILLA',
  minPrice: 1000,
  maxPrice: 2000,
  nbOfGuests: 4,
  page: 0,
  size: 20
};

// Enlever les valeurs nulles/undefined
const cleanFilters = Object.fromEntries(
  Object.entries(filters).filter(([_, v]) => v != null)
);

const queryString = new URLSearchParams(cleanFilters).toString();
const response = await fetch(
  `http://localhost:8082/api/listings/properties/search?${queryString}`
);

const { content, totalElements } = await response.json();
console.log(`${totalElements} propriétés trouvées`);
// Afficher les résultats
```

---

## ⚠️ Points d'Attention Critiques

### 1. Validation Description

```javascript
// ❌ FAUX - Trop court (échec 400)
description: "Belle villa"

// ✅ CORRECT - Au moins 50 caractères
description: "Belle villa spacieuse avec vue sur mer, piscine privée et jardin tropical. Idéale pour familles."
```

### 2. Format Characteristics

```javascript
// ❌ FAUX - Array d'IDs
characteristics: [1, 2, 3]

// ❌ FAUX - characteristicIds
characteristicIds: [1, 2, 3]

// ✅ CORRECT - Array d'objets avec id
characteristics: [
  { "id": 1 },
  { "id": 2 },
  { "id": 3 }
]
```

### 3. Images Uploadées Séparément

```javascript
// ❌ FAUX - URLs dans la création
{
  ...
  images: ["url1", "url2"]  // Ignoré !
}

// ✅ CORRECT - Upload séparé après création
// 1. POST /properties (sans images)
// 2. POST /properties/{id}/images (FormData)
```

### 4. Soft Delete vs Hard Delete

```javascript
// Après DELETE /properties/{id}
// La propriété existe toujours en BDD avec status = DELETED
// Vérifier avant affichage :
if (property.status !== 'DELETED') {
  // Afficher la propriété
}
```

### 5. Mes Propriétés - Filtrer Deleted

```javascript
// Backend retourne déjà sans DELETED
const myProperties = await fetch('/properties/my-properties');
// Pas besoin de filtrer côté frontend
```

---

## 📊 Résumé des Statuts

| Status | Visible Public | Visible Owner | Éditable | Réservable | Transitions |
|--------|----------------|---------------|----------|-----------|-------------|
| `DRAFT` | ❌ | ✅ | ✅ | ❌ | PENDING, DELETED |
| `PENDING` | ❌ | ✅ | ✅ | ❌ | ACTIVE, DRAFT, DELETED |
| `ACTIVE` | ✅ | ✅ | ⚠️ Limité | ✅ | HIDDEN, DELETED |
| `HIDDEN` | ❌ | ✅ | ⚠️ Limité | ❌ | ACTIVE, DELETED |
| `DELETED` | ❌ | ❌ | ❌ | ❌ | ❌ Aucune |

---

**Version** : 2.0 (Corrigée)  
**Date** : 11 janvier 2026  
**Prochaine étape** : [BOOKING_SERVICE.md](BOOKING_SERVICE.md)
