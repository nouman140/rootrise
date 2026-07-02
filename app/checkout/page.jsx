"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { selectCartItems } from "/store/cartSlice";
import { useRouter } from "next/navigation";
import CheckoutForm from "/components/CheckoutForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthIsLoading);
  const cartItems = useSelector(selectCartItems);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 bg-white rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add items to your cart before checking out
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
        Checkout
      </h1>

      <CheckoutForm />
    </div>
  );
}
