import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Copy, Play, X, Save, Filter, Star, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const PromptLibrary: React.FC = () => {
  const { prompts, createPrompt, updatePrompt, deletePrompt, addMessage, currentProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [customCategory, setCustomCategory] = useState('');
  const [favoritePrompts, setFavoritePrompts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  const categories = [
    'all',
    'ad-copy',
    'email-sequences',
    'social-media',
    'product-descriptions',
    'blog-posts',
    'sales-funnels',
    'cold-outreach',
    'customer-support',
    'content-creation',
    'custom'
  ];

  const defaultPrompts = [
    {
      name: 'Facebook Ad Copy',
      content: 'Create compelling Facebook ad copy for [PRODUCT/SERVICE]. Focus on the main benefit and include a strong call-to-action. Target audience: [TARGET_AUDIENCE]. Key pain point: [PAIN_POINT].',
      category: 'ad-copy',
      tags: ['facebook', 'ads', 'copy', 'marketing'],
    },
    {
      name: 'Email Welcome Series',
      content: 'Write a 5-email welcome series for new subscribers. Email 1 should introduce the brand, Email 2 should provide value, Email 3 should share social proof, Email 4 should address objections, Email 5 should make a soft pitch.',
      category: 'email-sequences',
      tags: ['email', 'welcome', 'sequence', 'nurture'],
    },
    {
      name: 'Instagram Reel Hook',
      content: 'Create 10 attention-grabbing hooks for Instagram Reels about [TOPIC]. Each hook should be under 10 words and create curiosity or urgency. Target audience: [TARGET_AUDIENCE].',
      category: 'social-media',
      tags: ['instagram', 'reels', 'hooks', 'social'],
    },
    {
      name: 'Product Description',
      content: 'Write a compelling product description for [PRODUCT_NAME]. Include key features, benefits, and address common objections. Use persuasive language and include emotional triggers.',
      category: 'product-descriptions',
      tags: ['product', 'description', 'ecommerce', 'sales'],
    },
    {
      name: 'Blog Post Outline',
      content: 'Create a detailed blog post outline for "[BLOG_TITLE]". Include an engaging introduction, 5-7 main sections with subheadings, key points for each section, and a compelling conclusion with call-to-action.',
      category: 'blog-posts',
      tags: ['blog', 'content', 'outline', 'seo'],
    },
    {
      name: 'Customer Support Response',
      content: 'Write a helpful and empathetic customer support response for [CUSTOMER_ISSUE]. Acknowledge their concern, provide a clear solution, and offer additional assistance. Maintain a professional yet friendly tone.',
      category: 'customer-support',
      tags: ['support', 'customer', 'service', 'response'],
    }
  ];

  // Initialize with default prompts if none exist
  React.useEffect(() => {
    if (prompts.length === 0) {
      defaultPrompts.forEach(prompt => {
        createPrompt(prompt);
      });
    }
  }, []);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const category = formData.get('category') as string;
    const finalCategory = category === 'custom' ? (formData.get('customCategory') as string) || 'custom' : category;
    
    createPrompt({
      name: formData.get('name') as string,
      content: formData.get('content') as string,
      category: finalCategory,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      profileId: currentProfile?.id,
    });
    
    setShowCreateModal(false);
    setCustomCategory('');
  };

  const handleUpdatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const category = formData.get('category') as string;
    const finalCategory = category === 'custom' ? (formData.get('customCategory') as string) || 'custom' : category;
    
    updatePrompt(editingPrompt, {
      name: formData.get('name') as string,
      content: formData.get('content') as string,
      category: finalCategory,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
    });
    
    setEditingPrompt(null);
    setCustomCategory('');
  };

  const handleRunPrompt = (prompt: any) => {
    let processedContent = prompt.content;
    
    // Replace placeholders with context data if available
    if (currentProfile) {
      processedContent = processedContent
        .replace(/\[PRODUCT\/SERVICE\]/g, currentProfile.businessInfo.offer || '[PRODUCT/SERVICE]')
        .replace(/\[TARGET_AUDIENCE\]/g, currentProfile.businessInfo.audience || '[TARGET_AUDIENCE]')
        .replace(/\[BUSINESS_NAME\]/g, currentProfile.businessInfo.name || '[BUSINESS_NAME]')
        .replace(/\[NICHE\]/g, currentProfile.businessInfo.niche || '[NICHE]');
    }
    
    addMessage({
      content: processedContent,
      role: 'user',
      profileId: currentProfile?.id,
    });
    
    // Show success feedback
    alert('Prompt sent to AI Chat! Check the Chat tab to see the response.');
  };

  const handleDeletePrompt = (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
    }
  };

  const copyPrompt = (content: string, promptId: string) => {
    navigator.clipboard.writeText(content);
    setButtonStates(prev => ({ ...prev, [`copy-${promptId}`]: true }));
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [`copy-${promptId}`]: false }));
    }, 2000);
  };

  const toggleFavorite = (promptId: string) => {
    setFavoritePrompts(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(promptId)) {
        newFavorites.delete(promptId);
      } else {
        newFavorites.add(promptId);
      }
      return newFavorites;
    });
  };

  const editingPromptData = editingPrompt ? prompts.find(p => p.id === editingPrompt) : null;

  // Get unique categories from existing prompts
  const uniqueCategories = [...new Set(prompts.map(p => p.category))];
  const allCategories = [...categories.filter(c => c !== 'custom'), ...uniqueCategories.filter(c => !categories.includes(c))];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 md:p-8 border-b border-glass-border bg-glass-bg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-mono">
              <span className="text-terminal-green">{'>'}</span> Prompt Library
            </h1>
            <p className="text-text-gray font-mono">Save, organize, and reuse your best prompts</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="bg-glass-bg backdrop-blur-xl border border-glass-border text-white px-4 py-3 rounded-xl font-medium hover:border-glass-border-hover transition font-mono flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 145, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              animate={buttonStates['new-prompt'] ? { 
                backgroundColor: '#00FF91', 
                color: '#000000',
                scale: [1, 1.1, 1]
              } : {}}
              onClick={() => handleButtonClick('new-prompt', () => setShowCreateModal(true))}
              className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
            >
              <Plus className="w-5 h-5" />
              <span>{buttonStates['new-prompt'] ? 'Opening...' : 'New Prompt'}</span>
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border shadow-glass"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                >
                  {allCategories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Prompts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border hover:border-glass-border-hover transition-all duration-300 group shadow-glass relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white font-mono group-hover:text-terminal-green transition-colors">
                        {prompt.name}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleFavorite(prompt.id)}
                        className={`transition-colors ${
                          favoritePrompts.has(prompt.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${favoritePrompts.has(prompt.id) ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="w-4 h-4 text-text-gray" />
                      <span className="text-sm text-text-gray capitalize font-mono">
                        {prompt.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyPrompt(prompt.content, prompt.id)}
                      className="p-2 text-text-gray hover:text-terminal-green transition rounded-lg hover:bg-glass-hover"
                      title="Copy prompt"
                    >
                      {buttonStates[`copy-${prompt.id}`] ? (
                        <Zap className="w-4 h-4 text-terminal-green" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingPrompt(prompt.id)}
                      className="p-2 text-text-gray hover:text-accent-blue transition rounded-lg hover:bg-glass-hover"
                      title="Edit prompt"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-2 text-text-gray hover:text-red-400 transition rounded-lg hover:bg-glass-hover"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <p className="text-text-gray text-sm mb-4 line-clamp-3 font-mono leading-relaxed">
                  {prompt.content}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-terminal-green/20 text-terminal-green text-xs rounded-lg font-mono border border-terminal-green/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  animate={buttonStates[`use-${prompt.id}`] ? { 
                    backgroundColor: '#00FF91', 
                    color: '#000000',
                    scale: [1, 1.05, 1]
                  } : {}}
                  onClick={() => handleButtonClick(`use-${prompt.id}`, () => handleRunPrompt(prompt))}
                  className="w-full bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black py-3 rounded-xl font-medium hover:shadow-glow transition flex items-center justify-center space-x-2 font-mono"
                >
                  <Play className="w-4 h-4" />
                  <span>{buttonStates[`use-${prompt.id}`] ? 'Sent to Chat!' : 'Use Prompt'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-terminal-green/20 to-terminal-green/10 rounded-3xl flex items-center justify-center mx-auto border border-terminal-green/20">
                <Search className="w-10 h-10 text-terminal-green" />
              </div>
              <h3 className="text-2xl font-semibold text-white font-mono">No prompts found</h3>
              <p className="text-text-gray font-mono max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first prompt to get started'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-3 rounded-xl font-medium hover:shadow-glow transition font-mono"
                >
                  Create First Prompt
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Create Prompt Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl border border-glass-border shadow-glass-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white font-mono">Create New Prompt</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCustomCategory('');
                  }}
                  className="text-text-gray hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePrompt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Enter prompt name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    value={customCategory ? 'custom' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setCustomCategory('custom');
                      } else {
                        setCustomCategory('');
                      }
                    }}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  >
                    <option value="">Select a category</option>
                    {categories.slice(1, -1).map(category => (
                      <option key={category} value={category}>
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                    <option value="custom">Custom Category</option>
                  </select>
                </div>

                {customCategory && (
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      name="customCategory"
                      required
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                      placeholder="Enter custom category name"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="e.g., marketing, social media, copy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Prompt Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={6}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Enter your prompt content..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCustomCategory('');
                    }}
                    className="px-6 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-medium hover:shadow-glow transition font-mono"
                  >
                    Create Prompt
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Prompt Modal */}
      <AnimatePresence>
        {editingPrompt && editingPromptData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl border border-glass-border shadow-glass-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white font-mono">Edit Prompt</h2>
                <button
                  onClick={() => {
                    setEditingPrompt(null);
                    setCustomCategory('');
                  }}
                  className="text-text-gray hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePrompt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingPromptData.name}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Enter prompt name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={categories.includes(editingPromptData.category) ? editingPromptData.category : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setCustomCategory(editingPromptData.category);
                      } else {
                        setCustomCategory('');
                      }
                    }}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                  >
                    {categories.slice(1, -1).map(category => (
                      <option key={category} value={category}>
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                    <option value="custom">Custom Category</option>
                  </select>
                </div>

                {(customCategory || !categories.includes(editingPromptData.category)) && (
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      name="customCategory"
                      required
                      defaultValue={!categories.includes(editingPromptData.category) ? editingPromptData.category : customCategory}
                      className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                      placeholder="Enter custom category name"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingPromptData.tags.join(', ')}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="e.g., marketing, social media, copy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Prompt Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={6}
                    defaultValue={editingPromptData.content}
                    className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-white focus:border-terminal-green focus:outline-none font-mono backdrop-blur-xl"
                    placeholder="Enter your prompt content..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditingPrompt(null);
                      setCustomCategory('');
                    }}
                    className="px-6 py-2 text-text-gray hover:text-white transition font-mono"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 145, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-medium hover:shadow-glow transition flex items-center space-x-2 font-mono"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default PromptLibrary;