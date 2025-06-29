import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, 
  HardDrive, 
  MessageSquare, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Folder,
  File,
  Calendar,
  User,
  ExternalLink,
  Zap,
  Brain,
  ArrowRight,
  Clock,
  Star,
  Trash2,
  Bot,
  Slack,
  FileSpreadsheet,
  Database,
  Workflow,
  Code,
  Globe,
  Shield,
  Cpu
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { googleDocsService } from '../../services/googleDocsService';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'connected' | 'available' | 'coming_soon';
  category: 'productivity' | 'communication' | 'automation' | 'ai';
  features: string[];
  setupRequired?: boolean;
  color: string;
}

interface IntegrationFile {
  id: string;
  name: string;
  type: 'document' | 'sheet' | 'folder' | 'message' | 'pdf';
  source: string;
  lastModified: Date;
  size?: string;
  url: string;
  content?: string;
  isImported?: boolean;
}

const IntegrationsHub: React.FC = () => {
  const { profiles, currentProfile, setCurrentProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'google-drive' | 'slack' | 'automation'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<IntegrationFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTarget, setImportTarget] = useState<string>('');
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});

  const integrations: Integration[] = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Import content from Google Docs and Sheets to enhance your context profiles',
      icon: HardDrive,
      status: 'available',
      category: 'productivity',
      features: ['Import Google Docs', 'Extract from Sheets', 'Auto-sync content', 'Batch processing'],
      setupRequired: true,
      color: 'blue'
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Extract team conversations and knowledge from Slack channels',
      icon: MessageSquare,
      status: 'coming_soon',
      category: 'communication',
      features: ['Channel history', 'Direct messages', 'Thread extraction', 'User context'],
      color: 'purple'
    },
    {
      id: 'pdf-processor',
      name: 'PDF Processor',
      description: 'Extract and structure content from PDF documents into JSON profiles',
      icon: FileText,
      status: 'available',
      category: 'automation',
      features: ['Text extraction', 'JSON conversion', 'Auto-tagging', 'Batch processing'],
      color: 'red'
    },
    {
      id: 'automation-engine',
      name: 'Automation Engine',
      description: 'Create custom workflows to automatically process and tag content',
      icon: Workflow,
      status: 'available',
      category: 'automation',
      features: ['Custom workflows', 'Auto-tagging', 'Content classification', 'Rule-based processing'],
      color: 'green'
    },
    {
      id: 'api-connector',
      name: 'API Connector',
      description: 'Connect to external APIs and automatically import structured data',
      icon: Code,
      status: 'coming_soon',
      category: 'automation',
      features: ['REST API support', 'Webhook integration', 'Data transformation', 'Scheduled imports'],
      color: 'orange'
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper',
      description: 'Extract content from websites and convert to structured profiles',
      icon: Globe,
      status: 'coming_soon',
      category: 'automation',
      features: ['Website scraping', 'Content extraction', 'Auto-structuring', 'Scheduled updates'],
      color: 'teal'
    }
  ];

  // Mock files for demonstration
  const mockFiles: IntegrationFile[] = [
    {
      id: 'doc_1',
      name: 'Brand Guidelines 2024',
      type: 'document',
      source: 'Google Drive',
      lastModified: new Date('2024-01-15'),
      size: '2.3 MB',
      url: 'https://docs.google.com/document/d/mock1',
      content: 'Our brand voice is professional yet approachable. We focus on clarity and authenticity in all communications...'
    },
    {
      id: 'pdf_1',
      name: 'Customer Research Report.pdf',
      type: 'pdf',
      source: 'PDF Processor',
      lastModified: new Date('2024-01-12'),
      size: '4.1 MB',
      url: '#',
      content: 'Customer survey results show 85% prefer automated solutions. Key pain points include manual processes...'
    },
    {
      id: 'sheet_1',
      name: 'Product Features Matrix',
      type: 'sheet',
      source: 'Google Drive',
      lastModified: new Date('2024-01-08'),
      size: '856 KB',
      url: 'https://docs.google.com/spreadsheets/d/mock1',
      content: 'Feature 1: AI-powered context management, Feature 2: Multi-model support...'
    }
  ];

  useEffect(() => {
    setFiles(mockFiles);
  }, []);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  const getIntegrationsByCategory = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'available':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'coming_soon':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'available':
        return 'Available';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  const getIntegrationColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      teal: 'from-teal-500 to-teal-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto border border-terminal-green/20">
            <Puzzle className="w-10 h-10 text-terminal-green" />
          </div>
          <h2 className="text-3xl font-bold text-white font-mono">Integrations Hub</h2>
          <p className="text-text-gray font-mono max-w-2xl mx-auto leading-relaxed">
            Connect your favorite tools and automate content extraction to build richer context profiles. 
            Transform documents, conversations, and data into structured AI-ready formats.
          </p>
        </motion.div>
      </div>

      {/* Categories */}
      {['productivity', 'communication', 'automation', 'ai'].map((category, categoryIndex) => {
        const categoryIntegrations = getIntegrationsByCategory(category);
        if (categoryIntegrations.length === 0) return null;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white font-mono capitalize flex items-center space-x-3">
              <div className="w-2 h-2 bg-terminal-green rounded-full" />
              <span>{category} Integrations</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryIntegrations.map((integration, index) => {
                const Icon = integration.icon;
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border hover:border-glass-border-hover transition-all duration-300 group shadow-glass relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getIntegrationColor(integration.color)} rounded-2xl flex items-center justify-center shadow-glow-sm`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getStatusColor(integration.status)}`}>
                          {getStatusText(integration.status)}
                        </span>
                      </div>
                      
                      <h4 className="text-white font-semibold mb-2 font-mono group-hover:text-terminal-green transition-colors">
                        {integration.name}
                      </h4>
                      <p className="text-text-gray text-sm mb-4 font-mono leading-relaxed">
                        {integration.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        {integration.features.slice(0, 3).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-terminal-green flex-shrink-0" />
                            <span className="text-text-gray text-xs font-mono">{feature}</span>
                          </div>
                        ))}
                        {integration.features.length > 3 && (
                          <div className="flex items-center space-x-2">
                            <Plus className="w-3 h-3 text-terminal-green flex-shrink-0" />
                            <span className="text-text-gray text-xs font-mono">
                              +{integration.features.length - 3} more features
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (integration.id === 'google-drive') {
                            setActiveTab('google-drive');
                          } else if (integration.status === 'available') {
                            alert(`${integration.name} integration coming soon!`);
                          }
                        }}
                        disabled={integration.status === 'coming_soon'}
                        className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center space-x-2 font-mono ${
                          integration.status === 'coming_soon'
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : integration.status === 'connected'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : `bg-gradient-to-r ${getIntegrationColor(integration.color)} text-white hover:shadow-glow`
                        }`}
                      >
                        {integration.status === 'coming_soon' ? (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>Coming Soon</span>
                          </>
                        ) : integration.status === 'connected' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Manage</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Connect</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderGoogleDrive = () => (
    <div className="space-y-6">
      {/* Google Drive specific content */}
      <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white font-mono">Google Drive Integration</h3>
            <p className="text-text-gray text-sm font-mono">Import and process content from your Google Drive</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-glass-bg rounded-xl p-4 border border-glass-border">
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-medium mb-2 font-mono">Google Docs</h4>
            <p className="text-text-gray text-sm font-mono">Extract text content and structure from documents</p>
          </div>
          <div className="bg-glass-bg rounded-xl p-4 border border-glass-border">
            <FileSpreadsheet className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-medium mb-2 font-mono">Google Sheets</h4>
            <p className="text-text-gray text-sm font-mono">Import structured data and convert to profiles</p>
          </div>
          <div className="bg-glass-bg rounded-xl p-4 border border-glass-border">
            <Brain className="w-8 h-8 text-terminal-green mb-3" />
            <h4 className="text-white font-medium mb-2 font-mono">Auto-Processing</h4>
            <p className="text-text-gray text-sm font-mono">Automatically tag and categorize imported content</p>
          </div>
        </div>
      </div>
      
      {/* File browser would go here */}
      <div className="text-center py-12">
        <p className="text-text-gray font-mono">Google Drive file browser will be implemented here</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      {/* Header */}
      <div className="flex-shrink-0 p-6 md:p-8 border-b border-glass-border bg-glass-bg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-mono flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-2xl flex items-center justify-center shadow-glow-sm">
                <Puzzle className="w-7 h-7 text-black" />
              </div>
              <span>
                <span className="text-terminal-green">{'>'}</span> Integrations
              </span>
            </h1>
            <p className="text-text-gray font-mono">Connect tools and automate content extraction for richer AI context</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex space-x-1 bg-glass-bg rounded-xl p-1 border border-glass-border">
          {[
            { id: 'overview', label: 'Overview', icon: Puzzle },
            { id: 'google-drive', label: 'Google Drive', icon: HardDrive },
            { id: 'automation', label: 'Automation', icon: Workflow }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition font-mono ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black font-medium shadow-glow'
                    : 'text-text-gray hover:text-white hover:bg-glass-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'google-drive' && renderGoogleDrive()}
          {activeTab === 'automation' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <Workflow className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white font-mono mb-4">Automation Engine</h3>
              <p className="text-text-gray font-mono max-w-md mx-auto">
                Create custom workflows to automatically process and tag content from various sources.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default IntegrationsHub;