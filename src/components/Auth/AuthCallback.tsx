import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { whopService } from '../../services/whopService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError('Authentication was cancelled or failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Exchange code for token
        await whopService.exchangeCodeForToken(code);
        
        // Refresh user data
        await refreshUserData();
        
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error: any) {
        console.error('Authentication error:', error);
        setStatus('error');
        setError(error.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker-bg via-dark-bg to-darker-bg flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 79px, #00FF91 79px, #00FF91 81px, transparent 81px),
            linear-gradient(#00FF91 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-card-bg to-card-hover rounded-xl p-8 border border-border-light backdrop-blur-sm max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-terminal-green/20 to-terminal-green/5 rounded-xl flex items-center justify-center mx-auto mb-6">
          {status === 'loading' && (
            <Terminal className="w-8 h-8 text-terminal-green animate-pulse" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-8 h-8 text-terminal-green" />
          )}
          {status === 'error' && (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4 font-mono">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Welcome to ContxtProfile!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-text-gray font-mono mb-6">
          {status === 'loading' && 'Please wait while we set up your account...'}
          {status === 'success' && 'Redirecting to your dashboard...'}
          {status === 'error' && (error || 'Something went wrong. Redirecting to login...')}
        </p>

        {status === 'loading' && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;