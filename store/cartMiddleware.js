import { saveCartToFirestore } from "../lib/firebaseAdmin";

// Mirrors the old CartContext useEffect:
//   "save cart whenever it changes (only for logged-in users + active uid)"
// Runs after addToCart / removeFromCart / updateQuantity / clearCart.
const persistedActionTypes = new Set([
  "cart/addToCart",
  "cart/removeFromCart",
  "cart/updateQuantity",
  "cart/clearCart",
]);

export const cartPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (persistedActionTypes.has(action.type)) {
    const { cart } = store.getState();
    if (cart.activeUid) {
      saveCartToFirestore(cart.activeUid, cart.items);
    }
  }

  return result;
};
