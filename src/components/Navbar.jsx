import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Compass,
  Bell,
  CalendarDays,
  User,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const data = await api.getNotifications();
        if (active) setNotifications(data || []);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!notificationMenuRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        const updated = await api.markNotificationRead(notification.id);
        setNotifications((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    setNotificationsOpen(false);
    navigate(notification.type === "request_received" ? "/requests" : "/inbox");
  };

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
            <span className="brand-badge">Peer Learning</span>
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
              to="/sessions"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              id="nav-sessions-link"
            >
              <CalendarDays size={17} />
              <span>Sessions</span>
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
              <div className="notification-menu" ref={notificationMenuRef}>
                <button
                  type="button"
                  className="notification-trigger"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                  aria-expanded={notificationsOpen}
                  aria-controls="notification-dropdown"
                  title="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="notification-count">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <section
                    className="notification-dropdown"
                    id="notification-dropdown"
                    aria-label="Notifications"
                  >
                    <div className="notification-heading">
                      <h2>Notifications</h2>
                      {unreadCount > 0 && <span>{unreadCount} new</span>}
                    </div>
                    {notifications.length ? (
                      <ul className="notification-list">
                        {notifications.map((notification) => (
                          <li key={notification.id}>
                            <button
                              type="button"
                              className={`notification-item ${notification.is_read ? "read" : "unread"}`}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <span className="notification-message">
                                {notification.message}
                              </span>
                              <time dateTime={notification.created_at}>
                                {new Date(
                                  notification.created_at,
                                ).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </time>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="notification-empty">
                        You’re all caught up.
                      </p>
                    )}
                  </section>
                )}
              </div>
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
