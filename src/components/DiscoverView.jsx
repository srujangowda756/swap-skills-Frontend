import React, { useState, useEffect } from "react";
import {
  Compass,
  Search,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
  ArrowLeftRight,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const DiscoverView = ({
  allSkills = [],
  mySkills = [],
  onOpenAuth,
  onOpenSwapModal,
  onOpenAddSkill,
  setActiveTab,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Search state
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [searchType, setSearchType] = useState("teach"); // 'teach' = find people teaching; 'learn' = find people wanting to learn
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchFilterText, setSearchFilterText] = useState("");

  // Auto-select first skill if available and search
  useEffect(() => {
    if (allSkills.length > 0 && !selectedSkillId) {
      const firstSkill = allSkills[0];
      setSelectedSkillId(firstSkill.id);
      runDiscovery(firstSkill.id, searchType);
    }
  }, [allSkills]);

  const runDiscovery = async (skillId, type) => {
    if (!skillId) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await api.discoverUsers(skillId, type);
      // Filter out current user from matches if logged in
      const filtered = user
        ? results.filter((item) => item.user_id !== user.id)
        : results;
      setMatches(filtered);
    } catch (err) {
      console.error("Discovery error:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (id) => {
    setSelectedSkillId(id);
    runDiscovery(id, searchType);
  };

  const handleTypeToggle = (type) => {
    setSearchType(type);
    if (selectedSkillId) {
      runDiscovery(selectedSkillId, type);
    }
  };

  const selectedSkillObj = allSkills.find((s) => s.id === selectedSkillId);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if current user has any complementary skill
  const isMutualMatch = (match) => {
    if (!isAuthenticated || !mySkills.length) return false;
    // If we are looking for a teacher, and we have skills we teach
    return mySkills.some((s) => s.type === "teach");
  };

  return (
    <div className="discover-container">
      {/* Matchmaker Control Bar */}
      <section className="matchmaker-section">
        <div className="matchmaker-card">
          <div className="matchmaker-header">
            <div className="matchmaker-title-row">
              <Compass className="text-cyan" size={24} />
              <h2>Swap Matchmaker & Peer Finder</h2>
            </div>
            <p className="matchmaker-subtitle">
              Choose a skill to see who is ready to collaborate with you right
              now.
            </p>
          </div>

          <div className="matchmaker-controls">
            {/* Intent Switcher */}
            <div className="intent-switcher">
              <span className="control-label">Looking for:</span>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segment-btn ${searchType === "teach" ? "active" : ""}`}
                  onClick={() => handleTypeToggle("teach")}
                >
                  <GraduationCap size={16} />
                  <span>Teachers to Learn From</span>
                </button>
                <button
                  type="button"
                  className={`segment-btn ${searchType === "learn" ? "active" : ""}`}
                  onClick={() => handleTypeToggle("learn")}
                >
                  <Users size={16} />
                  <span>Students to Teach</span>
                </button>
              </div>
            </div>

            {/* Skill Selector */}
            <div className="skill-select-control">
              <label htmlFor="select-skill" className="control-label">
                Target Skill:
              </label>
              <select
                id="select-skill"
                className="select-input"
                value={selectedSkillId}
                onChange={(e) => handleSkillChange(e.target.value)}
              >
                {allSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.skill_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Skill Chips */}
          <div className="skill-chips-row">
            <span className="chips-label">Popular:</span>
            <div className="chips-list">
              {allSkills.slice(0, 7).map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  className={`skill-chip ${selectedSkillId === skill.id ? "active" : ""}`}
                  onClick={() => handleSkillChange(skill.id)}
                >
                  {skill.skill_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Results */}
      <section className="results-section">
        <div className="results-header">
          <div className="results-count">
            <h3>
              {selectedSkillObj ? (
                <>
                  Members for <strong>{selectedSkillObj.skill_name}</strong>
                </>
              ) : (
                "Available Matches"
              )}
            </h3>
            <span className="count-tag">
              {matches.length}{" "}
              {matches.length === 1 ? "user found" : "users found"}
            </span>
          </div>

          {matches.length > 0 && (
            <div className="results-filter">
              <div className="input-with-icon search-small">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchFilterText}
                  onChange={(e) => setSearchFilterText(e.target.value)}
                  className="form-input form-input-sm"
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={36} className="animate-spin text-cyan" />
            <p>Searching for compatible peers...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches
              .filter((m) =>
                searchFilterText
                  ? m.user_name
                      .toLowerCase()
                      .includes(searchFilterText.toLowerCase())
                  : true,
              )
              .map((match) => {
                const mutual = isMutualMatch(match);
                return (
                  <div key={match.id} className="match-card">
                    {mutual && (
                      <div
                        className="mutual-match-badge"
                        title="You have skills to exchange!"
                      >
                        <Sparkles size={12} />
                        <span>Swap Candidate</span>
                      </div>
                    )}

                    <div className="match-card-top">
                      <div className="user-avatar-lg">
                        {getInitials(match.user_name)}
                      </div>
                      <div className="match-user-details">
                        <h4 className="match-user-name">{match.user_name}</h4>
                        <span
                          className={`badge ${match.type === "teach" ? "badge-teach" : "badge-learn"}`}
                        >
                          {match.type === "teach"
                            ? "Offers Teaching"
                            : "Wants to Learn"}
                        </span>
                      </div>
                    </div>

                    <div className="match-skill-box">
                      <div className="match-skill-name">{match.skill_name}</div>
                      <p className="match-skill-desc">
                        {match.skill_description}
                      </p>
                    </div>

                    <div className="match-card-footer">
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => {
                          if (!isAuthenticated) {
                            onOpenAuth("login");
                          } else {
                            onOpenSwapModal(
                              { id: match.user_id, name: match.user_name },
                              {
                                id: match.skill_id,
                                skill_name: match.skill_name,
                              },
                              match.type,
                            );
                          }
                        }}
                      >
                        <ArrowLeftRight size={16} />
                        <span>Propose Swap</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="empty-results-card">
            <div className="empty-icon-circle">
              <Users size={32} />
            </div>
            <h3>No members found offering this yet</h3>
            <p>
              Be the pioneer! Add{" "}
              <strong>{selectedSkillObj?.skill_name || "this skill"}</strong> to
              your own profile as someone who can teach it or wants to learn it.
            </p>
            <div className="empty-actions">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab("profile")}
                >
                  <span>Go to My Profile & Add Skill</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenAuth("register")}
                >
                  <span>Sign Up to Claim This Skill</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
