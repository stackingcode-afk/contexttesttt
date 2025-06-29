export interface ContextProfile {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  businessInfo: {
    name: string;
    website: string;
    audience: string;
    niche: string;
    offer: string;
  };
  offerBreakdown: {
    features: string[];
    pricing: string;
    usps: string[];
  };
  brandVoice: {
    tone: string;
    forbiddenWords: string[];
    formattingStyle: string;
  };
  customerAvatars: CustomerAvatar[];
  sops: string[];
  marketingGoals: string[];
  samples: Sample[];
  customFields: Record<string, any>;
}

export interface CustomerAvatar {
  id: string;
  name: string;
  age: string;
  occupation: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
}

export interface Sample {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'link';
  content: string;
  uploadedAt: Date;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  profileId?: string;
  createdAt: Date;
  isChain?: boolean;
  steps?: PromptStep[];
}

export interface PromptStep {
  id: string;
  name: string;
  content: string;
  order: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  profileId?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  available: boolean;
}