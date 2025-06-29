import React, { useState, useEffect } from 'react';
import { Save, Trash2, Crown, Zap, Download, Upload, Key, Bot, User, CreditCard, Server, Globe, FileText, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import BillingSettings from './BillingSettings';
import { motion } from 'framer-motion';
import { aiService } from '../../services/aiService';
import { googleDocsService } from '../../services/googleDocsService';

const Settings: React.FC = () => {
  const { profiles, prompts, clearMessages } = useApp();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai_api_key') || '',
    anthropic: localStorage.getItem('anthropic_api_key') || '',
    google: localStorage.getItem('google_api_key') || '',
  });
  const [localUrls, setLocalUrls] = useState({
    ollama: localStorage.getItem('ollama_base_url') || 'http://localhost:11434/api',
    gemini_cli: localStorage.getItem('gemini_cli_base_url') || 'http://localhost:8080/api',
    local_llm: localStorage.getItem('local_llm_base_url') || 'http://localhost:5000/api',
  });
  const [localModelStatus, setLocalModelStatus] = useState<Record<string, string>>({});
  const [googleDocsConfig, setGoogleDocsConfig] = useState({
    apiKey: localStorage.getItem('google_docs_api_key') || '',
    clientId: localStorage.getItem('google_docs_client_id') || '',
  });

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'api', label: 'AI Models & API', icon: Bot },
    { id: 'integrations', label: 'Integrations', icon: FileText },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  // Check local model status periodically
  useEffect(() => {
    const checkStatus = () => {
      const localProviders = ['ollama', 'gemini_cli', 'local_llm'];
      const status: Record<string, string> = {};
      
      localProviders.forEach(provider => {
        status[provider] = aiService.getProviderStatus(provider);
      });
      
      setLocalModelStatus(status);
    };

    // Check immediately
    checkStatus();
    
    // Then check every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Load Google Docs config on mount
  useEffect(() => {
    googleDocsService.loadConfig();
  }, []);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  const handleSaveApiKey = (provider: string, key: string) => {
    localStorage.setItem(`${provider}_api_key`, key);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
    aiService.setApiKey(provider, key);
  };

  const handleSaveLocalUrl = (provider: string, url: string) => {
    localStorage.setItem(`${provider}_base_url`, url);
    setLocalUrls(prev => ({ ...prev, [provider]: url }));
    aiService.setBaseUrl(provider, url);
  };

  const handleSaveGoogleDocsConfig = async () => {
    try {
      await googleDocsService.initialize(googleDocsConfig.apiKey, googleDocsConfig.clientId);
      alert('Google Docs configuration saved successfully!');
    } catch (error) {
      alert('Failed to save Google Docs configuration. Please check your credentials.');
    }
  };

  const handleTestGoogleDocs = async () => {
    try {
      const authenticated = await googleDocsService.authenticate();
      if (authenticated) {
        alert('Google Docs connection successful!');
      } else {
        alert('Google Docs authentication failed.');
      }
    } catch (error) {
      alert('Google Docs test failed. Please check your configuration.');
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // Clear app data but keep auth data
      localStorage.removeItem('contxt-profiles');
      localStorage.removeItem('contxt-prompts');
      localStorage.removeItem('contxt-messages');
      clearMessages();
      window.location.reload();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-terminal-green" />;
      case 'checking':
        return <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'disconnected':
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'checking':
        return 'Checking...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <h3 className="text-xl font-semibold text-white mb-6 font-mono">Account Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                    disabled
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono opacity-75"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('https://whop.com/settings', '_blank')}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-lg font-semibold hover:shadow-glow transition font-mono"
                >
                  Edit Profile on WHOP
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="border border-red-500 text-red-400 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition font-mono"
                >
                  Sign Out
                </motion.button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <h3 className="text-xl font-semibold text-white mb-6 font-mono">Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div>
                    <p className="text-white font-medium font-mono">Auto-save profiles</p>
                    <p className="text-text-gray text-sm font-mono mt-1">Automatically save changes every 10 seconds</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-terminal-green rounded focus:ring-terminal-green" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div>
                    <p className="text-white font-medium font-mono">Auto-detect local models</p>
                    <p className="text-text-gray text-sm font-mono mt-1">Automatically detect running local AI models</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-terminal-green rounded focus:ring-terminal-green" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-border-gray opacity-60">
                  <div>
                    <p className="text-white font-medium font-mono">Dark mode</p>
                    <p className="text-text-gray text-sm font-mono mt-1">Use dark theme (always enabled)</p>
                  </div>
                  <input type="checkbox" defaultChecked disabled className="w-5 h-5 text-terminal-green rounded" />
                </div>
              </div>
            </div>

            {/* Data Overview */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <h3 className="text-xl font-semibold text-white mb-6 font-mono">Data Overview</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="text-3xl font-bold text-terminal-green font-mono">{profiles.length}</div>
                  <div className="text-text-gray text-sm font-mono mt-1">Context Profiles</div>
                </div>
                <div className="text-center p-6 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="text-3xl font-bold text-terminal-green font-mono">{prompts.length}</div>
                  <div className="text-text-gray text-sm font-mono mt-1">Saved Prompts</div>
                </div>
              </div>

              <div className="border-t border-border-gray pt-8">
                <h4 className="text-lg font-semibold text-red-400 mb-4 font-mono">Danger Zone</h4>
                <p className="text-text-gray text-sm mb-6 font-mono">
                  This will permanently delete all your profiles, prompts, and chat history.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={buttonStates['clear-data'] ? { 
                    backgroundColor: '#ef4444', 
                    scale: [1, 1.05, 1]
                  } : {}}
                  onClick={() => handleButtonClick('clear-data', handleClearAllData)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition flex items-center space-x-3 font-mono"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>{buttonStates['clear-data'] ? 'Cleared!' : 'Clear All Data'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-8">
            {/* Cloud Models Section */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white font-mono">Cloud AI Models</h3>
                  <p className="text-text-gray text-sm font-mono">Configure your API keys for cloud-based AI models</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* OpenAI */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium font-mono">OpenAI (GPT-4, GPT-3.5)</h4>
                      <p className="text-text-gray text-sm font-mono">Get your API key from platform.openai.com</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                      placeholder="sk-..."
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-openai'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-openai', () => handleSaveApiKey('openai', apiKeys.openai))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-openai'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>

                {/* Anthropic */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">C</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium font-mono">Anthropic (Claude)</h4>
                      <p className="text-text-gray text-sm font-mono">Get your API key from console.anthropic.com</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="password"
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                      placeholder="sk-ant-..."
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-anthropic'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-anthropic', () => handleSaveApiKey('anthropic', apiKeys.anthropic))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-anthropic'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>

                {/* Google */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium font-mono">Google (Gemini Pro)</h4>
                      <p className="text-text-gray text-sm font-mono">Get your API key from makersuite.google.com</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="password"
                      value={apiKeys.google}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, google: e.target.value }))}
                      placeholder="AIza..."
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-google'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-google', () => handleSaveApiKey('google', apiKeys.google))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-google'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Models Section */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white font-mono">Local AI Models</h3>
                  <p className="text-text-gray text-sm font-mono">Configure local AI models for complete privacy</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-terminal-green animate-pulse" />
                  <span className="text-sm text-terminal-green font-mono">Auto-detecting...</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Ollama */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">O</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium font-mono">Ollama (Local LLMs)</h4>
                      <p className="text-text-gray text-sm font-mono">Run Llama 2, Code Llama, Mistral locally</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(localModelStatus.ollama)}
                      <span className="text-sm font-mono text-text-gray">
                        {getStatusText(localModelStatus.ollama)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={localUrls.ollama}
                      onChange={(e) => setLocalUrls(prev => ({ ...prev, ollama: e.target.value }))}
                      placeholder="http://localhost:11434/api"
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-ollama'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-ollama', () => handleSaveLocalUrl('ollama', localUrls.ollama))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-ollama'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>

                {/* Gemini CLI */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium font-mono">Gemini CLI 2.5 Pro (Local)</h4>
                      <p className="text-text-gray text-sm font-mono">Local Gemini 2.5 Pro via CLI interface</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(localModelStatus.gemini_cli)}
                      <span className="text-sm font-mono text-text-gray">
                        {getStatusText(localModelStatus.gemini_cli)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={localUrls.gemini_cli}
                      onChange={(e) => setLocalUrls(prev => ({ ...prev, gemini_cli: e.target.value }))}
                      placeholder="http://localhost:8080/api"
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-gemini-cli'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-gemini-cli', () => handleSaveLocalUrl('gemini_cli', localUrls.gemini_cli))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-gemini-cli'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>

                {/* Custom Local LLM */}
                <div className="bg-gray-800 rounded-lg p-6 border border-border-gray">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">L</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium font-mono">Custom Local LLM</h4>
                      <p className="text-text-gray text-sm font-mono">Any locally installed LLM with API interface</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(localModelStatus.local_llm)}
                      <span className="text-sm font-mono text-text-gray">
                        {getStatusText(localModelStatus.local_llm)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={localUrls.local_llm}
                      onChange={(e) => setLocalUrls(prev => ({ ...prev, local_llm: e.target.value }))}
                      placeholder="http://localhost:5000/api"
                      className="flex-1 bg-gray-700 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={buttonStates['save-local-llm'] ? { 
                        backgroundColor: '#00FF91', 
                        color: '#000000',
                        scale: [1, 1.05, 1]
                      } : {}}
                      onClick={() => handleButtonClick('save-local-llm', () => handleSaveLocalUrl('local_llm', localUrls.local_llm))}
                      className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                    >
                      {buttonStates['save-local-llm'] ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-xl p-6 border border-yellow-500/30">
              <div className="flex items-center space-x-4 mb-4">
                <Key className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white font-mono">Security & Privacy Notice</h3>
              </div>
              <div className="space-y-3 text-sm font-mono text-text-gray">
                <p>• Cloud API keys are stored locally in your browser and never transmitted to our servers</p>
                <p>• Local models keep all data on your machine - nothing is sent externally</p>
                <p>• Auto-detection checks for running local models every 30 seconds</p>
                <p>• You can use any combination of cloud and local models seamlessly</p>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-8">
            {/* Google Docs Integration */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white font-mono">Google Docs Integration</h3>
                  <p className="text-text-gray text-sm font-mono">Import content from your Google Docs to enhance context profiles</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Google API Key
                  </label>
                  <input
                    type="password"
                    value={googleDocsConfig.apiKey}
                    onChange={(e) => setGoogleDocsConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Get from Google Cloud Console"
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={googleDocsConfig.clientId}
                    onChange={(e) => setGoogleDocsConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Get from Google Cloud Console"
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={buttonStates['save-google-docs'] ? { 
                      backgroundColor: '#00FF91', 
                      color: '#000000',
                      scale: [1, 1.05, 1]
                    } : {}}
                    onClick={() => handleButtonClick('save-google-docs', handleSaveGoogleDocsConfig)}
                    className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
                  >
                    {buttonStates['save-google-docs'] ? 'Saved!' : 'Save Config'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={buttonStates['test-google-docs'] ? { 
                      backgroundColor: '#3b82f6', 
                      scale: [1, 1.05, 1]
                    } : {}}
                    onClick={() => handleButtonClick('test-google-docs', handleTestGoogleDocs)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition font-mono"
                  >
                    {buttonStates['test-google-docs'] ? 'Testing...' : 'Test Connection'}
                  </motion.button>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="text-white font-medium mb-3 font-mono">Setup Instructions:</h4>
                <ol className="text-sm text-text-gray space-y-2 font-mono">
                  <li>1. Go to Google Cloud Console</li>
                  <li>2. Enable Google Docs API and Google Drive API</li>
                  <li>3. Create credentials (API Key + OAuth 2.0 Client ID)</li>
                  <li>4. Add your domain to authorized origins</li>
                  <li>5. Enter credentials above and test connection</li>
                </ol>
              </div>
            </div>

            {/* Coming Soon Integrations */}
            <div className="bg-card-bg rounded-xl p-6 border border-border-light opacity-60">
              <h3 className="text-xl font-semibold text-white mb-6 font-mono">Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono">Slack Integration</p>
                    <p className="text-text-gray text-xs font-mono">Import team conversations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">N</span>
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono">Notion Integration</p>
                    <p className="text-text-gray text-xs font-mono">Sync with Notion pages</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Z</span>
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono">Zapier Integration</p>
                    <p className="text-text-gray text-xs font-mono">Automate workflows</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-border-gray">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-white font-medium font-mono">API Access</p>
                    <p className="text-text-gray text-xs font-mono">Custom integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return <BillingSettings />;

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 md:p-8 border-b border-border-light bg-card-bg">
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">
          <span className="text-terminal-green">{'>'}</span> Settings
        </h1>
        <p className="text-text-gray font-mono">Manage your account and preferences</p>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed */}
        <div className="flex-shrink-0 w-full lg:w-80 border-r border-border-light bg-card-bg">
          <nav className="p-6 space-y-3 h-full overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 rounded-lg transition flex items-center space-x-4 font-mono ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black font-medium shadow-glow'
                      : 'text-text-gray hover:text-white hover:bg-card-hover'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:block">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;