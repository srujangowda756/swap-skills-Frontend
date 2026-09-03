import React, { useState } from 'react';
import { X, Send, ArrowLeftRight, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SwapRequestModal = ({
  isOpen,
  onClose,
  targetUser,
  targetSkill,
  targetType,
  userSkills = [],
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedOfferSkill, setSelectedOfferSkill] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  // Filter skills user can teach if target is teaching (or vice versa)
  const availableOffers = userSkills.filter((us) =>
    targetType === 'teach' ? us.type === 'teach' : us.type === 'learn'
  );

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(`Swap request sent to ${targetUser?.name || 'user'}!`);
      }
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-badge">
            <ArrowLeftRight size={22} />
          </div>
          <h2 className="modal-title">Propose a Skill Swap</h2>
          <p className="modal-subtitle">
            Connect with <strong>{targetUser?.name || 'this member'}</strong> to exchange knowledge and organize a session.
          </p>
        </div>

        {sent ? (
          <div className="success-confirmation">
            <CheckCircle2 size={48} className="text-emerald animate-bounce" />
            <h3>Request Sent!</h3>
            <p>
              Your proposal has been shared with {targetUser?.name}. You can coordinate via message to schedule your session!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="auth-form">
            <div className="swap-preview-card">
              <div className="swap-peer">
                <span className="swap-peer-label">They will provide:</span>
                <div className="swap-peer-skill">
                  <span className={`badge ${targetType === 'teach' ? 'badge-teach' : 'badge-learn'}`}>
                    {targetType === 'teach' ? 'Teaching' : 'Wants to Learn'}
                  </span>
                  <span className="swap-skill-title">{targetSkill?.skill_name || 'Skill'}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="offer-skill">What will you offer in return?</label>
              {availableOffers.length > 0 ? (
                <select
                  id="offer-skill"
                  className="form-input"
                  value={selectedOfferSkill}
                  onChange={(e) => setSelectedOfferSkill(e.target.value)}
                  required
                >
                  <option value="">-- Choose one of your skills to offer --</option>
                  {availableOffers.map((us) => (
                    <option key={us.id} value={us.skill_name}>
                      {us.skill_name} ({us.type === 'teach' ? 'You Teach' : 'You Learn'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="empty-hint-card">
                  <p>
                    Tip: Add skills you can <strong>Teach</strong> in your profile so you can propose mutual swaps easily!
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="swap-message">Personal Note or Preferred Schedule</label>
              <textarea
                id="swap-message"
                className="form-textarea"
                rows={3}
                placeholder="Hey! I saw you teach this skill. I'd love to swap for 1 hour a week over Zoom or Discord..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Send size={16} />
                <span>Send Proposal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
