import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  FolderPlus, 
  Settings, 
  Crown, 
  UserPlus, 
  Search,
  Filter,
  MoreVertical,
  Folder,
  Brain,
  MessageSquare,
  BarChart3,
  Shield,
  Calendar,
  Activity,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  ArrowRight,
  X,
  Copy,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  Globe,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  lastActive: Date;
  status: 'online' | 'offline' | 'away';
}

interface ProjectFolder {
  id: string;
  name: string;
  description: string;
  profileCount: number;
  memberCount: number;
  lastUpdated: Date;
  color: string;
  isShared: boolean;
  profiles: SharedProfile[];
  owner: string;
  collaborators: string[];
}

interface SharedProfile {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  createdBy: string;
  isShared: boolean;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
}

const TeamWorkspace: React.FC = () => {
  const { hasFeatureAccess } = useAuth();
  const { profiles, setCurrentProfile, createProfile, updateProfile, deleteProfile } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<ProjectFolder | null>(null);
  const [showFolderDetails, setShowFolderDetails] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data - in real app this would come from API
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'admin',
      lastActive: new Date(),
      status: 'online'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: 'member',
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
      status: 'away'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'viewer',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'offline'
    }
  ];

  // Convert existing profiles to shared profiles format
  const sharedProfiles: SharedProfile[] = profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    description: profile.businessInfo.name || 'Business context profile',
    lastModified: profile.updatedAt,
    createdBy: 'You',
    isShared: true,
    tags: [profile.businessInfo.niche || 'general'].filter(Boolean),
    status: 'active' as const
  }));

  const projectFolders: ProjectFolder[] = [
    {
      id: '1',
      name: 'Marketing Campaigns',
      description: 'Context profiles for all marketing initiatives',
      profileCount: Math.min(sharedProfiles.length, 5),
      memberCount: 3,
      lastUpdated: new Date(),
      color: 'from-terminal-green to-terminal-green-dark',
      isShared: true,
      profiles: sharedProfiles.slice(0, 5),
      owner: 'You',
      collaborators: ['Sarah Wilson', 'Mike Chen']
    },
    {
      id: '2',
      name: 'Product Development',
      description: 'Technical documentation and product contexts',
      profileCount: Math.min(sharedProfiles.length, 3),
      memberCount: 2,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4),
      color: 'from-accent-blue to-accent-blue-light',
      isShared: true,
      profiles: sharedProfiles.slice(0, 3),
      owner: 'John Doe',
      collaborators: ['You']
    }
  ];

  const handleEditProfile = (profile: SharedProfile) => {
    // Find the actual profile from the profiles array
    const actualProfile = profiles.find(p => p.id === profile.id);
    if (actualProfile) {
      setCurrentProfile(actualProfile);
      // Navigate to profiles view to edit
      window.dispatchEvent(new CustomEvent('navigate-to-profiles'));
    }
  };

  const handleViewProfile = (profile: SharedProfile) => {
    const actualProfile = profiles.find(p => p.id === profile.id);
    if (actualProfile) {
      setCurrentProfile(actualProfile);
      window.dispatchEvent(new CustomEvent('navigate-to-profiles'));
    }
  };

  const handleDuplicateProfile = (profile: SharedProfile) => {
    const actualProfile = profiles.find(p => p.id === profile.id);
    if (actualProfile) {
      const duplicatedProfile = createProfile(`${actualProfile.name} (Team Copy)`);
      const updatedProfile = {
        ...duplicatedProfile,
        businessInfo: { ...actualProfile.businessInfo },
        brandVoice: { ...actualProfile.brandVoice },
        customerAvatars: [...actualProfile.customerAvatars],
        offerBreakdown: { ...actualProfile.offerBreakdown },
        sops: [...actualProfile.sops],
        marketingGoals: [...actualProfile.marketingGoals],
        samples: [...actualProfile.samples],
        customFields: { ...actualProfile.customFields },
      };
      
      updateProfile(duplicatedProfile.id, updatedProfile);
      alert(`Profile "${actualProfile.name}" has been duplicated for team use!`);
    }
  };

  const handleDeleteProfile = (profile: SharedProfile) => {
    if (confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      deleteProfile(profile.id);
      alert('Profile deleted successfully!');
    }
  };

  const handleFolderClick = (folder: ProjectFolder) => {
    setSelectedFolder(folder);
    setShowFolderDetails(true);
  };

  const handleCreateFolder = (formData: FormData) => {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isShared = formData.get('shared') === 'on';
    
    console.log('Creating folder:', { name, description, isShared });
    setShowCreateFolderModal(false);
    alert('Project folder created successfully!');
  };

  const handleInviteMember = (formData: FormData) => {
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    
    console.log('Inviting member:', { email, role });
    setShowInviteModal(false);
    alert(`Invitation sent to ${email}!`);
  };

  const handleBulkAction = (action: string) => {
    const selectedCount = selectedProfiles.size;
    if (selectedCount === 0) return;

    switch (action) {
      case 'share':
        alert(`Shared ${selectedCount} profiles with team`);
        break;
      case 'folder':
        alert(`Added ${selectedCount} profiles to folder`);
        break;
      case 'archive':
        alert(`Archived ${selectedCount} profiles`);
        break;
      case 'delete':
        if (confirm(`Delete ${selectedCount} selected profiles? This cannot be undone.`)) {
          selectedProfiles.forEach(profileId => {
            deleteProfile(profileId);
          });
          alert(`Deleted ${selectedCount} profiles`);
        }
        break;
    }
    setSelectedProfiles(new Set());
    setShowBulkActions(false);
  };

  // Listen for navigation events
  React.useEffect(() => {
    const handleNavigateToProfiles = () => {
      // This would be handled by the parent component
      console.log('Navigate to profiles');
    };

    window.addEventListener('navigate-to-profiles', handleNavigateToProfiles);
    return () => window.removeEventListener('navigate-to-profiles', handleNavigateToProfiles);
  }, []);

  if (!hasFeatureAccess('team_workspace')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-purple/20">
            <Crown className="w-10 h-10 text-accent-purple" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">Team Plan Required</h2>
          <p className="text-text-gray mb-6 font-mono leading-relaxed">
            Upgrade to the Team plan to access collaborative workspaces, project folders, and team management features.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.location.href = '/settings?tab=billing';
            }}
            className="bg-gradient-to-r from-accent-purple to-accent-purple-light text-white px-8 py-4 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center space-x-2 mx-auto"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Team Plan</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profiles', label: 'Shared Profiles', icon: Brain },
    { id: 'folders', label: 'Project Folders', icon: Folder },
    { id: 'members', label: 'Team Members', icon: Users },
    { id: 'settings', label: 'Team Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Team Members', value: teamMembers.length, icon: Users, color: 'text-terminal-green', change: '+2 this month' },
                { label: 'Shared Profiles', value: sharedProfiles.length, icon: Brain, color: 'text-accent-blue', change: `+${Math.floor(sharedProfiles.length / 3)} this week` },
                { label: 'Project Folders', value: projectFolders.length, icon: Folder, color: 'text-accent-purple', change: 'Recently created' },
                { label: 'Active Sessions', value: 12, icon: Activity, color: 'text-accent-orange', change: '3 online now' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass hover:border-glass-border-hover transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                        <span className={`text-3xl font-bold ${stat.color} font-mono`}>{stat.value}</span>
                      </div>
                      <p className="text-white font-medium mb-1">{stat.label}</p>
                      <p className="text-text-muted text-sm font-mono">{stat.change}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(true)}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass hover:border-terminal-green/50 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-terminal-green/5 via-transparent to-terminal-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="w-6 h-6 text-terminal-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-mono">Invite Team Member</h3>
                  <p className="text-text-gray text-sm font-mono">Add new collaborators to your workspace</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateFolderModal(true)}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass hover:border-accent-blue/50 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FolderPlus className="w-6 h-6 text-accent-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-mono">Create Project Folder</h3>
                  <p className="text-text-gray text-sm font-mono">Organize profiles into project folders</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('profiles')}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass hover:border-accent-purple/50 transition-all duration-300 text-left group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 via-transparent to-accent-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="w-6 h-6 text-accent-purple" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-mono">Share Profiles</h3>
                  <p className="text-text-gray text-sm font-mono">Share context profiles with your team</p>
                </div>
              </motion.button>
            </div>

            {/* Recent Activity */}
            <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass relative overflow-hidden">
              <div className="absolute inset-0 bg-glass-shine opacity-5" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-6 font-mono flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-terminal-green" />
                  <span>Recent Team Activity</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { user: 'You', action: 'created profile', target: sharedProfiles[0]?.name || 'New Profile', time: '2 hours ago', type: 'create' },
                    { user: 'Sarah Wilson', action: 'updated folder', target: 'Marketing Campaigns', time: '4 hours ago', type: 'update' },
                    { user: 'Mike Chen', action: 'shared profile', target: sharedProfiles[1]?.name || 'Profile', time: '1 day ago', type: 'share' },
                    { user: 'John Doe', action: 'invited member', target: 'alex@company.com', time: '2 days ago', type: 'invite' },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-glass-hover transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        activity.type === 'create' ? 'bg-terminal-green/20 border-terminal-green/30' :
                        activity.type === 'update' ? 'bg-accent-blue/20 border-accent-blue/30' :
                        activity.type === 'share' ? 'bg-accent-purple/20 border-accent-purple/30' :
                        'bg-accent-orange/20 border-accent-orange/30'
                      }`}>
                        <span className="text-xs font-bold">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-mono">
                          <span className="text-terminal-green">{activity.user}</span> {activity.action}{' '}
                          <span className="text-accent-blue">{activity.target}</span>
                        </p>
                        <p className="text-text-muted text-xs font-mono">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'profiles':
        return (
          <div className="space-y-6">
            {/* Header with Search and Actions */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-white font-mono">Shared Profiles</h2>
                <p className="text-text-gray font-mono">Manage and collaborate on context profiles</p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedProfiles.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="bg-accent-blue text-white px-4 py-2 rounded-xl font-medium hover:bg-accent-blue/80 transition font-mono flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{selectedProfiles.size} Selected</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-glass-bg border border-glass-border text-white px-4 py-3 rounded-xl font-medium hover:border-glass-border-hover transition font-mono flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </motion.button>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {showBulkActions && selectedProfiles.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-xl p-4 border border-glass-border shadow-glass"
                >
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBulkAction('share')}
                      className="bg-terminal-green text-black px-4 py-2 rounded-lg font-medium hover:bg-terminal-green/80 transition font-mono flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBulkAction('folder')}
                      className="bg-accent-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-blue/80 transition font-mono flex items-center space-x-2"
                    >
                      <Folder className="w-4 h-4" />
                      <span>Add to Folder</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBulkAction('archive')}
                      className="bg-accent-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-orange/80 transition font-mono flex items-center space-x-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Archive</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBulkAction('delete')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition font-mono flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedProfiles
                .filter(profile => 
                  profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  profile.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                    selectedProfiles.has(profile.id) 
                      ? 'border-terminal-green shadow-glow-sm' 
                      : 'border-glass-border hover:border-glass-border-hover shadow-glass'
                  }`}
                  onClick={() => {
                    const newSelected = new Set(selectedProfiles);
                    if (newSelected.has(profile.id)) {
                      newSelected.delete(profile.id);
                    } else {
                      newSelected.add(profile.id);
                    }
                    setSelectedProfiles(newSelected);
                  }}
                >
                  <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-xl flex items-center justify-center border border-terminal-green/20">
                          <Brain className="w-6 h-6 text-terminal-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white font-mono group-hover:text-terminal-green transition-colors truncate">
                            {profile.name}
                          </h3>
                          <p className="text-text-gray text-sm font-mono truncate">{profile.description}</p>
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedProfiles.has(profile.id)
                          ? 'bg-terminal-green border-terminal-green'
                          : 'border-gray-400 group-hover:border-terminal-green'
                      }`}>
                        {selectedProfiles.has(profile.id) && (
                          <CheckCircle className="w-3 h-3 text-black" />
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-terminal-green/20 text-terminal-green text-xs rounded-lg font-mono border border-terminal-green/30"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className={`px-2 py-1 text-xs rounded-lg font-mono border ${
                        profile.status === 'active' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green/30' :
                        profile.status === 'draft' ? 'bg-accent-orange/20 text-accent-orange border-accent-orange/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {profile.status}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-sm font-mono mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-text-muted">{profile.lastModified.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {profile.isShared ? (
                          <Globe className="w-4 h-4 text-terminal-green" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-text-muted">{profile.createdBy}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(profile);
                          }}
                          className="p-2 text-gray-400 hover:text-terminal-green transition rounded-lg hover:bg-glass-hover"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
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
                            handleDuplicateProfile(profile);
                          }}
                          className="p-2 text-gray-400 hover:text-accent-purple transition rounded-lg hover:bg-glass-hover"
                          title="Duplicate Profile"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProfile(profile);
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-glass-hover"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-terminal-green group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {sharedProfiles.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-terminal-green/20">
                  <Brain className="w-10 h-10 text-terminal-green" />
                </div>
                <h3 className="text-2xl font-semibold text-white font-mono mb-4">No Shared Profiles</h3>
                <p className="text-text-gray font-mono mb-6">Create your first context profile to start collaborating with your team</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-profiles'))}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition font-mono"
                >
                  Create First Profile
                </motion.button>
              </div>
            )}
          </div>
        );

      case 'folders':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-white font-mono">Project Folders</h2>
                <p className="text-text-gray font-mono">Organize your team's context profiles</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateFolderModal(true)}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center space-x-2"
              >
                <FolderPlus className="w-5 h-5" />
                <span>New Folder</span>
              </motion.button>
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectFolders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass hover:border-glass-border-hover transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${folder.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow-sm`}>
                        <Folder className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {folder.isShared && (
                          <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
                        )}
                        <button 
                          className="text-text-gray hover:text-white transition opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Folder options clicked');
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 font-mono group-hover:text-terminal-green transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-text-gray text-sm mb-4 font-mono line-clamp-2">{folder.description}</p>
                    
                    <div className="flex items-center justify-between text-sm font-mono mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-text-muted">{folder.profileCount} profiles</span>
                        <span className="text-text-muted">{folder.memberCount} members</span>
                      </div>
                      <span className="text-text-muted">
                        {folder.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {folder.collaborators.slice(0, 3).map((collaborator, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-full border-2 border-glass-bg flex items-center justify-center"
                              title={collaborator}
                            >
                              <span className="text-xs font-bold text-terminal-green">
                                {collaborator.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          ))}
                          {folder.collaborators.length > 3 && (
                            <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-glass-bg flex items-center justify-center">
                              <span className="text-xs font-bold text-white">+{folder.collaborators.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-terminal-green font-mono">
                          {folder.isShared ? 'Shared' : 'Private'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-gray group-hover:text-terminal-green group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-white font-mono">Team Members</h2>
                <p className="text-text-gray font-mono">Manage your team access and permissions</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Invite Member</span>
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray w-5 h-5" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-glass-bg border border-glass-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
              />
            </div>

            {/* Members List */}
            <div className="bg-glass-bg backdrop-blur-xl rounded-2xl border border-glass-border shadow-glass overflow-hidden">
              <div className="p-6 border-b border-glass-border">
                <h3 className="text-lg font-semibold text-white font-mono">Team Members ({teamMembers.length})</h3>
              </div>
              <div className="divide-y divide-glass-border">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-glass-hover transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-full flex items-center justify-center border border-terminal-green/20">
                            <span className="text-terminal-green font-bold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-glass-bg ${
                            member.status === 'online' ? 'bg-terminal-green' :
                            member.status === 'away' ? 'bg-accent-orange' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium font-mono">{member.name}</h4>
                          <p className="text-text-gray text-sm font-mono">{member.email}</p>
                          <p className="text-text-muted text-xs font-mono">
                            Last active: {member.lastActive.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
                          member.role === 'admin' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green/30' :
                          member.role === 'member' ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {member.role}
                        </span>
                        <button 
                          className="text-text-gray hover:text-white transition"
                          onClick={() => console.log('Member options clicked')}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white font-mono">Team Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass">
                <h3 className="text-lg font-semibold text-white mb-4 font-mono">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Team Name</label>
                    <input
                      type="text"
                      defaultValue="My Team"
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Team Description</label>
                    <textarea
                      rows={3}
                      defaultValue="Our team workspace for AI context management"
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass">
                <h3 className="text-lg font-semibold text-white mb-4 font-mono">Default Permissions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium font-mono">Allow profile sharing</p>
                      <p className="text-text-gray text-sm font-mono">Members can share profiles with the team</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-terminal-green" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium font-mono">Require approval for invites</p>
                      <p className="text-text-gray text-sm font-mono">Admin approval needed for new members</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-terminal-green" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium font-mono">Enable activity tracking</p>
                      <p className="text-text-gray text-sm font-mono">Track team member activity</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-terminal-green" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">
            <span className="text-terminal-green">{'>'}</span> Team Workspace
          </h1>
          <p className="text-text-gray font-mono">Collaborate with your team on AI context profiles</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-glass-bg backdrop-blur-xl rounded-xl p-1 border border-glass-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 font-mono whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black font-medium shadow-glow-sm'
                      : 'text-text-gray hover:text-white hover:bg-glass-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Folder Details Modal */}
      <AnimatePresence>
        {showFolderDetails && selectedFolder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-glass-border shadow-glass-xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${selectedFolder.color} rounded-xl flex items-center justify-center shadow-glow-sm`}>
                      <Folder className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-mono">{selectedFolder.name}</h2>
                      <p className="text-text-gray font-mono">{selectedFolder.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFolderDetails(false)}
                    className="text-text-gray hover:text-white transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Folder Stats */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-glass-bg backdrop-blur-xl rounded-xl p-4 border border-glass-border">
                      <h3 className="text-lg font-semibold text-white mb-4 font-mono">Folder Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-text-gray font-mono">Profiles:</span>
                          <span className="text-terminal-green font-mono font-bold">{selectedFolder.profileCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-gray font-mono">Members:</span>
                          <span className="text-accent-blue font-mono font-bold">{selectedFolder.memberCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-gray font-mono">Visibility:</span>
                          <span className={`font-mono font-bold ${selectedFolder.isShared ? 'text-terminal-green' : 'text-accent-orange'}`}>
                            {selectedFolder.isShared ? 'Shared' : 'Private'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-gray font-mono">Updated:</span>
                          <span className="text-text-muted font-mono">{selectedFolder.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black p-3 rounded-xl font-medium hover:shadow-glow transition font-mono flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Profile</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-glass-bg border border-glass-border text-white p-3 rounded-xl font-medium hover:bg-glass-hover transition font-mono flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share Folder</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Profiles List */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 font-mono">Context Profiles</h3>
                    <div className="space-y-3">
                      {selectedFolder.profiles.map((profile, index) => (
                        <motion.div
                          key={profile.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-glass-bg backdrop-blur-xl rounded-xl p-4 border border-glass-border hover:border-glass-border-hover transition-all duration-300 group cursor-pointer"
                          onClick={() => handleViewProfile(profile)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-xl flex items-center justify-center border border-terminal-green/20">
                                <Brain className="w-5 h-5 text-terminal-green" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium font-mono group-hover:text-terminal-green transition-colors">
                                  {profile.name}
                                </h4>
                                <p className="text-text-gray text-sm font-mono">{profile.description}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-text-muted text-xs font-mono">
                                    By {profile.createdBy}
                                  </span>
                                  <span className="text-text-muted text-xs font-mono">
                                    {profile.lastModified.toLocaleDateString()}
                                  </span>
                                  {profile.isShared && (
                                    <span className="text-terminal-green text-xs font-mono flex items-center space-x-1">
                                      <Share2 className="w-3 h-3" />
                                      <span>Shared</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="text-text-gray hover:text-terminal-green transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(profile);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-text-gray hover:text-accent-blue transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProfile(profile);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-text-gray hover:text-accent-purple transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateProfile(profile);
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-glass-border shadow-glass-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4 font-mono">Invite Team Member</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleInviteMember(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="colleague@company.com"
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Role</label>
                    <select 
                      name="role"
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-terminal-green text-black px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition font-mono"
                  >
                    Send Invite
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-glass-border shadow-glass-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4 font-mono">Create Project Folder</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleCreateFolder(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Folder Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="My Project Folder"
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Describe what this folder will contain..."
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="shared" id="shared" className="w-4 h-4 text-terminal-green" />
                    <label htmlFor="shared" className="text-sm text-text-gray font-mono">
                      Share with all team members
                    </label>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateFolderModal(false)}
                    className="flex-1 px-4 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-terminal-green text-black px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition font-mono"
                  >
                    Create Folder
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamWorkspace;