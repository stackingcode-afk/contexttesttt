import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, 
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
  Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { googleDocsService } from '../../services/googleDocsService';

interface GoogleDriveFile {
  id: string;
  name: string;
  type: 'document' | 'sheet' | 'folder';
  lastModified: Date;
  size?: string;
  url: string;
  content?: string;
  isImported?: boolean;
}

const GoogleDriveIntegration: React.FC = () => {
  const { profiles, currentProfile, setCurrentProfile } = useApp();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTarget, setImportTarget] = useState<string>('');
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | 'document' | 'sheet'>('all');

  // Mock data for demonstration
  const mockFiles: GoogleDriveFile[] = [
    {
      id: 'doc_1',
      name: 'Brand Guidelines 2024',
      type: 'document',
      lastModified: new Date('2024-01-15'),
      size: '2.3 MB',
      url: 'https://docs.google.com/document/d/mock1',
      content: 'Our brand voice is professional yet approachable. We focus on clarity and authenticity in all communications...'
    },
    {
      id: 'doc_2',
      name: 'Customer Personas Research',
      type: 'document',
      lastModified: new Date('2024-01-10'),
      size: '1.8 MB',
      url: 'https://docs.google.com/document/d/mock2',
      content: 'Primary persona: Sarah, 32, Marketing Manager. Pain points: Limited time, needs efficient solutions...'
    },
    {
      id: 'sheet_1',
      name: 'Product Features Matrix',
      type: 'sheet',
      lastModified: new Date('2024-01-08'),
      size: '856 KB',
      url: 'https://docs.google.com/spreadsheets/d/mock1',
      content: 'Feature 1: AI-powered context management, Feature 2: Multi-model support...'
    },
    {
      id: 'doc_3',
      name: 'Marketing Campaign Strategy',
      type: 'document',
      lastModified: new Date('2024-01-05'),
      size: '3.1 MB',
      url: 'https://docs.google.com/document/d/mock3',
      content: 'Q1 2024 campaign focuses on AI adoption in small businesses. Key messaging: efficiency, automation...'
    },
    {
      id: 'doc_4',
      name: 'SOPs - Content Creation',
      type: 'document',
      lastModified: new Date('2024-01-03'),
      size: '1.2 MB',
      url: 'https://docs.google.com/document/d/mock4',
      content: 'Step 1: Research target audience, Step 2: Define key messages, Step 3: Create content outline...'
    }
  ];

  useEffect(() => {
    // Check if Google Drive is configured
    setIsConnected(googleDocsService.isConfigured());
    
    // Load mock files for demonstration
    setFiles(mockFiles);
  }, []);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (googleDocsService.isConfigured()) {
        const authenticated = await googleDocsService.authenticate();
        setIsConnected(authenticated);
        if (authenticated) {
          await loadFiles();
        }
      } else {
        // Redirect to settings to configure
        alert('Please configure Google Drive integration in Settings first.');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect to Google Drive. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from Google Drive API
      // For now, we'll use mock data
      setFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleImportFiles = () => {
    if (selectedFiles.size === 0) {
      alert('Please select files to import.');
      return;
    }
    
    if (!importTarget) {
      alert('Please select a target profile.');
      return;
    }
    
    setShowImportModal(true);
  };

  const confirmImport = () => {
    const selectedFilesList = files.filter(f => selectedFiles.has(f.id));
    
    // Mark files as imported
    setFiles(prev => prev.map(file => 
      selectedFiles.has(file.id) ? { ...file, isImported: true } : file
    ));
    
    // Clear selections
    setSelectedFiles(new Set());
    setShowImportModal(false);
    setImportTarget('');
    
    alert(`Successfully imported ${selectedFilesList.length} files to ${profiles.find(p => p.id === importTarget)?.name}!`);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'sheet':
        return File;
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
      case 'folder':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      {/* Header */}
      <div className="flex-shrink-0 p-6 md:p-8 border-b border-glass-border bg-glass-bg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-mono flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-glow-sm">
                <HardDrive className="w-7 h-7 text-white" />
              </div>
              <span>
                <span className="text-terminal-green">{'>'}</span> Google Drive Integration
              </span>
            </h1>
            <p className="text-text-gray font-mono">Import content from Google Docs and Sheets to enhance your context profiles</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-900/20 rounded-xl border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-mono text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-900/20 rounded-xl border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-mono text-sm">Not Connected</span>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick('connect', handleConnect)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <HardDrive className="w-5 h-5" />
              )}
              <span>{buttonStates['connect'] ? 'Connecting...' : isConnected ? 'Refresh' : 'Connect'}</span>
            </motion.button>
          </div>
        </div>

        {/* Filters and Search */}
        {isConnected && (
          <div className="mt-6 bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-glass-bg border border-glass-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
              >
                <option value="all">All Files</option>
                <option value="document">Documents</option>
                <option value="sheet">Spreadsheets</option>
              </select>
              
              {selectedFiles.size > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImportFiles}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
                >
                  <Download className="w-5 h-5" />
                  <span>Import Selected ({selectedFiles.size})</span>
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {!isConnected ? (
          // Connection Setup
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
                <HardDrive className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-3xl font-semibold text-white font-mono">Connect Google Drive</h3>
              <p className="text-text-gray font-mono max-w-2xl mx-auto leading-relaxed">
                Import content from your Google Docs and Sheets to automatically enhance your context profiles with existing business information, brand guidelines, and customer data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
                  <FileText className="w-8 h-8 text-blue-400 mb-4" />
                  <h4 className="text-white font-medium mb-2 font-mono">Google Docs</h4>
                  <p className="text-text-gray text-sm font-mono">Import brand guidelines, SOPs, and business documentation</p>
                </div>
                <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
                  <File className="w-8 h-8 text-green-400 mb-4" />
                  <h4 className="text-white font-medium mb-2 font-mono">Google Sheets</h4>
                  <p className="text-text-gray text-sm font-mono">Extract customer data, product features, and structured information</p>
                </div>
                <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border">
                  <Brain className="w-8 h-8 text-terminal-green mb-4" />
                  <h4 className="text-white font-medium mb-2 font-mono">Auto-Enhancement</h4>
                  <p className="text-text-gray text-sm font-mono">Automatically populate context profiles with relevant content</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnect}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-glow-xl transition-all duration-300 flex items-center space-x-3 mx-auto font-mono"
              >
                <HardDrive className="w-6 h-6" />
                <span>Connect Google Drive</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        ) : (
          // Files Grid
          <div className="space-y-6">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-500/10 rounded-3xl flex items-center justify-center mx-auto border border-gray-500/20">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white font-mono">No files found</h3>
                  <p className="text-text-gray font-mono">
                    {searchTerm ? 'Try adjusting your search terms' : 'No files available in your Google Drive'}
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFiles.map((file, index) => {
                  const FileIcon = getFileIcon(file.type);
                  const isSelected = selectedFiles.has(file.id);
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className={`bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 group shadow-glass relative overflow-hidden cursor-pointer ${
                        isSelected 
                          ? 'border-terminal-green shadow-glow' 
                          : 'border-glass-border hover:border-glass-border-hover'
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                      
                      {/* Selection indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-terminal-green border-terminal-green' 
                          : 'border-gray-400 group-hover:border-terminal-green'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-black absolute top-0.5 left-0.5" />
                        )}
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-2xl flex items-center justify-center border border-gray-600/20`}>
                            <FileIcon className={`w-6 h-6 ${getFileTypeColor(file.type)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium font-mono truncate group-hover:text-terminal-green transition-colors">
                              {file.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-text-gray font-mono capitalize">{file.type}</span>
                              {file.isImported && (
                                <span className="text-xs text-terminal-green font-mono bg-terminal-green/20 px-2 py-0.5 rounded-full border border-terminal-green/30">
                                  Imported
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-text-gray text-sm mb-4 line-clamp-2 font-mono leading-relaxed">
                          {file.content?.substring(0, 120)}...
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-text-gray font-mono">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{file.lastModified.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{file.size}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}
                            className="p-2 text-text-gray hover:text-blue-400 transition rounded-lg hover:bg-glass-hover"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Preview functionality
                            }}
                            className="p-2 text-text-gray hover:text-terminal-green transition rounded-lg hover:bg-glass-hover"
                            title="Preview content"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
                  <Trash2 className="w-5 h-5" />
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

export default GoogleDriveIntegration;