import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, SendHorizonal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const ChatPage = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState(
    location.state?.otherUserName || "Chat",
  );

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const data = await api.getConversationMessages(conversationId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || !conversationId) return;

    try {
      setSending(true);
      const sent = await api.sendMessage({
        conversation_id: conversationId,
        content: trimmed,
      });
      setMessages((prev) => [...prev, sent]);
      setInput("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at)),
    [messages],
  );

  return (
    <div className="chat-page">
      <button
        type="button"
        className="back-link chat-back"
        onClick={() => navigate("/inbox")}
      >
        <ArrowLeft size={16} />
        <span>Back to Inbox</span>
      </button>

      <div className="glass-panel chat-panel">
        <header className="chat-header">
          <div className="conversation-avatar conversation-avatar-large">
            {otherUserName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2>{otherUserName}</h2>
            <span className="status-indicator">Online</span>
          </div>
        </header>

        <div className="chat-thread">
          {loading ? (
            <div className="loading-state compact-state">
              <Loader2 size={28} className="animate-spin text-cyan" />
              <p>Loading messages…</p>
            </div>
          ) : (
            sortedMessages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`message-row ${isOwn ? "own" : "their"}`}
                >
                  <div className={`message-bubble ${isOwn ? "own" : "their"}`}>
                    <p>{message.content}</p>
                    <span>
                      {new Date(message.sent_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-composer">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message…"
            className="chat-input"
          />
          <button
            type="button"
            className="btn btn-primary chat-send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            <SendHorizonal size={17} />
            <span>{sending ? "Sending" : "Send"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
