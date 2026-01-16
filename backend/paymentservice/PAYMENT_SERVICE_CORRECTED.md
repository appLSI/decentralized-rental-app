# Payment Service - API Documentation

## Table des matières

1. [Introduction](#introduction)
2. [Architecture blockchain](#architecture-blockchain)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
5. [Flux de paiement](#flux-de-paiement)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Integration Examples](#integration-examples)
9. [Smart Contract Integration](#smart-contract-integration)

---

## Introduction

Le **Payment Service** gère la validation des paiements blockchain effectués via les smart contracts RentalEscrow sur la blockchain Polygon.

**Base URL via Gateway**: `/api/payments`

**Service direct** (développement uniquement): `http://localhost:8084/payments`

### Caractéristiques

- ✅ Validation des transactions blockchain
- ✅ Extraction des événements `Funded` des smart contracts
- ✅ Vérification de l'intégrité des paiements
- ✅ Historique des paiements par réservation
- ✅ Gestion des erreurs blockchain

---

## Architecture blockchain

### Smart Contract RentalEscrow

Le service interagit avec les smart contracts `RentalEscrow` déployés sur Polygon.

**Réseau** : Polygon Mainnet / Mumbai Testnet

**Fonctionnalités du contrat** :
- `fund()` : Fonction payable pour déposer les fonds
- `Funded` : Événement émis lors du dépôt
- `state` : Variable d'état du contrat

### Événement Funded

```solidity
event Funded(address indexed tenant, uint256 amount);
```

**Topic Hash** : `0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4`

---

## Authentication

### Headers requis

| Header | Valeur | Obligatoire | Description |
|--------|--------|-------------|-------------|
| `Authorization` | `Bearer {token}` | ✅ Oui | Token JWT obtenu lors de la connexion |
| `X-User-Id` | `{uuid}` | ✅ Oui | UUID de l'utilisateur (injecté par la Gateway) |
| `Content-Type` | `application/json` | ✅ Oui (POST) | Type de contenu |

---

## Endpoints

### 1. Valider un paiement blockchain

Valide un paiement blockchain après que l'utilisateur ait appelé `fund()` sur le contrat RentalEscrow.

**Endpoint**
```http
POST /api/payments/validate
```

**Request Body**

```json
{
  "bookingId": 42,
  "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "expectedAmount": 1050.00
}
```

**Champs de la requête**

| Champ | Type | Obligatoire | Format | Description |
|-------|------|-------------|--------|-------------|
| `bookingId` | Long | ✅ Oui | Entier positif | ID de la réservation à valider |
| `transactionHash` | String | ✅ Oui | `^0x[a-fA-F0-9]{64}$` | Hash de la transaction blockchain (66 caractères) |
| `contractAddress` | String | ✅ Oui | `^0x[a-fA-F0-9]{40}$` | Adresse du contrat RentalEscrow (42 caractères) |
| `expectedAmount` | BigDecimal | ✅ Oui | Nombre positif | Montant attendu en MATIC/USDC |

**Validations**

- ✅ `bookingId` doit être un entier positif
- ✅ `transactionHash` doit respecter le format `0x` + 64 caractères hexadécimaux
- ✅ `contractAddress` doit respecter le format `0x` + 40 caractères hexadécimaux
- ✅ `expectedAmount` doit être un nombre positif
- ✅ L'utilisateur doit être le locataire de la réservation
- ✅ La réservation doit être en statut `AWAITING_PAYMENT`

**Processus de validation**

1. **Vérification de sécurité**
    - Récupération de la réservation depuis le Booking Service
    - Vérification que l'utilisateur est bien le locataire
    - Vérification que le statut est `AWAITING_PAYMENT`

2. **Validation blockchain**
    - Récupération du receipt de la transaction
    - Vérification que la transaction a réussi (`status: 0x1`)
    - Vérification que la destination est le bon contrat
    - Extraction de l'événement `Funded`
    - Comparaison du montant avec la tolérance (0.01%)

**Response Success (200 OK)**

```json
{
  "paymentId": 15,
  "bookingId": 42,
  "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "status": "VALIDATED",
  "amount": 1050.00,
  "currency": "MATIC",
  "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "blockNumber": 12345678,
  "validatedAt": "2026-01-14T14:35:00",
  "createdAt": "2026-01-14T14:35:00",
  "errorMessage": null
}
```

**Champs de la réponse**

| Champ | Type | Description |
|-------|------|-------------|
| `paymentId` | Long | Identifiant unique du paiement |
| `bookingId` | Long | ID de la réservation associée |
| `transactionHash` | String | Hash de la transaction validée |
| `contractAddress` | String | Adresse du contrat RentalEscrow |
| `status` | Enum | Statut du paiement (voir [Statuts](#statuts-de-paiement)) |
| `amount` | BigDecimal | Montant validé (extrait de l'événement Funded) |
| `currency` | String | Devise utilisée |
| `fromAddress` | String | Adresse wallet du payeur |
| `blockNumber` | Long | Numéro du bloc contenant la transaction |
| `validatedAt` | DateTime | Date et heure de validation |
| `createdAt` | DateTime | Date de création de l'enregistrement |
| `errorMessage` | String | Message d'erreur (null si succès) |

**Erreurs possibles**

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `400` | `Invalid transaction hash format` | Format du hash incorrect | Vérifier le format `0x[64 hex]` |
| `400` | `Invalid contract address format` | Format de l'adresse incorrect | Vérifier le format `0x[40 hex]` |
| `400` | `Booking ID is required` | Le bookingId est manquant | Fournir un bookingId |
| `400` | `Booking status is not AWAITING_PAYMENT` | La réservation n'attend pas de paiement | Vérifier le statut de la réservation |
| `401` | `Unauthorized` | Token JWT invalide | Se reconnecter |
| `403` | `Forbidden` | Vous n'êtes pas le locataire | Seul le locataire peut valider |
| `404` | `Transaction not found` | Transaction non trouvée ou non minée | Attendre 30s et réessayer |
| `500` | `Transaction failed on-chain` | La transaction a échoué | Vérifier sur PolygonScan |
| `500` | `Payment sent to wrong contract` | Mauvaise adresse de contrat | Vérifier l'adresse du contrat |
| `500` | `Funded event not found` | L'événement Funded n'existe pas | Vérifier l'appel à fund() |
| `503` | `Service Unavailable` | Le Booking Service est indisponible | Réessayer plus tard |

**Exemple d'erreur**

```json
{
  "timestamp": "2026-01-14T14:35:00",
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found or not yet mined. Please wait 30 seconds and retry."
}
```

**Erreur de validation**

```json
{
  "transactionHash": "Invalid transaction hash format. Expected: 0x[64 hex characters]",
  "contractAddress": "Invalid contract address format. Expected: 0x[40 hex characters]"
}
```

---

### 2. Récupérer l'historique des paiements

Liste tous les paiements associés à une réservation.

**Endpoint**
```http
GET /api/payments/booking/{bookingId}
```

**Path Parameters**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `bookingId` | Long | Identifiant de la réservation |

**Response Success (200 OK)**

```json
[
  {
    "paymentId": 15,
    "bookingId": 42,
    "transactionHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "status": "VALIDATED",
    "amount": 1050.00,
    "currency": "MATIC",
    "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "blockNumber": 12345678,
    "validatedAt": "2026-01-14T14:35:00",
    "createdAt": "2026-01-14T14:35:00"
  },
  {
    "paymentId": 14,
    "bookingId": 42,
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "status": "FAILED",
    "errorMessage": "Transaction not found or not yet mined",
    "createdAt": "2026-01-14T14:30:00"
  }
]
```

**Cas d'usage**

- Vérifier les tentatives de paiement précédentes
- Afficher l'historique des transactions
- Debugging en cas de problème

**Erreurs possibles**

| Code | Message | Description |
|------|---------|-------------|
| `401` | `Unauthorized` | Token JWT invalide |
| `404` | `Booking not found` | La réservation n'existe pas |

---

### 3. Health check

Vérifie que le service de paiement est opérationnel.

**Endpoint**
```http
GET /api/payments/health
```

**Aucune authentification requise**

**Response Success (200 OK)**

```text
PaymentService is running
```

---

## Flux de paiement

### Vue d'ensemble

Le flux de paiement se déroule en 3 étapes principales :

```
1. Créer la réservation (Backend)
   ↓
2. Payer avec MetaMask (Frontend + Blockchain)
   ↓
3. Valider le paiement (Backend)
```

### Étape 1 : Créer la réservation

```typescript
const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    propertyId: '550e8400-e29b-41d4-a716-446655440001',
    startDate: '2026-02-15',
    endDate: '2026-02-22'
  })
}).then(res => res.json());

// Conserver ces informations pour l'étape 2
const { id: bookingId, totalPrice, tenantWalletAddress } = booking;
```

### Étape 2 : Payer avec MetaMask

```typescript
import { ethers } from 'ethers';

// Prérequis : Un contrat RentalEscrow doit être déployé
const contractAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';

// Connexion à MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Créer l'instance du contrat
const rentalEscrow = new ethers.Contract(
  contractAddress,
  RENTAL_ESCROW_ABI,
  signer
);

// Convertir le montant en Wei
const amountInWei = ethers.utils.parseEther(totalPrice.toString());

// Appeler la fonction fund()
const tx = await rentalEscrow.fund({
  value: amountInWei,
  gasLimit: 300000
});

console.log('Transaction envoyée:', tx.hash);

// Attendre la confirmation
const receipt = await tx.wait();
console.log('Transaction confirmée dans le bloc:', receipt.blockNumber);

// Informations nécessaires pour l'étape 3
const transactionHash = tx.hash;
```

### Étape 3 : Valider le paiement

```typescript
const validation = await fetch('/api/payments/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bookingId: bookingId,
    transactionHash: transactionHash,
    contractAddress: contractAddress,
    expectedAmount: totalPrice
  })
}).then(res => res.json());

if (validation.status === 'VALIDATED') {
  console.log('✅ Paiement validé !');
  // Rediriger vers la page de confirmation
}
```

### Diagramme de séquence complet

```
┌─────────┐       ┌─────────┐       ┌───────────┐       ┌─────────┐
│Frontend │       │MetaMask │       │ Blockchain│       │ Backend │
└────┬────┘       └────┬────┘       └─────┬─────┘       └────┬────┘
     │                 │                  │                  │
     │ POST /bookings                                        │
     │────────────────────────────────────────────────────>  │
     │                 │                  │                  │
     │ <───────────────────────────────── bookingId, totalPrice
     │                 │                  │                  │
     │ fund()          │                  │                  │
     │───────────────> │                  │                  │
     │                 │ Confirm tx       │                  │
     │                 │────────────────> │                  │
     │                 │                  │ emit Funded      │
     │                 │                  │─────────────────>│
     │ txHash          │                  │                  │
     │ <───────────────│                  │                  │
     │                 │                  │                  │
     │ POST /payments/validate                               │
     │────────────────────────────────────────────────────>  │
     │                 │                  │                  │
     │                 │                  │ <──── fetch receipt
     │                 │                  │                  │
     │ <───────────────────────────────── paymentId, status  │
     │                 │                  │                  │
```

---

## Data Models

### PaymentValidationRequestDTO

```typescript
interface PaymentValidationRequestDTO {
  bookingId: number;           // ID de la réservation (obligatoire)
  transactionHash: string;     // Hash 0x + 64 hex (obligatoire)
  contractAddress: string;     // Adresse 0x + 40 hex (obligatoire)
  expectedAmount: number;      // Montant positif (obligatoire)
}
```

**Contraintes de validation**

```typescript
// Regex pour transactionHash
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

// Regex pour contractAddress
const CONTRACT_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Exemple de validation
function validatePaymentRequest(request: PaymentValidationRequestDTO): boolean {
  if (!request.bookingId || request.bookingId <= 0) {
    return false;
  }
  
  if (!TX_HASH_REGEX.test(request.transactionHash)) {
    return false;
  }
  
  if (!CONTRACT_ADDRESS_REGEX.test(request.contractAddress)) {
    return false;
  }
  
  if (!request.expectedAmount || request.expectedAmount <= 0) {
    return false;
  }
  
  return true;
}
```

### PaymentResponseDTO

```typescript
interface PaymentResponseDTO {
  paymentId: number;              // ID unique du paiement
  bookingId: number;              // ID de la réservation
  transactionHash: string;        // Hash de la transaction
  contractAddress: string;        // Adresse du contrat
  status: PaymentStatus;          // Statut du paiement
  amount: number;                 // Montant validé
  currency: string;               // Devise (MATIC, USDC)
  fromAddress: string;            // Adresse du payeur
  blockNumber: number;            // Numéro de bloc
  validatedAt: string;            // Date de validation
  createdAt: string;              // Date de création
  errorMessage?: string;          // Message d'erreur (optionnel)
}
```

### PaymentStatus

```typescript
enum PaymentStatus {
  VALIDATED = 'VALIDATED',    // Paiement validé avec succès
  FAILED = 'FAILED',          // Échec de la validation
  PENDING = 'PENDING'         // Validation en cours
}
```

---

## Error Handling

### Gestion des erreurs blockchain

```typescript
async function validatePaymentWithRetry(
  paymentData: PaymentValidationRequestDTO,
  maxRetries: number = 3
): Promise<PaymentResponseDTO> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('/api/payments/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json();

      // Transaction not mined yet - retry
      if (response.status === 404 && attempt < maxRetries - 1) {
        console.log(`Transaction not mined yet. Retrying in ${(attempt + 1) * 10}s...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 10000));
        continue;
      }

      // Other errors - don't retry
      throw new Error(error.message);

    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }

  throw new Error('Max retries reached');
}
```

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Transaction not found` | Transaction pas encore minée | Attendre 30s et réessayer |
| `Invalid transaction hash format` | Mauvais format du hash | Vérifier le format `0x[64 hex]` |
| `Payment sent to wrong contract` | Mauvaise adresse de contrat | Utiliser le bon contrat RentalEscrow |
| `Funded event not found` | Événement pas émis | Vérifier l'appel à `fund()` |
| `Service Unavailable` | Booking Service down | Réessayer plus tard |

---

## Integration Examples

### Fonction complète de paiement

```typescript
import { ethers } from 'ethers';

interface PaymentResult {
  success: boolean;
  payment?: PaymentResponseDTO;
  error?: string;
}

async function processPayment(
  bookingId: number,
  contractAddress: string,
  amount: number
): Promise<PaymentResult> {
  try {
    // Étape 1 : Vérifier MetaMask
    if (!window.ethereum) {
      return {
        success: false,
        error: 'MetaMask is not installed'
      };
    }

    // Étape 2 : Effectuer le paiement blockchain
    console.log('🔐 Connecting to MetaMask...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    console.log('💰 Sending payment...');
    const rentalEscrow = new ethers.Contract(
      contractAddress,
      RENTAL_ESCROW_ABI,
      signer
    );

    const amountInWei = ethers.utils.parseEther(amount.toString());
    
    const tx = await rentalEscrow.fund({
      value: amountInWei,
      gasLimit: 300000
    });

    console.log('⏳ Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    // Étape 3 : Valider le paiement
    console.log('🔍 Validating payment...');
    
    const payment = await validatePaymentWithRetry({
      bookingId,
      transactionHash: tx.hash,
      contractAddress,
      expectedAmount: amount
    });

    console.log('✅ Payment validated:', payment);

    return {
      success: true,
      payment
    };

  } catch (error: any) {
    console.error('❌ Payment error:', error);

    // Gérer les erreurs MetaMask
    if (error.code === 4001) {
      return {
        success: false,
        error: 'Transaction rejected by user'
      };
    }

    if (error.code === -32603) {
      return {
        success: false,
        error: 'Insufficient funds'
      };
    }

    return {
      success: false,
      error: error.message || 'Payment failed'
    };
  }
}
```

### React Hook personnalisé

```typescript
import { useState, useCallback } from 'react';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponseDTO | null>(null);

  const processPayment = useCallback(async (
    bookingId: number,
    contractAddress: string,
    amount: number
  ) => {
    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const result = await processPayment(bookingId, contractAddress, amount);

      if (result.success && result.payment) {
        setPayment(result.payment);
        return result.payment;
      } else {
        setError(result.error || 'Payment failed');
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPayment = useCallback(() => {
    setPayment(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    payment,
    processPayment,
    resetPayment
  };
}
```

### Composant de paiement

```typescript
import React from 'react';
import { usePayment } from './hooks/usePayment';

interface PaymentButtonProps {
  bookingId: number;
  contractAddress: string;
  amount: number;
  onSuccess: (payment: PaymentResponseDTO) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookingId,
  contractAddress,
  amount,
  onSuccess
}) => {
  const { loading, error, processPayment } = usePayment();

  const handlePayment = async () => {
    try {
      const payment = await processPayment(bookingId, contractAddress, amount);
      onSuccess(payment);
    } catch (err) {
      // Error is already set in the hook
      console.error('Payment failed:', err);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="payment-button"
      >
        {loading ? (
          <>
            <Spinner />
            Processing payment...
          </>
        ) : (
          `Pay ${amount} MATIC`
        )}
      </button>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
```

---

## Smart Contract Integration

### ABI du contrat RentalEscrow

```typescript
export const RENTAL_ESCROW_ABI = [
  {
    "inputs": [],
    "name": "fund",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tenant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
```

### Vérification de l'état du contrat

```typescript
async function getContractState(contractAddress: string): Promise<number> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const rentalEscrow = new ethers.Contract(
    contractAddress,
    RENTAL_ESCROW_ABI,
    provider
  );

  const state = await rentalEscrow.state();
  return state;
}

// États possibles :
// 0: CREATED
// 1: FUNDED
// 2: RELEASED
// 3: REFUNDED
```

### Écoute des événements en temps réel

```typescript
function listenToFundedEvent(
  contractAddress: string,
  callback: (tenant: string, amount: BigNumber) => void
): void {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const rentalEscrow = new ethers.Contract(
    contractAddress,
    RENTAL_ESCROW_ABI,
    provider
  );

  // Écouter l'événement Funded
  rentalEscrow.on('Funded', (tenant, amount, event) => {
    console.log('🎉 Funded event detected!');
    console.log('Tenant:', tenant);
    console.log('Amount:', ethers.utils.formatEther(amount), 'MATIC');
    
    callback(tenant, amount);
  });
}
```

---

## Testing

### Mock du service de paiement

```typescript
// __mocks__/paymentService.ts
export const mockPaymentService = {
  validatePayment: jest.fn(),
  getPaymentHistory: jest.fn()
};

// Test
import { mockPaymentService } from './__mocks__/paymentService';

describe('Payment validation', () => {
  it('should validate payment successfully', async () => {
    const mockPayment: PaymentResponseDTO = {
      paymentId: 15,
      bookingId: 42,
      transactionHash: '0x1234...',
      status: 'VALIDATED',
      amount: 1050,
      currency: 'MATIC',
      fromAddress: '0xabc...',
      blockNumber: 12345678,
      validatedAt: '2026-01-14T14:35:00',
      createdAt: '2026-01-14T14:35:00',
      contractAddress: '0x742d...'
    };

    mockPaymentService.validatePayment.mockResolvedValue(mockPayment);

    const result = await mockPaymentService.validatePayment({
      bookingId: 42,
      transactionHash: '0x1234...',
      contractAddress: '0x742d...',
      expectedAmount: 1050
    });

    expect(result.status).toBe('VALIDATED');
    expect(result.amount).toBe(1050);
  });
});
```

---

## Best Practices

### 1. Toujours vérifier MetaMask

```typescript
if (typeof window.ethereum === 'undefined') {
  throw new Error('Please install MetaMask');
}

// Vérifier le réseau
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
const POLYGON_CHAIN_ID = '0x89'; // 137 en hexadécimal

if (chainId !== POLYGON_CHAIN_ID) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: POLYGON_CHAIN_ID }]
  });
}
```

### 2. Gérer les erreurs de gas

```typescript
try {
  const gasEstimate = await rentalEscrow.estimateGas.fund({ value: amountInWei });
  const gasLimit = gasEstimate.mul(120).div(100); // +20% de marge

  const tx = await rentalEscrow.fund({
    value: amountInWei,
    gasLimit
  });
} catch (error) {
  console.error('Gas estimation failed:', error);
  // Utiliser une limite de gas fixe en fallback
  const tx = await rentalEscrow.fund({
    value: amountInWei,
    gasLimit: 300000
  });
}
```

### 3. Afficher la progression

```typescript
async function paymentWithProgress(
  bookingId: number,
  contractAddress: string,
  amount: number,
  onProgress: (step: string, progress: number) => void
): Promise<PaymentResponseDTO> {
  onProgress('Connecting to wallet...', 10);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  onProgress('Sending transaction...', 30);
  const rentalEscrow = new ethers.Contract(contractAddress, RENTAL_ESCROW_ABI, signer);
  const tx = await rentalEscrow.fund({ value: ethers.utils.parseEther(amount.toString()) });

  onProgress('Waiting for confirmation...', 50);
  await tx.wait();

  onProgress('Validating payment...', 70);
  const payment = await validatePaymentWithRetry({ bookingId, transactionHash: tx.hash, contractAddress, expectedAmount: amount });

  onProgress('Payment complete!', 100);
  return payment;
}
```

---

**Documentation version** : 1.0.0  
**Dernière mise à jour** : 14 janvier 2026