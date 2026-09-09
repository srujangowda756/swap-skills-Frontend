import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { Toast } from './components/Toast';
import { Loader2 } from 'lucide-react';

// Protected Route wrapper for authenticated pages
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <Loader2 size={40} className="animate-spin text-cyan" />
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect already logged-in users away from Login/Register to Dashboard
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <Loader2 size={40} className="animate-spin text-cyan" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onShowToast={showToast} />
              </ProtectedRoute>
            }
          />

          {/* Public / Open Discovery Routes */}
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? '/dashboard' : '/discover'} replace />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            © 2026 SwapSkills v1. Peer-to-Peer Knowledge Sharing Platform.
          </p>
          <div className="footer-api-status">
            <span className="status-dot"></span>
            <span>API Online</span>
          </div>
        </div>
      </footer>

      {/* Global Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
