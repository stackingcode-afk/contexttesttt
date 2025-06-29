// AI Service for handling API calls to different providers including local models with auto-detection
export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  models: string[];
  type: 'cloud' | 'local';
  status?: 'connected' | 'disconnected' | 'checking';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private providers: Record<string, AIProvider> = {
    openai: {
      name: 'OpenAI',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'],
      type: 'cloud'
    },
    anthropic: {
      name: 'Anthropic',
      apiKey: '',
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
      type: 'cloud'
    },
    google: {
      name: 'Google',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-pro', 'gemini-1.5-pro-latest'],
      type: 'cloud'
    },
    ollama: {
      name: 'Ollama (Local)',
      apiKey: '',
      baseUrl: 'http://localhost:11434/api',
      models: ['llama2', 'codellama', 'mistral', 'neural-chat', 'starling-lm'],
      type: 'local',
      status: 'disconnected'
    },
    gemini_cli: {
      name: 'Gemini CLI (Local)',
      apiKey: '',
      baseUrl: 'http://localhost:8080/api',
      models: ['gemini-2.5-pro', 'gemini-2.0-flash'],
      type: 'local',
      status: 'disconnected'
    },
    local_llm: {
      name: 'Custom Local LLM',
      apiKey: '',
      baseUrl: 'http://localhost:5000/api',
      models: ['custom-model'],
      type: 'local',
      status: 'disconnected'
    }
  };

  private detectionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoDetection();
  }

  // Auto-detection for local models
  private async startAutoDetection() {
    // Check immediately on startup
    await this.detectLocalModels();
    
    // Then check every 30 seconds
    this.detectionInterval = setInterval(() => {
      this.detectLocalModels();
    }, 30000);
  }

  private async detectLocalModels() {
    const localProviders = Object.keys(this.providers).filter(
      key => this.providers[key].type === 'local'
    );

    for (const provider of localProviders) {
      await this.checkLocalModelStatus(provider);
    }
  }

  private async checkLocalModelStatus(provider: string) {
    const providerConfig = this.providers[provider];
    if (!providerConfig || providerConfig.type !== 'local') return;

    try {
      providerConfig.status = 'checking';
      
      // Try different endpoints based on provider
      let healthEndpoint = '';
      let testPayload = {};
      
      switch (provider) {
        case 'ollama':
          healthEndpoint = `${providerConfig.baseUrl.replace('/api', '')}/api/tags`;
          break;
        case 'gemini_cli':
          healthEndpoint = `${providerConfig.baseUrl}/health`;
          break;
        case 'local_llm':
          healthEndpoint = `${providerConfig.baseUrl}/health`;
          break;
      }

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        providerConfig.status = 'connected';
        
        // For Ollama, also fetch available models
        if (provider === 'ollama') {
          const data = await response.json();
          if (data.models && Array.isArray(data.models)) {
            providerConfig.models = data.models.map((model: any) => model.name);
          }
        }
        
        console.log(`✅ ${providerConfig.name} detected and connected`);
      } else {
        providerConfig.status = 'disconnected';
      }
    } catch (error) {
      providerConfig.status = 'disconnected';
      // Silent fail for auto-detection
    }
  }

  // Get provider status
  getProviderStatus(provider: string): string {
    return this.providers[provider]?.status || 'unknown';
  }

  // Get all connected local providers
  getConnectedLocalProviders(): string[] {
    return Object.keys(this.providers).filter(
      key => this.providers[key].type === 'local' && this.providers[key].status === 'connected'
    );
  }

  // Set API key for a provider
  setApiKey(provider: string, apiKey: string): void {
    if (this.providers[provider]) {
      this.providers[provider].apiKey = apiKey;
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
  }

  // Set custom base URL for local models
  setBaseUrl(provider: string, baseUrl: string): void {
    if (this.providers[provider] && this.providers[provider].type === 'local') {
      this.providers[provider].baseUrl = baseUrl;
      localStorage.setItem(`${provider}_base_url`, baseUrl);
      // Re-check status after URL change
      this.checkLocalModelStatus(provider);
    }
  }

  // Get API key for a provider
  getApiKey(provider: string): string | null {
    const stored = localStorage.getItem(`${provider}_api_key`);
    if (stored) {
      this.providers[provider].apiKey = stored;
      return stored;
    }
    return this.providers[provider]?.apiKey || null;
  }

  // Get base URL for a provider
  getBaseUrl(provider: string): string {
    const stored = localStorage.getItem(`${provider}_base_url`);
    if (stored && this.providers[provider]?.type === 'local') {
      this.providers[provider].baseUrl = stored;
      return stored;
    }
    return this.providers[provider]?.baseUrl || '';
  }

  // Check if provider has valid API key (not required for some local models)
  hasApiKey(provider: string): boolean {
    // Local models might not require API keys, check if they're connected
    if (this.providers[provider]?.type === 'local') {
      return this.providers[provider]?.status === 'connected';
    }
    const key = this.getApiKey(provider);
    return key !== null && key.trim() !== '';
  }

  // OpenAI API call
  async callOpenAI(messages: ChatMessage[], model: string = 'gpt-4'): Promise<AIResponse> {
    const apiKey = this.getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.providers.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }

  // Anthropic API call
  async callAnthropic(messages: ChatMessage[], model: string = 'claude-3-sonnet-20240229'): Promise<AIResponse> {
    const apiKey = this.getApiKey('anthropic');
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.providers.anthropic.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: systemMessage?.content || '',
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: data.model,
      usage: data.usage
    };
  }

  // Google Gemini API call
  async callGoogle(messages: ChatMessage[], model: string = 'gemini-pro'): Promise<AIResponse> {
    const apiKey = this.getApiKey('google');
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    // Convert messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Add system message as first user message if exists
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `System: ${systemMessage.content}` }]
      });
    }

    const response = await fetch(
      `${this.providers.google.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      usage: data.usageMetadata
    };
  }

  // Ollama API call (local)
  async callOllama(messages: ChatMessage[], model: string = 'llama2'): Promise<AIResponse> {
    const baseUrl = this.getBaseUrl('ollama');
    
    if (this.providers.ollama.status !== 'connected') {
      throw new Error('Ollama is not running. Please start Ollama and try again.');
    }
    
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.message.content,
        model: data.model,
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
    } catch (error) {
      throw new Error(`Ollama connection failed. Make sure Ollama is running on ${baseUrl}`);
    }
  }

  // Gemini CLI API call (local)
  async callGeminiCLI(messages: ChatMessage[], model: string = 'gemini-2.5-pro'): Promise<AIResponse> {
    const baseUrl = this.getBaseUrl('gemini_cli');
    
    if (this.providers.gemini_cli.status !== 'connected') {
      throw new Error('Gemini CLI is not running. Please start the Gemini CLI server and try again.');
    }
    
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini CLI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.response || data.content,
        model: data.model || model,
        usage: data.usage
      };
    } catch (error) {
      throw new Error(`Gemini CLI connection failed. Make sure Gemini CLI server is running on ${baseUrl}`);
    }
  }

  // Custom Local LLM API call
  async callLocalLLM(messages: ChatMessage[], model: string = 'custom-model'): Promise<AIResponse> {
    const baseUrl = this.getBaseUrl('local_llm');
    
    if (this.providers.local_llm.status !== 'connected') {
      throw new Error('Local LLM is not running. Please start your local LLM server and try again.');
    }
    
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Local LLM API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.response || data.content || data.message,
        model: data.model || model,
        usage: data.usage
      };
    } catch (error) {
      throw new Error(`Local LLM connection failed. Make sure your local LLM server is running on ${baseUrl}`);
    }
  }

  // Universal chat method that routes to appropriate provider
  async chat(
    messages: ChatMessage[], 
    provider: string, 
    model: string
  ): Promise<AIResponse> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages, model);
      case 'anthropic':
        return this.callAnthropic(messages, model);
      case 'google':
        return this.callGoogle(messages, model);
      case 'ollama':
        return this.callOllama(messages, model);
      case 'gemini_cli':
        return this.callGeminiCLI(messages, model);
      case 'local_llm':
        return this.callLocalLLM(messages, model);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // Get available models for a provider
  getModels(provider: string): string[] {
    return this.providers[provider]?.models || [];
  }

  // Get all providers
  getProviders(): string[] {
    return Object.keys(this.providers);
  }

  // Get providers by type
  getProvidersByType(type: 'cloud' | 'local'): string[] {
    return Object.keys(this.providers).filter(key => this.providers[key].type === type);
  }

  // Check if provider is local
  isLocalProvider(provider: string): boolean {
    return this.providers[provider]?.type === 'local';
  }

  // Test API key validity or local model availability
  async testApiKey(provider: string): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];
      
      const models = this.getModels(provider);
      if (models.length === 0) return false;
      
      await this.chat(testMessages, provider, models[0]);
      return true;
    } catch (error) {
      console.error(`API key test failed for ${provider}:`, error);
      return false;
    }
  }

  // Get provider info
  getProviderInfo(provider: string): AIProvider | null {
    return this.providers[provider] || null;
  }

  // Add custom local model
  addCustomLocalModel(
    providerId: string, 
    name: string, 
    baseUrl: string, 
    models: string[]
  ): void {
    this.providers[providerId] = {
      name,
      apiKey: '',
      baseUrl,
      models,
      type: 'local',
      status: 'disconnected'
    };
    localStorage.setItem(`${providerId}_base_url`, baseUrl);
    // Check status immediately
    this.checkLocalModelStatus(providerId);
  }

  // Cleanup
  destroy() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }
}

export const aiService = new AIService();