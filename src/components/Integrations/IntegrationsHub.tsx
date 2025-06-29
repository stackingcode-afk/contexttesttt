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
  Cpu,
  X
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
  const { profiles, currentProfile, setCurrentProfile, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'google-drive' | 'pdf-processor' | 'automation'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<IntegrationFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTarget, setImportTarget] = useState<string>('');
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [processingPdf, setProcessingPdf] = useState(false);

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

  // Mock Google Drive files for demonstration
  const mockGoogleFiles: IntegrationFile[] = [
    {
      id: 'doc_1',
      name: 'Brand Guidelines 2024',
      type: 'document',
      source: 'Google Drive',
      lastModified: new Date('2024-01-15'),
      size: '2.3 MB',
      url: 'https://docs.google.com/document/d/mock1',
      content: 'Our brand voice is professional yet approachable. We focus on clarity and authenticity in all communications. Key messaging pillars: Innovation, Reliability, Customer-first approach.'
    },
    {
      id: 'sheet_1',
      name: 'Product Features Matrix',
      type: 'sheet',
      source: 'Google Drive',
      lastModified: new Date('2024-01-08'),
      size: '856 KB',
      url: 'https://docs.google.com/spreadsheets/d/mock1',
      content: 'Feature 1: AI-powered context management - Allows users to create detailed business contexts. Feature 2: Multi-model support - Works with GPT, Claude, Gemini, and local models.'
    },
    {
      id: 'doc_2',
      name: 'Customer Personas Research',
      type: 'document',
      source: 'Google Drive',
      lastModified: new Date('2024-01-10'),
      size: '1.8 MB',
      url: 'https://docs.google.com/document/d/mock2',
      content: 'Primary persona: Sarah, 32, Marketing Manager. Pain points: Limited time for content creation, needs efficient AI solutions. Goals: Streamline marketing workflows, improve content quality.'
    }
  ];

  useEffect(() => {
    setFiles(mockGoogleFiles);
  }, []);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  // Google Drive Functions
  const handleConnectGoogleDrive = async () => {
    setIsLoading(true);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGoogleDriveConnected(true);
      alert('✅ Google Drive connected successfully! (Demo mode)');
    } catch (error) {
      alert('❌ Failed to connect to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromGoogleDrive = () => {
    if (selectedFiles.size === 0) {
      alert('Please select files to import.');
      return;
    }
    setShowImportModal(true);
  };

  // PDF Processing Functions
  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPdfFiles(prev => [...prev, ...files]);
  };

  const processPdfFile = async (file: File) => {
    setProcessingPdf(true);
    try {
      // Simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted content
      const extractedContent = {
        title: file.name.replace('.pdf', ''),
        content: `Extracted content from ${file.name}. This would contain the actual text content from the PDF, structured and ready for import into context profiles.`,
        metadata: {
          pages: Math.floor(Math.random() * 50) + 1,
          wordCount: Math.floor(Math.random() * 5000) + 500,
          extractedAt: new Date()
        }
      };

      // Add to files list
      const newFile: IntegrationFile = {
        id: `pdf_${Date.now()}`,
        name: file.name,
        type: 'pdf',
        source: 'PDF Processor',
        lastModified: new Date(),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: '#',
        content: extractedContent.content
      };

      setFiles(prev => [...prev, newFile]);
      alert(`✅ Successfully processed ${file.name}!`);
    } catch (error) {
      alert(`❌ Failed to process ${file.name}`);
    } finally {
      setProcessingPdf(false);
    }
  };

  // Import Functions
  const confirmImport = () => {
    if (!importTarget) {
      alert('Please select a target profile.');
      return;
    }

    const selectedFilesList = files.filter(f => selectedFiles.has(f.id));
    const targetProfile = profiles.find(p => p.id === importTarget);
    
    if (!targetProfile) {
      alert('Target profile not found.');
      return;
    }

    // Update profile with imported content
    const updatedProfile = { ...targetProfile };
    
    selectedFilesList.forEach(file => {
      // Add content to custom fields
      if (!updatedProfile.customFields.importedContent) {
        updatedProfile.customFields.importedContent = [];
      }
      
      updatedProfile.customFields.importedContent.push({
        id: file.id,
        name: file.name,
        source: file.source,
        content: file.content,
        importedAt: new Date(),
        type: file.type
      });

      // Try to auto-populate relevant fields based on content
      if (file.content) {
        const content = file.content.toLowerCase();
        
        // Auto-populate brand voice if content mentions tone/voice
        if (content.includes('brand voice') || content.includes('tone')) {
          if (!updatedProfile.brandVoice.tone) {
            updatedProfile.brandVoice.tone = file.content.substring(0, 200) + '...';
          }
        }
        
        // Auto-populate business info if content mentions company/business
        if (content.includes('company') || content.includes('business')) {
          if (!updatedProfile.businessInfo.name && file.name.includes('brand')) {
            // Try to extract company name from content
            const lines = file.content.split('\n');
            const companyLine = lines.find(line => 
              line.toLowerCase().includes('company') || 
              line.toLowerCase().includes('business')
            );
            if (companyLine) {
              updatedProfile.businessInfo.name = companyLine.substring(0, 50);
            }
          }
        }
      }
    });

    // Update the profile
    updateProfile(importTarget, updatedProfile);
    
    // Mark files as imported
    setFiles(prev => prev.map(file => 
      selectedFiles.has(file.id) ? { ...file, isImported: true } : file
    ));
    
    // Clear selections and close modal
    setSelectedFiles(new Set());
    setShowImportModal(false);
    setImportTarget('');
    
    alert(`✅ Successfully imported ${selectedFilesList.length} files to ${targetProfile.name}!`);
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'sheet':
        return FileSpreadsheet;
      case 'pdf':
        return FileText;
      case 'folder':
        return Folder;
      default:
        return File;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'text-blue-400';
      case 'sheet':
        return 'text-green-400';
      case 'pdf':
        return 'text-red-400';
      case 'folder':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'overview' || 
                      (activeTab === 'google-drive' && file.source === 'Google Drive') ||
                      (activeTab === 'pdf-processor' && file.source === 'PDF Processor');
    return matchesSearch && matchesTab;
  });

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
      {['productivity', 'automation', 'communication', 'ai'].map((category, categoryIndex) => {
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
                          if (integration.status === 'available') {
                            setActiveTab(integration.id as any);
                          } else {
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
      {/* Connection Status */}
      <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white font-mono">Google Drive Integration</h3>
              <p className="text-text-gray text-sm font-mono">Import and process content from your Google Drive</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {googleDriveConnected ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-900/20 rounded-xl border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-mono text-sm">Connected</span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleButtonClick('connect-drive', handleConnectGoogleDrive)}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <HardDrive className="w-5 h-5" />
                )}
                <span>{buttonStates['connect-drive'] ? 'Connecting...' : 'Connect Drive'}</span>
              </motion.button>
            )}
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

      {/* File Browser */}
      {googleDriveConnected && (
        <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-white font-mono">Available Files</h4>
            {selectedFiles.size > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImportFromGoogleDrive}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
              >
                <Download className="w-5 h-5" />
                <span>Import Selected ({selectedFiles.size})</span>
              </motion.button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              const isSelected = selectedFiles.has(file.id);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-glass-bg rounded-xl p-4 border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-terminal-green shadow-glow' 
                      : 'border-glass-border hover:border-glass-border-hover'
                  }`}
                  onClick={() => {
                    setSelectedFiles(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(file.id)) {
                        newSet.delete(file.id);
                      } else {
                        newSet.add(file.id);
                      }
                      return newSet;
                    });
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-xl flex items-center justify-center border border-gray-600/20`}>
                      <FileIcon className={`w-5 h-5 ${getFileTypeColor(file.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium font-mono truncate">{file.name}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-text-gray font-mono capitalize">{file.type}</span>
                        <span className="text-xs text-text-gray font-mono">{file.size}</span>
                        {file.isImported && (
                          <span className="text-xs text-terminal-green font-mono bg-terminal-green/20 px-2 py-0.5 rounded-full border border-terminal-green/30">
                            Imported
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-terminal-green border-terminal-green' 
                        : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-black absolute" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderPdfProcessor = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white font-mono">PDF Processor</h3>
            <p className="text-text-gray text-sm font-mono">Extract and structure content from PDF documents</p>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-terminal-green transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2 font-mono">Upload PDF Files</h4>
          <p className="text-text-gray text-sm mb-4 font-mono">Drag and drop PDF files or click to browse</p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handlePdfUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow transition cursor-pointer inline-flex items-center space-x-2 font-mono"
          >
            <Plus className="w-5 h-5" />
            <span>Choose Files</span>
          </label>
        </div>
      </div>

      {/* Processing Queue */}
      {pdfFiles.length > 0 && (
        <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
          <h4 className="text-lg font-semibold text-white font-mono mb-4">Processing Queue</h4>
          <div className="space-y-3">
            {pdfFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-glass-bg rounded-xl border border-glass-border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium font-mono">{file.name}</p>
                    <p className="text-text-gray text-sm font-mono">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => processPdfFile(file)}
                  disabled={processingPdf}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-glow transition font-mono disabled:opacity-50"
                >
                  {processingPdf ? 'Processing...' : 'Process'}
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Files */}
      <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
        <h4 className="text-lg font-semibold text-white font-mono mb-4">Processed Files</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFiles.filter(f => f.source === 'PDF Processor').map((file, index) => {
            const isSelected = selectedFiles.has(file.id);
            
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-glass-bg rounded-xl p-4 border transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-terminal-green shadow-glow' 
                    : 'border-glass-border hover:border-glass-border-hover'
                }`}
                onClick={() => {
                  setSelectedFiles(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(file.id)) {
                      newSet.delete(file.id);
                    } else {
                      newSet.add(file.id);
                    }
                    return newSet;
                  });
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium font-mono truncate">{file.name}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-text-gray font-mono">{file.size}</span>
                      {file.isImported && (
                        <span className="text-xs text-terminal-green font-mono bg-terminal-green/20 px-2 py-0.5 rounded-full border border-terminal-green/30">
                          Imported
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-terminal-green border-terminal-green' 
                      : 'border-gray-400'
                  }`}>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-black absolute" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {selectedFiles.size > 0 && (
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
            >
              <Download className="w-5 h-5" />
              <span>Import Selected ({selectedFiles.size})</span>
            </motion.button>
          </div>
        )}
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
            { id: 'pdf-processor', label: 'PDF Processor', icon: FileText },
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
          {activeTab === 'pdf-processor' && renderPdfProcessor()}
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

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-glass-border shadow-glass-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white font-mono">Import to Profile</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-text-gray hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Select Target Profile
                  </label>
                  <select
                    value={importTarget}
                    onChange={(e) => setImportTarget(e.target.value)}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  >
                    <option value="">Choose a profile...</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-glass-bg rounded-xl p-4 border border-glass-border">
                  <h3 className="text-white font-medium mb-2 font-mono">Selected Files ({selectedFiles.size})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.filter(f => selectedFiles.has(f.id)).map(file => (
                      <div key={file.id} className="flex items-center space-x-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-text-gray font-mono truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmImport}
                    disabled={!importTarget}
                    className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-medium hover:shadow-glow transition font-mono disabled:opacity-50"
                  >
                    Import Files
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationsHub;