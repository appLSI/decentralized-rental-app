# Booking Service - API Documentation

## Table des matières

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Integration Examples](#integration-examples)

---

## Introduction

Le **Booking Service** gère toutes les opérations liées aux réservations de propriétés. Il permet aux utilisateurs de créer, consulter, et annuler leurs réservations.

**Base URL via Gateway**: `/api/bookings`

**Service direct** (développement uniquement): `http://localhost:8083/bookings`

---

## Authentication

### Headers requis

Tous les endpoints (sauf mention contraire) nécessitent une authentification JWT.

| Header | Valeur | Obligatoire | Description |
|--------|--------|-------------|-------------|
| `Authorization` | `Bearer {token}` | ✅ Oui | Token JWT obtenu lors de la connexion |
| `X-User-Id` | `{uuid}` | ✅ Oui | UUID de l'utilisateur (injecté automatiquement par la Gateway) |
| `Content-Type` | `application/json` | ✅ Oui (POST/PATCH) | Type de contenu |

> **Note** : Le header `X-User-Id` est automatiquement ajouté par la Gateway après validation du JWT. Le frontend n'a pas besoin de le fournir.

---

## Endpoints

### 1. Créer une réservation

Crée une nouvelle réservation avec le statut initial `AWAITING_PAYMENT`.

**Endpoint**
```http
POST /api/bookings
```

**Request Body**

```json
{
  "propertyId": "550e8400-e29b-41d4-a716-446655440001",
  "startDate": "2026-02-15",
  "endDate": "2026-02-22"
}
```

**Champs de la requête**

| Champ | Type | Obligatoire | Format | Description |
|-------|------|-------------|--------|-------------|
| `propertyId` | String | ✅ Oui | UUID | Identifiant unique de la propriété |
| `startDate` | String | ✅ Oui | `YYYY-MM-DD` | Date de début de la réservation |
| `endDate` | String | ✅ Oui | `YYYY-MM-DD` | Date de fin de la réservation |

**Validations**

- ✅ `propertyId` ne doit pas être null
- ✅ `startDate` ne doit pas être null et doit être une date valide
- ✅ `endDate` ne doit pas être null et doit être une date valide
- ✅ `startDate` doit être avant `endDate`
- ✅ L'utilisateur doit avoir un wallet connecté

**Response Success (201 Created)**

```json
{
  "id": 42,
  "propertyId": "550e8400-e29b-41d4-a716-446655440001",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-02-15",
  "endDate": "2026-02-22",
  "status": "AWAITING_PAYMENT",
  "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "pricePerNight": 150.00,
  "totalPrice": 1050.00,
  "currency": "MATIC",
  "createdAt": "2026-01-14T14:30:00",
  "updatedAt": "2026-01-14T14:30:00"
}
```

**Champs de la réponse**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Long | Identifiant unique de la réservation (à conserver pour le paiement) |
| `propertyId` | String | UUID de la propriété réservée |
| `tenantId` | String | UUID du locataire (utilisateur connecté) |
| `startDate` | String | Date de début (ISO 8601) |
| `endDate` | String | Date de fin (ISO 8601) |
| `status` | Enum | Statut de la réservation (voir [Statuts](#statuts-de-réservation)) |
| `tenantWalletAddress` | String | Adresse MetaMask du locataire (format 0x...) |
| `pricePerNight` | BigDecimal | Prix par nuit en MATIC |
| `totalPrice` | BigDecimal | **Montant total à payer** (utilisé pour la blockchain) |
| `currency` | String | Devise (`MATIC`, `USDC`, etc.) |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Date de dernière modification |

**Erreurs possibles**

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `400` | `Wallet Not Connected` | L'utilisateur n'a pas connecté son wallet MetaMask | Connecter le wallet avant de réserver |
| `400` | `Property ID is required` | Le champ propertyId est manquant | Fournir un propertyId valide |
| `400` | `Start date is required` | Le champ startDate est manquant | Fournir une date de début |
| `400` | `End date is required` | Le champ endDate est manquant | Fournir une date de fin |
| `401` | `Unauthorized` | Token JWT invalide ou manquant | Se reconnecter |
| `404` | `Property not found` | La propriété n'existe pas | Vérifier l'ID de la propriété |
| `409` | `Property not available` | La propriété n'est pas disponible pour ces dates | Choisir d'autres dates |

**Exemple d'erreur**

```json
{
  "timestamp": "2026-01-14T14:30:00",
  "status": 400,
  "error": "Wallet Not Connected",
  "message": "Please connect your MetaMask wallet before booking"
}
```

---

### 2. Annuler une réservation

Annule une réservation existante. Seul le propriétaire de la réservation peut l'annuler.

**Endpoint**
```http
PATCH /api/bookings/{bookingId}/cancel
```

**Path Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `bookingId` | Long | Identifiant de la réservation à annuler |

**Request Body**

Aucun body requis.

**Response Success (200 OK)**

```json
{
  "id": 42,
  "propertyId": "550e8400-e29b-41d4-a716-446655440001",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-02-15",
  "endDate": "2026-02-22",
  "status": "CANCELLED",
  "totalPrice": 1050.00,
  "currency": "MATIC",
  "updatedAt": "2026-01-14T15:00:00"
}
```

**Erreurs possibles**

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `401` | `Unauthorized` | Token JWT invalide | Se reconnecter |
| `403` | `Forbidden` | Vous n'êtes pas le propriétaire de cette réservation | Seul le locataire peut annuler |
| `404` | `Booking not found` | La réservation n'existe pas | Vérifier l'ID |

---

### 3. Récupérer mes réservations

Liste toutes les réservations de l'utilisateur connecté.

**Endpoint**
```http
GET /api/bookings/my-bookings
```

**Query Parameters**

Aucun.

**Response Success (200 OK)**

```json
[
  {
    "id": 42,
    "propertyId": "550e8400-e29b-41d4-a716-446655440001",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "startDate": "2026-02-15",
    "endDate": "2026-02-22",
    "status": "AWAITING_PAYMENT",
    "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "pricePerNight": 150.00,
    "totalPrice": 1050.00,
    "currency": "MATIC",
    "createdAt": "2026-01-14T14:30:00",
    "updatedAt": "2026-01-14T14:30:00"
  },
  {
    "id": 41,
    "propertyId": "550e8400-e29b-41d4-a716-446655440002",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "startDate": "2026-01-20",
    "endDate": "2026-01-25",
    "status": "CONFIRMED",
    "totalPrice": 800.00,
    "currency": "MATIC",
    "createdAt": "2026-01-10T10:00:00"
  }
]
```

**Filtrage côté frontend**

```javascript
// Filtrer par statut
const awaitingPayment = bookings.filter(b => b.status === 'AWAITING_PAYMENT');
const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
const cancelled = bookings.filter(b => b.status === 'CANCELLED');

// Filtrer par date
const upcoming = bookings.filter(b => 
  new Date(b.startDate) > new Date() && b.status === 'CONFIRMED'
);

const past = bookings.filter(b => 
  new Date(b.endDate) < new Date()
);
```

**Erreurs possibles**

| Code | Message | Description |
|------|---------|-------------|
| `401` | `Unauthorized` | Token JWT invalide |

---

### 4. Récupérer une réservation spécifique

Obtient les détails d'une réservation par son ID.

**Endpoint**
```http
GET /api/bookings/{bookingId}
```

**Path Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `bookingId` | Long | Identifiant de la réservation |

**Response Success (200 OK)**

```json
{
  "id": 42,
  "propertyId": "550e8400-e29b-41d4-a716-446655440001",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-02-15",
  "endDate": "2026-02-22",
  "status": "AWAITING_PAYMENT",
  "tenantWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "pricePerNight": 150.00,
  "totalPrice": 1050.00,
  "currency": "MATIC",
  "createdAt": "2026-01-14T14:30:00",
  "updatedAt": "2026-01-14T14:30:00"
}
```

**Erreurs possibles**

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `401` | `Unauthorized` | Token JWT invalide | Se reconnecter |
| `403` | `Forbidden` | Vous n'avez pas accès à cette réservation | Seul le locataire peut voir sa réservation |
| `404` | `Booking not found` | La réservation n'existe pas | Vérifier l'ID |

---

### 5. Compter les réservations actives (client)

Compte le nombre de réservations actives où l'utilisateur est le locataire.

**Endpoint**
```http
GET /api/bookings/client/{userId}/active-count
```

**Path Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `userId` | String | UUID de l'utilisateur |

**Response Success (200 OK)**

```json
{
  "count": 3,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "User has active bookings as client"
}
```

**Statuts considérés comme actifs** : `CONFIRMED`, `AWAITING_PAYMENT`, `PENDING`

**Cas d'usage**

- Afficher le nombre de réservations actives dans le dashboard utilisateur
- Vérifier si un utilisateur peut effectuer une action (ex: supprimer son compte)

---

### 6. Compter les réservations futures (hôte)

Compte le nombre de réservations futures où l'utilisateur est le propriétaire.

**Endpoint**
```http
GET /api/bookings/host/{userId}/future-count
```

**Path Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `userId` | String | UUID de l'utilisateur |

**Response Success (200 OK)**

```json
{
  "count": 0,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "No future host bookings found"
}
```

> **Note** : Cette fonctionnalité retourne actuellement toujours 0 (non encore implémentée).

---

## Data Models

### BookingRequestDTO

```typescript
interface BookingRequestDTO {
  propertyId: string;      // UUID de la propriété (obligatoire)
  startDate: string;       // Format: YYYY-MM-DD (obligatoire)
  endDate: string;         // Format: YYYY-MM-DD (obligatoire)
}
```

### BookingResponseDTO

```typescript
interface BookingResponseDTO {
  id: number;                    // Identifiant unique
  propertyId: string;            // UUID de la propriété
  tenantId: string;              // UUID du locataire
  startDate: string;             // Date de début (ISO 8601)
  endDate: string;               // Date de fin (ISO 8601)
  status: BookingStatus;         // Statut de la réservation
  tenantWalletAddress: string;   // Adresse MetaMask (0x...)
  pricePerNight: number;         // Prix par nuit
  totalPrice: number;            // Montant total
  currency: string;              // Devise (MATIC, USDC)
  createdAt: string;             // Date de création
  updatedAt: string;             // Date de modification
}
```

### BookingStatus

```typescript
enum BookingStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',  // En attente de paiement
  CONFIRMED = 'CONFIRMED',                // Confirmée
  CANCELLED = 'CANCELLED',                // Annulée
  PENDING = 'PENDING'                     // En attente
}
```

**Transitions d'état**

```
AWAITING_PAYMENT → CONFIRMED (après paiement validé)
AWAITING_PAYMENT → CANCELLED (annulation par l'utilisateur)
CONFIRMED → CANCELLED (annulation par l'utilisateur)
```

---

## Error Handling

### Structure des erreurs

```json
{
  "timestamp": "2026-01-14T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description détaillée de l'erreur"
}
```

### Erreurs de validation

```json
{
  "propertyId": "Property ID is required",
  "startDate": "Start date is required",
  "endDate": "End date is required"
}
```

### Codes d'erreur

| Code | Type | Description |
|------|------|-------------|
| `400` | Bad Request | Données invalides ou manquantes |
| `401` | Unauthorized | Authentification requise |
| `403` | Forbidden | Accès refusé |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Conflit (propriété non disponible) |
| `500` | Internal Server Error | Erreur serveur |
| `503` | Service Unavailable | Service indisponible |

---

## Integration Examples

### React + TypeScript

```typescript
import axios from 'axios';

interface BookingRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
}

interface BookingResponse {
  id: number;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: 'AWAITING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  tenantWalletAddress: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

class BookingService {
  private api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  constructor() {
    // Intercepteur pour ajouter le token JWT
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async createBooking(data: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await this.api.post<BookingResponse>('/bookings', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes('Wallet')) {
          throw new Error('Veuillez connecter votre wallet MetaMask');
        }
      }
      throw error;
    }
  }

  async getMyBookings(): Promise<BookingResponse[]> {
    const response = await this.api.get<BookingResponse[]>('/bookings/my-bookings');
    return response.data;
  }

  async getBooking(bookingId: number): Promise<BookingResponse> {
    const response = await this.api.get<BookingResponse>(`/bookings/${bookingId}`);
    return response.data;
  }

  async cancelBooking(bookingId: number): Promise<BookingResponse> {
    const response = await this.api.patch<BookingResponse>(
      `/bookings/${bookingId}/cancel`
    );
    return response.data;
  }
}

export const bookingService = new BookingService();
```

### Usage dans un composant React

```typescript
import React, { useState } from 'react';
import { bookingService } from './services/bookingService';

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    propertyId: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const booking = await bookingService.createBooking(formData);
      console.log('Réservation créée:', booking);
      
      // Rediriger vers la page de paiement
      window.location.href = `/payment/${booking.id}`;
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        value={formData.propertyId}
        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
        placeholder="Property ID"
        required
      />
      
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
      />
      
      <input
        type="date"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Réserver'}
      </button>
    </form>
  );
};

export default BookingForm;
```

### Vue.js 3 + Composition API

```typescript
// composables/useBooking.ts
import { ref } from 'vue';

export function useBooking() {
  const bookings = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createBooking = async (data: BookingRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMyBookings = async () => {
    loading.value = true;
    
    try {
      const response = await fetch('/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      bookings.value = await response.json();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    fetchMyBookings
  };
}
```

---

## Testing

### Jest + Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { bookingService } from './services/bookingService';
import BookingForm from './BookingForm';

jest.mock('./services/bookingService');

describe('BookingForm', () => {
  it('should create a booking successfully', async () => {
    const mockBooking = {
      id: 42,
      propertyId: '550e8400-e29b-41d4-a716-446655440001',
      status: 'AWAITING_PAYMENT',
      totalPrice: 1050
    };

    (bookingService.createBooking as jest.Mock).mockResolvedValue(mockBooking);

    render(<BookingForm />);

    fireEvent.change(screen.getByPlaceholderText('Property ID'), {
      target: { value: '550e8400-e29b-41d4-a716-446655440001' }
    });

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-02-15' }
    });

    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-02-22' }
    });

    fireEvent.click(screen.getByText('Réserver'));

    await waitFor(() => {
      expect(bookingService.createBooking).toHaveBeenCalledWith({
        propertyId: '550e8400-e29b-41d4-a716-446655440001',
        startDate: '2026-02-15',
        endDate: '2026-02-22'
      });
    });
  });

  it('should show error when wallet is not connected', async () => {
    (bookingService.createBooking as jest.Mock).mockRejectedValue(
      new Error('Veuillez connecter votre wallet MetaMask')
    );

    render(<BookingForm />);

    // Fill form and submit...

    await waitFor(() => {
      expect(screen.getByText(/wallet MetaMask/i)).toBeInTheDocument();
    });
  });
});
```

---

## Best Practices

### 1. Gestion des erreurs

```typescript
try {
  const booking = await bookingService.createBooking(data);
  // Succès
} catch (error: any) {
  if (error.response) {
    // Erreur API
    switch (error.response.status) {
      case 400:
        handleValidationError(error.response.data);
        break;
      case 401:
        redirectToLogin();
        break;
      case 403:
        showForbiddenMessage();
        break;
      case 404:
        showNotFoundMessage();
        break;
      default:
        showGenericError();
    }
  } else {
    // Erreur réseau
    showNetworkError();
  }
}
```

### 2. Retry logic pour les erreurs temporaires

```typescript
async function createBookingWithRetry(data: BookingRequest, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await bookingService.createBooking(data);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // Retry seulement pour les erreurs 503
      if (error.response?.status === 503) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
}
```

### 3. Optimistic updates

```typescript
const cancelBooking = async (bookingId: number) => {
  // Mise à jour optimiste
  const previousBookings = [...bookings];
  bookings.value = bookings.value.map(b =>
    b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
  );

  try {
    await bookingService.cancelBooking(bookingId);
  } catch (error) {
    // Rollback en cas d'erreur
    bookings.value = previousBookings;
    throw error;
  }
};
```

---

**Documentation version** : 1.0.0  
**Dernière mise à jour** : 14 janvier 2026