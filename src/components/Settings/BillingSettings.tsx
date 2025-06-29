import React, { useState, useEffect } from 'react';
import { Crown, Zap, ExternalLink, CreditCard, CheckCircle, TestTube, Star, Phone, Workflow } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { whopService } from '../../services/whopService';
import { motion } from 'framer-motion';

const BillingSettings: React.FC = () => {
  const { membership, getCurrentPlan, refreshUserData } = useAuth();
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isTestMode = whopService.isInTestMode();

  // Listen for navigation event from sidebar
  useEffect(() => {
    const handleNavigateToBilling = () => {
      // This component is already the billing settings, so we're good
      console.log('Navigated to billing settings');
    };

    window.addEventListener('navigate-to-billing', handleNavigateToBilling);
    return () => window.removeEventListener('navigate-to-billing', handleNavigateToBilling);
  }, []);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonId]: true }));
    action();
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonId]: false }));
    }, 1000);
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setIsLoading(true);
      
      if (isTestMode) {
        // In test mode, simulate the upgrade
        const planName = planId.includes('starter') ? 'starter' : 
                         planId.includes('pro') ? 'pro' : 
                         planId.includes('team') ? 'team' :
                         planId.includes('enterprise') ? 'enterprise' : 'free';
        whopService.setTestPlan(planName);
        
        // Refresh user data to reflect the change
        await refreshUserData();
        
        alert(`✅ Test Mode: Upgraded to ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan!`);
      } else {
        const checkoutUrl = await whopService.createCheckoutSession(planId);
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSales = () => {
    if (isTestMode) {
      // In test mode, simulate enterprise upgrade
      whopService.setTestPlan('enterprise');
      refreshUserData();
      alert('✅ Test Mode: Upgraded to Enterprise plan!');
    } else {
      window.open('mailto:sales@contxtprofile.com?subject=Custom Automation Inquiry', '_blank');
    }
  };

  const handleTestPlanChange = (planName: 'free' | 'starter' | 'pro' | 'team' | 'enterprise') => {
    if (isTestMode) {
      whopService.setTestPlan(planName);
      refreshUserData();
    }
  };

  const currentPlan = getCurrentPlan();
  const plans = whopService.getAvailablePlans();

  return (
    <div className="space-y-8 h-full overflow-y-auto">
      {/* Test Mode Notice */}
      {isTestMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/20 to-terminal-green/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center space-x-4 mb-4">
            <TestTube className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white font-mono">Test Mode Active</h3>
          </div>
          <p className="text-text-gray text-sm mb-6 font-mono">
            You're in development mode. Plan changes are simulated locally and won't affect real billing.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestPlanChange('free')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-mono transition"
            >
              Test Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestPlanChange('starter')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-mono transition"
            >
              Test Starter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestPlanChange('pro')}
              className="bg-terminal-green hover:bg-terminal-green-dark text-black px-4 py-2 rounded-lg text-sm font-mono transition"
            >
              Test Pro
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestPlanChange('team')}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-mono transition"
            >
              Test Team
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestPlanChange('enterprise')}
              className="bg-gradient-to-r from-green-500 to-terminal-green text-black px-4 py-2 rounded-lg text-sm font-mono transition"
            >
              Test Enterprise
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-terminal-green/10 to-blue-500/10 rounded-xl p-6 border border-terminal-green/30">
        <div className="flex items-center space-x-4 mb-6">
          <Crown className="w-6 h-6 text-terminal-green" />
          <h3 className="text-xl font-semibold text-white font-mono">
            Current Plan: {plans.find(p => p.id === currentPlan)?.name || currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            {isTestMode && <span className="text-blue-400 ml-2">(Test)</span>}
          </h3>
        </div>
        
        {membership ? (
          <div className="space-y-3 text-sm font-mono">
            <p className="text-text-gray">
              <span className="text-white">Status:</span> {membership.status}
            </p>
            <p className="text-text-gray">
              <span className="text-white">Plan:</span> {membership.plan.name}
            </p>
            <p className="text-text-gray">
              <span className="text-white">Price:</span> ${membership.plan.price}/{membership.plan.interval}
            </p>
            {membership.expires_at && (
              <p className="text-text-gray">
                <span className="text-white">Expires:</span> {new Date(membership.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-text-gray font-mono">
            {currentPlan === 'free' 
              ? "You're currently on the free plan. Upgrade to unlock premium features."
              : `You're currently on the ${currentPlan} plan.`
            }
          </p>
        )}

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={buttonStates['manage-billing'] ? { 
              backgroundColor: '#00FF91', 
              color: '#000000',
              scale: [1, 1.05, 1]
            } : {}}
            onClick={() => handleButtonClick('manage-billing', () => {
              if (isTestMode) {
                alert('🧪 Test Mode: This would open WHOP billing portal in production');
              } else {
                window.open('https://whop.com/billing', '_blank');
              }
            })}
            className="bg-terminal-green text-black px-6 py-3 rounded-lg font-medium hover:shadow-glow transition font-mono"
          >
            {buttonStates['manage-billing'] ? 'Opening...' : 'Manage Billing'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={buttonStates['refresh-status'] ? { 
              backgroundColor: '#00FF91', 
              color: '#000000',
              scale: [1, 1.05, 1]
            } : {}}
            onClick={() => handleButtonClick('refresh-status', refreshUserData)}
            className="border border-terminal-green text-terminal-green px-6 py-3 rounded-lg font-medium hover:bg-terminal-green hover:text-black transition font-mono"
          >
            {buttonStates['refresh-status'] ? 'Refreshing...' : 'Refresh Status'}
          </motion.button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-8 font-mono">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgrade = currentPlan !== plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isCurrentPlan ? { scale: 1.02 } : {}}
                className={`bg-card-bg rounded-xl border transition relative overflow-hidden ${
                  isCurrentPlan 
                    ? 'border-terminal-green shadow-glow' 
                    : plan.popular 
                    ? 'border-terminal-green/50 shadow-lg shadow-terminal-green/20' 
                    : plan.isCustom
                    ? 'border-green-500/50'
                    : 'border-border-light hover:border-terminal-green/50'
                }`}
              >
                {/* Badge positioned ON the top border of the card - Single line */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center space-x-1.5 shadow-lg whitespace-nowrap">
                      <Star className="w-3 h-3 flex-shrink-0" />
                      <span>MOST POPULAR</span>
                    </div>
                  </div>
                )}

                {/* Enterprise badge positioned ON the top border of the card - Single line */}
                {plan.isCustom && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-terminal-green text-black px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center space-x-1.5 shadow-lg whitespace-nowrap">
                      <Workflow className="w-3 h-3 flex-shrink-0" />
                      <span>ENTERPRISE</span>
                    </div>
                  </div>
                )}

                {/* Card content with proper padding */}
                <div className="p-6">
                  <div className={`text-center mb-8 ${plan.popular || plan.isCustom ? 'mt-4' : ''}`}>
                    {plan.isCustom && (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-terminal-green rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Workflow className="w-8 h-8 text-black" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2 font-mono">{plan.name}</h3>
                    <p className="text-text-gray text-sm mb-4 font-mono">{plan.description}</p>
                    <div className="text-3xl font-bold text-terminal-green mb-2 font-mono">
                      {plan.price === 'Custom' ? (
                        <span className="text-green-400">Custom</span>
                      ) : (
                        <>
                          ${plan.price}
                          <span className="text-sm text-text-gray">/{plan.interval}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.isCustom ? 'text-green-400' : 'text-terminal-green'}`} />
                        <span className="text-text-gray">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={plan.isCustom ? handleContactSales : () => canUpgrade && handleUpgrade(plan.whopPlanId!)}
                    disabled={isCurrentPlan || isLoading}
                    className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black hover:shadow-glow'
                        : plan.isCustom
                        ? 'bg-gradient-to-r from-green-500 to-terminal-green text-black hover:bg-green-600'
                        : isCurrentPlan
                        ? 'bg-gray-700 text-text-gray cursor-not-allowed'
                        : 'bg-card-hover text-white border border-border-light hover:border-terminal-green'
                    }`}
                  >
                    {plan.isCustom && <Phone className="w-4 h-4" />}
                    <span>
                      {isCurrentPlan 
                        ? 'Current Plan' 
                        : buttonStates[`upgrade-${plan.id}`] 
                          ? 'Processing...' 
                          : plan.isCustom && isTestMode
                          ? 'Test Enterprise'
                          : plan.cta || (isTestMode ? 'Test Upgrade' : 'Upgrade')
                      }
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Features Preview */}
      {currentPlan !== 'enterprise' && (
        <div className="bg-gradient-to-br from-green-900/20 to-terminal-green/20 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-xl font-semibold text-white mb-6 font-mono flex items-center space-x-3">
            <Workflow className="w-6 h-6 text-green-400" />
            <span>Custom Automation Features</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Custom AI workflows tailored to your business</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Complete system integration with existing tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Professional local model setup and configuration</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Custom API development and endpoints</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Dedicated implementation team</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-text-gray">Comprehensive training and ongoing support</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Information */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-light">
        <h3 className="text-xl font-semibold text-white mb-6 font-mono">Billing Information</h3>
        <div className="space-y-4 text-sm font-mono">
          <div className="flex items-center space-x-4">
            <CreditCard className="w-5 h-5 text-terminal-green" />
            <span className="text-text-gray">
              {isTestMode ? 'Test Mode: No real billing active' : 'All billing is securely handled by WHOP'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ExternalLink className="w-5 h-5 text-terminal-green" />
            <span className="text-text-gray">
              {isTestMode 
                ? 'In production: Manage payment methods and invoices in your WHOP account'
                : 'Manage payment methods and invoices in your WHOP account'
              }
            </span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (isTestMode) {
              alert('🧪 Test Mode: This would open WHOP billing portal in production');
            } else {
              window.open('https://whop.com/billing', '_blank');
            }
          }}
          className="mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition border border-border-gray font-mono"
        >
          {isTestMode ? 'Test: Open WHOP Billing Portal' : 'Open WHOP Billing Portal'}
        </motion.button>
      </div>
    </div>
  );
};

export default BillingSettings;