"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { useRouter, useParams } from "next/navigation";
import { getOrders } from "/lib/firebaseAdmin";
import Link from "next/link";
import { CheckCircle, Loader, ArrowRight } from "lucide-react";

export default function OrderConfirmationPage() {
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && orderId) {
      loadOrder();
    }
  }, [user, orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orders = await getOrders(user.uid);
      const foundOrder = orders.find((o) => o.orderId === orderId);
      setOrder(foundOrder);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 bg-white rounded-lg">
          <p className="text-gray-600 text-xl">Order not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000 || timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Message */}
      <div className="text-center mb-12">
        <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 text-lg">Thank you for your purchase</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b">
          <div>
            <p className="text-gray-600 text-sm mb-1">Order Number</p>
            <p className="text-lg font-semibold text-gray-800">
              {order.orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Order Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Status</p>
            <p className="text-lg font-semibold text-yellow-600">
              {order.status}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Amount</p>
            <p className="text-lg font-semibold text-blue-600">
              Rs. {order.totalPrice.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Delivery Address
          </h2>
          <div className="text-gray-700 space-y-1">
            <p>{order.userDetails?.fullName}</p>
            <p>{order.userDetails?.phone}</p>
            <p>{order.userDetails?.address}</p>
            <p>
              {order.userDetails?.city}, {order.userDetails?.postalCode}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Order Items
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  Rs. {(item.price * item.quantity).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-700">
            <span className="font-semibold">Payment Method: </span>
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "EasyPaisa"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Info Box */}
      <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          What happens next?
        </h3>
        <ul className="text-gray-700 space-y-2 list-disc list-inside">
          <li>You'll receive an order confirmation email shortly</li>
          <li>We'll prepare your order for shipment</li>
          <li>You'll be notified when your order is on its way</li>
          <li>Track your order status here anytime</li>
        </ul>
      </div>
    </div>
  );
}
