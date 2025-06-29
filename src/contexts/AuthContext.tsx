import React, { createContext, useContext, useState, useEffect } from 'react';
import { whopService, WhopUser, WhopMembership } from '../services/whopService';

interface AuthContextType {
  user: WhopUser | null;
  membership: WhopMembership | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  hasFeatureAccess: (feature: string) => boolean;
  getCurrentPlan: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<WhopUser | null>(null);
  const [membership, setMembership] = useState<WhopMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = whopService.isAuthenticated() && user !== null;

  // Feature access based on plan - Enterprise includes ALL team features
  const hasFeatureAccess = (feature: string): boolean => {
    const currentPlan = getCurrentPlan();
    
    const featureMatrix: Record<string, string[]> = {
      'unlimited_profiles': ['pro', 'team', 'enterprise'],
      'all_ai_models': ['pro', 'team', 'enterprise'],
      'custom_templates': ['pro', 'team', 'enterprise'],
      'integrations_access': ['pro', 'team', 'enterprise'], // Integrations available for Pro+
      'team_workspace': ['team', 'enterprise'], // Enterprise includes team features
      'project_folders': ['team', 'enterprise'],
      'team_members': ['team', 'enterprise'],
      'shared_library': ['team', 'enterprise'],
      'analytics': ['team', 'enterprise'],
      'white_label': ['team', 'enterprise'],
      'custom_integrations': ['team', 'enterprise'],
      'custom_workflows': ['enterprise'],
      'implementation_team': ['enterprise'],
    };

    return featureMatrix[feature]?.includes(currentPlan) || false;
  };

  const getCurrentPlan = (): string => {
    // In test mode, get the plan from local storage
    if (whopService.isInTestMode()) {
      return whopService.getTestPlan();
    }

    if (!membership || membership.status !== 'active') return 'free';
    
    // Map WHOP plan IDs to internal plan names
    const planMapping: Record<string, string> = {
      'plan_starter_monthly': 'starter',
      'plan_starter_monthly_placeholder': 'starter',
      'plan_pro_monthly': 'pro',
      'plan_pro_monthly_placeholder': 'pro',
      'plan_team_monthly': 'team',
      'plan_team_monthly_placeholder': 'team',
      'plan_enterprise_custom': 'enterprise',
    };

    return planMapping[membership.plan_id] || 'free';
  };

  const refreshUserData = async () => {
    if (!whopService.isAuthenticated()) {
      setUser(null);
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [userData, membershipData] = await Promise.all([
        whopService.getCurrentUser(),
        whopService.getCurrentPlan(),
      ]);

      setUser(userData);
      setMembership(membershipData);
      
      // Cache user data
      localStorage.setItem('whop_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If there's an error and not in test mode, the user might need to re-authenticate
      if (!whopService.isInTestMode()) {
        whopService.logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    console.log('Login function called!'); // Debug log
    console.log('Test mode:', whopService.isInTestMode()); // Debug log
    
    if (whopService.isInTestMode()) {
      console.log('Using test mode login'); // Debug log
      // In test mode, simulate login
      const mockToken = 'mock_access_token_' + Date.now();
      localStorage.setItem('whop_access_token', mockToken);
      localStorage.setItem('whop_token_expires_at', (Date.now() + 3600 * 1000).toString());
      
      // Set mock user data immediately
      const mockUser: WhopUser = {
        id: 'user_test_123',
        username: 'testuser',
        email: 'test@contxtprofile.com',
        profile_pic_url: 'https://via.placeholder.com/150',
        created_at: new Date().toISOString(),
        social_accounts: [],
      };
      
      setUser(mockUser);
      localStorage.setItem('whop_user', JSON.stringify(mockUser));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
      return;
    }

    try {
      console.log('Getting auth URL...'); // Debug log
      const authUrl = whopService.getAuthUrl();
      console.log('Auth URL:', authUrl); // Debug log
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setMembership(null);
    whopService.logout();
  };

  // Load cached user data and refresh on mount
  useEffect(() => {
    const loadUserData = async () => {
      console.log('Loading user data...'); // Debug log
      
      // Try to load cached user data first
      const cachedUser = localStorage.getItem('whop_user');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          console.log('Loaded cached user:', parsedUser); // Debug log
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing cached user data:', error);
        }
      }

      // Then refresh from API
      await refreshUserData();
    };

    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      membership,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUserData,
      hasFeatureAccess,
      getCurrentPlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
};