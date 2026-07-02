"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader, Send } from "lucide-react";
import { onMessages, sendMessage } from "/lib/chatFirebase";

export default function ChatThreadAdmin({ threadId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    const unsub = onMessages({
      threadId,
      onUpdate: (msgs) => setMessages(msgs),
    });
    return () => unsub();
  }, [threadId]);

  const canSend = useMemo(
    () => text.trim().length > 0 && !isSending && !!threadId,
    [text, isSending, threadId],
  );

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!canSend) return;

    try {
      setIsSending(true);
      await sendMessage({
        threadId,
        senderRole: "admin",
        text: text.trim(),
      });
      setText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!threadId) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col h-[65vh] max-h-[65vh]">
        <div className="flex-1 overflow-auto border rounded-md p-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">No messages yet.</div>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => {
                const isMe = m.senderRole === "admin";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reply..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={`px-4 py-2 rounded-lg font-semibold text-white ${
              canSend
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
