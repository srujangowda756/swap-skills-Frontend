import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Compass,
  User,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Link */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/discover"}
          className="navbar-brand"
        >
          <div className="brand-logo-glow">
            <ArrowLeftRight className="brand-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              Swap<span className="gradient-text">Skills</span>
            </span>
            <span className="brand-badge">v1.0 • Peer Learning</span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="navbar-links" aria-label="Main Navigation">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              id="nav-dashboard-link"
            >
              <User size={17} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/discover"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              id="nav-discover-link"
            >
              <Compass size={17} />
              <span>Discover</span>
            </NavLink>

            <NavLink
              to="/requests"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              id="nav-requests-link"
            >
              <ArrowLeftRight size={17} />
              <span>Requests</span>
            </NavLink>

            <NavLink
              to="/inbox"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              id="nav-inbox-link"
            >
              <Sparkles size={17} />
              <span>Inbox</span>
            </NavLink>
          </nav>
        )}

        {/* Auth Section */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-badge" title={user?.email || ""}>
                <div className="user-avatar">{getInitials(user?.name)}</div>
                <div className="user-info-text">
                  <span className="user-name">{user?.name || "User"}</span>
                  <span className="user-email">{user?.email || ""}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon-only logout-btn"
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
                id="logout-button"
              >
                <LogOut size={16} />
                <span className="logout-text">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <Link
                to="/login"
                className="btn btn-secondary"
                id="nav-login-btn"
              >
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                id="nav-register-btn"
              >
                <Sparkles size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
