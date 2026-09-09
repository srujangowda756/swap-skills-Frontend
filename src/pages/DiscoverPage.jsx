import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DiscoverPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedType, setSelectedType] = useState('teach'); // 'teach' = find teachers, 'learn' = find students
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch skills catalog
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const data = await api.getSkills();
        setSkills(data || []);
        if (data && data.length > 0) {
          setSelectedSkillId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
        setError('Could not load skills catalog. Please try again.');
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  // Fetch matches whenever selectedSkillId or selectedType changes
  const fetchMatches = useCallback(async (skillId, type) => {
    if (!skillId) return;
    setLoadingMatches(true);
    setHasSearched(true);
    setError('');
    try {
      const results = await api.discoverUsers(skillId, type);
      // Filter out current user if logged in so they don't see themselves as a match
      const filtered = user
        ? results.filter((item) => item.user_id !== user.id)
        : results;
      setMatches(filtered);
    } catch (err) {
      console.error('Discovery fetch error:', err);
      setError('Failed to fetch matched users for this skill.');
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSkillId) {
      fetchMatches(selectedSkillId, selectedType);
    }
  }, [selectedSkillId, selectedType, fetchMatches]);

  const handleSkillChange = (newSkillId) => {
    setSelectedSkillId(newSkillId);
  };

  const handleTypeToggle = (type) => {
    setSelectedType(type);
  };

  const selectedSkillObj = skills.find((s) => s.id === selectedSkillId);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMatches = matches.filter((m) =>
    searchFilter
      ? m.user_name.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  return (
    <div className="discover-container">
      {/* Header Controls */}
      <section className="matchmaker-section">
        <div className="matchmaker-card">
          <div className="matchmaker-header">
            <div className="matchmaker-title-row">
              <Compass className="text-cyan" size={24} />
              <h1 className="page-title">Discover & Browse Users</h1>
            </div>
            <p className="matchmaker-subtitle">
              Select a skill and find community members who can teach it or want to learn it.
            </p>
          </div>

          <div className="matchmaker-controls">
            {/* Type Toggle */}
            <div className="intent-switcher">
              <span className="control-label">Looking for:</span>
              <div className="segmented-control" role="group" aria-label="Filter user role">
                <button
                  type="button"
                  className={`segment-btn ${selectedType === 'teach' ? 'active' : ''}`}
                  onClick={() => handleTypeToggle('teach')}
                  id="filter-teach-btn"
                >
                  <GraduationCap size={16} />
                  <span>People Who Teach</span>
                </button>
                <button
                  type="button"
                  className={`segment-btn ${selectedType === 'learn' ? 'active' : ''}`}
                  onClick={() => handleTypeToggle('learn')}
                  id="filter-learn-btn"
                >
                  <Users size={16} />
                  <span>People Who Want to Learn</span>
                </button>
              </div>
            </div>

            {/* Skill Dropdown */}
            <div className="skill-select-control">
              <label htmlFor="skill-selector" className="control-label">
                Select Skill:
              </label>
              {loadingSkills ? (
                <div className="loading-inline">
                  <Loader2 size={16} className="animate-spin text-cyan" />
                  <span>Loading catalog...</span>
                </div>
              ) : (
                <select
                  id="skill-selector"
                  className="select-input"
                  value={selectedSkillId}
                  onChange={(e) => handleSkillChange(e.target.value)}
                >
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.skill_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quick Skill Chips */}
          {skills.length > 0 && (
            <div className="skill-chips-row">
              <span className="chips-label">Quick select:</span>
              <div className="chips-list">
                {skills.slice(0, 8).map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className={`skill-chip ${selectedSkillId === skill.id ? 'active' : ''}`}
                    onClick={() => handleSkillChange(skill.id)}
                  >
                    {skill.skill_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="results-header">
          <div className="results-count">
            <h2>
              {selectedSkillObj ? (
                <>
                  Members for <strong>{selectedSkillObj.skill_name}</strong>
                </>
              ) : (
                'Available Users'
              )}
            </h2>
            <span className="count-tag">
              {matches.length} {matches.length === 1 ? 'member' : 'members'} found
            </span>
          </div>

          {matches.length > 0 && (
            <div className="results-filter">
              <div className="input-with-icon search-small">
                <Search size={15} className="input-icon" />
                <input
                  type="text"
                  placeholder="Filter members..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="form-input form-input-sm"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="alert-banner alert-error mb-4" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loadingMatches ? (
          <div className="loading-state">
            <Loader2 size={36} className="animate-spin text-cyan" />
            <p>Searching for users...</p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="matches-grid">
            {filteredMatches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-card-top">
                  <div className="user-avatar-lg">
                    {getInitials(match.user_name)}
                  </div>
                  <div className="match-user-details">
                    <h3 className="match-user-name">{match.user_name}</h3>
                    <span
                      className={`badge ${
                        match.type === 'teach' ? 'badge-teach' : 'badge-learn'
                      }`}
                    >
                      {match.type === 'teach' ? 'Offers Teaching' : 'Wants to Learn'}
                    </span>
                  </div>
                </div>

                <div className="match-skill-box">
                  <div className="match-skill-name">{match.skill_name}</div>
                  {match.skill_description && (
                    <p className="match-skill-desc">{match.skill_description}</p>
                  )}
                </div>

                <div className="match-card-footer">
                  <Link
                    to={`/user/${match.user_id}`}
                    state={{ userName: match.user_name }}
                    className="btn btn-secondary btn-block view-profile-btn"
                  >
                    <User size={15} />
                    <span>View Profile</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-results-card">
            <div className="empty-icon-circle">
              <Users size={32} />
            </div>
            <h3>No matches found</h3>
            <p>
              No community members are currently listed as{' '}
              {selectedType === 'teach' ? 'teaching' : 'learning'}{' '}
              <strong>{selectedSkillObj?.skill_name || 'this skill'}</strong>.
            </p>
            <p className="text-secondary text-sm mt-2">
              Try switching between "People Who Teach" and "People Who Want to Learn", or select a different skill above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
