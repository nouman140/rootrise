"use client";

import ChatThread from "../../components/ChatThread";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading, selectIsAdmin } from "/store/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatPage() {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthIsLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      if (isAdmin) {
        router.push("/admin/chat");
        return;
      }
      setReady(true);
    }
  }, [isLoading, user, isAdmin, router]);

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // ChatThread will create/get the per-user thread.
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Chat Support</h1>
      <p className="text-gray-600 mb-6">Message the admin. We’ll reply here.</p>
      <ChatThread compact={false} />
    </div>
  );
}
