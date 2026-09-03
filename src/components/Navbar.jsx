import React from 'react';
import { ArrowLeftRight, Compass, Sparkles, BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, mySkillsCount = 0 }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setActiveTab('discover')}>
          <div className="brand-logo-glow">
            <ArrowLeftRight className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Swap<span className="gradient-text">Skills</span></span>
            <span className="brand-badge">Peer-to-Peer</span>
          </div>
        </div>

        <nav className="navbar-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Compass size={18} />
            <span>Discover & Match</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <BookOpen size={18} />
            <span>All Skills</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login');
              } else {
                setActiveTab('profile');
              }
            }}
          >
            <User size={18} />
            <span>My Profile</span>
            {isAuthenticated && mySkillsCount > 0 && (
              <span className="nav-counter">{mySkillsCount}</span>
            )}
          </button>
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-badge" title={user.email}>
                <div className="user-avatar">{getInitials(user.name)}</div>
                <div className="user-info-text">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon-only"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={16} />
                <span>Log In</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onOpenAuth('register')}
              >
                <Sparkles size={16} />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
