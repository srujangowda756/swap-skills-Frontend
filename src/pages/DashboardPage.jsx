import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Calendar,
  Plus,
  GraduationCap,
  Sparkles,
  Trash2,
  Loader2,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AddSkillModal } from '../components/AddSkillModal';

export const DashboardPage = ({ onShowToast }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch current user skills
  const fetchSkills = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.getUserSkills(userId);
      setSkills(data || []);
    } catch (err) {
      console.error('Failed to load user skills:', err);
      setError('Could not load your skills profile. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchSkills(user.id);
    }
  }, [user?.id, fetchSkills]);

  const handleRemoveSkill = async (userSkillId, skillName) => {
    if (!window.confirm(`Remove "${skillName}" from your profile?`)) {
      return;
    }

    setDeletingId(userSkillId);
    try {
      await api.removeUserSkill(userSkillId);
      setSkills((prev) => prev.filter((s) => s.id !== userSkillId));
      if (onShowToast) onShowToast(`Removed "${skillName}"`, 'info');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to remove skill', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSkillAdded = () => {
    if (user?.id) {
      fetchSkills(user.id);
    }
    if (onShowToast) {
      onShowToast('Skill successfully added to your profile!', 'success');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const teachSkills = skills.filter((s) => s.type === 'teach');
  const learnSkills = skills.filter((s) => s.type === 'learn');

  return (
    <div className="dashboard-container">
      {/* Header Profile Card */}
      <div className="profile-hero-card">
        <div className="profile-user-main">
          <div className="profile-avatar-large">
            {getInitials(user?.name)}
          </div>
          <div className="profile-details">
            <h1 className="profile-user-name">{user?.name || 'My Profile'}</h1>
            <div className="profile-meta-tags">
              <span className="profile-meta-item">
                <Mail size={15} />
                <span>{user?.email}</span>
              </span>
              {user?.created_at && (
                <span className="profile-meta-item">
                  <Calendar size={15} />
                  <span>Member since {formatDate(user?.created_at)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions-bar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            id="open-add-skill-modal-btn"
          >
            <Plus size={18} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error mb-4" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={36} className="animate-spin text-cyan" />
          <p>Loading your skills profile...</p>
        </div>
      ) : (
        <div className="dashboard-sections">
          {/* Section 1: Skills I Teach */}
          <section className="skills-section">
            <div className="section-header">
              <div className="section-title-row">
                <div className="section-icon-badge teach-icon-badge">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="section-title">Skills I Teach</h2>
                  <p className="section-subtitle">
                    Skills and knowledge you can offer to others
                  </p>
                </div>
              </div>
              <span className="skill-counter-badge badge-teach">
                {teachSkills.length} {teachSkills.length === 1 ? 'Skill' : 'Skills'}
              </span>
            </div>

            {teachSkills.length === 0 ? (
              <div className="empty-chip-box">
                <p>You haven't listed any skills to teach yet.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mt-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Add Teaching Skill</span>
                </button>
              </div>
            ) : (
              <div className="chips-container">
                {teachSkills.map((userSkill) => {
                  const isDeleting = deletingId === userSkill.id;
                  return (
                    <div
                      key={userSkill.id}
                      className="skill-chip-tag chip-teach"
                      title={userSkill.skill_description}
                    >
                      <GraduationCap size={15} className="chip-icon text-emerald" />
                      <span className="chip-name">{userSkill.skill_name}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() =>
                          handleRemoveSkill(userSkill.id, userSkill.skill_name)
                        }
                        disabled={isDeleting}
                        title="Remove this skill"
                        aria-label={`Remove ${userSkill.skill_name}`}
                      >
                        {isDeleting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Skills I Want to Learn */}
          <section className="skills-section">
            <div className="section-header">
              <div className="section-title-row">
                <div className="section-icon-badge learn-icon-badge">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="section-title">Skills I Want to Learn</h2>
                  <p className="section-subtitle">
                    Topics and abilities you want to acquire
                  </p>
                </div>
              </div>
              <span className="skill-counter-badge badge-learn">
                {learnSkills.length} {learnSkills.length === 1 ? 'Skill' : 'Skills'}
              </span>
            </div>

            {learnSkills.length === 0 ? (
              <div className="empty-chip-box">
                <p>You haven't listed any skills to learn yet.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mt-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Add Learning Goal</span>
                </button>
              </div>
            ) : (
              <div className="chips-container">
                {learnSkills.map((userSkill) => {
                  const isDeleting = deletingId === userSkill.id;
                  return (
                    <div
                      key={userSkill.id}
                      className="skill-chip-tag chip-learn"
                      title={userSkill.skill_description}
                    >
                      <Sparkles size={15} className="chip-icon text-violet" />
                      <span className="chip-name">{userSkill.skill_name}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() =>
                          handleRemoveSkill(userSkill.id, userSkill.skill_name)
                        }
                        disabled={isDeleting}
                        title="Remove this skill"
                        aria-label={`Remove ${userSkill.skill_name}`}
                      >
                        {isDeleting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Discovery CTA bar */}
      <div className="discover-cta-banner">
        <div>
          <h3>Ready to find someone to swap skills with?</h3>
          <p>Browse other members by skill and find teachers or students.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/discover')}
        >
          <Compass size={16} />
          <span>Explore Discover</span>
        </button>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSkillAdded={handleSkillAdded}
        existingSkills={skills}
      />
    </div>
  );
};
