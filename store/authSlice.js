import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

// Serialize only what's needed in state — the full Firebase User object
// isn't a plain object and won't play nicely with the store.
const serializeUser = (user) =>
  user
    ? { uid: user.uid, email: user.email, displayName: user.displayName }
    : null;

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return serializeUser(result.user);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return serializeUser(result.user);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  user: null,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Dispatched by the Firebase onAuthStateChanged listener (see AuthListener below)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectAuthIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) =>
  !!(state.auth.user && state.auth.user.email === ADMIN_EMAIL);

export default authSlice.reducer;
