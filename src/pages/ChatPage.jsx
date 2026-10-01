import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, SendHorizonal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, api } from "../services/api";

export const ChatPage = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [socketConnection, setSocketConnection] = useState({
    conversationId: null,
    connected: false,
  });
  const [otherUserOnline, setOtherUserOnline] = useState({
    conversationId: null,
    online: null,
  });
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const otherUserName = location.state?.otherUserName || "Chat";
  const presenceStatus =
    otherUserOnline.conversationId === conversationId
      ? otherUserOnline.online
      : null;
  const loading = loadedConversationId !== conversationId;

  useEffect(() => {
    if (!conversationId) return undefined;

    let active = true;
    api
      .getConversationMessages(conversationId)
      .then((data) => {
        if (active) {
          setMessages((current) => {
            const messageMap = new Map(
              (data || []).map((message) => [message.id, message]),
            );
            current.forEach((message) => messageMap.set(message.id, message));
            return [...messageMap.values()];
          });
        }
      })
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => {
        if (active) setLoadedConversationId(conversationId);
      });

    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !token) return undefined;

    const socketUrl = new URL(API_BASE_URL);
    socketUrl.protocol = socketUrl.protocol === "https:" ? "wss:" : "ws:";
    socketUrl.pathname = `/ws/${conversationId}`;
    socketUrl.search = new URLSearchParams({ token }).toString();

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;
    socket.onopen = () =>
      setSocketConnection({ conversationId, connected: true });

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "presence_snapshot") {
        setOtherUserOnline({
          conversationId,
          online: payload.online_user_ids.some(
            (onlineUserId) => onlineUserId !== String(user?.id),
          ),
        });
        return;
      }
      if (payload.type === "presence") {
        if (payload.user_id !== String(user?.id)) {
          setOtherUserOnline({ conversationId, online: payload.online });
        }
        return;
      }
      if (payload.id) {
        setMessages((current) =>
          current.some((message) => message.id === payload.id)
            ? current
            : [...current, payload],
        );
      }
    };
    socket.onclose = () => {
      setSocketConnection({ conversationId, connected: false });
      setOtherUserOnline({ conversationId, online: null });
    };
    socket.onerror = () => {
      setSocketConnection({ conversationId, connected: false });
      setOtherUserOnline({ conversationId, online: null });
    };

    return () => {
      socket.onmessage = null;
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.close();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [conversationId, token, user?.id]);

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
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("Chat connection is not ready");
      }
      socket.send(JSON.stringify({ content: trimmed }));
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
            <span
              className={`status-indicator ${presenceStatus ? "online" : ""}`}
            >
              {presenceStatus === null
                ? "Connecting…"
                : presenceStatus
                  ? "Online"
                  : "Offline"}
            </span>
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
            disabled={
              sending ||
              socketConnection.conversationId !== conversationId ||
              !socketConnection.connected
            }
          >
            <SendHorizonal size={17} />
            <span>{sending ? "Sending" : "Send"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
