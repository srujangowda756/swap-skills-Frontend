import React, { useEffect, useState } from "react";
import { MessageSquareText, Loader2, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export const InboxPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.getConversations();
        setConversations(data || []);
      } catch (err) {
        setError(err.message || "Unable to load your conversations.");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  return (
    <div className="inbox-page">
      <div className="panel-header-row">
        <div>
          <p className="eyebrow-text">Messages</p>
          <h1 className="page-title">Inbox</h1>
        </div>
      </div>

      <div className="glass-panel inbox-panel">
        {error && (
          <div className="alert-banner alert-error">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state compact-state">
            <Loader2 size={28} className="animate-spin text-cyan" />
            <p>Loading conversations…</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state-card">
            <MessageSquareText size={28} />
            <h3>No conversations yet</h3>
            <p>
              Accept a swap request to start messaging your new learning
              partner.
            </p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                type="button"
                className="conversation-row"
                onClick={() =>
                  navigate(`/chat/${conversation.conversation_id}`, {
                    state: { otherUserName: conversation.other_user_name },
                  })
                }
              >
                <div className="conversation-avatar">
                  {conversation.other_user_name?.slice(0, 2).toUpperCase() ||
                    "U"}
                </div>

                <div className="conversation-content">
                  <div className="conversation-topline">
                    <h3>{conversation.other_user_name || "Member"}</h3>
                    {conversation.last_message_at && (
                      <span className="conversation-time">
                        {new Date(
                          conversation.last_message_at,
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="conversation-preview">
                    {conversation.last_message || "Start the conversation"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
