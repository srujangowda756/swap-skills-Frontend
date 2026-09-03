import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('swapskills_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('swapskills_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('swapskills_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('swapskills_token', data.access_token);
    setToken(data.access_token);
    // Fetch profile immediately
    const userProfile = await api.getMe();
    setUser(userProfile);
    return userProfile;
  };

  const register = async (name, email, password) => {
    await api.register({ name, email, password });
    // Log user in right after registration
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('swapskills_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (e) {
        console.error('Failed to refresh user:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
