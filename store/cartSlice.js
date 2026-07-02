import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  saveCartToFirestore,
  getCartFromFirestore,
} from "../lib/firebaseAdmin";

// Load the logged-in user's cart from Firestore.
// Call this from your auth listener once you have a uid.
export const loadCart = createAsyncThunk("cart/loadCart", async (uid) => {
  const cart = await getCartFromFirestore(uid);
  return cart || [];
});

// Thunk version of "remove + persist immediately" (mirrors removeFromCartAndPersist)
export const removeFromCartAndPersist = createAsyncThunk(
  "cart/removeFromCartAndPersist",
  async (productId, { getState }) => {
    const { cart } = getState();
    const nextItems = cart.items.filter((item) => item.id !== productId);
    if (cart.activeUid) {
      await saveCartToFirestore(cart.activeUid, nextItems);
    }
    return productId;
  },
);

const initialState = {
  items: [],
  isLoading: false,
  activeUid: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setActiveUser: (state, action) => {
      const uid = action.payload;
      // mirrors: if uid changes, clear cart immediately
      if (uid !== state.activeUid) {
        state.activeUid = uid;
        state.items = [];
      }
      if (!uid) {
        state.activeUid = null;
        state.items = [];
      }
    },
    addToCart: (state, action) => {
      if (!state.activeUid) return; // block adding until logged in
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      if (!state.activeUid) return;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      if (!state.activeUid) return;
      const { productId, quantity } = action.payload;
      if (quantity === 0) {
        state.items = state.items.filter((item) => item.id !== productId);
        return;
      }
      const item = state.items.find((item) => item.id === productId);
      if (item) item.quantity = quantity;
    },
    clearCart: (state) => {
      if (!state.activeUid) return;
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(loadCart.rejected, (state) => {
        state.items = [];
        state.isLoading = false;
      })
      .addCase(removeFromCartAndPersist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const {
  setActiveUser,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

// Selectors (replace getTotal() / getItemCount() from CartContext)
export const selectCartItems = (state) => state.cart.items;
export const selectCartIsLoading = (state) => state.cart.isLoading;
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
