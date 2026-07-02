"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
import { selectCartItems, selectCartTotal, clearCart as clearCartAction } from "../store/cartSlice";
import { useRouter } from "next/navigation";
import { createOrder } from "../lib/firebaseAdmin";
import toast from "react-hot-toast";
import { ArrowRight, Loader } from "lucide-react";

export default function CheckoutForm() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to place an order");
      router.push("/auth/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsLoading(true);

      // Validate form
      if (
        !formData.fullName ||
        !formData.phone ||
        !formData.address ||
        !formData.city
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Create order
      const orderId = await createOrder(
        user.uid,
        cartItems,
        total,
        paymentMethod,
        formData,
      );

      // Handle payment
      if (paymentMethod === "easypaisa") {
        // Simulate EasyPaisa payment
        const message = `You have received a payment request for Rs. ${total}. Order ID: ${orderId}. Please reply ACCEPT to confirm.`;

        // In production, integrate with EasyPaisa API
        alert(
          `EasyPaisa Payment Request:\n\n${message}\n\nPhone: ${formData.phone}`,
        );

        // For demo, mark as paid
        // await updateOrderStatus(orderId, 'Paid');
      }

      dispatch(clearCartAction());
      toast.success("Order placed successfully!");

      // Redirect to order confirmation
      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-8">
      {/* Delivery Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Delivery Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="+92 300 1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="your.email@example.com"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., Karachi"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., 75000"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Payment Method
        </h2>

        <div className="space-y-4">
          {/* Cash on Delivery */}
          <label
            className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
            style={{
              borderColor: paymentMethod === "cod" ? "#2563eb" : "#e5e7eb",
              backgroundColor:
                paymentMethod === "cod" ? "#eff6ff" : "transparent",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 mt-1 text-blue-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <h3 className="font-semibold text-gray-800">
                Cash on Delivery (COD)
              </h3>
              <p className="text-sm text-gray-600">
                Pay when your order is delivered
              </p>
            </div>
          </label>

          {/* EasyPaisa */}
          <label
            className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
            style={{
              borderColor:
                paymentMethod === "easypaisa" ? "#2563eb" : "#e5e7eb",
              backgroundColor:
                paymentMethod === "easypaisa" ? "#eff6ff" : "transparent",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="easypaisa"
              checked={paymentMethod === "easypaisa"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 mt-1 text-blue-600 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <h3 className="font-semibold text-gray-800">EasyPaisa</h3>
              <p className="text-sm text-gray-600">
                Pay using EasyPaisa mobile wallet
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>

        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-700">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>Rs. {(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">
              Total Amount:
            </span>
            <span className="text-3xl font-bold text-blue-600">
              Rs. {total.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || cartItems.length === 0}
        className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition ${
          isLoading || cartItems.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Place Order</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
}
