# RootRise — E-commerce Store

A full-stack e-commerce web app built with Next.js, Firebase, Redux Toolkit, and Tailwind CSS. Includes customer-facing shopping flows and an admin dashboard for managing products, orders, and customer chat.

## Features

**Customer**
- Browse and filter products, view product details
- Cart with quantity controls (persisted per-user in Firestore)
- Checkout flow with Cash on Delivery / EasyPaisa payment options
- Order confirmation page
- Live chat with admin/support
- Email/password signup and login (Firebase Auth)

**Admin**
- Product management (create, edit, list)
- Order management
- Admin chat dashboard to respond to customer threads
- Route-protected admin layout (redirects non-admins)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **State management:** Redux Toolkit + React Redux
- **Auth & Database:** Firebase Auth + Firestore
- **Image hosting:** Cloudinary
- **Styling:** Tailwind CSS
- **UI:** lucide-react icons, react-hot-toast notifications

## Project Structure

```
app/
  page.jsx                  Home / product listing
  products/[id]/            Product detail page
  cart/                     Shopping cart
  checkout/                 Checkout flow
  order-confirmation/[id]/  Order confirmation
  chat/                     Customer chat
  auth/login, auth/signup   Authentication pages
  admin/                    Admin dashboard (products, orders, chat)
  api/upload/               Image upload API route (Cloudinary)

components/                 Reusable UI components (ProductCard, Navbar, CartItem, etc.)

store/
  store.js                  Redux store configuration
  cartSlice.js              Cart state, reducers, thunks, selectors
  authSlice.js              Auth state, reducers, thunks, selectors
  cartMiddleware.js         Auto-persists cart to Firestore on change

context/
  ReduxProvider.jsx         Wraps the app in Redux's <Provider> and
                             bridges Firebase's onAuthStateChanged into the store

lib/
  firebase.js                Firebase client config
  firebaseAdmin.js           Firestore helpers (products, orders, cart)
  chatFirebase.js            Chat-related Firestore helpers
  cloudinary.js / cloudinaryUtils.jsx   Image upload helpers
```

## State Management

Global state (cart and auth) is managed with **Redux Toolkit**:

- `cartSlice` holds cart items and exposes `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart` actions and `selectCartItems` / `selectCartTotal` / `selectCartItemCount` selectors.
- `authSlice` holds the current user and exposes `login`, `signup`, `logout` async thunks and `selectUser` / `selectIsAdmin` / `selectAuthIsLoading` selectors.
- A custom middleware (`cartMiddleware.js`) automatically saves the cart to Firestore whenever it changes, scoped to the logged-in user.
- `ReduxProvider` subscribes once to Firebase's auth state and keeps the Redux store in sync (loading the right user's cart on login, clearing it on logout).

In components, access state with `useSelector` and dispatch actions with `useDispatch`:

```jsx
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItems } from "../store/cartSlice";

const dispatch = useDispatch();
const cartItems = useSelector(selectCartItems);

dispatch(addToCart(product));
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env.local` file in the project root with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_ADMIN_EMAIL=
NEXT_PUBLIC_ADMIN_PASSWORD=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
- Firebase values come from your Firebase project settings (Auth + Firestore must be enabled).
- `NEXT_PUBLIC_ADMIN_EMAIL` determines which logged-in user sees the admin dashboard.
- Cloudinary values come from your Cloudinary dashboard (used for product image uploads).

### 3. Run the dev server
```bash
npm run dev
```
App runs at `https://rootrisestore.netlify.app/`.

### 4. Build for production
```bash
npm run build
npm start
```

## Scripts

| Command         | Description                  |
|-----------------|-------------------------------|
| `npm run dev`   | Start development server      |
| `npm run build` | Build for production          |
| `npm start`     | Run the production build      |
| `npm run lint`  | Run ESLint                    |

## Notes

- Admin access is determined by comparing the logged-in user's email to `NEXT_PUBLIC_ADMIN_EMAIL` — there's no separate admin role system.
- Cart data is stored per-user in Firestore so it persists across sessions and devices.
- Image uploads go through `app/api/upload/route.js`, which uploads to Cloudinary.
