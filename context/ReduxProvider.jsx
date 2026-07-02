"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import { auth } from "../lib/firebase";
import { setUser } from "../store/authSlice";
import { setActiveUser, loadCart } from "../store/cartSlice";

// Bridges Firebase's onAuthStateChanged listener into Redux.
// Replaces the duplicated useEffect logic that used to live in both
// AuthContext and CartContext.
function AuthListener({ children }) {
  const dispatch = useDispatch();
  const activeUidRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      dispatch(
        setUser(
          currentUser
            ? {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
              }
            : null,
        ),
      );

      if (!currentUser) {
        activeUidRef.current = null;
        dispatch(setActiveUser(null));
        return;
      }

      if (currentUser.uid !== activeUidRef.current) {
        activeUidRef.current = currentUser.uid;
        dispatch(setActiveUser(currentUser.uid));
        dispatch(loadCart(currentUser.uid));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthListener>{children}</AuthListener>
    </Provider>
  );
}
