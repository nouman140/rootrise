"use client";

import OrderManagement from "/components/OrderManagement";

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Orders</h1>
      <OrderManagement />
    </div>
  );
}
