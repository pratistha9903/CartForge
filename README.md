# CartForge — Adaptive E-Commerce Cart Engine

A production-style shopping cart microservice built for the **Node.js Backend Intern assignment**: multi-user cart isolation, tiered promotional pricing, defensive input validation, and a self-chosen **Feature X** (automatic cart expiration via MongoDB TTL).

This repository includes the **required Express + MongoDB backend** plus an optional **React storefront** for end-to-end demos.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Session & User Isolation Strategy](#session--user-isolation-strategy)
5. [Database Schemas](#database-schemas)
6. [Promotion Engine](#promotion-engine)
7. [Feature X — Cart TTL Expiration](#feature-x--cart-ttl-expiration)
8. [API Reference](#api-reference)
9. [Input Validation](#input-validation)
10. [Environment Variables](#environment-variables)
11. [Local Setup](#local-setup)
12. [Frontend (Optional Demo UI)](#frontend-optional-demo-ui)
13. [Testing Checklist](#testing-checklist)
14. [Project Structure](#project-structure)

---

## Overview

CartForge solves four core assignment challenges:

| Challenge | Implementation |
|-----------|----------------|
| Multi-tenant cart isolation | Each user gets one cart keyed by MongoDB `userId` |
| Item ingestion | Add, update quantity, remove items via REST endpoints |
| Dynamic campaign checkout | Tiered discounts + category diversity bonus (INR) |
| Feature X | **Cart TTL expiration** — abandoned carts auto-delete via MongoDB TTL index |

Additional production extras (not counted as Feature X): rate limiting, request logging, Helmet security headers, order persistence after checkout.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js 18+, Express 4, Mongoose 8, express-validator, bcryptjs |
| **Database** | MongoDB (local, Docker, or Atlas) |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |

---

## Architecture

```
Client (Browser / Postman)
        │
        ▼
┌───────────────────────────────────────┐
│  Express App (port 3001)              │
│  helmet → cors → json → morgan        │
│  requestLogger → rateLimiter          │
│                                       │
│  /api/users   → user routes           │
│  /api/cart    → cart routes           │
│  /api/orders  → order routes          │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Layered backend                      │
│  routes → controllers → services      │
│           → models (Mongoose)         │
│  validators (express-validator)       │
└───────────────────────────────────────┘
        │
        ▼
   MongoDB Atlas / local / in-memory
   Collections: users, carts, orders
```

**Design principle:** Routes handle HTTP only. Controllers parse requests and format responses. Services contain all business logic (cart mutations, pricing, orders). Models define schema constraints at the database layer.

See [`DESIGN.md`](./DESIGN.md) for edge cases, trade-offs, and validation strategy in more depth.

---

## Session & User Isolation Strategy

The assignment asks for a mechanism to identify and isolate different users' carts. CartForge uses a **userId-based session model**:

### How it works

1. **Sign up** — `POST /api/users` creates a user and returns `{ id, name, email }`.
2. **Login** — `POST /api/users/login` validates credentials and returns the same user object.
3. **Client session** — The frontend stores the user object in `localStorage` under `cartforge_user`. Every cart API call includes `userId` in the body or URL.
4. **Server isolation** — The service layer loads carts with `Cart.findOne({ userId, status: 'active' })`. Each user has at most one active cart (`userId` is unique on the Cart collection).

### Why this approach

- **Simple and explicit** — No JWT complexity for a cart-focused assignment; the `userId` is the tenant key.
- **Database-enforced isolation** — Unique index on `Cart.userId` prevents duplicate carts per user.
- **Verifiable** — `ensureUserExists()` runs before any cart operation; invalid or missing users return `404`.

### Example flow

```
Register → receive userId "674a1b2c..."
Login    → same userId stored client-side
Add item → POST /api/cart/items { userId: "674a1b2c...", productId: "P101", ... }
Get cart → GET /api/cart/674a1b2c...
```

User A and User B can shop simultaneously; their carts never mix because every query is scoped to `userId`.

---

## Database Schemas

### User (`users` collection)

```json
{
  "_id": "ObjectId",
  "name": "Pratistha",
  "email": "pratistha@example.com",
  "password": "<bcrypt hash — never returned by API>",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

- Email is unique and lowercased.
- Password hashed with bcrypt (12 rounds) before save.

### Cart (`carts` collection)

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref User, unique)",
  "items": [
    {
      "productId": "P101",
      "name": "Wireless Mouse",
      "price": 899,
      "quantity": 2,
      "category": "Electronics",
      "imageUrl": ""
    }
  ],
  "status": "active | checked_out | expired",
  "expiresAt": "ISO date",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

- Items are **embedded** inside the cart document (no separate `cart_items` collection).
- One user → one cart → many embedded items.
- `expiresAt` drives Feature X (TTL index below).

### Order (`orders` collection — bonus feature)

```json
{
  "_id": "ObjectId",
  "orderId": "CF-00036B45",
  "userId": "ObjectId",
  "items": [ "...same shape as cart items..." ],
  "subtotal": 3999,
  "tierDiscount": 399.9,
  "diversityBonus": 0,
  "discount": 399.9,
  "finalTotal": 3599.1,
  "appliedTier": "Silver",
  "uniqueCategories": 2,
  "status": "confirmed",
  "createdAt": "ISO date"
}
```

Orders are created when checkout is completed (`POST /api/cart/:userId/complete`). The cart is cleared after a successful order.

---

## Promotion Engine

All prices are in **INR (₹)**.

### Tier thresholds

| Subtotal (₹) | Tier | Discount |
|--------------|------|----------|
| Below 1,000 | None | 0% |
| 1,000 – 4,999 | Silver | 10% |
| 5,000 – 9,999 | Gold | 15% |
| 10,000 and above | Platinum | 20% |

### Diversity bonus

If the cart contains items from **3 or more different categories**, an extra **₹200** is subtracted from the total (on top of the tier discount).

### Formulas

```
lineTotal     = price × quantity  (per item)
subtotal      = sum of all lineTotals
tierDiscount  = subtotal × tierPercent
diversityBonus = 200 if uniqueCategories >= 3 else 0
discount        = tierDiscount + diversityBonus
finalTotal      = max(0, subtotal - discount)
```

### Example

Cart subtotal ₹3,500 → **Silver** tier (10%) → tier discount ₹350 → final ₹3,150.

Cart subtotal ₹6,000 with 3 categories → **Gold** (15%) = ₹900 off + ₹200 diversity = ₹1,100 off → final ₹4,900.

---

## Feature X — Cart TTL Expiration

**This is the assignment's required "Feature X"** — the one self-chosen production-ready addition documented in this README.

### What was added

Every cart document has an `expiresAt` timestamp. MongoDB runs a **TTL index** on this field:

```javascript
// Cart model
expiresAt: { type: Date, default: () => getCartExpiryDate() }
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

When `expiresAt` passes, MongoDB **automatically deletes** the cart document. No cron job or manual cleanup is needed.

### Sliding expiration

The TTL is **sliding**, not fixed from creation:

- Creating a cart sets `expiresAt = now + CART_TTL_HOURS`
- Adding, updating, or removing items **resets** `expiresAt` to the same window
- Active shoppers keep their cart; abandoned carts expire after inactivity

### Configuration — `CART_TTL_HOURS`

Controlled by the environment variable `CART_TTL_HOURS` (default: **24** hours).

```env
CART_TTL_HOURS=24
```

Implementation lives in `backend/src/config/cart.config.js` and is used by both the Cart model default and `cart.service.js` on every cart mutation.

### Why this was chosen

- **Real e-commerce pattern** — Abandoned carts accumulate quickly; TTL keeps the database lean.
- **Zero operational overhead** — MongoDB's built-in TTL monitor handles deletion.
- **Configurable** — Ops can tune `CART_TTL_HOURS` without code changes.

### Is it working?

| Environment | TTL behavior |
|-------------|--------------|
| **MongoDB Atlas / local MongoDB** | ✅ Fully working. TTL monitor runs in the background; expired carts are removed automatically (usually within ~60 seconds of `expiresAt`). |
| **In-memory dev fallback** | ⚠️ TTL index behavior is limited. Use Atlas or Docker MongoDB to verify TTL in practice. |

**How to verify on Atlas:**

1. Set `CART_TTL_HOURS=1` in `backend/.env` and restart the backend.
2. Add items to a cart via API or UI.
3. Call `GET /api/cart/:userId` — note `expiresAt` in the response (~1 hour from now).
4. Wait until after `expiresAt` (or temporarily set `CART_TTL_HOURS=0.01` for a quick test — minimum practical value is `1` hour due to validation).
5. The cart document disappears from the `carts` collection in Atlas.

**Note:** Other extras in the codebase (rate limiting, request logging, order history) are **not** Feature X — they are additional production hardening on top of the assignment.

---

## API Reference

Base URL: `http://localhost:3001/api`

All successful responses follow:

```json
{ "success": true, "data": { ... } }
```

Errors follow:

```json
{ "success": false, "message": "...", "errors": ["..."] }
```

---

### Users

#### Create user (sign up)

`POST /api/users`

**Body:**
```json
{
  "name": "Pratistha",
  "email": "pratistha@example.com",
  "password": "secret123"
}
```

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "674a1b2c3d4e5f6789012345",
    "name": "Pratistha",
    "email": "pratistha@example.com"
  }
}
```

**Errors:** `400` invalid input · `409` duplicate email

---

#### Login

`POST /api/users/login`

**Body:**
```json
{
  "email": "pratistha@example.com",
  "password": "secret123"
}
```

**Success (200):** Same user object as sign up.

**Errors:** `400` invalid input · `401` wrong credentials

---

#### Get user

`GET /api/users/:userId`

**Success (200):** User object without password.

**Errors:** `400` invalid userId · `404` not found

---

### Cart

#### Add or merge item

`POST /api/cart/items`

If the same `productId` already exists, **quantity is increased** (merged). Otherwise a new line item is added. Resets cart TTL.

**Body:**
```json
{
  "userId": "674a1b2c3d4e5f6789012345",
  "productId": "P101",
  "name": "Wireless Mouse",
  "price": 899,
  "quantity": 2,
  "category": "Electronics",
  "imageUrl": "https://example.com/mouse.jpg"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| userId | Yes | Valid MongoDB ObjectId |
| productId | Yes | Non-empty string |
| name | Yes | Non-empty string |
| price | Yes | Number > 0 |
| quantity | Yes | Integer > 0 |
| category | Yes | Non-empty string |
| imageUrl | No | String |

**Success (200):** Full cart object including `expiresAt`.

---

#### Update item quantity

`PATCH /api/cart/items/:productId`

**Body:**
```json
{
  "userId": "674a1b2c3d4e5f6789012345",
  "quantity": 5
}
```

**Errors:** `404` cart or product not found

---

#### Remove item

`DELETE /api/cart/items/:productId`

**Body:**
```json
{
  "userId": "674a1b2c3d4e5f6789012345"
}
```

---

#### Get cart

`GET /api/cart/:userId`

Returns cart with items, `itemCount`, `status`, and `expiresAt`. Empty cart if none exists.

---

#### Checkout summary (pricing only)

`GET /api/cart/:userId/checkout`

Calculates subtotal, tier discount, diversity bonus, and final total **without** placing an order.

**Success (200) — example:**
```json
{
  "success": true,
  "data": {
    "userId": "674a1b2c3d4e5f6789012345",
    "items": [ "..." ],
    "subtotal": 3500,
    "tierDiscount": 350,
    "diversityBonus": 0,
    "discount": 350,
    "finalTotal": 3150,
    "appliedTier": "Silver",
    "uniqueCategories": 2,
    "campaign": {
      "activeTier": { "id": "silver", "name": "Silver", "discountPercent": 10 },
      "nextTier": { "name": "Gold", "minSubtotal": 5000, "amountToUnlock": 1500 },
      "diversityBonusApplied": false
    },
    "tiers": [ "..." ]
  }
}
```

Empty cart returns zeros with `appliedTier: "None"`.

---

#### Complete checkout (place order)

`POST /api/cart/:userId/complete`

Persists an order, clears the cart, returns order confirmation.

**Success (200):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "CF-00036B45",
    "userId": "...",
    "items": [ "..." ],
    "subtotal": 3999,
    "discount": 399.9,
    "finalTotal": 3599.1,
    "appliedTier": "Silver"
  }
}
```

**Errors:** `400` empty cart · `404` user not found

---

#### Clear cart

`DELETE /api/cart/:userId`

Removes all items but keeps the cart document.

---

#### Health check

`GET /api/cart/health`

Returns `{ status: "healthy", timestamp: "..." }`.

---

### Orders (bonus — post-checkout history)

#### List orders

`GET /api/orders/:userId`

Returns all orders for the user, newest first.

#### Get single order

`GET /api/orders/:userId/:orderId`

Returns one order by human-readable `orderId` (e.g. `CF-00036B45`).

---

## Input Validation

Every endpoint uses **express-validator** before business logic runs. Invalid payloads never reach MongoDB write operations.

**400 Bad Request example:**
```json
{
  "success": false,
  "message": "Invalid input",
  "errors": [
    "quantity must be greater than 0",
    "Invalid userId"
  ]
}
```

**Additional protections:**
- Mongoose schema min/max constraints on price, quantity, string lengths
- Duplicate email → `409 Conflict`
- bcrypt password minimum 6 characters
- JSON body size limit: 10 KB
- Helmet security headers
- Rate limit: 100 requests per 15 minutes per IP on `/api/*`

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and edit values.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Express server port |
| `MONGODB_URI` | — | MongoDB connection string (required in production) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `CART_TTL_HOURS` | `24` | Hours until inactive cart expires (Feature X) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |
| `NODE_ENV` | `development` | Environment mode |
| `USE_MEMORY_DB` | — | Set `true` to force in-memory MongoDB (dev only) |

**MongoDB Atlas example:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cartforge?retryWrites=true&w=majority
```

Never commit `.env` — it is listed in `.gitignore`.

---

## Local Setup

### Prerequisites

- Node.js 18 or higher
- MongoDB (local install, Docker, or Atlas account)

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend

```bash
cd backend
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux
```

Edit `.env` with your `MONGODB_URI`.

### 3. Start MongoDB (choose one)

**Option A — Docker (project root):**
```bash
docker compose up -d
```

**Option B — MongoDB Atlas:** Paste your Atlas URI into `MONGODB_URI`.

**Option C — No MongoDB installed:** The backend auto-starts an in-memory database in development if the URI fails to connect (data is lost on restart).

### 4. Run the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

Expected output: `MongoDB connected` on port 3001.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

### 5. Quick API test (curl / Postman)

```bash
# 1. Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"secret123\"}"

# 2. Add item (replace USER_ID)
curl -X POST http://localhost:3001/api/cart/items \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"USER_ID\",\"productId\":\"P101\",\"name\":\"Mouse\",\"price\":1500,\"quantity\":1,\"category\":\"Electronics\"}"

# 3. Checkout summary
curl http://localhost:3001/api/cart/USER_ID/checkout
```

---

## Frontend (Optional Demo UI)

The React app is **not required by the assignment** but demonstrates the full flow:

| Route | Page |
|-------|------|
| `/` | Product catalog + live cart panel |
| `/login`, `/signup` | Authentication |
| `/checkout` | Order review and place order |
| `/order-success/:orderId` | Confirmation |
| `/dashboard` | Stats and last order |
| `/orders` | Full order history |

The frontend proxies `/api` to `http://localhost:3001` via Vite config.

---

## Testing Checklist

Use this list with Postman or the UI:

- [ ] Create user — receive `id`
- [ ] Login with same credentials
- [ ] Add first item to cart
- [ ] Add same product again — quantity merges
- [ ] Add a second different product
- [ ] Update quantity via PATCH
- [ ] Remove one item via DELETE
- [ ] Checkout with subtotal below ₹1,000 — tier **None**, 0% discount
- [ ] Checkout with subtotal ₹1,000–₹4,999 — tier **Silver**, 10% off
- [ ] Checkout with subtotal ₹5,000+ — tier **Gold** or **Platinum**
- [ ] Cart with 3+ categories — ₹200 diversity bonus applied
- [ ] Invalid quantity (`0` or negative) — **400** with error array
- [ ] Invalid price (`0`) — **400**
- [ ] Invalid userId — **400**
- [ ] Complete checkout — order saved, cart cleared
- [ ] View order history — `GET /api/orders/:userId`
- [ ] Verify `expiresAt` on cart response (Feature X)

---

## Project Structure

```
CartForge/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── database.js       # MongoDB connection + dev fallback
│       │   └── cart.config.js    # CART_TTL_HOURS → expiresAt helper
│       ├── models/
│       │   ├── User.js
│       │   ├── Cart.js           # TTL index on expiresAt
│       │   └── Order.js
│       ├── routes/
│       │   ├── user.routes.js
│       │   ├── cart.routes.js
│       │   └── order.routes.js
│       ├── controllers/
│       ├── services/
│       │   ├── cart.service.js
│       │   ├── pricing.service.js
│       │   ├── user.service.js
│       │   └── order.service.js
│       ├── validators/
│       │   └── cart.validator.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── security.js       # rate limit + request logger
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/                      # React demo storefront
├── DESIGN.md                     # Architecture deep-dive
├── docker-compose.yml
└── README.md
```

---

## Related Documentation

- [`DESIGN.md`](./DESIGN.md) — Architecture decisions, edge cases, trade-offs, validation strategy

---


