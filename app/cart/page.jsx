"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { selectCartItems, selectCartTotal } from "/store/cartSlice";
import { useRouter } from "next/navigation";
import CartItem from "/components/CartItem";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthIsLoading);
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
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


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some products to get started!
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>Rs. {total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>Rs. {total.toFixed(0) / 100}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  Rs. {total + total / 100}
                </span>
              </div>
            </div>

            {cartItems.length > 0 && (
              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={20} />
              </Link>
            )}

            <Link
              href="/"
              className="w-full mt-3 border border-blue-600 hover:bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold  transition flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
