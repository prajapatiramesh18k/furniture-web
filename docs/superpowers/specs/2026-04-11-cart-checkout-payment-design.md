# Cart + Checkout + Razorpay Payment — Design Spec

## Overview

Add a full cart page, checkout page, and Razorpay payment integration to the existing Ananya House of Furniture Next.js site. Orders are saved to MongoDB.

---

## Tech Stack

- **Razorpay** — Test Mode (key: `rzp_test_XXXXXXXX`, secret placeholder)
- **MongoDB** — existing `orders` collection via Mongoose
- **Next.js App Router** — Client Components for interactive pages

---

## Files to Create / Modify

### New Files
- `src/app/cart/page.tsx` — full cart page
- `src/app/checkout/page.tsx` — checkout + payment
- `src/app/order-confirmation/page.tsx` — post-payment success
- `src/app/api/orders/route.ts` — **extend** POST to accept `paymentId` and `orderId` from Razorpay

### Files to Modify
- `src/context/CartContext.tsx` — add `clearCart()` function
- `src/components/Navbar.tsx` — fix checkout button to navigate to `/cart`

---

## Data Flow

```
CartSidebar "Proceed to Checkout"
  → /cart (full cart page)
    → /checkout (customer form + Razorpay Pay Now button)
      → POST /api/orders/create (server creates Razorpay order, returns order_id)
      → Razorpay Checkout modal opens
      → User completes payment
      → POST /api/orders (save order with paymentId, status="Paid")
      → clearCart()
      → redirect /order-confirmation
```

---

## 1. CartContext — clearCart

Add to `CartContext`:
```ts
const clearCart = () => setCart([]);
```

Export from `useCart`: add `clearCart` to returned value.

---

## 2. Cart Page (`/cart`)

**Route:** `/cart`
**Access:** Any user with items in cart

### Layout
- Back button → `/`
- Page title: "Your Cart"
- If cart is empty: show empty state with "Continue Shopping" CTA
- If items exist: show item list + order summary sidebar

### Item Row
- Product image (small, ~80px)
- Product name
- Unit price
- Quantity controls (− / count / +)
- Line total = price × quantity
- Remove button (× icon)
- Updates CartContext immediately

### Order Summary (right panel)
- Subtotal
- Delivery: "Free Delivery on orders above Rs.5,000" (or "Rs. 500 delivery charge" if below)
- Total
- "Proceed to Checkout" button → `/checkout`

### Responsive
- Desktop: 2-column (items left, summary right)
- Mobile: stacked (items top, summary bottom, sticky checkout button)

---

## 3. Checkout Page (`/checkout`)

**Route:** `/checkout`
**Access:** Redirect to `/cart` if cart is empty

### Layout
- 2-column on desktop, stacked on mobile

### Left — Customer Info Form
Fields:
- Full Name (required)
- Phone Number (required, 10 digits)
- Email (optional)
- Address (required, textarea)
- City (required)
- Pincode (required, 6 digits)

Validation: HTML5 + JS checks before submission. Show inline error messages.

### Right — Order Summary
- Compact list of cart items (name × qty, price)
- Subtotal
- Delivery charge
- **Total to pay** (bold, large)

### Payment Section
- "Pay Now" button (primary CTA)
- On click:
  1. Validate form
  2. POST `/api/orders/create` with `{ amount: totalInPaise, items, customerInfo }`
  3. Receive `{ orderId }` (Razorpay order ID)
  4. Open `Razorpay.checkout({ key, amount, order_id, name, description, prefill, handler })`
  5. On success callback: POST `/api/orders` with full order data + `paymentId`
  6. Call `clearCart()`
  7. Redirect to `/order-confirmation`
  8. On failure: show error toast, allow retry

### API: `/api/orders/create` (NEW POST endpoint)
Creates a Razorpay order server-side using `RAZORPAY_KEY_SECRET`.

Request:
```json
{ "amount": 499900, "currency": "INR", "receipt": "order_xxx" }
```

Response:
```json
{ "orderId": "order_xxxx", "amount": 499900, "currency": "INR" }
```

Error handling: return 500 if Razorpay call fails.

---

## 4. Order Confirmation Page (`/order-confirmation`)

**Route:** `/order-confirmation`
**Access:** Only after successful payment (query param: `?orderId=xxx`)

### Content
- Large success icon (checkmark)
- "Order Placed Successfully!"
- Order ID (from query param)
- "Thank you, [Name]! We'll contact you shortly."
- Order summary (items, total)
- "Continue Shopping" button → `/`

---

## 5. Navbar — Fix Checkout Button

In `CartSidebar` (Navbar.tsx), change:
```tsx
// Before
<button className="btn checkout-btn" onClick={onClose}>

// After
<button className="btn checkout-btn" onClick={() => { onClose(); router.push('/cart'); }}>
```

Also need to add `useRouter` import if not present (already present).

---

## 6. `/api/orders` Route — Extend POST

Current POST saves order with `status: "Pending"`. Extend to accept:
```json
{
  "customerInfo": { "name", "phone", "email", "address", "city", "pincode" },
  "items": [{ "id", "name", "image", "price", "quantity" }],
  "total": 499900,
  "paymentMethod": "Razorpay",
  "paymentId": "pay_xxxx",
  "razorpayOrderId": "order_xxxx"
}
```

Save with `status: "Paid"` when `paymentId` is present.

---

## Environment Variables

Add to `.env.local` and Vercel project:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

Use `RAZORPAY_KEY_ID` in browser (client-side). Use `RAZORPAY_KEY_SECRET` only in server-side API routes.

---

## Security Notes

- Never expose `RAZORPAY_KEY_SECRET` to the browser
- Always create Razorpay orders server-side (`/api/orders/create`)
- Verify payment signature server-side before saving order (optional but recommended — can be added in v2)
- Validate all customer input on both client and server

---

## Styling

Reuse existing CSS classes from `globals.css` where possible:
- `.cart-items-container`, `.cart-item` styles for cart page
- `.btn`, `.btn-check` for buttons
- Add new classes scoped to checkout/confirmation pages

---

## Order of Implementation

1. `CartContext` — add `clearCart`
2. `/cart` page
3. `/checkout` page
4. `/api/orders/create` endpoint
5. `/order-confirmation` page
6. Fix Navbar checkout button
7. Extend `/api/orders` POST
8. Add environment variables
9. Test full flow
