import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Loader2, Check, X, Clock3, Send } from "lucide-react";
import { api } from "../services/api";

const statusMeta = {
  pending: { label: "Pending", className: "status-pending" },
  accepted: { label: "Accepted", className: "status-accepted" },
  rejected: { label: "Rejected", className: "status-rejected" },
};

export const RequestsPage = () => {
  const [tab, setTab] = useState("received");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.listSwapRequests(tab);
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Unable to load swap requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const handleDecision = async (requestId, action) => {
    try {
      await api.respondToSwapRequest(requestId, action);
      await fetchRequests();
    } catch (err) {
      setError(err.message || "Unable to update this request.");
    }
  };

  const visibleRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [requests]);

  return (
    <div className="requests-page">
      <div className="panel-header-row requests-header">
        <div>
          <p className="eyebrow-text">Connections</p>
          <h1 className="page-title">Swap Requests</h1>
        </div>
      </div>

      <div className="glass-panel requests-panel">
        <div
          className="segmented-control request-tabs"
          role="tablist"
          aria-label="Swap request tabs"
        >
          <button
            type="button"
            className={`segment-btn ${tab === "received" ? "active" : ""}`}
            onClick={() => setTab("received")}
          >
            <ArrowLeftRight size={15} />
            <span>Received</span>
          </button>
          <button
            type="button"
            className={`segment-btn ${tab === "sent" ? "active" : ""}`}
            onClick={() => setTab("sent")}
          >
            <Send size={15} />
            <span>Sent</span>
          </button>
        </div>

        {error && (
          <div className="alert-banner alert-error mt-2">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state compact-state">
            <Loader2 size={28} className="animate-spin text-cyan" />
            <p>Loading requests…</p>
          </div>
        ) : visibleRequests.length === 0 ? (
          <div className="empty-state-card">
            <Clock3 size={28} />
            <h3>No {tab} requests yet</h3>
            <p>When someone reaches out to swap skills, they’ll appear here.</p>
          </div>
        ) : (
          <div className="request-list">
            {visibleRequests.map((request) => {
              const peerId =
                tab === "received" ? request.sender_id : request.receiver_id;
              const peerName = peerId
                ? `${peerId.slice(0, 8)}...`
                : "Unknown user";
              const status = statusMeta[request.status] || statusMeta.pending;

              return (
                <div key={request.id} className="request-row glass-row">
                  <div className="request-avatar">
                    {peerName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="request-main">
                    <div className="request-headline">
                      <h3>{peerName}</h3>
                      <span className={`status-pill ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="request-meta">
                      {tab === "received"
                        ? "Sent you a skill swap request"
                        : "You sent a swap request"}
                    </p>
                  </div>

                  <div className="request-actions">
                    {tab === "received" && request.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDecision(request.id, "reject")}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDecision(request.id, "accept")}
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                      </>
                    ) : (
                      <span className="request-date">
                        {new Date(request.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
