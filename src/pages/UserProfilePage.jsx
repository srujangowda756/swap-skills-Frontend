import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { SwapRequestModal } from "../components/SwapRequestModal";

export const UserProfilePage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [mySkills, setMySkills] = useState([]);

  const userName = location.state?.userName || "Member Profile";

  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");
      try {
        const data = await api.getUserSkills(userId);
        setSkills(data || []);
      } catch (err) {
        console.error("Failed to load user profile skills:", err);
        setError("Could not retrieve this user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [userId]);

  useEffect(() => {
    const loadMySkills = async () => {
      if (!currentUser?.id) return;
      try {
        const data = await api.getUserSkills(currentUser.id);
        setMySkills(data || []);
      } catch (err) {
        console.error("Failed to load your skills for swap request:", err);
      }
    };

    loadMySkills();
  }, [currentUser?.id]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const teachSkills = skills.filter((s) => s.type === "teach");
  const learnSkills = skills.filter((s) => s.type === "learn");

  return (
    <div className="user-profile-container">
      {/* Back to Discover link */}
      <div className="nav-back-row">
        <Link to="/discover" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Discover</span>
        </Link>
      </div>

      {/* User Header */}
      <div className="profile-hero-card profile-hero-card-alt">
        <div className="profile-user-main">
          <div className="profile-avatar-large">{getInitials(userName)}</div>
          <div className="profile-details">
            <div className="user-role-badge">Community Member</div>
            <h1 className="profile-user-name">{userName}</h1>
            <p className="profile-subtext">
              Sharing expertise and exploring new knowledge on SkillSwap
            </p>
          </div>
        </div>

        <div className="profile-actions-bar profile-actions-bar-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsSwapModalOpen(true)}
          >
            <Send size={18} />
            <span>Send Swap Request</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error mb-4" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader2 size={36} className="animate-spin text-cyan" />
          <p>Loading member's skill profile...</p>
        </div>
      ) : (
        <div className="dashboard-sections">
          {/* Skills They Teach */}
          <section className="skills-section">
            <div className="section-header">
              <div className="section-title-row">
                <div className="section-icon-badge teach-icon-badge">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="section-title">Skills They Teach</h2>
                  <p className="section-subtitle">
                    Knowledge this member offers to teach
                  </p>
                </div>
              </div>
              <span className="skill-counter-badge badge-teach">
                {teachSkills.length}{" "}
                {teachSkills.length === 1 ? "Skill" : "Skills"}
              </span>
            </div>

            {teachSkills.length === 0 ? (
              <div className="empty-chip-box">
                <p>No teaching skills listed by this member yet.</p>
              </div>
            ) : (
              <div className="chips-container">
                {teachSkills.map((userSkill) => (
                  <div
                    key={userSkill.id}
                    className="skill-chip-tag chip-teach"
                    title={userSkill.skill_description}
                  >
                    <GraduationCap
                      size={15}
                      className="chip-icon text-emerald"
                    />
                    <span className="chip-name">{userSkill.skill_name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Skills They Want to Learn */}
          <section className="skills-section">
            <div className="section-header">
              <div className="section-title-row">
                <div className="section-icon-badge learn-icon-badge">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="section-title">Skills They Want to Learn</h2>
                  <p className="section-subtitle">
                    Subjects this member wants to study
                  </p>
                </div>
              </div>
              <span className="skill-counter-badge badge-learn">
                {learnSkills.length}{" "}
                {learnSkills.length === 1 ? "Skill" : "Skills"}
              </span>
            </div>

            {learnSkills.length === 0 ? (
              <div className="empty-chip-box">
                <p>No learning goals listed by this member yet.</p>
              </div>
            ) : (
              <div className="chips-container">
                {learnSkills.map((userSkill) => (
                  <div
                    key={userSkill.id}
                    className="skill-chip-tag chip-learn"
                    title={userSkill.skill_description}
                  >
                    <Sparkles size={15} className="chip-icon text-violet" />
                    <span className="chip-name">{userSkill.skill_name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <SwapRequestModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        targetUser={{
          id: userId,
          name: userName,
        }}
        targetSkill={
          teachSkills[0] || learnSkills[0] || { skill_name: "a skill" }
        }
        targetType={teachSkills.length > 0 ? "teach" : "learn"}
        userSkills={mySkills}
        onSuccess={() => setIsSwapModalOpen(false)}
      />
    </div>
  );
};
