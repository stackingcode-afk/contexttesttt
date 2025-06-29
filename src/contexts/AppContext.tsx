import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContextProfile, Prompt, ChatMessage, AIModel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../services/aiService';

interface AppContextType {
  profiles: ContextProfile[];
  prompts: Prompt[];
  messages: ChatMessage[];
  currentProfile: ContextProfile | null;
  currentModel: AIModel;
  availableModels: AIModel[];
  
  // Profile management
  createProfile: (name: string) => ContextProfile;
  updateProfile: (id: string, updates: Partial<ContextProfile>) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (profile: ContextProfile | null) => void;
  
  // Prompt management
  createPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  
  // Chat management
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Model management
  setCurrentModel: (model: AIModel) => void;
  
  // API key management
  getApiKey: (provider: string) => string | null;
  hasApiKey: (provider: string) => boolean;
  setApiKey: (provider: string, key: string) => void;
  testApiKey: (provider: string) => Promise<boolean>;
  
  // Local model management
  setLocalModelUrl: (provider: string, url: string) => void;
  getLocalModelUrl: (provider: string) => string;
  getLocalModelStatus: (provider: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ContextProfile[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ContextProfile | null>(null);
  const [currentModel, setCurrentModel] = useState<AIModel>({
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    available: true,
  });

  const availableModels: AIModel[] = [
    // Cloud models
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', available: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', available: true },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', available: true },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', available: true },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', available: true },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', provider: 'google', available: true },
    
    // Local models
    { id: 'llama2', name: 'Llama 2 (Ollama)', provider: 'ollama', available: true },
    { id: 'codellama', name: 'Code Llama (Ollama)', provider: 'ollama', available: true },
    { id: 'mistral', name: 'Mistral (Ollama)', provider: 'ollama', available: true },
    { id: 'neural-chat', name: 'Neural Chat (Ollama)', provider: 'ollama', available: true },
    { id: 'starling-lm', name: 'Starling LM (Ollama)', provider: 'ollama', available: true },
    
    // Gemini CLI models
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (CLI)', provider: 'gemini_cli', available: true },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (CLI)', provider: 'gemini_cli', available: true },
    
    // Custom local models
    { id: 'custom-model', name: 'Custom Local LLM', provider: 'local_llm', available: true },
  ];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('contxt-profiles');
    const savedPrompts = localStorage.getItem('contxt-prompts');
    const savedMessages = localStorage.getItem('contxt-messages');
    const savedCurrentModel = localStorage.getItem('contxt-current-model');
    
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      } catch (error) {
        console.error('Error parsing saved profiles:', error);
      }
    }
    
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        setPrompts(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })));
      } catch (error) {
        console.error('Error parsing saved prompts:', error);
      }
    }
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }

    if (savedCurrentModel) {
      try {
        const parsed = JSON.parse(savedCurrentModel);
        const model = availableModels.find(m => m.id === parsed.id);
        if (model) {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error('Error parsing saved current model:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('contxt-profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('contxt-prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('contxt-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('contxt-current-model', JSON.stringify(currentModel));
  }, [currentModel]);

  const createProfile = (name: string): ContextProfile => {
    const newProfile: ContextProfile = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      businessInfo: {
        name: '',
        website: '',
        audience: '',
        niche: '',
        offer: '',
      },
      offerBreakdown: {
        features: [],
        pricing: '',
        usps: [],
      },
      brandVoice: {
        tone: '',
        forbiddenWords: [],
        formattingStyle: '',
      },
      customerAvatars: [],
      sops: [],
      marketingGoals: [],
      samples: [],
      customFields: {},
    };
    
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<ContextProfile>) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === id 
        ? { ...profile, ...updates, updatedAt: new Date() }
        : profile
    ));
    
    if (currentProfile?.id === id) {
      setCurrentProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== id));
    if (currentProfile?.id === id) {
      setCurrentProfile(null);
    }
  };

  const createPrompt = (prompt: Omit<Prompt, 'id' | 'createdAt'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: uuidv4(),
      createdAt: new Date(),
    };
    setPrompts(prev => [...prev, newPrompt]);
  };

  const updatePrompt = (id: string, updates: Partial<Prompt>) => {
    setPrompts(prev => prev.map(prompt => 
      prompt.id === id ? { ...prompt, ...updates } : prompt
    ));
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getApiKey = (provider: string): string | null => {
    return aiService.getApiKey(provider);
  };

  const hasApiKey = (provider: string): boolean => {
    return aiService.hasApiKey(provider);
  };

  const setApiKey = (provider: string, key: string): void => {
    aiService.setApiKey(provider, key);
  };

  const testApiKey = async (provider: string): Promise<boolean> => {
    return aiService.testApiKey(provider);
  };

  const setLocalModelUrl = (provider: string, url: string): void => {
    aiService.setBaseUrl(provider, url);
  };

  const getLocalModelUrl = (provider: string): string => {
    return aiService.getBaseUrl(provider);
  };

  const getLocalModelStatus = (provider: string): string => {
    return aiService.getProviderStatus(provider);
  };

  return (
    <AppContext.Provider value={{
      profiles,
      prompts,
      messages,
      currentProfile,
      currentModel,
      availableModels,
      createProfile,
      updateProfile,
      deleteProfile,
      setCurrentProfile,
      createPrompt,
      updatePrompt,
      deletePrompt,
      addMessage,
      clearMessages,
      setCurrentModel,
      getApiKey,
      hasApiKey,
      setApiKey,
      testApiKey,
      setLocalModelUrl,
      getLocalModelUrl,
      getLocalModelStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};