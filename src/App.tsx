import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthCallback from './components/Auth/AuthCallback';
import LandingPage from './components/Landing/LandingPage';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ProfileBuilder from './components/Profiles/ProfileBuilder';
import AIChat from './components/Chat/AIChat';
import PromptLibrary from './components/Prompts/PromptLibrary';
import TeamWorkspace from './components/Team/TeamWorkspace.tsx';
import Settings from './components/Settings/Settings';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for navigation events from team workspace
  React.useEffect(() => {
    const handleNavigateToProfiles = () => {
      setCurrentView('profiles');
    };

    window.addEventListener('navigate-to-profiles', handleNavigateToProfiles);
    return () => window.removeEventListener('navigate-to-profiles', handleNavigateToProfiles);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'profiles':
        return <ProfileBuilder />;
      case 'chat':
        return <AIChat />;
      case 'prompts':
        return <PromptLibrary />;
      case 'team':
        return <TeamWorkspace />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-surface-950 via-surface-925 to-surface-900 text-text-primary overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            linear-gradient(90deg, transparent 79px, rgba(20, 184, 166, 0.03) 79px, rgba(20, 184, 166, 0.03) 81px, transparent 81px),
            linear-gradient(rgba(20, 184, 166, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '1000px 1000px, 1000px 1000px, 100px 100px, 100px 100px'
        }} />
      </div>

      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-primary-500/8 via-primary-500/4 to-transparent rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-info-500/6 via-info-500/3 to-transparent rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-purple-500/5 via-purple-500/2 to-transparent rounded-full blur-3xl animate-float opacity-40" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-6 left-6 z-50 md:hidden w-12 h-12 bg-glass-bg backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-glass border border-glass-border relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-glass-shine opacity-20" />
        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'fixed' : 'hidden'} md:relative md:block z-40 h-full`}>
        <AnimatePresence>
          {(mobileMenuOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="h-full"
            >
              <Sidebar 
                currentView={currentView} 
                onViewChange={(view) => {
                  setCurrentView(view);
                  setMobileMenuOpen(false);
                }}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content - Fixed height and proper scrolling */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 h-full overflow-hidden"
        >
          {renderView()}
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Landing page as the main entry point */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected app routes */}
            <Route path="/app/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            
            {/* Individual protected routes for direct access */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/profiles" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/prompts" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;