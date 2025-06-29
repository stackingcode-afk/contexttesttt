import React from 'react';
import { Plus, Brain, MessageSquare, BookOpen, ArrowRight, Sparkles, Zap, Users, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { motion } from 'framer-motion';
import ProfileTemplateSelector from '../Profiles/ProfileTemplateSelector';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { profiles, createProfile, setCurrentProfile, deleteProfile, updateProfile } = useApp();
  const [showTemplateSelector, setShowTemplateSelector] = React.useState(false);
  const [showProfileActions, setShowProfileActions] = React.useState<string | null>(null);

  const handleCreateProfile = () => {
    setShowTemplateSelector(true);
  };

  const handleSelectTemplate = (template: any, customName?: string) => {
    const profileName = customName || template.name;
    const newProfile = createProfile(profileName);
    
    // Apply template data
    const updatedProfile = {
      ...newProfile,
      businessInfo: {
        ...newProfile.businessInfo,
        ...template.fields.businessInfo,
      },
      customFields: {
        ...newProfile.customFields,
        ...template.fields.customFields,
      },
    };
    
    setCurrentProfile(updatedProfile);
    onViewChange('profiles');
  };

  const handleEditProfile = (profile: any) => {
    setCurrentProfile(profile);
    onViewChange('profiles');
    setShowProfileActions(null);
  };

  const handleViewProfile = (profile: any) => {
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

  const handleDuplicateProfile = (profile: any) => {
    const duplicatedProfile = createProfile(`${profile.name} (Copy)`);
    const updatedProfile = {
      ...duplicatedProfile,
      businessInfo: { ...profile.businessInfo },
      brandVoice: { ...profile.brandVoice },
      customerAvatars: [...profile.customerAvatars],
      offerBreakdown: { ...profile.offerBreakdown },
      sops: [...profile.sops],
      marketingGoals: [...profile.marketingGoals],
      samples: [...profile.samples],
      customFields: { ...profile.customFields },
    };
    
    updateProfile(duplicatedProfile.id, updatedProfile);
    setShowProfileActions(null);
    alert(`Profile "${profile.name}" has been duplicated!`);
  };

  const recentProfiles = profiles.slice(-3);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg relative">
      {/* Clean, Centered Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle centered gradient orbs */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-terminal-green/8 via-terminal-green/4 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/3 right-1/2 transform translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gradient-radial from-accent-purple/6 via-accent-purple/3 to-transparent rounded-full blur-3xl opacity-50" />
        
        {/* Minimal grid pattern - perfectly centered */}
        <div className="absolute inset-0 opacity-[0.01]" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 145, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 145, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: 'center center'
        }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 font-sans tracking-tight">
              Welcome to{' '}
              <span className="text-terminal-green">
                ContxtProfile
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Create AI context profiles that understand your business and deliver exceptional results
            </p>
            
            {/* Single floating accent element */}
            <div className="flex justify-center items-center mt-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-glass-bg backdrop-blur-xl rounded-full border border-glass-border shadow-glass">
                <Sparkles className="w-4 h-4 text-terminal-green" />
                <span className="text-sm text-gray-300 font-mono">AI-Powered</span>
              </div>
            </div>
          </motion.div>

          {/* Main Action Section */}
          {profiles.length === 0 ? (
            // First-time user experience
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-16"
            >
              <div className="bg-glass-bg backdrop-blur-2xl rounded-3xl p-12 border border-glass-border shadow-glass-xl max-w-3xl mx-auto relative overflow-hidden">
                {/* Clean glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02] opacity-60" />
                
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-terminal-green via-terminal-green-light to-terminal-green-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-lg relative overflow-hidden">
                    <Brain className="w-12 h-12 text-black relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl" />
                  </div>
                  
                  <h2 className="text-4xl font-bold text-white mb-6 font-sans">
                    Create Your First Profile
                  </h2>
                  <p className="text-gray-300 mb-10 text-lg leading-relaxed max-w-2xl mx-auto font-light">
                    Choose from specialized templates or start with a custom profile to structure your business context for AI agents
                  </p>
                  
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: '0 0 50px rgba(0, 255, 145, 0.5)' 
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateProfile}
                    className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-glow-xl transition-all duration-300 flex items-center space-x-3 mx-auto relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Get Started</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Existing user experience
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-glass-bg backdrop-blur-2xl rounded-3xl p-8 border border-glass-border shadow-glass-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] opacity-80" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-8 font-sans">Quick Actions</h2>
                  
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewChange('chat')}
                      className="w-full flex items-center space-x-4 p-6 bg-glass-bg backdrop-blur-xl rounded-2xl hover:bg-glass-hover transition-all duration-300 text-left group border border-glass-border hover:border-glass-border-hover shadow-glass relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 bg-gradient-to-br from-terminal-green/20 via-terminal-green/15 to-terminal-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-terminal-green/20 relative z-10">
                        <MessageSquare className="w-7 h-7 text-terminal-green" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-white font-semibold text-lg">Start AI Chat</p>
                        <p className="text-gray-400 text-sm">Chat with context-aware AI</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-terminal-green transition-colors relative z-10" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateProfile}
                      className="w-full flex items-center space-x-4 p-6 bg-glass-bg backdrop-blur-xl rounded-2xl hover:bg-glass-hover transition-all duration-300 text-left group border border-glass-border hover:border-glass-border-hover shadow-glass relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-purple/20 via-accent-purple/15 to-accent-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-accent-purple/20 relative z-10">
                        <Plus className="w-7 h-7 text-accent-purple" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-white font-semibold text-lg">New Profile</p>
                        <p className="text-gray-400 text-sm">Create context profile</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-purple transition-colors relative z-10" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewChange('prompts')}
                      className="w-full flex items-center space-x-4 p-6 bg-glass-bg backdrop-blur-xl rounded-2xl hover:bg-glass-hover transition-all duration-300 text-left group border border-glass-border hover:border-glass-border-hover shadow-glass relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-blue/20 via-accent-blue/15 to-accent-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-accent-blue/20 relative z-10">
                        <BookOpen className="w-7 h-7 text-accent-blue" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-white font-semibold text-lg">Browse Prompts</p>
                        <p className="text-gray-400 text-sm">Explore saved prompts</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-blue transition-colors relative z-10" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewChange('team')}
                      className="w-full flex items-center space-x-4 p-6 bg-glass-bg backdrop-blur-xl rounded-2xl hover:bg-glass-hover transition-all duration-300 text-left group border border-glass-border hover:border-glass-border-hover shadow-glass relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-orange/20 via-accent-orange/15 to-accent-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-accent-orange/20 relative z-10">
                        <Users className="w-7 h-7 text-accent-orange" />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-white font-semibold text-lg">Team Workspace</p>
                        <p className="text-gray-400 text-sm">Collaborate with team</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-orange transition-colors relative z-10" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Recent Profiles */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-glass-bg backdrop-blur-2xl rounded-3xl p-8 border border-glass-border shadow-glass-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] opacity-80" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white font-sans">Recent Profiles</h2>
                    <div className="px-4 py-2 bg-gradient-to-r from-terminal-green/20 to-terminal-green/10 rounded-full border border-terminal-green/30 backdrop-blur-sm">
                      <span className="text-terminal-green font-mono text-lg font-bold">{profiles.length}</span>
                    </div>
                  </div>
                  
                  {recentProfiles.length > 0 ? (
                    <div className="space-y-4">
                      {recentProfiles.map((profile, index) => (
                        <motion.div
                          key={profile.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-4 p-5 bg-glass-bg backdrop-blur-xl rounded-2xl cursor-pointer hover:bg-glass-hover transition-all duration-300 group border border-glass-border hover:border-glass-border-hover shadow-glass relative overflow-hidden"
                          onClick={() => handleViewProfile(profile)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="w-12 h-12 bg-gradient-to-br from-terminal-green/20 via-terminal-green/15 to-terminal-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-terminal-green/20 relative z-10">
                            <Brain className="w-6 h-6 text-terminal-green" />
                          </div>
                          <div className="flex-1 relative z-10">
                            <p className="text-white font-semibold group-hover:text-terminal-green transition-colors">{profile.name}</p>
                            <p className="text-gray-400 text-sm">
                              {profile.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                              className="p-2 text-gray-400 hover:text-accent-blue transition rounded-lg hover:bg-glass-hover"
                              title="Edit Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowProfileActions(showProfileActions === profile.id ? null : profile.id);
                              }}
                              className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-glass-hover"
                              title="More Actions"
                            >
                              <Settings className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-terminal-green transition-colors relative z-10" />

                          {/* Profile Actions Dropdown */}
                          {showProfileActions === profile.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-4 top-16 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-glass-xl z-30 min-w-[160px]"
                            >
                              <div className="p-2">
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfile(profile);
                                  }}
                                  className="w-full text-left px-3 py-2 text-white hover:bg-glass-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProfile(profile);
                                  }}
                                  className="w-full text-left px-3 py-2 text-white hover:bg-glass-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateProfile(profile);
                                  }}
                                  className="w-full text-left px-3 py-2 text-white hover:bg-glass-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Duplicate</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfile(profile);
                                  }}
                                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700/30 via-gray-600/20 to-gray-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-gray-600/20">
                        <Brain className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">No profiles yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Bottom Accent */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-3 bg-glass-bg backdrop-blur-xl rounded-2xl px-8 py-4 border border-glass-border shadow-glass relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Sparkles className="w-5 h-5 text-terminal-green relative z-10" />
              <span className="text-gray-300 font-medium relative z-10">Powered by advanced AI context management</span>
              <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse relative z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Template Selector */}
      <ProfileTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
      />

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

export default Dashboard;