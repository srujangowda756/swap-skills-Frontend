import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, Loader2, Star, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const shortId = (id) => (id ? `Member ${id.slice(0, 8)}` : "Swap partner");

export const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [selectedReviewSession, setSelectedReviewSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewedSessionIds, setReviewedSessionIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSessionId, setSavingSessionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const [sessionData, sentRequests, receivedRequests] = await Promise.all(
          [
            api.getMySessions(),
            api.listSwapRequests("sent"),
            api.listSwapRequests("received"),
          ],
        );
        if (!active) return;
        setSessions(sessionData || []);
        setAcceptedRequests(
          [...(sentRequests || []), ...(receivedRequests || [])].filter(
            (request) => request.status === "accepted",
          ),
        );
      } catch (err) {
        if (active) setError(err.message || "Unable to load your sessions.");
      } finally {
        if (active) setLoading(false);
      }
    };

    queueMicrotask(() => void loadSessions());
    return () => {
      active = false;
    };
  }, []);

  const availableRequests = acceptedRequests.filter(
    (request) =>
      !sessions.some(
        (session) =>
          session.swap_request_id === request.id &&
          session.status === "scheduled",
      ),
  );

  const getPeerId = (session) => {
    const request = acceptedRequests.find(
      (item) => item.id === session.swap_request_id,
    );
    if (!request) return "";
    return request.sender_id === user?.id
      ? request.receiver_id
      : request.sender_id;
  };

  const scheduleSession = async (event) => {
    event.preventDefault();
    if (!selectedRequestId || !scheduledAt) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const created = await api.createSession({
        swap_request_id: selectedRequestId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: Number(duration) || null,
      });
      setSessions((current) => [...current, created]);
      setScheduledAt("");
      setNotice("Session scheduled.");
    } catch (err) {
      setError(err.message || "Unable to schedule this session.");
    } finally {
      setSaving(false);
    }
  };

  const updateSession = async (sessionId, action) => {
    setSavingSessionId(sessionId);
    setError("");
    setNotice("");
    try {
      const updated = await api.updateSessionStatus(sessionId, action);
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? updated : session,
        ),
      );
      setNotice(
        action === "complete"
          ? "Session marked complete."
          : "Session cancelled.",
      );
    } catch (err) {
      setError(err.message || "Unable to update this session.");
    } finally {
      setSavingSessionId("");
    }
  };

  const openReview = async (session) => {
    const peerId = getPeerId(session);
    if (!peerId) {
      setError("Could not identify the other session participant.");
      return;
    }
    setError("");
    try {
      const peerReviews = await api.getUserReviews(peerId);
      const alreadyReviewed = (peerReviews || []).some(
        (review) =>
          review.session_id === session.id && review.reviewer_id === user?.id,
      );
      if (alreadyReviewed) {
        setReviewedSessionIds((current) => new Set(current).add(session.id));
        setNotice("You have already reviewed this session.");
        return;
      }
      setSelectedReviewSession(session);
      setRating(5);
      setComment("");
    } catch (err) {
      setError(err.message || "Unable to check the review status.");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedReviewSession) return;
    setSaving(true);
    setError("");
    try {
      await api.createReview({
        session_id: selectedReviewSession.id,
        reviewed_user_id: getPeerId(selectedReviewSession),
        rating,
        comment: comment.trim() || null,
      });
      setReviewedSessionIds((current) =>
        new Set(current).add(selectedReviewSession.id),
      );
      setSelectedReviewSession(null);
      setNotice("Review submitted.");
    } catch (err) {
      setError(err.message || "Unable to submit your review.");
    } finally {
      setSaving(false);
    }
  };

  const orderedSessions = [...sessions].sort(
    (first, second) =>
      new Date(first.scheduled_at) - new Date(second.scheduled_at),
  );

  return (
    <div className="sessions-page">
      <div className="panel-header-row">
        <div>
          <p className="eyebrow-text">Your learning schedule</p>
          <h1 className="page-title">Sessions</h1>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <p className="session-notice" role="status">
          {notice}
        </p>
      )}

      <section className="glass-panel session-scheduler">
        <div className="session-section-heading">
          <div className="section-icon-badge teach-icon-badge">
            <CalendarDays size={19} />
          </div>
          <div>
            <h2>Schedule a session</h2>
            <p>Choose an accepted swap request and set a time.</p>
          </div>
        </div>
        {availableRequests.length ? (
          <form className="session-schedule-form" onSubmit={scheduleSession}>
            <label>
              Accepted swap
              <select
                className="select-input"
                value={selectedRequestId}
                onChange={(event) => setSelectedRequestId(event.target.value)}
                required
              >
                <option value="">Choose a swap</option>
                {availableRequests.map((request) => {
                  const peerId =
                    request.sender_id === user?.id
                      ? request.receiver_id
                      : request.sender_id;
                  return (
                    <option key={request.id} value={request.id}>
                      {shortId(peerId)}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Date and time
              <input
                className="form-input"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </label>
            <label>
              Duration (minutes)
              <input
                className="form-input"
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CalendarDays size={16} />
              )}
              <span>Schedule</span>
            </button>
          </form>
        ) : (
          <p className="session-helper-text">
            Accept a swap request before scheduling a session.
          </p>
        )}
      </section>

      <section className="glass-panel session-list-panel">
        <div className="session-section-heading">
          <div className="section-icon-badge learn-icon-badge">
            <Clock3 size={19} />
          </div>
          <div>
            <h2>Your sessions</h2>
            <p>Manage scheduled sessions and review completed swaps.</p>
          </div>
        </div>
        {loading ? (
          <div className="loading-state compact-state">
            <Loader2 size={28} className="animate-spin text-cyan" />
            <p>Loading sessions...</p>
          </div>
        ) : orderedSessions.length === 0 ? (
          <div className="empty-state-card">
            <CalendarDays size={28} />
            <h3>No sessions yet</h3>
            <p>Your scheduled sessions will appear here.</p>
          </div>
        ) : (
          <div className="session-list">
            {orderedSessions.map((session) => {
              const peerId = getPeerId(session);
              const reviewOpen = selectedReviewSession?.id === session.id;
              const isSaving = savingSessionId === session.id;
              return (
                <article className="session-item" key={session.id}>
                  <div className="session-item-main">
                    <div>
                      <h3>{shortId(peerId)}</h3>
                      <p>{formatDate(session.scheduled_at)}</p>
                      {session.duration_minutes && (
                        <p>{session.duration_minutes} minutes</p>
                      )}
                    </div>
                    <span className={`status-pill status-${session.status}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="session-item-actions">
                    {session.status === "scheduled" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isSaving}
                          onClick={() => updateSession(session.id, "cancel")}
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isSaving}
                          onClick={() => updateSession(session.id, "complete")}
                        >
                          {isSaving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          <span>Complete</span>
                        </button>
                      </>
                    )}
                    {session.status === "completed" &&
                      (reviewedSessionIds.has(session.id) ? (
                        <span className="session-reviewed">
                          <Check size={15} /> Reviewed
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => void openReview(session)}
                        >
                          <Star size={14} />
                          <span>Leave review</span>
                        </button>
                      ))}
                  </div>
                  {reviewOpen && (
                    <form
                      className="session-review-form"
                      onSubmit={submitReview}
                    >
                      <label>Rating</label>
                      <div
                        className="session-rating-picker"
                        role="group"
                        aria-label="Choose a rating"
                      >
                        {Array.from({ length: 5 }, (_, index) => {
                          const value = index + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              className={value <= rating ? "selected" : ""}
                              aria-label={`${value} star${value === 1 ? "" : "s"}`}
                              aria-pressed={rating === value}
                              onClick={() => setRating(value)}
                            >
                              <Star
                                size={21}
                                fill={value <= rating ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <label htmlFor={`review-comment-${session.id}`}>
                        Comment
                      </label>
                      <textarea
                        id={`review-comment-${session.id}`}
                        className="form-textarea"
                        rows="3"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Share a few details about the session"
                      />
                      <div className="session-review-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          type="button"
                          onClick={() => setSelectedReviewSession(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          type="submit"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Star size={14} />
                          )}
                          <span>Submit review</span>
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
