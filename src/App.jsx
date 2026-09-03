import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DiscoverView } from './components/DiscoverView';
import { SkillsCatalogView } from './components/SkillsCatalogView';
import { MyProfileView } from './components/MyProfileView';
import { AuthModal } from './components/AuthModal';
import { AddSkillModal } from './components/AddSkillModal';
import { SwapRequestModal } from './components/SwapRequestModal';
import { Toast } from './components/Toast';
import { api, API_BASE_URL } from './services/api';

function MainApp() {
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'skills' | 'profile'

  // Global Data
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);

  // Swap Request Modal State
  const [swapModalState, setSwapModalState] = useState({
    isOpen: false,
    targetUser: null,
    targetSkill: null,
    targetType: 'teach',
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all platform skills
  const fetchAllSkills = useCallback(async () => {
    try {
      setLoadingSkills(true);
      const data = await api.getSkills();
      setAllSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
      showToast('Could not load skills catalog. Please check backend connection.', 'error');
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  // Fetch logged-in user's skills
  const fetchMySkills = useCallback(async () => {
    if (!user) {
      setMySkills([]);
      return;
    }
    try {
      const data = await api.getUserSkills(user.id);
      setMySkills(data);
    } catch (err) {
      console.error('Failed to load user skills:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchAllSkills();
  }, [fetchAllSkills]);

  useEffect(() => {
    fetchMySkills();
  }, [fetchMySkills]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectSkillForDiscovery = (skillId) => {
    setActiveTab('discover');
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSwapModal = (targetUser, targetSkill, targetType) => {
    setSwapModalState({
      isOpen: true,
      targetUser,
      targetSkill,
      targetType,
    });
  };

  const handleCloseSwapModal = () => {
    setSwapModalState({
      isOpen: false,
      targetUser: null,
      targetSkill: null,
      targetType: 'teach',
    });
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        mySkillsCount={mySkills.length}
      />

      <main className="main-content">
        {activeTab === 'discover' && (
          <DiscoverView
            allSkills={allSkills}
            mySkills={mySkills}
            onOpenAuth={handleOpenAuth}
            onOpenSwapModal={handleOpenSwapModal}
            onOpenAddSkill={() => setAddSkillModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsCatalogView
            skills={allSkills}
            mySkills={mySkills}
            onOpenAddSkill={() => setAddSkillModalOpen(true)}
            onOpenAuth={handleOpenAuth}
            onSkillAddedToUser={fetchMySkills}
            onSelectSkillForDiscovery={handleSelectSkillForDiscovery}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'profile' && isAuthenticated && (
          <MyProfileView
            allSkills={allSkills}
            mySkills={mySkills}
            onRefreshMySkills={fetchMySkills}
            onSelectSkillForDiscovery={handleSelectSkillForDiscovery}
            onShowToast={showToast}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            © 2026 SwapSkills. Open Peer Knowledge Exchange Platform.
          </p>
          <div className="footer-api-status">
            <span className="status-dot"></span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchMySkills();
        }}
      />

      <AddSkillModal
        isOpen={addSkillModalOpen}
        onClose={() => setAddSkillModalOpen(false)}
        onSkillAdded={(newSkill) => {
          setAllSkills((prev) => [newSkill, ...prev]);
          showToast(`"${newSkill.skill_name}" added to skills catalog!`, 'success');
        }}
      />

      <SwapRequestModal
        isOpen={swapModalState.isOpen}
        onClose={handleCloseSwapModal}
        targetUser={swapModalState.targetUser}
        targetSkill={swapModalState.targetSkill}
        targetType={swapModalState.targetType}
        userSkills={mySkills}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Notification Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
