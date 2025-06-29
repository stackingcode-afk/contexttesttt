import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredFeature,
  fallback 
}) => {
  const { isAuthenticated, isLoading, hasFeatureAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darker-bg via-dark-bg to-darker-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-terminal-green/20 to-terminal-green/5 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Terminal className="w-8 h-8 text-terminal-green animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 font-mono">Loading...</h2>
          <p className="text-text-gray font-mono">Initializing ContxtProfile</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to landing page instead of showing login page
    window.location.href = '/';
    return null;
  }

  // Check feature access if required
  if (requiredFeature && !hasFeatureAccess(requiredFeature)) {
    return fallback || (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4 font-mono">Upgrade Required</h2>
        <p className="text-text-gray font-mono">
          This feature requires a higher plan. Please upgrade to continue.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;