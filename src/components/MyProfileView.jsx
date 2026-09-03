import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Trash2,
  Plus,
  Compass,
  Calendar,
  Loader2,
  Mail,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const MyProfileView = ({
  allSkills = [],
  mySkills = [],
  onRefreshMySkills,
  onSelectSkillForDiscovery,
  onShowToast,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'teach', 'learn'
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState('teach');
  const [addingSkill, setAddingSkill] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const teachSkills = mySkills.filter((s) => s.type === 'teach');
  const learnSkills = mySkills.filter((s) => s.type === 'learn');

  // Filter skills not yet added in the selected type
  const availableToAdd = allSkills.filter(
    (skill) => !mySkills.some((ms) => ms.skill_id === skill.id && ms.type === selectedTypeToAdd)
  );

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!selectedSkillToAdd) return;

    setAddingSkill(true);
    try {
      await api.addUserSkill({
        skill_id: selectedSkillToAdd,
        type: selectedTypeToAdd,
      });
      setSelectedSkillToAdd('');
      onRefreshMySkills();
      onShowToast(
        `Added to your ${selectedTypeToAdd === 'teach' ? 'Teaching' : 'Learning'} list!`,
        'success'
      );
    } catch (err) {
      onShowToast(err.message || 'Failed to add skill', 'error');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemove = async (userSkillId, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}" from your profile?`)) {
      return;
    }

    setDeletingId(userSkillId);
    try {
      await api.removeUserSkill(userSkillId);
      onRefreshMySkills();
      onShowToast(`Removed "${skillName}"`, 'info');
    } catch (err) {
      onShowToast(err.message || 'Failed to remove skill', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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

  const displayedSkills =
    activeSubTab === 'teach'
      ? teachSkills
      : activeSubTab === 'learn'
      ? learnSkills
      : mySkills;

  return (
    <div className="profile-container">
      {/* Profile Header Card */}
      <div className="profile-hero-card">
        <div className="profile-user-main">
          <div className="profile-avatar-large">{getInitials(user?.name)}</div>
          <div className="profile-details">
            <h2 className="profile-user-name">{user?.name}</h2>
            <div className="profile-meta-tags">
              <span className="profile-meta-item">
                <Mail size={14} />
                <span>{user?.email}</span>
              </span>
              <span className="profile-meta-item">
                <Calendar size={14} />
                <span>Member since {formatDate(user?.created_at)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-card-title">Skills I Teach</div>
            <div className="stat-card-val text-emerald">{teachSkills.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Want to Learn</div>
            <div className="stat-card-val text-violet">{learnSkills.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Total Skills</div>
            <div className="stat-card-val text-cyan">{mySkills.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="quick-add-card">
        <div className="quick-add-header">
          <Award size={18} className="text-cyan" />
          <h3>Quick Add Skill to Profile</h3>
        </div>
        <form onSubmit={handleQuickAdd} className="quick-add-form">
          <div className="form-group flex-1">
            <select
              className="select-input"
              value={selectedSkillToAdd}
              onChange={(e) => setSelectedSkillToAdd(e.target.value)}
              required
            >
              <option value="">-- Choose a skill from catalog --</option>
              {availableToAdd.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.skill_name}
                </option>
              ))}
            </select>
          </div>

          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${selectedTypeToAdd === 'teach' ? 'active' : ''}`}
              onClick={() => setSelectedTypeToAdd('teach')}
            >
              <GraduationCap size={15} />
              <span>I Can Teach</span>
            </button>
            <button
              type="button"
              className={`segment-btn ${selectedTypeToAdd === 'learn' ? 'active' : ''}`}
              onClick={() => setSelectedTypeToAdd('learn')}
            >
              <Sparkles size={15} />
              <span>I Want to Learn</span>
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingSkill || !selectedSkillToAdd}
          >
            {addingSkill ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Plus size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Skills Filter Tabs */}
      <div className="profile-skills-header">
        <div className="skills-filter-tabs">
          <button
            type="button"
            className={`filter-tab ${activeSubTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('all')}
          >
            All Skills ({mySkills.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeSubTab === 'teach' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('teach')}
          >
            <GraduationCap size={15} />
            <span>Teaching ({teachSkills.length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${activeSubTab === 'learn' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('learn')}
          >
            <Sparkles size={15} />
            <span>Learning ({learnSkills.length})</span>
          </button>
        </div>
      </div>

      {/* Skills List */}
      {displayedSkills.length === 0 ? (
        <div className="empty-results-card">
          <div className="empty-icon-circle">
            <GraduationCap size={32} />
          </div>
          <h3>No skills found in this section</h3>
          <p>
            Start adding skills you want to teach or learn to discover matches and exchange skills with other members.
          </p>
          <button
            type="button"
            className="btn btn-secondary mt-3"
            onClick={() => setActiveTab('skills')}
          >
            Browse Full Catalog
          </button>
        </div>
      ) : (
        <div className="my-skills-grid">
          {displayedSkills.map((userSkill) => {
            const isDeleting = deletingId === userSkill.id;
            const isTeach = userSkill.type === 'teach';

            return (
              <div key={userSkill.id} className="my-skill-card">
                <div className="my-skill-top">
                  <div className="my-skill-title-block">
                    <span className={`badge ${isTeach ? 'badge-teach' : 'badge-learn'}`}>
                      {isTeach ? 'Teaching' : 'Learning'}
                    </span>
                    <h4 className="my-skill-name">{userSkill.skill_name}</h4>
                  </div>
                  <button
                    type="button"
                    className="btn-danger-ghost"
                    onClick={() => handleRemove(userSkill.id, userSkill.skill_name)}
                    disabled={isDeleting}
                    title="Remove from my profile"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <p className="my-skill-desc">{userSkill.skill_description}</p>

                <div className="my-skill-footer">
                  <span className="my-skill-date">
                    Added {formatDate(userSkill.added_at)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onSelectSkillForDiscovery(userSkill.skill_id)}
                  >
                    <Compass size={14} />
                    <span>Find Peers</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
