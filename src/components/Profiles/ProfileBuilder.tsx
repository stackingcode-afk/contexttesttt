import React, { useState, useEffect } from 'react';
import { Save, Plus, X, FileText, Globe, Users, Megaphone, Zap, Settings, Upload, ArrowRight, Grid3X3, List, Search, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { ContextProfile, CustomerAvatar, Sample } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import ProfileTemplateSelector from './ProfileTemplateSelector';

const ProfileBuilder: React.FC = () => {
  const { currentProfile, updateProfile, profiles, setCurrentProfile, createProfile, deleteProfile } = useApp();
  const { hasFeatureAccess, getCurrentPlan } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileActions, setShowProfileActions] = useState<string | null>(null);

  const [localProfile, setLocalProfile] = useState<ContextProfile | null>(currentProfile);

  const currentPlan = getCurrentPlan();

  useEffect(() => {
    setLocalProfile(currentProfile);
  }, [currentProfile]);

  useEffect(() => {
    // Auto-save every 10 seconds if there are unsaved changes
    const interval = setInterval(() => {
      if (unsavedChanges && localProfile) {
        updateProfile(localProfile.id, localProfile);
        setUnsavedChanges(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [unsavedChanges, localProfile, updateProfile]);

  const handleFieldChange = (section: string, field: string, value: any) => {
    if (!localProfile) return;
    
    setLocalProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof ContextProfile],
          [field]: value,
        },
      };
    });
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    if (localProfile) {
      updateProfile(localProfile.id, localProfile);
      setUnsavedChanges(false);
      // Show success feedback
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-terminal-green text-black px-6 py-3 rounded-xl font-mono font-medium z-50 shadow-glow';
      notification.textContent = 'Profile saved successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  const handleSaveAndReturn = () => {
    if (localProfile) {
      updateProfile(localProfile.id, localProfile);
      setUnsavedChanges(false);
      setCurrentProfile(null); // Return to dashboard
      setLocalProfile(null);
    }
  };

  const handleBackToDashboard = () => {
    if (unsavedChanges) {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        handleSaveAndReturn();
      } else {
        setCurrentProfile(null);
        setLocalProfile(null);
        setUnsavedChanges(false);
      }
    } else {
      setCurrentProfile(null);
      setLocalProfile(null);
    }
  };

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
    
    // Update the profile with template data
    updateProfile(newProfile.id, updatedProfile);
    setCurrentProfile(updatedProfile);
    setLocalProfile(updatedProfile);
    setShowTemplateSelector(false);
  };

  const handleUploadProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate that it's a profile JSON
        if (data.businessInfo && data.brandVoice && data.customerAvatars) {
          // Create new profile from uploaded data
          const newProfile: ContextProfile = {
            ...data,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
            // Ensure required fields exist
            businessInfo: data.businessInfo || {},
            brandVoice: data.brandVoice || {},
            customerAvatars: data.customerAvatars || [],
            offerBreakdown: data.offerBreakdown || { features: [], pricing: '', usps: [] },
            sops: data.sops || [],
            marketingGoals: data.marketingGoals || [],
            samples: data.samples || [],
            customFields: data.customFields || {},
          };
          
          // Update the profile and set as current
          updateProfile(newProfile.id, newProfile);
          setCurrentProfile(newProfile);
          setLocalProfile(newProfile);
          setShowUploadModal(false);
          
          alert('Profile uploaded successfully!');
        } else {
          alert('Invalid profile file. Please upload a valid ContxtProfile JSON file.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleProfileChange = (profile: ContextProfile) => {
    if (unsavedChanges) {
      if (confirm('You have unsaved changes. Do you want to save before switching profiles?')) {
        if (localProfile) {
          updateProfile(localProfile.id, localProfile);
        }
      }
    }
    setCurrentProfile(profile);
    setLocalProfile(profile);
    setShowProfileSelector(false);
    setUnsavedChanges(false);
    setActiveTab('business'); // Reset to first tab when switching profiles
  };

  const handleEditProfile = (profile: ContextProfile) => {
    setCurrentProfile(profile);
    setShowProfileActions(null);
  };

  const handleDeleteProfile = (profile: ContextProfile) => {
    if (confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      deleteProfile(profile.id);
      setShowProfileActions(null);
      if (currentProfile?.id === profile.id) {
        setCurrentProfile(null);
        setLocalProfile(null);
      }
    }
  };

  const handleDuplicateProfile = (profile: ContextProfile) => {
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
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-terminal-green text-black px-6 py-3 rounded-xl font-mono font-medium z-50 shadow-glow';
    notification.textContent = `Profile "${profile.name}" duplicated successfully!`;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const addCustomerAvatar = () => {
    if (!localProfile) return;
    
    const newAvatar: CustomerAvatar = {
      id: uuidv4(),
      name: '',
      age: '',
      occupation: '',
      painPoints: [],
      goals: [],
      demographics: '',
    };
    
    setLocalProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customerAvatars: [...prev.customerAvatars, newAvatar],
      };
    });
    setUnsavedChanges(true);
  };

  const updateCustomerAvatar = (id: string, field: string, value: any) => {
    if (!localProfile) return;
    
    setLocalProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customerAvatars: prev.customerAvatars.map(avatar =>
          avatar.id === id ? { ...avatar, [field]: value } : avatar
        ),
      };
    });
    setUnsavedChanges(true);
  };

  const removeCustomerAvatar = (id: string) => {
    if (!localProfile) return;
    
    setLocalProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customerAvatars: prev.customerAvatars.filter(avatar => avatar.id !== id),
      };
    });
    setUnsavedChanges(true);
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Globe },
    { id: 'offer', label: 'Offer Breakdown', icon: Zap },
    { id: 'voice', label: 'Brand Voice', icon: Megaphone },
    { id: 'avatars', label: 'Customer Avatars', icon: Users },
    { id: 'sops', label: 'SOPs & Processes', icon: FileText },
    { id: 'goals', label: 'Marketing Goals', icon: Settings },
  ];

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.businessInfo.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no profile is selected, show the profiles dashboard
  if (!localProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">
                <span className="text-terminal-green">{'>'}</span> Context Profiles
              </h1>
              <p className="text-text-gray font-mono">
                Manage your AI context profiles ({profiles.length} total)
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' 
                      ? 'bg-terminal-green text-black' 
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' 
                      ? 'bg-terminal-green text-black' 
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="border border-accent-blue text-accent-blue px-4 py-2 rounded-xl font-medium hover:bg-accent-blue hover:text-white transition font-mono flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 145, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Profile</span>
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md bg-glass-bg border border-glass-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
            />
          </div>

          {/* Profiles Grid/List */}
          {filteredProfiles.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border hover:border-glass-border-hover transition-all duration-300 cursor-pointer group shadow-glass relative overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center space-x-6' : ''
                  }`}
                  onClick={() => handleEditProfile(profile)}
                >
                  <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className={`relative z-10 ${viewMode === 'list' ? 'flex items-center space-x-6 flex-1' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'flex justify-between items-start mb-4'}`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-terminal-green/20">
                        <FileText className="w-6 h-6 text-terminal-green" />
                      </div>
                      
                      {viewMode === 'list' && (
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 font-mono group-hover:text-terminal-green transition-colors">
                            {profile.name}
                          </h3>
                          <p className="text-text-gray text-sm font-mono">
                            {profile.businessInfo.name || 'Business profile'}
                          </p>
                          <p className="text-text-muted text-xs font-mono mt-1">
                            Updated: {profile.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateProfile(profile);
                          }}
                          className="p-2 text-text-gray hover:text-accent-blue transition rounded-lg hover:bg-glass-hover"
                          title="Duplicate Profile"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProfileActions(showProfileActions === profile.id ? null : profile.id);
                          }}
                          className="p-2 text-text-gray hover:text-white transition rounded-lg hover:bg-glass-hover"
                          title="More Actions"
                        >
                          <Settings className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <>
                        <h3 className="text-lg font-semibold text-white mb-2 font-mono group-hover:text-terminal-green transition-colors">
                          {profile.name}
                        </h3>
                        <p className="text-text-gray text-sm mb-4 font-mono line-clamp-2">
                          {profile.businessInfo.name || 'Business profile'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm font-mono">
                          <span className="text-text-muted">
                            {profile.updatedAt.toLocaleDateString()}
                          </span>
                          <ArrowRight className="w-4 h-4 text-text-gray group-hover:text-terminal-green group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </>
                    )}

                    {/* Profile Actions Dropdown */}
                    {showProfileActions === profile.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute ${viewMode === 'list' ? 'right-4 top-16' : 'right-4 top-16'} bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-glass-xl z-30 min-w-[160px]`}
                      >
                        <div className="p-2">
                          <motion.button
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProfile(profile);
                            }}
                            className="w-full text-left px-3 py-2 text-white hover:bg-glass-hover rounded-lg transition flex items-center space-x-2 font-mono text-sm"
                          >
                            <FileText className="w-4 h-4" />
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
                            <X className="w-4 h-4" />
                            <span>Delete</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto border border-terminal-green/20">
                  <FileText className="w-10 h-10 text-terminal-green" />
                </div>
                <h3 className="text-2xl font-semibold text-white font-mono">
                  {searchTerm ? 'No profiles found' : 'No profiles yet'}
                </h3>
                <p className="text-text-gray font-mono max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search term'
                    : 'Create your first context profile to get started'
                  }
                </p>
                {!searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 145, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateProfile}
                    className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Profile</span>
                  </motion.button>
                )}
              </motion.div>
            </div>
          )}
        </div>

        {/* Profile Template Selector */}
        <ProfileTemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 border border-glass-border shadow-glass-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white font-mono">Upload Profile</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-text-gray hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-text-gray text-sm mb-6 font-mono">
                  Upload a ContxtProfile JSON file to import an existing profile.
                </p>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadProfile}
                  className="hidden"
                  id="upload-profile"
                />
                
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    htmlFor="upload-profile"
                    className="flex-1 bg-terminal-green text-black px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition font-mono cursor-pointer text-center"
                  >
                    Choose File
                  </motion.label>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Click outside to close profile actions */}
        {showProfileActions && (
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setShowProfileActions(null)}
          />
        )}
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                  Business Name
                </label>
                <input
                  type="text"
                  value={localProfile.businessInfo.name}
                  onChange={(e) => handleFieldChange('businessInfo', 'name', e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                  Website
                </label>
                <input
                  type="url"
                  value={localProfile.businessInfo.website}
                  onChange={(e) => handleFieldChange('businessInfo', 'website', e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Target Audience
              </label>
              <textarea
                value={localProfile.businessInfo.audience}
                onChange={(e) => handleFieldChange('businessInfo', 'audience', e.target.value)}
                rows={3}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="Describe your target audience..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Niche
              </label>
              <input
                type="text"
                value={localProfile.businessInfo.niche}
                onChange={(e) => handleFieldChange('businessInfo', 'niche', e.target.value)}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="e.g., SaaS, E-commerce, Coaching"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Main Offer
              </label>
              <textarea
                value={localProfile.businessInfo.offer}
                onChange={(e) => handleFieldChange('businessInfo', 'offer', e.target.value)}
                rows={4}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="Describe your main product or service..."
              />
            </div>

            {/* Custom Fields for specialized templates */}
            {localProfile.customFields && Object.keys(localProfile.customFields).length > 0 && (
              <div className="mt-8 pt-6 border-t border-glass-border">
                <h3 className="text-lg font-semibold text-white mb-4 font-mono">Template-Specific Fields</h3>
                <div className="space-y-4">
                  {Object.entries(localProfile.customFields).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      {Array.isArray(value) ? (
                        <textarea
                          value={value.join('\n')}
                          onChange={(e) => {
                            const newCustomFields = {
                              ...localProfile.customFields,
                              [key]: e.target.value.split('\n').filter(item => item.trim())
                            };
                            setLocalProfile(prev => prev ? { ...prev, customFields: newCustomFields } : prev);
                            setUnsavedChanges(true);
                          }}
                          rows={3}
                          className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} (one per line)...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const newCustomFields = {
                              ...localProfile.customFields,
                              [key]: e.target.value
                            };
                            setLocalProfile(prev => prev ? { ...prev, customFields: newCustomFields } : prev);
                            setUnsavedChanges(true);
                          }}
                          className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'offer':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Key Features
              </label>
              <textarea
                value={localProfile.offerBreakdown.features.join('\n')}
                onChange={(e) => handleFieldChange('offerBreakdown', 'features', e.target.value.split('\n').filter(f => f.trim()))}
                rows={5}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="List key features (one per line)..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Pricing Structure
              </label>
              <textarea
                value={localProfile.offerBreakdown.pricing}
                onChange={(e) => handleFieldChange('offerBreakdown', 'pricing', e.target.value)}
                rows={3}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="Describe your pricing model..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Unique Selling Points
              </label>
              <textarea
                value={localProfile.offerBreakdown.usps.join('\n')}
                onChange={(e) => handleFieldChange('offerBreakdown', 'usps', e.target.value.split('\n').filter(u => u.trim()))}
                rows={4}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="List unique selling points (one per line)..."
              />
            </div>
          </div>
        );
        
      case 'voice':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Brand Tone & Voice
              </label>
              <textarea
                value={localProfile.brandVoice.tone}
                onChange={(e) => handleFieldChange('brandVoice', 'tone', e.target.value)}
                rows={4}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="Describe your brand's tone and voice (e.g., professional, friendly, authoritative)..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Forbidden Words/Phrases
              </label>
              <textarea
                value={localProfile.brandVoice.forbiddenWords.join('\n')}
                onChange={(e) => handleFieldChange('brandVoice', 'forbiddenWords', e.target.value.split('\n').filter(w => w.trim()))}
                rows={3}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="List words/phrases to avoid (one per line)..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Formatting Style
              </label>
              <textarea
                value={localProfile.brandVoice.formattingStyle}
                onChange={(e) => handleFieldChange('brandVoice', 'formattingStyle', e.target.value)}
                rows={3}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="Describe preferred formatting (e.g., bullet points, numbered lists, paragraph style)..."
              />
            </div>
          </div>
        );
        
      case 'avatars':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white font-mono">Customer Avatars</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCustomerAvatar}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-4 py-2 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Add Avatar</span>
              </motion.button>
            </div>
            
            {localProfile.customerAvatars.map((avatar, index) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-medium font-mono">Avatar {index + 1}</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeCustomerAvatar(avatar.id)}
                    className="text-red-400 hover:text-red-300 transition p-1 rounded-lg hover:bg-red-900/20"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={avatar.name}
                    onChange={(e) => updateCustomerAvatar(avatar.id, 'name', e.target.value)}
                    className="bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Avatar name"
                  />
                  <input
                    type="text"
                    value={avatar.age}
                    onChange={(e) => updateCustomerAvatar(avatar.id, 'age', e.target.value)}
                    className="bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Age range"
                  />
                </div>
                
                <input
                  type="text"
                  value={avatar.occupation}
                  onChange={(e) => updateCustomerAvatar(avatar.id, 'occupation', e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-white focus:border-terminal-green focus:outline-none mb-4 font-mono backdrop-blur-xl"
                  placeholder="Occupation"
                />
                
                <textarea
                  value={avatar.painPoints.join('\n')}
                  onChange={(e) => updateCustomerAvatar(avatar.id, 'painPoints', e.target.value.split('\n').filter(p => p.trim()))}
                  rows={3}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-white focus:border-terminal-green focus:outline-none mb-4 font-mono backdrop-blur-xl"
                  placeholder="Pain points (one per line)"
                />
                
                <textarea
                  value={avatar.goals.join('\n')}
                  onChange={(e) => updateCustomerAvatar(avatar.id, 'goals', e.target.value.split('\n').filter(g => g.trim()))}
                  rows={3}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  placeholder="Goals (one per line)"
                />
              </motion.div>
            ))}
            
            {localProfile.customerAvatars.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-terminal-green/20">
                  <Users className="w-8 h-8 text-terminal-green" />
                </div>
                <p className="text-text-gray font-mono mb-4">No customer avatars created yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCustomerAvatar}
                  className="text-terminal-green hover:underline font-mono"
                >
                  Create your first avatar
                </motion.button>
              </div>
            )}
          </div>
        );
        
      case 'sops':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Standard Operating Procedures & Processes
              </label>
              <textarea
                value={localProfile.sops.join('\n')}
                onChange={(e) => handleFieldChange('sops', '', e.target.value.split('\n').filter(s => s.trim()))}
                rows={8}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="List your SOPs and processes (one per line)..."
              />
            </div>
          </div>
        );
        
      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                Marketing Goals & Objectives
              </label>
              <textarea
                value={localProfile.marketingGoals.join('\n')}
                onChange={(e) => handleFieldChange('marketingGoals', '', e.target.value.split('\n').filter(g => g.trim()))}
                rows={8}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                placeholder="List your marketing goals (one per line)..."
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      {/* Header */}
      <div className="bg-glass-bg backdrop-blur-xl border-b border-glass-border p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-glass-shine opacity-5" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Back to Dashboard Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-3 py-2 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border hover:border-glass-border-hover transition font-mono text-text-gray hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>

              {/* Profile Selector */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileSelector(!showProfileSelector)}
                  className="flex items-center space-x-3 px-4 py-2 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border hover:border-glass-border-hover transition font-mono"
                >
                  <FileText className="w-5 h-5 text-terminal-green" />
                  <div>
                    <div className="text-white font-medium">{localProfile.name}</div>
                    <div className="text-xs text-text-gray">
                      Updated: {localProfile.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${showProfileSelector ? 'rotate-90' : ''}`} />
                </motion.button>
                
                <AnimatePresence>
                  {showProfileSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute left-0 top-full mt-2 w-80 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-glass-xl z-20"
                    >
                      <div className="p-3 border-b border-glass-border">
                        <h3 className="text-sm font-medium text-white font-mono">Switch Profile</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {profiles.map((profile) => (
                          <motion.button
                            key={profile.id}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onClick={() => handleProfileChange(profile)}
                            className={`w-full px-4 py-3 text-left hover:bg-glass-hover transition flex items-center space-x-3 font-mono ${
                              localProfile.id === profile.id ? 'text-terminal-green bg-glass-hover' : 'text-white'
                            }`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-lg flex items-center justify-center border border-terminal-green/20">
                              <FileText className="w-4 h-4 text-terminal-green" />
                            </div>
                            <div>
                              <div className="font-medium">{profile.name}</div>
                              <div className="text-xs text-text-gray">{profile.businessInfo.name || 'Business profile'}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {unsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 px-3 py-1 bg-orange-900/20 border border-orange-500/30 rounded-lg"
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-orange-400 text-sm font-mono">Unsaved changes</span>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="border border-terminal-green text-terminal-green px-4 py-2 rounded-xl font-medium hover:bg-terminal-green hover:text-black transition font-mono flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveAndReturn}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
              >
                <Save className="w-4 h-4" />
                <span>Save & Return</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-glass-bg backdrop-blur-xl border-b border-glass-border relative overflow-hidden">
        <div className="absolute inset-0 bg-glass-shine opacity-5" />
        <div className="relative z-10">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap font-mono ${
                    activeTab === tab.id
                      ? 'border-terminal-green text-terminal-green bg-terminal-green/10'
                      : 'border-transparent text-text-gray hover:text-white hover:bg-glass-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Profile Template Selector */}
      <ProfileTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default ProfileBuilder;