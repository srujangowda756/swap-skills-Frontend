import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  Compass,
  Users,
  MessageSquareText,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="landing-page-shell">
      <div className="landing-card">
        <div className="landing-brand-row">
          <div className="brand-logo-glow landing-logo">
            <ArrowLeftRight className="brand-icon" size={26} />
          </div>
          <span className="landing-tag">Peer learning platform</span>
        </div>

        <h1 className="landing-title">
          Swap skills.
          <br />
          Grow together.
        </h1>

        <p className="landing-subtitle">
          Connect with people who teach what you want to learn and learn what
          you can teach back.
        </p>

        <div className="landing-actions">
          <Link
            to="/login"
            className="btn btn-primary btn-lg"
            id="landing-login-btn"
          >
            <span>Login</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="btn btn-secondary btn-lg"
            id="landing-signup-btn"
          >
            <span>Sign Up</span>
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
    </div>
  );
};
