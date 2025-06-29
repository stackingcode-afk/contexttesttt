import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, RotateCcw, Settings, Brain, AlertCircle, Terminal, Activity, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/aiService';

const AIChat: React.FC = () => {
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    currentProfile, 
    currentModel, 
    setCurrentModel, 
    availableModels,
    hasApiKey,
    getApiKey,
    profiles,
    setCurrentProfile
  } = useApp();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileSelectorRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileSelectorRef.current && !profileSelectorRef.current.contains(event.target as Node)) {
        setShowProfileSelector(false);
      }
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const canUseCurrentModel = hasApiKey(currentModel.provider);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!canUseCurrentModel) {
      setError(`Please configure your ${currentModel.provider} API key in Settings to use ${currentModel.name}`);
      return;
    }
    
    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Add user message
    addMessage({
      content: userMessage,
      role: 'user',
      profileId: currentProfile?.id,
    });
    
    setIsLoading(true);
    
    try {
      // Prepare messages for API
      const chatMessages = [];
      
      // Add system message with context if profile exists
      if (currentProfile) {
        const contextPrompt = `You are an AI assistant for ${currentProfile.businessInfo.name || 'this business'}. Use the following context to provide relevant, helpful responses:

Business Context:
- Company: ${currentProfile.businessInfo.name || 'Not specified'}
- Website: ${currentProfile.businessInfo.website || 'Not specified'}
- Niche: ${currentProfile.businessInfo.niche || 'Not specified'}
- Target Audience: ${currentProfile.businessInfo.audience || 'Not specified'}
- Main Offer: ${currentProfile.businessInfo.offer || 'Not specified'}

Brand Voice & Tone:
${currentProfile.brandVoice.tone || 'Professional and helpful'}

${currentProfile.brandVoice.forbiddenWords.length > 0 ? `Avoid these words/phrases: ${currentProfile.brandVoice.forbiddenWords.join(', ')}` : ''}

Key Features:
${currentProfile.offerBreakdown.features.map(f => `- ${f}`).join('\n') || 'Not specified'}

Customer Avatars:
${currentProfile.customerAvatars.map(avatar => `
- ${avatar.name}: ${avatar.age}, ${avatar.occupation}
  Pain Points: ${avatar.painPoints.join(', ')}
  Goals: ${avatar.goals.join(', ')}
`).join('\n') || 'Not specified'}

Marketing Goals:
${currentProfile.marketingGoals.map(g => `- ${g}`).join('\n') || 'Not specified'}

Always respond in character and use this business context to provide relevant, helpful responses that align with the brand voice and serve the target audience effectively.`;

        chatMessages.push({
          role: 'system' as const,
          content: contextPrompt
        });
      }
      
      // Add conversation history (last 10 messages to avoid token limits)
      const recentMessages = messages
        .filter(msg => !currentProfile || msg.profileId === currentProfile.id)
        .slice(-10)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      chatMessages.push(...recentMessages);
      
      // Add current user message
      chatMessages.push({
        role: 'user' as const,
        content: userMessage
      });
      
      // Call AI service
      const response = await aiService.chat(
        chatMessages,
        currentModel.provider,
        currentModel.id
      );
      
      // Add AI response
      addMessage({
        content: response.content,
        role: 'assistant',
        profileId: currentProfile?.id,
      });
      
    } catch (error: any) {
      console.error('Error calling AI API:', error);
      const errorMessage = error.message || 'Sorry, there was an error processing your request. Please check your API key and try again.';
      setError(errorMessage);
      
      addMessage({
        content: `Error: ${errorMessage}`,
        role: 'assistant',
        profileId: currentProfile?.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleProfileChange = (profile: any) => {
    setCurrentProfile(profile);
    setShowProfileSelector(false);
  };

  const handleClearMessages = () => {
    if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      clearMessages();
    }
  };

  const filteredMessages = currentProfile 
    ? messages.filter(msg => msg.profileId === currentProfile.id)
    : messages.filter(msg => !msg.profileId);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg relative">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <div className="bg-glass-bg backdrop-blur-xl border-b border-glass-border p-4 lg:p-6 relative overflow-visible">
          <div className="absolute inset-0 bg-glass-shine opacity-5" />
          <div className="relative z-20">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-2xl flex items-center justify-center shadow-glow-sm">
                  <Terminal className="w-7 h-7 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-white font-mono">AI Chat Assistant</h2>
                  <p className="text-sm text-text-gray font-mono truncate">
                    {currentProfile ? `Using ${currentProfile.name} context` : 'No context profile active'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Profile Selector */}
                <div className="relative flex-1 sm:flex-none" ref={profileSelectorRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowProfileSelector(!showProfileSelector);
                      setShowModelSelector(false);
                    }}
                    className="w-full sm:w-auto flex items-center justify-between space-x-2 px-4 py-2 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border hover:border-glass-border-hover transition font-mono"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <Brain className="w-4 h-4 text-terminal-green flex-shrink-0" />
                      <span className="text-white text-sm truncate">
                        {currentProfile ? currentProfile.name : 'Select Profile'}
                      </span>
                    </div>
                    <ArrowRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${showProfileSelector ? 'rotate-90' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showProfileSelector && (
                      <>
                        {/* Backdrop overlay for mobile */}
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden" />
                        
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:w-80 top-full mt-2 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-glass-xl z-50 max-h-80 overflow-hidden"
                          style={{ zIndex: 9999 }}
                        >
                          <div className="p-3 border-b border-glass-border">
                            <h3 className="text-sm font-medium text-white font-mono">Select Context Profile</h3>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <motion.button
                              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                              onClick={() => handleProfileChange(null)}
                              className={`w-full px-4 py-3 text-left hover:bg-glass-hover transition flex items-center space-x-3 font-mono ${
                                !currentProfile ? 'text-terminal-green bg-glass-hover' : 'text-white'
                              }`}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-600/20 to-gray-500/10 rounded-lg flex items-center justify-center border border-gray-500/20 flex-shrink-0">
                                <Terminal className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">No Profile</div>
                                <div className="text-xs text-text-gray">General AI assistant</div>
                              </div>
                            </motion.button>
                            {profiles.map((profile) => (
                              <motion.button
                                key={profile.id}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                onClick={() => handleProfileChange(profile)}
                                className={`w-full px-4 py-3 text-left hover:bg-glass-hover transition flex items-center space-x-3 font-mono ${
                                  currentProfile?.id === profile.id ? 'text-terminal-green bg-glass-hover' : 'text-white'
                                }`}
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-lg flex items-center justify-center border border-terminal-green/20 flex-shrink-0">
                                  <Brain className="w-4 h-4 text-terminal-green" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{profile.name}</div>
                                  <div className="text-xs text-text-gray truncate">{profile.businessInfo.name || 'Business profile'}</div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                          {profiles.length === 0 && (
                            <div className="p-4 text-center">
                              <p className="text-text-gray text-sm font-mono">No profiles created yet</p>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Model Selector */}
                <div className="relative flex-1 sm:flex-none" ref={modelSelectorRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowModelSelector(!showModelSelector);
                      setShowProfileSelector(false);
                    }}
                    className={`w-full sm:w-auto flex items-center justify-between space-x-2 px-4 py-2 rounded-xl transition font-mono ${
                      canUseCurrentModel 
                        ? 'bg-glass-bg backdrop-blur-xl border border-glass-border hover:border-glass-border-hover' 
                        : 'bg-red-900/20 border border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <Settings className="w-4 h-4 text-terminal-green flex-shrink-0" />
                      <span className="text-white text-sm truncate">{currentModel.name}</span>
                      {!canUseCurrentModel && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    </div>
                    <ArrowRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${showModelSelector ? 'rotate-90' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showModelSelector && (
                      <>
                        {/* Backdrop overlay for mobile */}
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden" />
                        
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute left-0 right-0 sm:left-0 sm:right-auto sm:w-80 top-full mt-2 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-glass-xl z-50 max-h-80 overflow-hidden"
                          style={{ zIndex: 9999 }}
                        >
                          <div className="p-3 border-b border-glass-border">
                            <h3 className="text-sm font-medium text-white font-mono">Select AI Model</h3>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {availableModels.map((model) => {
                              const hasKey = hasApiKey(model.provider);
                              return (
                                <motion.button
                                  key={model.id}
                                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                  onClick={() => {
                                    setCurrentModel(model);
                                    setShowModelSelector(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-glass-hover transition flex items-center justify-between font-mono ${
                                    currentModel.id === model.id ? 'text-terminal-green bg-glass-hover' : 'text-white'
                                  } ${!hasKey ? 'opacity-60' : ''}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{model.name}</div>
                                    <div className="text-xs text-text-gray capitalize">{model.provider}</div>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    {hasKey ? (
                                      <Activity className="w-4 h-4 text-terminal-green" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 text-red-400" />
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                          <div className="border-t border-glass-border p-3">
                            <p className="text-xs text-text-gray font-mono">Configure API keys in Settings</p>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearMessages}
                  className="p-2 text-text-gray hover:text-white transition rounded-lg hover:bg-glass-hover flex-shrink-0"
                  title="Clear messages"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            
            {!canUseCurrentModel && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm font-mono">
                    API key required for {currentModel.name}. Configure in Settings → AI Models & API.
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm font-mono break-words">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto border border-terminal-green/20">
                  <Terminal className="w-10 h-10 text-terminal-green" />
                </div>
                <h3 className="text-2xl font-semibold text-white font-mono">Start a conversation</h3>
                <p className="text-text-gray font-mono max-w-md mx-auto leading-relaxed">
                  {currentProfile 
                    ? `Ask questions and get context-aware responses based on your ${currentProfile.name} profile.`
                    : 'Select a context profile to get personalized responses, or chat without context.'
                  }
                </p>
                {!canUseCurrentModel && (
                  <p className="text-red-400 text-sm font-mono">
                    Configure your {currentModel.provider} API key to enable AI responses.
                  </p>
                )}
                
                {/* Quick starter prompts */}
                {currentProfile && canUseCurrentModel && (
                  <div className="space-y-3 max-w-lg mx-auto">
                    <p className="text-sm text-text-gray font-mono">Try these prompts:</p>
                    <div className="grid gap-2">
                      {[
                        "Help me write a marketing email",
                        "Create social media content",
                        "Draft a customer response"
                      ].map((prompt, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 145, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(prompt)}
                          className="text-left p-3 bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border hover:border-terminal-green/50 transition text-sm font-mono text-text-gray hover:text-white"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-4xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-4 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-terminal-green to-terminal-green-dark text-black shadow-glow-sm' 
                        : 'bg-glass-bg backdrop-blur-xl text-terminal-green border border-glass-border'
                    }`}>
                      {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    
                    <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-4 rounded-2xl font-mono relative group max-w-full ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black shadow-glow-sm'
                          : 'bg-glass-bg backdrop-blur-xl text-white border border-glass-border'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
                        
                        {/* Copy button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyMessage(message.content, message.id)}
                          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                            message.role === 'user' 
                              ? 'hover:bg-black/20 text-black/70 hover:text-black' 
                              : 'hover:bg-white/10 text-white/70 hover:text-white'
                          }`}
                        >
                          {copiedMessageId === message.id ? (
                            <Zap className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-text-muted font-mono">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {copiedMessageId === message.id && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs text-terminal-green font-mono"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-glass-bg backdrop-blur-xl text-terminal-green border border-glass-border flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-glass-bg backdrop-blur-xl rounded-2xl p-4 border border-glass-border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-glass-bg backdrop-blur-xl border-t border-glass-border p-4 lg:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-glass-shine opacity-5" />
          <div className="relative z-10">
            <div className="flex items-end space-x-4">
              <div className="flex-1 min-w-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !canUseCurrentModel 
                      ? `Configure ${currentModel.provider} API key to chat...`
                      : currentProfile 
                        ? `Ask anything about ${currentProfile.name}...` 
                        : 'Type your message...'
                  }
                  rows={1}
                  disabled={!canUseCurrentModel}
                  className={`w-full border rounded-2xl px-6 py-4 text-white focus:outline-none resize-none font-mono transition-all duration-300 ${
                    canUseCurrentModel 
                      ? 'bg-glass-bg backdrop-blur-xl border-glass-border focus:border-terminal-green focus:shadow-lg focus:shadow-terminal-green/20' 
                      : 'bg-gray-900 border-red-500/30 opacity-50 cursor-not-allowed'
                  }`}
                  style={{ minHeight: '56px', maxHeight: '120px' }}
                />
              </div>
              <motion.button
                whileHover={canUseCurrentModel ? { scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 145, 0.4)' } : {}}
                whileTap={canUseCurrentModel ? { scale: 0.95 } : {}}
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !canUseCurrentModel}
                className={`p-4 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  canUseCurrentModel && input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black hover:shadow-glow shadow-glow-sm'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="w-full lg:w-80 bg-glass-bg backdrop-blur-xl border-l border-glass-border flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-glass-shine opacity-5" />
        <div className="relative z-10 h-full flex flex-col">
          <div className="p-6 border-b border-glass-border">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2 font-mono">
              <Brain className="w-5 h-5 text-terminal-green" />
              <span>Active Context</span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {currentProfile ? (
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass"
                >
                  <h4 className="font-medium text-white mb-4 font-mono">{currentProfile.name}</h4>
                  <div className="space-y-3 text-sm font-mono">
                    <div>
                      <span className="text-text-gray">Business:</span>
                      <span className="text-white ml-2">{currentProfile.businessInfo.name || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-text-gray">Niche:</span>
                      <span className="text-white ml-2">{currentProfile.businessInfo.niche || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-text-gray">Tone:</span>
                      <span className="text-white ml-2">{currentProfile.brandVoice.tone || 'Not set'}</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass"
                >
                  <h4 className="font-medium text-white mb-4 font-mono">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div className="text-center">
                      <div className="text-terminal-green font-bold text-xl">{currentProfile.customerAvatars.length}</div>
                      <div className="text-text-gray">Avatars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-terminal-green font-bold text-xl">{currentProfile.sops.length}</div>
                      <div className="text-text-gray">SOPs</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass"
                >
                  <h4 className="font-medium text-white mb-4 font-mono">Current Model</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-mono">{currentModel.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                      canUseCurrentModel 
                        ? 'bg-terminal-green/20 text-terminal-green border border-terminal-green/30' 
                        : 'bg-red-900/50 text-red-300 border border-red-500/30'
                    }`}>
                      {canUseCurrentModel ? 'Ready' : 'API Key Required'}
                    </span>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-terminal-green/20">
                  <Brain className="w-8 h-8 text-terminal-green" />
                </div>
                <p className="text-text-gray text-sm font-mono mb-4">
                  No context profile selected. Select a profile to get context-aware responses.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileSelector(true)}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-4 py-2 rounded-xl font-medium hover:shadow-glow transition font-mono"
                >
                  Select Profile
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;