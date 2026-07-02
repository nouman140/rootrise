"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { onThreadsForAdmin } from "/lib/chatFirebase";
import ChatThreadAdmin from "./ChatThreadAdmin";

export default function AdminChat() {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthIsLoading);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);

  useEffect(() => {
    const unsub = onThreadsForAdmin({
      onUpdate: (t) => {
        setThreads(t);
        if (!activeThreadId && t.length) setActiveThreadId(t[0].id);
      },
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold mb-3">User Threads</h2>
        {threads.length === 0 ? (
          <div className="text-gray-500 text-sm">No active chats.</div>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  activeThreadId === t.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-gray-900 truncate">
                  {t.userEmail || t.userId}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {t.adminId ? "" : ""}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {activeThreadId ? (
          <ChatThreadAdmin threadId={activeThreadId} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            Select a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
