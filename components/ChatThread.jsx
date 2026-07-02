"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "/store/authSlice";
import { getOrCreateThread, onMessages, sendMessage } from "/lib/chatFirebase";

export default function ChatThread({
  threadId: propThreadId = null,
  compact = false,
}) {
  const user = useSelector(selectUser);
  const [threadId, setThreadId] = useState(propThreadId);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoadingThread, setIsLoadingThread] = useState(!propThreadId);
  const [isSending, setIsSending] = useState(false);

  const canSend = useMemo(
    () => text.trim().length > 0 && !isSending && !!threadId,
    [text, isSending, threadId],
  );

  useEffect(() => {
    let unsub;
    const init = async () => {
      try {
        if (!threadId && user?.uid) {
          setIsLoadingThread(true);
          const res = await getOrCreateThread({
            userId: user.uid,
            userEmail: user.email,
          });
          setThreadId(res.threadId);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to init chat");
      } finally {
        setIsLoadingThread(false);
      }
    };

    init();
    return () => {
      if (unsub) unsub();
    };
  }, [threadId, user?.uid, user?.email]);

  useEffect(() => {
    if (!threadId) return;
    const unsubLocal = onMessages({
      threadId,
      onUpdate: (msgs) => setMessages(msgs),
    });
    return () => unsubLocal();
  }, [threadId]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!canSend) return;

    try {
      setIsSending(true);
      const payload = {
        threadId,
        senderRole: "user",
        text: text.trim(),
      };
      await sendMessage(payload);
      setText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingThread) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div
      className={`${compact ? "" : "bg-white rounded-lg shadow-md"} ${compact ? "" : "p-4"}`}
    >
      <div className="flex flex-col h-[65vh] max-h-[65vh]">
        <div className="flex-1 overflow-auto border rounded-md p-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No messages yet. Say hi 👋
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => {
                const isMe = m.senderRole === "user";
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
            placeholder="Type a message..."
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
