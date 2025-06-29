import React from 'react';
import { 
  Home, 
  User, 
  MessageSquare, 
  BookOpen, 
  Settings,
  Zap,
  Brain,
  ChevronRight,
  Activity,
  Sparkles,
  Crown,
  BarChart3,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const { profiles, currentProfile, messages, setCurrentProfile, deleteProfile } = useApp();
  const { getCurrentPlan, hasFeatureAccess } = useAuth();
  const [showProfileActions, setShowProfileActions] = React.useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'profiles', label: 'Profiles', icon: User, badge: profiles.length },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, badge: null },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen, badge: null },
    { id: 'team', label: 'Team Workspace', icon: Users, badge: null, requiresFeature: 'team_workspace' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const currentPlan = getCurrentPlan();
  const planDisplayName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  const handlePlanClick = () => {
    // Navigate to settings and set the billing tab
    onViewChange('settings');
    // Use a small delay to ensure the settings component is mounted
    setTimeout(() => {
      const event = new CustomEvent('navigate-to-billing');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleProfileClick = (profile: any) => {
    setCurrentProfile(profile);
    onViewChange('profiles');
    setShowProfileActions(null);
  };

  const handleEditProfile = (profile: any) => {
    setCurrentProfile(profile);
    onViewChange('profiles');
    setShowProfileActions(null);
  };

  const handleDeleteProfile = (profile: any) => {
    if (confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      deleteProfile(profile.id);
      setShowProfileActions(null);
    }
  };

  const getProfileLimit = () => {
    switch (currentPlan) {
      case 'free': return 0;
      case 'starter': return 3;
      case 'pro': return '∞';
      case 'team': return '∞';
      default: return 0;
    }
  };

  return (
    <div className="w-80 bg-card-bg border-r border-border-light h-screen flex flex-col relative overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-lg flex items-center justify-center shadow-glow-sm">
            <Brain className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">ContxtProfile</h1>
            <p className="text-xs text-terminal-green font-mono tracking-wide">AI Context Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const hasAccess = !item.requiresFeature || hasFeatureAccess(item.requiresFeature);
            
            // Don't show team workspace if user doesn't have access
            if (item.requiresFeature && !hasAccess) {
              return null;
            }
            
            return (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition font-mono ${
                    isActive
                      ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black font-medium shadow-glow'
                      : 'text-text-gray hover:text-white hover:bg-card-hover'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-terminal-green'}`} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs font-mono ${
                      isActive 
                        ? 'bg-black/20 text-black' 
                        : 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {!isActive && (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </ul>

        {/* Quick Profile Access */}
        {profiles.length > 0 && (
          <motion.div 
            className="mt-8 pt-4 border-t border-border-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-sm font-medium text-text-gray mb-3 font-mono px-4">Quick Access</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {profiles.slice(0, 5).map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="relative"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleProfileClick(profile)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition text-left relative font-mono ${
                      currentProfile?.id === profile.id
                        ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30'
                        : 'text-text-gray hover:text-white hover:bg-card-hover'
                    }`}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-lg flex items-center justify-center border border-terminal-green/20">
                      <Brain className="w-3 h-3 text-terminal-green" />
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{profile.name}</span>
                    
                    {/* Actions button - only show on hover */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileActions(showProfileActions === profile.id ? null : profile.id);
                      }}
                      className="opacity-0 hover:opacity-100 transition p-1 hover:bg-card-hover rounded"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </motion.button>
                  </motion.button>

                  {/* Profile Actions Dropdown */}
                  <AnimatePresence>
                    {showProfileActions === profile.id && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowProfileActions(null)}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, x: -10 }}
                          className="absolute left-full top-0 ml-2 bg-card-bg rounded-lg border border-border-light shadow-lg z-50 min-w-[140px]"
                        >
                          <div className="p-2">
                            <motion.button
                              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                              onClick={() => handleProfileClick(profile)}
                              className="w-full text-left px-3 py-2 text-white hover:bg-card-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                              onClick={() => handleEditProfile(profile)}
                              className="w-full text-left px-3 py-2 text-white hover:bg-card-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              onClick={() => handleDeleteProfile(profile)}
                              className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Current Profile */}
      {currentProfile && (
        <motion.div 
          className="px-4 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-card-hover rounded-lg p-4 border border-border-light relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative">
                <Activity className="w-4 h-4 text-terminal-green animate-pulse" />
                <div className="absolute inset-0 bg-terminal-green/20 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-medium text-white font-mono">Active Profile</span>
            </div>
            <p className="text-sm text-text-gray truncate font-medium">{currentProfile.name}</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
              <span className="text-xs text-terminal-green font-mono tracking-wide">ONLINE</span>
              <div className="flex-1 h-px bg-gradient-to-r from-terminal-green/50 to-transparent" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan & Usage Section */}
      <motion.div 
        className="p-4 border-t border-border-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Plan Info */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePlanClick}
          className="w-full bg-card-hover rounded-lg p-4 border border-border-light hover:border-terminal-green/50 transition group mb-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Crown className={`w-4 h-4 ${currentPlan === 'free' ? 'text-gray-400' : 'text-terminal-green'}`} />
              <span className="text-sm font-medium text-white font-mono">Current Plan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-terminal-green transition-colors" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold font-mono ${
              currentPlan === 'free' ? 'text-gray-300' : 'text-terminal-green'
            }`}>
              {planDisplayName}
            </span>
            {currentPlan !== 'free' && (
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
            )}
          </div>
          
          {currentPlan === 'free' && (
            <p className="text-xs text-gray-400 mt-1 font-mono">Upgrade to get started</p>
          )}
        </motion.button>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('profiles')}
            className="bg-card-hover rounded-lg p-3 border border-border-light hover:border-terminal-green/50 transition group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-terminal-green font-bold text-lg font-mono">{profiles.length}</div>
              <User className="w-3 h-3 text-gray-400 group-hover:text-terminal-green transition-colors" />
            </div>
            <div className="text-xs text-text-gray font-mono">Profiles</div>
            <div className="text-xs text-yellow-400 mt-1 font-mono">
              Limit: {getProfileLimit()}
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('chat')}
            className="bg-card-hover rounded-lg p-3 border border-border-light hover:border-terminal-green/50 transition group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-terminal-green font-bold text-lg font-mono">{messages.length}</div>
              <BarChart3 className="w-3 h-3 text-gray-400 group-hover:text-terminal-green transition-colors" />
            </div>
            <div className="text-xs text-text-gray font-mono">Messages</div>
            {currentPlan === 'free' && (
              <div className="text-xs text-yellow-400 mt-1 font-mono">Upgrade needed</div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Click outside to close profile actions */}
      {showProfileActions && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowProfileActions(null)}
        />
      )}
    </div>
  );
};

export default Sidebar;