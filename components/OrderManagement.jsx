"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../lib/firebaseAdmin";
import { ChevronDown, Loader } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  "Pending",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const allOrders = await getOrders();
      setOrders(allOrders.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000 || timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Order Header */}
            <button
              onClick={() =>
                setExpandedOrder(expandedOrder === order.id ? null : order.id)
              }
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Order #{order.orderId.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Customer: {order.userDetails?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Items: {order.items?.length || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      Rs. {order.totalPrice?.toFixed(0)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`transition ${expandedOrder === order.id ? "rotate-180" : ""}`}
              />
            </button>

            {/* Expanded Details */}
            {expandedOrder === order.id && (
              <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                {/* Customer Details */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Delivery Address
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>{order.userDetails?.fullName}</p>
                    <p>{order.userDetails?.phone}</p>
                    <p>{order.userDetails?.address}</p>
                    <p>
                      {order.userDetails?.city}, {order.userDetails?.postalCode}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-gray-700 bg-white p-2 rounded"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>
                          Rs. {(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Update Status
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {ORDER_STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(order.id, status)}
                        disabled={updatingOrderId === order.id}
                        className={`px-3 py-1 rounded text-sm font-semibold transition ${
                          order.status === status
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-600"
                        } disabled:opacity-50`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Payment Method: </span>
                  <span className="capitalize">
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "EasyPaisa"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
