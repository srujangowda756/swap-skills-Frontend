import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  Compass,
  Users,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="landing-page-shell">
      <div className="landing-orbit landing-orbit-one" aria-hidden="true" />
      <div className="landing-orbit landing-orbit-two" aria-hidden="true" />
      <div className="landing-card">
        <div className="landing-layout">
          <div className="landing-copy">
            <div className="landing-brand-row">
              <div className="brand-logo-glow landing-logo">
                <ArrowLeftRight className="brand-icon" size={26} />
              </div>
              <span className="landing-tag">
                <Sparkles size={13} /> Peer learning platform
              </span>
            </div>

            <p className="landing-kicker">
              Your next skill is closer than you think.
            </p>
            <h1 className="landing-title">
              Swap skills.
              <br />
              <span className="gradient-text">Grow together.</span>
            </h1>

            <p className="landing-subtitle">
              Trade practical knowledge with curious people. Teach what you
              know, learn what matters, and make progress with a real person
              beside you.
            </p>

            <div className="landing-actions">
              <Link
                to="/login"
                className="btn btn-primary btn-lg"
                id="landing-login-btn"
              >
                <span>Start swapping</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary btn-lg"
                id="landing-signup-btn"
              >
                <span>Create a profile</span>
              </Link>
            </div>

            <div className="landing-features">
              <div className="feature-pill">
                <Compass size={16} />
                <span>Discover people</span>
              </div>
              <div className="feature-pill">
                <Users size={16} />
                <span>Swap expertise</span>
              </div>
              <div className="feature-pill">
                <MessageSquareText size={16} />
                <span>Message & match</span>
              </div>
            </div>
          </div>
          <div className="landing-visual" aria-label="A skill swap preview">
            <div className="visual-header">
              <span className="live-dot" /> Live skill exchange
              <span className="visual-menu">•••</span>
            </div>
            <div className="visual-match-score">
              <span>Great match</span>
              <strong>92%</strong>
            </div>
            <div className="visual-people">
              <div className="visual-person visual-person-left">
                <div className="visual-avatar avatar-coral">AL</div>
                <strong>Alex</strong>
                <span>Teaches UX writing</span>
              </div>
              <div className="visual-swap-icon">
                <ArrowLeftRight size={18} />
              </div>
              <div className="visual-person visual-person-right">
                <div className="visual-avatar avatar-mint">JM</div>
                <strong>Jamie</strong>
                <span>Teaches React</span>
              </div>
            </div>
            <div className="visual-tags">
              <span>UX writing</span>
              <span>React</span>
              <span>Portfolio review</span>
            </div>
            <div className="visual-footer">
              <span>
                <span className="avatar-stack">
                  <i>R</i>
                  <i>S</i>
                  <i>K</i>
                </span>{" "}
                18 people learning today
              </span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
