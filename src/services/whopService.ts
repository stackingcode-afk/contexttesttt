import axios from 'axios';

export interface WhopUser {
  id: string;
  username: string;
  email: string;
  profile_pic_url?: string;
  created_at: string;
  social_accounts: any[];
}

export interface WhopMembership {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  created_at: string;
  expires_at?: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year' | 'lifetime';
  };
}

export interface WhopAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

class WhopService {
  private baseURL = import.meta.env.VITE_WHOP_API_BASE_URL || 'https://api.whop.com/api/v5';
  private clientId = import.meta.env.VITE_WHOP_CLIENT_ID || 'app_HQCtS5aQ09LaVr';
  private clientSecret = import.meta.env.VITE_WHOP_CLIENT_SECRET || 'Zh-1cLKAUdXfaFNm0OYhzsxuiI0iamwOM0NbYFcJQ0E';
  private companyId = import.meta.env.VITE_WHOP_COMPANY_ID || 'biz_B386rHlw2cOruy';
  private redirectUri = import.meta.env.VITE_WHOP_REDIRECT_URI || 'https://contxtprofile.com/auth/callback';
  private accessToken: string | null = null;
  private isTestMode = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;

  constructor() {
    // Load access token from localStorage
    this.accessToken = localStorage.getItem('whop_access_token');
    this.setupAxiosInterceptors();
  }

  private setupAxiosInterceptors() {
    // Request interceptor to add auth header
    axios.interceptors.request.use((config) => {
      if (this.accessToken && config.url?.includes('api.whop.com')) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.accessToken) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request
            return axios.request(error.config);
          } else {
            // Refresh failed, redirect to login
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generate OAuth URL for WHOP login
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'user:read memberships:read',
    });

    return `https://whop.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<WhopAuthResponse> {
    try {
      // In test mode, simulate successful authentication
      if (this.isTestMode) {
        const mockAuthData: WhopAuthResponse = {
          access_token: 'mock_access_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: 'mock_refresh_token_' + Date.now(),
          scope: 'user:read memberships:read',
        };
        
        this.setAccessToken(mockAuthData.access_token);
        localStorage.setItem('whop_refresh_token', mockAuthData.refresh_token);
        localStorage.setItem('whop_token_expires_at', 
          (Date.now() + mockAuthData.expires_in * 1000).toString()
        );
        
        return mockAuthData;
      }

      const response = await axios.post('https://api.whop.com/api/v5/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        grant_type: 'authorization_code',
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const authData: WhopAuthResponse = response.data;
      this.setAccessToken(authData.access_token);
      
      // Store refresh token
      localStorage.setItem('whop_refresh_token', authData.refresh_token);
      localStorage.setItem('whop_token_expires_at', 
        (Date.now() + authData.expires_in * 1000).toString()
      );

      return authData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to authenticate with WHOP');
    }
  }

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    try {
      // In test mode, simulate successful refresh
      if (this.isTestMode) {
        const newToken = 'mock_access_token_refreshed_' + Date.now();
        this.setAccessToken(newToken);
        localStorage.setItem('whop_token_expires_at', 
          (Date.now() + 3600 * 1000).toString()
        );
        return true;
      }

      const refreshToken = localStorage.getItem('whop_refresh_token');
      if (!refreshToken) return false;

      const response = await axios.post('https://api.whop.com/api/v5/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const authData: WhopAuthResponse = response.data;
      this.setAccessToken(authData.access_token);
      
      localStorage.setItem('whop_refresh_token', authData.refresh_token);
      localStorage.setItem('whop_token_expires_at', 
        (Date.now() + authData.expires_in * 1000).toString()
      );

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Set access token
  private setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('whop_access_token', token);
  }

  // Get current user
  async getCurrentUser(): Promise<WhopUser> {
    try {
      // In test mode, return mock user data
      if (this.isTestMode) {
        return {
          id: 'user_test_123',
          username: 'testuser',
          email: 'test@contxtprofile.com',
          profile_pic_url: 'https://via.placeholder.com/150',
          created_at: new Date().toISOString(),
          social_accounts: [],
        };
      }

      const response = await axios.get(`${this.baseURL}/me`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  // Get user memberships
  async getUserMemberships(): Promise<WhopMembership[]> {
    try {
      // In test mode, return mock membership data
      if (this.isTestMode) {
        const mockPlan = localStorage.getItem('mock_user_plan') || 'free';
        
        if (mockPlan === 'free') {
          return [];
        }
        
        return [{
          id: 'membership_test_123',
          user_id: 'user_test_123',
          plan_id: `plan_${mockPlan}_monthly`,
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          plan: {
            id: `plan_${mockPlan}_monthly`,
            name: mockPlan.charAt(0).toUpperCase() + mockPlan.slice(1),
            price: mockPlan === 'starter' ? 20 : mockPlan === 'pro' ? 35 : mockPlan === 'team' ? 100 : 0,
            interval: 'month',
          },
        }];
      }

      const response = await axios.get(`${this.baseURL}/me/memberships`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching memberships:', error);
      throw new Error('Failed to fetch memberships');
    }
  }

  // Check if user has active membership for a specific plan
  async hasActiveMembership(planId?: string): Promise<boolean> {
    try {
      const memberships = await this.getUserMemberships();
      return memberships.some(membership => 
        membership.status === 'active' && 
        (!planId || membership.plan_id === planId)
      );
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  // Get user's current plan
  async getCurrentPlan(): Promise<WhopMembership | null> {
    try {
      const memberships = await this.getUserMemberships();
      const activeMembership = memberships.find(m => m.status === 'active');
      return activeMembership || null;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('whop_access_token');
    const expiresAt = localStorage.getItem('whop_token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    // Check if token is expired
    return Date.now() < parseInt(expiresAt);
  }

  // Logout user
  logout() {
    this.accessToken = null;
    localStorage.removeItem('whop_access_token');
    localStorage.removeItem('whop_refresh_token');
    localStorage.removeItem('whop_token_expires_at');
    localStorage.removeItem('whop_user');
    localStorage.removeItem('mock_user_plan'); // Clear test plan
    
    // Redirect to login
    window.location.href = '/';
  }

  // Create checkout session (for upgrading plans)
  async createCheckoutSession(planId: string, successUrl?: string, cancelUrl?: string): Promise<string> {
    try {
      // In test mode, simulate upgrade and return mock URL
      if (this.isTestMode) {
        // Simulate the upgrade by storing the plan locally
        const planName = planId.includes('starter') ? 'starter' : 
                         planId.includes('pro') ? 'pro' : 
                         planId.includes('team') ? 'team' : 
                         planId.includes('enterprise') ? 'enterprise' : 'free';
        localStorage.setItem('mock_user_plan', planName);
        
        // Simulate redirect to success page
        setTimeout(() => {
          window.location.href = successUrl || `${window.location.origin}/dashboard?upgraded=true`;
        }, 2000);
        
        return 'https://checkout.whop.com/mock-checkout-session';
      }

      const response = await axios.post(`${this.baseURL}/checkout/sessions`, {
        plan_id: planId,
        success_url: successUrl || `${window.location.origin}/dashboard?upgraded=true`,
        cancel_url: cancelUrl || `${window.location.origin}/settings?upgrade=cancelled`,
      });

      return response.data.checkout_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Get available plans - ONLY CORE PLANS (removed white label options)
  getAvailablePlans() {
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: 20,
        interval: 'month' as const,
        description: 'Perfect for individuals',
        features: [
          '3 Context Profiles',
          'GPT-3.5 & GPT-4 Access',
          'Local Model Support',
          '100 AI Messages/month',
          'Email Support'
        ],
        whopPlanId: 'plan_starter_monthly_placeholder',
        popular: false,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 35,
        interval: 'month' as const,
        description: 'For power users',
        features: [
          'Unlimited Profiles',
          'All AI Models',
          'Local & Cloud Models',
          'Unlimited Messages',
          'Custom Templates',
          'Priority Support'
        ],
        whopPlanId: 'plan_pro_monthly_placeholder',
        popular: true,
      },
      {
        id: 'team',
        name: 'Team',
        price: 100,
        interval: 'month' as const,
        description: 'For teams & enterprises',
        features: [
          'Everything in Pro',
          'Team Workspace',
          'Shared Library',
          'Team Management',
          'Analytics',
          'Advanced Integrations'
        ],
        whopPlanId: 'plan_team_monthly_placeholder',
        popular: false,
      },
      {
        id: 'enterprise',
        name: 'Custom Automation',
        price: 'Custom',
        interval: 'project' as const,
        description: 'Full AI integration service',
        features: [
          'Custom AI Workflows',
          'Google Drive Integration',
          'Sheets & Docs Processing',
          'JSON Data Extraction',
          'Custom Agent Development',
          'Implementation Team',
          'Training & Support'
        ],
        whopPlanId: 'plan_enterprise_custom',
        popular: false,
        isCustom: true,
        cta: 'Contact Sales'
      },
    ];
  }

  // Test mode helpers
  setTestPlan(planName: 'free' | 'starter' | 'pro' | 'team' | 'enterprise') {
    if (this.isTestMode) {
      localStorage.setItem('mock_user_plan', planName);
    }
  }

  getTestPlan(): string {
    if (this.isTestMode) {
      return localStorage.getItem('mock_user_plan') || 'free';
    }
    return 'free';
  }

  // Get company info
  getCompanyId(): string {
    return this.companyId;
  }

  // Get client ID
  getClientId(): string {
    return this.clientId;
  }

  // Check if in test mode
  isInTestMode(): boolean {
    return this.isTestMode;
  }
}

export const whopService = new WhopService();