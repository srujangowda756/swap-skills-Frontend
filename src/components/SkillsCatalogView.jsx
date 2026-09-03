import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  GraduationCap,
  Sparkles,
  Check,
  Compass,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SkillsCatalogView = ({
  skills = [],
  mySkills = [],
  onOpenAddSkill,
  onOpenAuth,
  onSkillAddedToUser,
  onSelectSkillForDiscovery,
  onShowToast,
}) => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const filteredSkills = skills.filter(
    (skill) =>
      skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isSkillAdded = (skillId, type) => {
    return mySkills.some((ms) => ms.skill_id === skillId && ms.type === type);
  };

  const handleAddUserSkill = async (skillId, type) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    const key = `${skillId}-${type}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    try {
      await api.addUserSkill({ skill_id: skillId, type });
      onSkillAddedToUser();
      onShowToast(
        `Added to your ${type === 'teach' ? 'Teaching' : 'Learning'} list!`,
        'success'
      );
    } catch (err) {
      onShowToast(err.message || 'Failed to add skill to your profile', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
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

  return (
    <div className="catalog-container">
      <div className="catalog-header-row">
        <div>
          <div className="section-eyebrow">
            <BookOpen size={16} className="text-cyan" />
            <span>Community Directory</span>
          </div>
          <h2 className="section-title">Explore All Skills</h2>
          <p className="section-desc">
            Browse our subject library or suggest new topics for the community to exchange.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!isAuthenticated) {
              onOpenAuth('login');
            } else {
              onOpenAddSkill();
            }
          }}
        >
          <Plus size={18} />
          <span>Contribute New Skill</span>
        </button>
      </div>

      <div className="catalog-toolbar">
        <div className="input-with-icon search-large">
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search skills by name, topic, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="catalog-count-pill">
          Showing <strong>{filteredSkills.length}</strong> of {skills.length} skills
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="empty-results-card">
          <div className="empty-icon-circle">
            <BookOpen size={32} />
          </div>
          <h3>No skills matched "{searchTerm}"</h3>
          <p>
            Can't find what you're looking for? Add it yourself to start connecting with learners and teachers!
          </p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login');
              } else {
                onOpenAddSkill();
              }
            }}
          >
            <Plus size={16} />
            <span>Add "{searchTerm}" to Platform</span>
          </button>
        </div>
      ) : (
        <div className="skills-grid">
          {filteredSkills.map((skill) => {
            const teaches = isSkillAdded(skill.id, 'teach');
            const learns = isSkillAdded(skill.id, 'learn');
            const teachLoading = actionLoading[`${skill.id}-teach`];
            const learnLoading = actionLoading[`${skill.id}-learn`];

            return (
              <div key={skill.id} className="skill-card">
                <div className="skill-card-body">
                  <div className="skill-header">
                    <h3 className="skill-title">{skill.skill_name}</h3>
                    {skill.added_at && (
                      <span className="skill-date" title="Added to catalog">
                        <Calendar size={13} />
                        {formatDate(skill.added_at)}
                      </span>
                    )}
                  </div>
                  <p className="skill-description">{skill.description}</p>
                </div>

                <div className="skill-card-footer">
                  <div className="skill-actions-row">
                    {/* Teach Button */}
                    <button
                      type="button"
                      className={`btn btn-sm ${teaches ? 'btn-active-teach' : 'btn-outline-teach'}`}
                      disabled={teaches || teachLoading}
                      onClick={() => handleAddUserSkill(skill.id, 'teach')}
                      title={teaches ? 'You teach this' : 'Add to your teaching list'}
                    >
                      {teachLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : teaches ? (
                        <>
                          <Check size={14} />
                          <span>Teaching</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap size={14} />
                          <span>I Can Teach</span>
                        </>
                      )}
                    </button>

                    {/* Learn Button */}
                    <button
                      type="button"
                      className={`btn btn-sm ${learns ? 'btn-active-learn' : 'btn-outline-learn'}`}
                      disabled={learns || learnLoading}
                      onClick={() => handleAddUserSkill(skill.id, 'learn')}
                      title={learns ? 'You are learning this' : 'Add to your learning wishlist'}
                    >
                      {learnLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : learns ? (
                        <>
                          <Check size={14} />
                          <span>Learning</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>I Want to Learn</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-block mt-2"
                    onClick={() => onSelectSkillForDiscovery(skill.id)}
                  >
                    <Compass size={14} />
                    <span>Find Peers For This Skill</span>
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
