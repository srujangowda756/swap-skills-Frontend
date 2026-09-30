import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Loader2,
  GraduationCap,
  Sparkles,
  Search,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";

export const AddSkillModal = ({
  isOpen,
  onClose,
  onSkillAdded,
  existingSkills = [],
}) => {
  const [skillsList, setSkillsList] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillType, setSkillType] = useState("teach"); // 'teach' or 'learn'
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load skills when modal opens
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSelectedSkillId("");
      setSearchTerm("");
      loadSkillsCatalog();
    }
  }, [isOpen]);

  const loadSkillsCatalog = async () => {
    setLoadingSkills(true);
    try {
      const data = await api.getSkills();
      setSkillsList(data || []);
      if (data && data.length > 0) {
        setSelectedSkillId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load skills:", err);
      setError("Could not load skills catalog from server.");
    } finally {
      setLoadingSkills(false);
    }
  };

  if (!isOpen) return null;

  const filteredSkills = skillsList.filter((s) =>
    s.skill_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedSkillId) {
      setError("Please select a skill from the list.");
      return;
    }

    // Client-side pre-check for clean UX
    const alreadyAdded = existingSkills.some(
      (us) => us.skill_id === selectedSkillId,
    );
    if (alreadyAdded) {
      setError(
        "This skill is already on your profile. You cannot add it again.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.addUserSkill({
        skill_id: selectedSkillId,
        type: skillType,
      });

      if (onSkillAdded) {
        onSkillAdded(result);
      }
      onClose();
    } catch (err) {
      const msg = err.message || "";
      if (
        msg.toLowerCase().includes("already added") ||
        msg.toLowerCase().includes("uq_user_skill")
      ) {
        setError(
          "This skill is already on your profile. You cannot add it again.",
        );
      } else {
        setError(msg || "Failed to add skill to your profile.");
      }
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
            <Plus size={22} />
          </div>
          <h2 className="modal-title">Add Skill to Profile</h2>
          <p className="modal-subtitle">
            Choose whether you can teach this skill to others or want to learn
            it.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Type Radio/Toggle */}
          <div className="form-group">
            <label className="label-bold">
              How do you want to list this skill?
            </label>
            <div className="type-radio-group">
              <label
                className={`type-radio-card ${skillType === "teach" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="skillType"
                  value="teach"
                  checked={skillType === "teach"}
                  onChange={() => setSkillType("teach")}
                  className="sr-only"
                />
                <div className="type-card-content">
                  <GraduationCap size={20} className="type-icon teach" />
                  <div>
                    <div className="type-title">I can teach this</div>
                    <div className="type-desc">
                      Offer your expertise to peers
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`type-radio-card ${skillType === "learn" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="skillType"
                  value="learn"
                  checked={skillType === "learn"}
                  onChange={() => setSkillType("learn")}
                  className="sr-only"
                />
                <div className="type-card-content">
                  <Sparkles size={20} className="type-icon learn" />
                  <div>
                    <div className="type-title">I want to learn this</div>
                    <div className="type-desc">Find mentors to learn from</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Skill Dropdown / Searchable */}
          <div className="form-group">
            <label htmlFor="skill-select" className="label-bold">
              Select Skill
            </label>

            {loadingSkills ? (
              <div className="loading-skills-indicator">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading available skills...</span>
              </div>
            ) : (
              <>
                <div className="searchable-filter">
                  <div className="input-with-icon">
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Search skill catalog..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </div>
                </div>

                <select
                  id="skill-select"
                  className="select-input mt-2"
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    -- Select a skill --
                  </option>
                  {filteredSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.skill_name}
                    </option>
                  ))}
                </select>
              </>
            )}
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
              disabled={submitting || !selectedSkillId || loadingSkills}
              id="submit-add-skill"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add to Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
