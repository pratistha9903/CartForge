# CartForge — Design Document

## Architecture

```
Client (React UI)
    │
    ▼
Express API  →  routes → controllers → services → models
    │
    ▼
MongoDB (User + Cart collections)
```

**Relationship:** One user → One cart → Many embedded items

## Folder Structure

| Layer | Responsibility |
|-------|----------------|
| `routes/` | HTTP route definitions |
| `controllers/` | Request/response handling |
| `services/` | Business logic (cart ops, pricing) |
| `models/` | Mongoose schemas |
| `validators/` | express-validator rules |
| `middleware/` | Error handling, rate limiting |

## Database Schema

### User
```
{ name, email, password (hashed), timestamps }
```

### Cart
```
{
  userId: ObjectId (unique — one cart per user),
  items: [{ productId, name, price, quantity, category }],
  status: active | checked_out | expired,
  expiresAt: Date (TTL index — 24h)
}
```

### Why cart items are embedded

Cart items are always read/written with their parent cart. Embedding avoids joins, keeps reads atomic, and matches the assignment's one-cart-per-user model.

## User Isolation Strategy

Each cart is keyed by `userId` (MongoDB ObjectId). All cart endpoints require a valid `userId` — either in the request body or URL param. The service layer verifies the user exists before any cart operation.

## Cart Item Logic

1. Find user's cart (or create if missing)
2. If product already exists → increase quantity
3. Else → add new item
4. Refresh `expiresAt` (sliding 24h TTL)

## Promotion Engine

```
subtotal = Σ (price × quantity)
tierDiscount = subtotal × tierPercent
diversityBonus = ₹200 if uniqueCategories >= 3 else 0
discount = tierDiscount + diversityBonus
finalTotal = subtotal - discount
```

| Tier | Range (INR) | Discount |
|------|-------------|----------|
| None | < ₹1,000 | 0% |
| Silver | ₹1,000 – ₹4,999 | 10% |
| Gold | ₹5,000 – ₹9,999 | 15% |
| Platinum | ≥ ₹10,000 | 20% |

## Validation Strategy

- **express-validator** on every endpoint
- Required: userId, productId, name, price (> 0), quantity (> 0), category
- Structured 400 response with error array

## Feature X: Cart TTL

```javascript
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
}
// TTL index: { expireAfterSeconds: 0 }
```

**Why:** Automatically removes abandoned carts without cron jobs. Standard production practice for e-commerce cart systems. TTL duration is configurable via `CART_TTL_HOURS` (default 24) in `backend/src/config/cart.config.js`.

## Edge Cases Handled

| Case | Handling |
|------|----------|
| User not found | 404 |
| Cart empty at checkout | Returns zeros with tier "None" |
| Same product added twice | Quantity merged |
| Invalid userId | 400 with validation error |
| Invalid quantity/price | 400 with validation message |
| Duplicate email on signup | 409 |

## Trade-offs

| Decision | Choice | Alternative |
|----------|--------|-------------|
| Cart identity | userId (one cart per user) | Session-based anonymous carts |
| Item storage | Embedded in Cart | Separate CartItem collection |
| Auth | Simple email/password | JWT tokens (kept frontend session in localStorage) |
| Currency | INR (₹) per assignment examples | USD |
| TTL | 24 hours sliding | Fixed TTL from creation |

## Frontend

React SPA with login/signup pages, product catalog (INR prices), live cart panel, and tier progress display. Requires login to add items — matching the userId-based backend design.
