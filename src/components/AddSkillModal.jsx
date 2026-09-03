import React, { useState } from 'react';
import { X, PlusCircle, Loader2, BookPlus } from 'lucide-react';
import { api } from '../services/api';

export const AddSkillModal = ({ isOpen, onClose, onSkillAdded }) => {
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!skillName.trim()) {
      setError('Please provide a skill name');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description of the skill');
      return;
    }

    setSubmitting(true);
    try {
      const newSkill = await api.createSkill({
        skill_name: skillName.trim(),
        description: description.trim(),
      });
      if (onSkillAdded) onSkillAdded(newSkill);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create skill. It might already exist.');
    } finally {
      setSubmitting(false);
    }
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
            <BookPlus size={22} />
          </div>
          <h2 className="modal-title">Contribute a Skill</h2>
          <p className="modal-subtitle">
            Add a new subject, craft, or technical skill to the platform catalog for others to teach & learn.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="skill-name">Skill Name</label>
            <input
              id="skill-name"
              type="text"
              className="form-input"
              placeholder="e.g. Graphic Design, Docker, Chess, Japanese"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skill-desc">Description</label>
            <textarea
              id="skill-desc"
              className="form-textarea"
              rows={3}
              placeholder="Explain what this skill covers and what learners will gain..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding Skill...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Add to Catalog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
