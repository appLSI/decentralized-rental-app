# 📚 API Documentation - Decentralized Rental Platform

## 🎯 Overview

**Version:** 2.1.0  
**Last Updated:** January 10, 2026  
**Base URL (Production):** `https://api.rental-platform.com`  
**Base URL (Development):** `http://localhost:8082`

### Architecture

```
┌─────────────────────────────────────────────────────┐
│            Frontend (React/Next.js)                 │
│         http://localhost:3000 | :5173               │
└────────────────────┬────────────────────────────────┘
                     │
                     │ All requests via Gateway
                     ▼
┌─────────────────────────────────────────────────────┐
│         🌐 API Gateway (Port 8082)                  │
│         ✅ CORS Configuration                        │
│         ✅ JWT Authentication                        │
│         ✅ Rate Limiting (100 req/min)              │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┴────────┬────────────┬─────────────┐
    ▼                 ▼            ▼             ▼
┌─────────┐    ┌──────────┐  ┌─────────┐  ┌──────────┐
│  Auth   │    │ Listing  │  │ Booking │  │ Payment  │
│ :8080   │    │  :8081   │  │  :8083  │  │  :8084   │
│(internal)│   │(internal)│  │(internal)│ │(internal)│
└─────────┘    └──────────┘  └─────────┘  └──────────┘
     │               │              │            │
     └───────────────┴──────────────┴────────────┘
                     │
                     ▼
            ┌────────────────┐
            │   RabbitMQ     │
            │   Message Bus  │
            └────────────────┘
```

### Key Features

- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **JWT Authentication** - Secure token-based auth (24h expiration)
- ✅ **Role-Based Access Control** - USER, ADMIN, AGENT roles
- ✅ **Web3 Integration** - Ethereum wallet support for payments
- ✅ **Event-Driven** - RabbitMQ for async communication
- ✅ **CORS Configured** - Centralized at Gateway level
- ✅ **RESTful API** - Standard HTTP methods and status codes

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User Registration → POST /api/auth/users
   └─> OTP sent to email
   
2. Email Verification → POST /api/auth/users/verify-otp
   └─> Account activated
   
3. Login → POST /api/auth/users/login
   └─> JWT token returned in Authorization header
   
4. Protected Requests → Include header:
   Authorization: Bearer {token}
   X-User-Id: {userId}
```

### JWT Token Structure

```json
{
  "sub": "user@example.com",
  "userId": "abc123-def456",
  "roles": ["USER"],
  "types": ["CLIENT", "OWNER"],
  "exp": 1640995200
}
```

### Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **USER** | Standard user | Create bookings, manage profile |
| **OWNER** | Property owner | Create properties, manage listings |
| **AGENT** | Support agent | Limited admin access |
| **ADMIN** | Administrator | Full system access |

### Default Admin Account

```json
{
  "email": "daar.chain@gmail.com",
  "password": "Admin@123"
}
```

⚠️ **Security Note:** Change default password immediately in production!

---

## 📍 Service Endpoints

### Gateway (Port 8082)

**⚠️ IMPORTANT:** All API requests MUST go through the Gateway. Direct service access is internal only.

| Service | Gateway URL | Direct Port (Internal) |
|---------|-------------|------------------------|
| Gateway Health | `/health` | N/A |
| Auth Service | `/api/auth/*` | 8080 (internal) |
| Listing Service | `/api/listings/*` | 8081 (internal) |
| Booking Service | `/api/bookings/*` | 8083 (internal) |
| Payment Service | `/api/payments/*` | 8084 (internal) |

---

## 🔑 Auth Service

### Base Path: `/api/auth`

### User Registration

**Create new user account with OTP verification**

```http
POST /api/auth/users
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "dateOfBirth": "1990-05-15",
  "types": ["CLIENT", "OWNER"]
}
```

**Response: `201 Created`**

```json
{
  "message": "User created successfully. A verification code has been sent to your email.",
  "userId": "abc123-def456",
  "email": "john.doe@example.com"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

**User Types:**
- `CLIENT` - Can make bookings
- `OWNER` - Can create and manage properties

---

### Email Verification

**Verify email with OTP code**

```http
POST /api/auth/users/verify-otp
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Response: `200 OK`**

```json
{
  "message": "Email verified successfully! You can now log in.",
  "status": "success"
}
```

**Notes:**
- OTP expires after 15 minutes
- Max 3 attempts before new code required
- Use `/resend-otp` to get a new code

---

### Login

**Authenticate and receive JWT token**

```http
POST /api/auth/users/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response: `200 OK`**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInVzZXJJZCI6ImFiYzEyMy1kZWY0NTYiLCJyb2xlcyI6WyJVU0VSIl0sInR5cGVzIjpbIkNMSUVOVCIsIk9XTkVSIl0sImV4cCI6MTY0MDk5NTIwMH0.xxx
user_id: abc123-def456
```

**Body:**
```json
{
  "userId": "abc123-def456",
  "email": "john.doe@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "roles": ["USER"],
  "types": ["CLIENT", "OWNER"]
}
```

**⚠️ CRITICAL:** The JWT token is in the `Authorization` header, NOT the response body!

**Common Errors:**

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Email or password incorrect | Invalid credentials |
| 403 | Please verify your email | Email not verified |

---

### Wallet Management

#### Connect Wallet

**Connect Web3 wallet to user account (first time)**

```http
POST /api/auth/users/{userId}/wallet/connect
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response: `200 OK`**

```json
{
  "message": "Wallet connected successfully",
  "userId": "abc123-def456",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Validations:**
- Must be valid Ethereum address (0x + 40 hex chars)
- Wallet cannot be used by another account
- User must own the account

**Events Published:**
- `user.wallet.connected` → Listing, Booking, Payment services

---

#### Disconnect Wallet

**⚠️ Disconnect wallet with business rules validation**

```http
DELETE /api/auth/users/{userId}/wallet/disconnect
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response: `200 OK`**

```json
{
  "message": "Wallet disconnected successfully",
  "userId": "abc123-def456"
}
```

**Pre-Disconnect Validations:**

The system performs **synchronous checks** before allowing disconnection:

| Check | Service | Condition |
|-------|---------|-----------|
| ✅ Active Properties | Listing | No properties with status `ACTIVE` |
| ✅ Future Bookings (Host) | Booking | No upcoming bookings as property owner |
| ✅ Active Bookings (Client) | Booking | No current/future bookings as tenant |

**Error Response: `409 Conflict`**

```json
{
  "message": "Cannot disconnect wallet: you have 2 active property(ies). Hide them first (status HIDDEN).",
  "status": "blocked"
}
```

**Possible Block Reasons:**
1. **Active Properties:** User has properties listed with `ACTIVE` status
    - Solution: Set properties to `HIDDEN` or `INACTIVE` first
2. **Future Host Bookings:** User has upcoming bookings for their properties
    - Solution: Cancel or complete bookings first
3. **Active Client Bookings:** User has active/future bookings as tenant
    - Solution: Cancel bookings or wait for completion

**Events Published:**
- `user.wallet.disconnected` → All services update their records

---

#### Get Wallet Status

**Check if user has connected wallet**

```http
GET /api/auth/users/{userId}/wallet/status
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response: `200 OK`**

```json
{
  "userId": "abc123-def456",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "exists": true
}
```

**If no wallet:**

```json
{
  "userId": "abc123-def456",
  "walletAddress": null,
  "exists": false
}
```

---

### Password Reset

#### Request Reset

```http
POST /api/auth/users/forgot-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response: `200 OK`**

```json
{
  "message": "A reset code has been sent to your email.",
  "status": "success"
}
```

#### Reset Password

```http
POST /api/auth/users/reset-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response: `200 OK`**

```json
{
  "message": "Password reset successfully.",
  "status": "success"
}
```

---

### Admin Operations

#### Create Agent

**Create agent account (Admin only)**

```http
POST /api/auth/users/admin/agents
Authorization: Bearer {adminToken}
X-User-Id: {adminUserId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstname": "Support",
  "lastname": "Agent",
  "email": "agent@example.com",
  "password": "AgentPass123!",
  "phone": "+1234567890"
}
```

**Response: `201 Created`**

```json
{
  "message": "Agent created successfully.",
  "agentId": "agent123-456",
  "email": "agent@example.com",
  "roles": ["AGENT"]
}
```

#### List All Agents

```http
GET /api/auth/users/admin/agents
Authorization: Bearer {adminToken}
X-User-Id: {adminUserId}
```

**Response: `200 OK`**

```json
[
  {
    "userId": "agent123-456",
    "firstname": "Support",
    "lastname": "Agent",
    "email": "agent@example.com",
    "phone": "+1234567890",
    "roles": ["AGENT"],
    "emailVerificationStatus": true
  }
]
```

#### Delete Agent

```http
DELETE /api/auth/users/admin/agents/{agentId}
Authorization: Bearer {adminToken}
X-User-Id: {adminUserId}
```

**Response: `200 OK`**

```json
{
  "message": "Agent deleted successfully.",
  "agentId": "agent123-456"
}
```

---

## 🏠 Listing Service

### Base Path: `/api/listings`

### Property Management

#### Create Property

**⚠️ Requires OWNER type and connected wallet**

```http
POST /api/listings/properties
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Modern Apartment in Paris",
  "description": "Beautiful apartment with Eiffel Tower view",
  "propertyType": "APARTMENT",
  "address": "123 Champs-Élysées",
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "zipCode": "75008",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "pricePerNight": 250.00,
  "nbOfBedrooms": 3,
  "nbOfBathrooms": 2,
  "nbOfGuests": 6,
  "nbOfBeds": 4,
  "characteristics": [
    {"id": 1},
    {"id": 5}
  ]
}
```

**Property Types:**
- `APARTMENT`
- `HOUSE`
- `VILLA`
- `STUDIO`
- `ROOM`

**Response: `201 Created`**

```json
{
  "message": "Property created successfully",
  "property": {
    "propertyId": "prop123-abc",
    "title": "Modern Apartment in Paris",
    "ownerId": "abc123-def456",
    "status": "DRAFT",
    "isValidated": false,
    "isDraft": true,
    "isHidden": false,
    "pricePerNight": 250.00,
    "city": "Paris",
    "country": "France",
    "createdAt": "2026-01-10T12:00:00Z"
  }
}
```

**Pre-Creation Check:**
```http
GET /api/listings/owners/check/{userId}
```

Returns:
```json
{
  "exists": true,
  "hasWalletAddress": true,
  "canCreateProperty": true,
  "message": "Owner is ready to create properties."
}
```

---

#### Search Properties

**Search with filters**

```http
GET /api/listings/properties/search
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | Filter by city |
| `type` | string | Property type (APARTMENT, HOUSE, etc.) |
| `minPrice` | decimal | Minimum price per night |
| `maxPrice` | decimal | Maximum price per night |
| `nbOfGuests` | integer | Minimum guest capacity |
| `page` | integer | Page number (default: 0) |
| `size` | integer | Page size (default: 20) |

**Example:**

```http
GET /api/listings/properties/search?city=Paris&minPrice=100&maxPrice=300&nbOfGuests=4&page=0&size=10
```

**Response: `200 OK`**

```json
{
  "content": [
    {
      "propertyId": "prop123-abc",
      "title": "Modern Apartment in Paris",
      "city": "Paris",
      "country": "France",
      "pricePerNight": 250.00,
      "nbOfBedrooms": 3,
      "nbOfBathrooms": 2,
      "nbOfGuests": 6,
      "imageFolderPath": ["https://..."],
      "status": "ACTIVE",
      "isValidated": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 45,
  "totalPages": 5
}
```

---

#### Nearby Properties

**Find properties near coordinates**

```http
GET /api/listings/properties/nearby
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | decimal | ✅ | Latitude coordinate |
| `longitude` | decimal | ✅ | Longitude coordinate |
| `radius` | decimal | ❌ | Search radius in km (default: 10) |
| `page` | integer | ❌ | Page number (default: 0) |
| `size` | integer | ❌ | Page size (default: 20) |

**Example:**

```http
GET /api/listings/properties/nearby?latitude=48.8566&longitude=2.3522&radius=5&size=10
```

**Response: `200 OK`**

```json
{
  "content": [
    {
      "propertyId": "prop123-abc",
      "title": "Modern Apartment",
      "distance": 2.3,
      "distanceUnit": "km",
      "city": "Paris",
      "pricePerNight": 250.00,
      "latitude": 48.8600,
      "longitude": 2.3500,
      "imageFolderPath": ["https://..."]
    }
  ],
  "totalElements": 8
}
```

---

#### Upload Property Images

```http
POST /api/listings/properties/{propertyId}/images
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: multipart/form-data
```

**Form Data:**

```
images: [file1.jpg, file2.jpg, file3.jpg]
```

**Response: `200 OK`**

```json
{
  "message": "Images uploaded successfully",
  "imagePaths": [
    "prop123-abc/image1.jpg",
    "prop123-abc/image2.jpg",
    "prop123-abc/image3.jpg"
  ],
  "totalImages": 3
}
```

**Restrictions:**
- Max 10 images per property
- Accepted formats: JPG, JPEG, PNG
- Max size: 5MB per image

---

## 📅 Booking Service

### Base Path: `/api/bookings`

### Create Booking

**⚠️ Requires connected wallet in Auth Service**

```http
POST /api/bookings
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": 123,
  "startDate": "2026-02-01",
  "endDate": "2026-02-07"
}
```

**Wallet Retrieval Flow:**

```
1. User submits booking request
   ↓
2. BookingService calls AuthService via Feign
   GET /users/{userId}/wallet/status
   ↓
3. Wallet validation:
   ✅ Wallet exists → Booking created with AWAITING_PAYMENT
   ❌ No wallet → Error 400 "Connect wallet first"
   ↓
4. Response with bookingId & totalPrice for payment
```

**Response: `201 Created`**

```json
{
  "id": 456,
  "propertyId": 123,
  "propertyTitle": "Modern Apartment in Paris",
  "userId": "abc123-def456",
  "tenantWalletAddress": "0x1234...7890",
  "startDate": "2026-02-01",
  "endDate": "2026-02-07",
  "numberOfNights": 6,
  "pricePerNight": 250.00,
  "totalPrice": 1500.00,
  "currency": "ETH",
  "status": "AWAITING_PAYMENT",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

**Booking Status Flow:**

```
AWAITING_PAYMENT (15 min timeout)
    ↓
    ├─→ CONFIRMED (payment validated)
    ├─→ CANCELLED (user cancellation)
    └─→ EXPIRED (payment timeout)
```

**Auto-Expiration:**
- Scheduler runs every 2 minutes
- Bookings in `AWAITING_PAYMENT` older than 15 minutes → `EXPIRED`
- Event published: `booking.expired`

**Validations:**

| Check | Error Message |
|-------|---------------|
| Property status | "Property must be ACTIVE" |
| Date overlap | "These dates are not available" |
| Guest capacity | "Number of guests exceeds capacity" |
| Start date | "Start date cannot be in the past" |
| End date | "End date must be after start date" |
| No wallet | "You must connect your wallet first" |

---

### Cancel Booking

```http
PATCH /api/bookings/{bookingId}/cancel
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "cancellationReason": "Change of travel plans"
}
```

**Response: `200 OK`**

```json
{
  "id": 456,
  "status": "CANCELLED",
  "cancellationReason": "Change of travel plans",
  "cancelledAt": "2026-01-10T15:00:00Z",
  "refundAmount": 1500.00,
  "refundStatus": "PENDING"
}
```

**Cancellation Policy:**

| Time Before Check-in | Refund |
|---------------------|--------|
| > 7 days | 100% |
| 3-7 days | 50% |
| < 3 days | 0% |

**Restrictions:**
- Only booking owner can cancel
- `COMPLETED` bookings cannot be cancelled
- Already `CANCELLED` bookings cannot be re-cancelled

---

### Get My Bookings

```http
GET /api/bookings/my-bookings
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Query Parameters:**

| Parameter | Type | Values |
|-----------|------|--------|
| `status` | string | PENDING, CONFIRMED, CANCELLED, EXPIRED |
| `upcoming` | boolean | true/false |
| `past` | boolean | true/false |

**Example:**

```http
GET /api/bookings/my-bookings?status=CONFIRMED&upcoming=true
```

**Response: `200 OK`**

```json
[
  {
    "id": 456,
    "propertyId": 123,
    "propertyTitle": "Modern Apartment in Paris",
    "propertyImage": "https://...",
    "startDate": "2026-02-01",
    "endDate": "2026-02-07",
    "numberOfNights": 6,
    "totalPrice": 1500.00,
    "status": "CONFIRMED",
    "canCancel": true
  }
]
```

---

## 💳 Payment Service

### Base Path: `/api/payments`

### Validate Payment

**⚠️ Called by frontend AFTER user calls fund() on smart contract**

```http
POST /api/payments/validate
Authorization: Bearer {token}
X-User-Id: {userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "bookingId": 456,
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "expectedAmount": 1500.00
}
```

**Validation Process:**

```
1. Check transaction exists on blockchain
   ↓
2. Verify transaction status = SUCCESS
   ↓
3. Parse "Funded" event from logs
   ↓
4. Verify amount matches (±0.01% tolerance)
   ↓
5. Check contract state = FUNDED
   ↓
6. Save payment with status CONFIRMED
   ↓
7. Publish event: payment.confirmed
   ↓
8. BookingService updates booking → CONFIRMED
```

**Response: `200 OK`**

```json
{
  "paymentId": 789,
  "bookingId": 456,
  "transactionHash": "0xabcdef...",
  "contractAddress": "0x1234...",
  "status": "CONFIRMED",
  "amount": 1500.00,
  "currency": "MATIC",
  "fromAddress": "0x1234...7890",
  "blockNumber": 12345678,
  "paidAt": "2026-01-10T12:05:00Z",
  "confirmation": {
    "bookingConfirmed": true
  }
}
```

**Payment Status:**

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting blockchain confirmation |
| `VALIDATING` | Verification in progress |
| `CONFIRMED` | Payment validated, booking confirmed |
| `FAILED` | Validation failed |

**Common Errors:**

| Status | Message |
|--------|---------|
| 404 | "Transaction not found or not yet mined" |
| 400 | "Transaction failed on-chain" |
| 400 | "Payment sent to wrong contract" |
| 400 | "Funded event not found" |
| 400 | "Amount mismatch" |

---

### Get Payment History

```http
GET /api/payments/booking/{bookingId}
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response: `200 OK`**

```json
[
  {
    "paymentId": 789,
    "bookingId": 456,
    "transactionHash": "0xabcdef...",
    "status": "CONFIRMED",
    "amount": 1500.00,
    "currency": "MATIC",
    "paidAt": "2026-01-10T12:05:00Z"
  }
]
```

---

## 🔄 Event-Driven Architecture

### RabbitMQ Events

#### User Events (Auth → Listing)

**Exchange:** `user.exchange`

| Event | Routing Key | Payload | Consumers |
|-------|-------------|---------|-----------|
| User Created | `user.created` | `{userId, walletAddress}` | Listing |
| User Updated | `user.updated` | `{userId, walletAddress}` | Listing |
| Wallet Connected | `user.wallet.connected` | `{userId, walletAddress}` | Listing, Booking, Payment |
| Wallet Updated | `user.wallet.updated` | `{userId, newWalletAddress, oldWalletAddress}` | All services |
| Wallet Disconnected | `user.wallet.disconnected` | `{userId, disconnectedWalletAddress}` | All services |

#### Booking Events

**Exchange:** `rental.exchange`

| Event | Routing Key | Payload | Consumers |
|-------|-------------|---------|-----------|
| Booking Created | `booking.created` | `{id, totalPrice}` | Payment |
| Booking Confirmed | `booking.confirmed` | `{bookingId, transactionId}` | Listing |
| Booking Cancelled | `booking.cancelled` | `{bookingId, reason}` | Listing, Payment |
| Booking Expired | `booking.expired` | `{bookingId, propertyId}` | Listing |

#### Payment Events

**Exchange:** `payment.exchange`

| Event | Routing Key | Payload | Consumers |
|-------|-------------|---------|-----------|
| Payment Confirmed | `payment.confirmed` | `{bookingId, transactionId, amount}` | Booking |
| Payment Failed | `payment.failed` | `{bookingId, reason}` | Booking |

### Dead Letter Queue

**Queue:** `rental.dlq`  
**Purpose:** Capture failed message processing for manual retry

---

## 📊 Standard Response Formats

### Success Response

```json
{
  "data": { /* response data */ },
  "status": "success",
  "timestamp": "2026-01-10T12:00:00Z"
}
```

### Error Response

```json
{
  "timestamp": "2026-01-10T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "path": "/api/endpoint",
  "code": "VALIDATION_ERROR"
}
```

### Pagination Response

```json
{
  "content": [ /* array of items */ ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## ⚠️ HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET, PUT, PATCH |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Invalid request format or parameters |
| **401** | Unauthorized | Missing or invalid JWT token |
| **403** | Forbidden | Valid token but insufficient permissions |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Resource conflict (e.g., duplicate email) |
| **422** | Unprocessable Entity | Valid syntax but semantic errors |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side error |
| **503** | Service Unavailable | Service temporarily down |

---

## 🔒 Security Best Practices

### For Developers

1. **Never expose service ports directly** - Always use Gateway
2. **Store JWT securely** - Use httpOnly cookies in production
3. **Validate input** - Always validate on both frontend and backend
4. **Use HTTPS** - Required in production
5. **Implement rate limiting** - Prevent abuse
6. **Log sensitive operations** - Audit trail for security

### JWT Token Management

```javascript
// ✅ Correct: Store in memory or httpOnly cookie
const token = response.headers.get('Authorization');
localStorage.setItem('token', token); // ❌ Avoid in production

// ✅ Better: Use httpOnly cookies
// Set by server: Set-Cookie: token={jwt}; HttpOnly; Secure; SameSite=Strict
```

### Request Headers

**All authenticated requests must include:**

```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
X-User-Id: abc123-def456
Content-Type: application/json
```

---

## 🧪 Testing Guide

### Using cURL

#### Register User

```bash
curl -X POST http://localhost:8082/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Test",
    "lastname": "User",
    "email": "test@example.com",
    "password": "Test@123",
    "types": ["CLIENT"]
  }'
```

#### Login

```bash
curl -v -X POST http://localhost:8082/api/auth/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Extract token from response header:**

```bash
# Token is in Authorization header
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

#### Search Properties

```bash
curl -X GET "http://localhost:8082/api/listings/properties/search?city=Paris&minPrice=100&maxPrice=300" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID"
```

#### Create Booking

```bash
curl -X POST http://localhost:8082/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": 123,
    "startDate": "2026-02-01",
    "endDate": "2026-02-07"
  }'
```

### Using Postman

1. **Create Environment Variables:**
    - `base_url`: `http://localhost:8082`
    - `token`: (set after login)
    - `user_id`: (set after login)

2. **Auto-Extract Token from Login:**
   ```javascript
   // In Tests tab of login request
   const authHeader = pm.response.headers.get('Authorization');
   const token = authHeader.replace('Bearer ', '');
   pm.environment.set('token', token);
   
   const userId = pm.response.headers.get('user_id');
   pm.environment.set('user_id', userId);
   ```

3. **Use Variables in Requests:**
   ```
   URL: {{base_url}}/api/listings/properties
   Headers:
     Authorization: Bearer {{token}}
     X-User-Id: {{user_id}}
   ```

---

## 📱 Complete User Flows

### Flow 1: New User Registration → Booking

```
1. Register Account
   POST /api/auth/users
   
2. Verify Email
   POST /api/auth/users/verify-otp
   
3. Login
   POST /api/auth/users/login
   → Save JWT token
   
4. Connect Wallet (Required for bookings)
   POST /api/auth/users/{userId}/wallet/connect
   
5. Search Properties
   GET /api/listings/properties/search
   
6. Create Booking
   POST /api/bookings
   → Receives bookingId, totalPrice, contractAddress
   
7. Pay via MetaMask (Frontend)
   → Call fund() on smart contract
   → Wait for transaction confirmation
   
8. Validate Payment
   POST /api/payments/validate
   → Booking status changes to CONFIRMED
```

### Flow 2: Property Owner Journey

```
1. Register with OWNER type
   POST /api/auth/users
   types: ["OWNER"]
   
2. Verify Email
   POST /api/auth/users/verify-otp
   
3. Login
   POST /api/auth/users/login
   
4. Connect Wallet (Required)
   POST /api/auth/users/{userId}/wallet/connect
   
5. Check Owner Status
   GET /api/listings/owners/check/{userId}
   → Verify wallet connected
   
6. Create Property
   POST /api/listings/properties
   
7. Upload Images
   POST /api/listings/properties/{propertyId}/images
   
8. Submit for Review (optional)
   POST /api/listings/properties/{propertyId}/submit
   
9. Activate Property
   PATCH /api/listings/properties/{propertyId}/status
   { "isHidden": false, "isDraft": false }
```

### Flow 3: Wallet Disconnection

```
1. User wants to disconnect wallet
   
2. System checks:
   ✓ Active properties?
   ✓ Future bookings as host?
   ✓ Active bookings as client?
   
3a. If checks pass:
    DELETE /api/auth/users/{userId}/wallet/disconnect
    → Wallet disconnected
    → Events published to all services
    
3b. If checks fail:
    → 409 Conflict response
    → Detailed error message
    → User must resolve issues first
```

---

## 🐛 Common Issues & Solutions

### Issue: "Token expired or invalid"

**Cause:** JWT token has expired (24h lifetime)

**Solution:**
```javascript
// Re-authenticate
POST /api/auth/users/login
// Get new token from response headers
```

### Issue: "Wallet not connected"

**Cause:** User trying to create booking without connected wallet

**Solution:**
```javascript
// Connect wallet first
POST /api/auth/users/{userId}/wallet/connect
{
  "walletAddress": "0x..."
}
```

### Issue: "Cannot disconnect wallet"

**Cause:** User has active properties or bookings

**Solution:**
1. Check what's blocking:
   ```bash
   # Returns detailed error message
   DELETE /api/auth/users/{userId}/wallet/disconnect
   ```

2. Resolve issues:
    - Hide active properties
    - Cancel future bookings
    - Complete active bookings

### Issue: "CORS error"

**Cause:** Request not going through Gateway

**Solution:**
```javascript
// ❌ Wrong
fetch('http://localhost:8080/users')

// ✅ Correct
fetch('http://localhost:8082/api/auth/users')
```

### Issue: "Transaction not found"

**Cause:** Transaction not yet mined on blockchain

**Solution:**
- Wait 30-60 seconds after MetaMask confirmation
- Check transaction status on blockchain explorer
- Retry validation

---

## 📈 Rate Limits

| Endpoint Type | Limit | Period |
|--------------|-------|--------|
| Authentication | 10 requests | per minute |
| Property Search | 100 requests | per minute |
| Booking Creation | 20 requests | per hour |
| Payment Validation | 10 requests | per hour |
| General API | 100 requests | per minute |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

**429 Response:**

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 100,
  "window": "1 minute"
}
```

---

## 🌍 Environment Configuration

### Development

```bash
# .env.development
GATEWAY_URL=http://localhost:8082
AUTH_SERVICE_URL=http://localhost:8080
LISTING_SERVICE_URL=http://localhost:8081
BOOKING_SERVICE_URL=http://localhost:8083
PAYMENT_SERVICE_URL=http://localhost:8084

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

WEB3_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
```

### Production

```bash
# .env.production
GATEWAY_URL=https://api.rental-platform.com
AUTH_SERVICE_URL=http://auth-service:8080
LISTING_SERVICE_URL=http://listing-service:8081
BOOKING_SERVICE_URL=http://booking-service:8083
PAYMENT_SERVICE_URL=http://payment-service:8084

RABBITMQ_HOST=rabbitmq-cluster
RABBITMQ_PORT=5672

WEB3_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
```

---

## 📝 Changelog

### Version 2.1.0 (2026-01-10)

**Added:**
- ✅ Wallet management endpoints (connect, disconnect, status)
- ✅ Business rules validation for wallet disconnection
- ✅ Auto-wallet retrieval in BookingService
- ✅ Booking auto-expiration (15 min timeout)
- ✅ Admin operations (create/list/delete agents)
- ✅ Enhanced error messages with action hints

**Changed:**
- ✅ CORS centralized at Gateway only
- ✅ User ID type changed from Long to String (UUID)
- ✅ Wallet now required for booking creation
- ✅ Improved event-driven architecture

**Fixed:**
- ✅ Duplicate CORS headers issue
- ✅ JWT role extraction in Gateway
- ✅ Circuit breaker for service communication
- ✅ RabbitMQ dead letter queue configuration

---

## 🔗 Additional Resources

### Official Documentation

- **Spring Cloud Gateway:** [https://spring.io/projects/spring-cloud-gateway](https://spring.io/projects/spring-cloud-gateway)
- **RabbitMQ:** [https://www.rabbitmq.com/documentation.html](https://www.rabbitmq.com/documentation.html)
- **Web3j:** [https://docs.web3j.io](https://docs.web3j.io)
- **Polygon Network:** [https://docs.polygon.technology](https://docs.polygon.technology)

### Smart Contract

```solidity
// RentalEscrow.sol
contract RentalEscrow {
    enum State { Created, Funded, Active, Completed, Cancelled }
    
    event Funded(address indexed tenant, uint256 amount);
    
    function fund() external payable {
        require(state == State.Created, "Invalid state");
        require(msg.value >= totalPrice, "Insufficient payment");
        
        state = State.Funded;
        emit Funded(msg.sender, msg.value);
    }
}
```

### Support

- **Email:** support@rental-platform.com
- **Discord:** [discord.gg/rental-platform](https://discord.gg/rental-platform)
- **GitHub Issues:** [github.com/rental-platform/issues](https://github.com/rental-platform/issues)

---

## 📄 License

This API is proprietary and confidential. Unauthorized use is prohibited.

**© 2026 Decentralized Rental Platform. All rights reserved.**

---

**Last Updated:** January 10, 2026  
**Documentation Version:** 2.1.0  
**API Version:** v1