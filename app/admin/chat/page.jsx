"use client";

import AdminChat from "/components/AdminChat";

export default function AdminChatPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Chat</h1>
      <AdminChat />
    </div>
  );
}
