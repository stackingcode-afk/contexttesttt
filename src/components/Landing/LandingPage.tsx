import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  Check, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Sparkles,
  MessageSquare,
  BookOpen,
  Settings,
  ChevronDown,
  Play,
  Menu,
  X,
  Terminal,
  Building2,
  TrendingUp,
  Globe,
  Clock,
  Award,
  Cog,
  Workflow,
  Code,
  Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  const features = [
    {
      icon: Brain,
      title: 'AI Context Profiles',
      description: 'Create detailed business contexts that make AI understand your brand, audience, and goals perfectly.',
      gradient: 'from-terminal-green to-terminal-green-dark'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Model Chat',
      description: 'Chat with GPT-4, Claude, Gemini, local models, and more - all with your business context automatically applied.',
      gradient: 'from-accent-blue to-accent-blue-light'
    },
    {
      icon: BookOpen,
      title: 'Prompt Library',
      description: 'Save, organize, and reuse your best prompts. Build a library of proven AI interactions.',
      gradient: 'from-accent-purple to-accent-purple-light'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share contexts and prompts with your team. Ensure consistent AI outputs across your organization.',
      gradient: 'from-accent-orange to-accent-orange-light'
    },
    {
      icon: Shield,
      title: 'Local & Cloud Models',
      description: 'Use cloud APIs or connect to locally installed models like Ollama, Gemini CLI, and custom LLMs.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: 'Instant Export',
      description: 'Export contexts to any AI platform or integrate with your existing workflows via API.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechFlow',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'ContxtProfile transformed how our team uses AI. Our marketing copy is now consistently on-brand and converts 40% better.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Founder',
      company: 'StartupLab',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Finally, an AI tool that understands our business context. It\'s like having a team member who never forgets our brand voice.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Content Manager',
      company: 'GrowthCo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'The prompt library feature alone saved us 10+ hours per week. Our content quality and consistency improved dramatically.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'AI Conversations' },
    { number: '500+', label: 'Happy Users' },
    { number: '95%', label: 'Accuracy Improvement' },
    { number: '40hrs', label: 'Saved Per Month' }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 20,
      period: 'month',
      description: 'Perfect for individuals',
      features: [
        '3 Context Profiles',
        'GPT-3.5 & GPT-4 Access',
        'Local Model Support',
        '100 AI Messages/month',
        'Email Support'
      ],
      popular: false,
      cta: 'Start 7-Day Trial',
      ctaStyle: 'secondary'
    },
    {
      name: 'Pro',
      price: 35,
      period: 'month',
      description: 'For power users',
      features: [
        'Unlimited Profiles',
        'All AI Models',
        'Local & Cloud Models',
        'Unlimited Messages',
        'Custom Templates',
        'Priority Support'
      ],
      popular: true,
      cta: 'Start 7-Day Trial',
      ctaStyle: 'primary'
    },
    {
      name: 'Team',
      price: 100,
      period: 'month',
      description: 'For teams & enterprises',
      features: [
        'Everything in Pro',
        'Team Workspace',
        'Shared Library',
        'Team Management',
        'Analytics',
        'White-label Options'
      ],
      popular: false,
      cta: 'Start 7-Day Trial',
      ctaStyle: 'secondary'
    },
    {
      name: 'Custom Automation',
      price: 'Custom',
      period: 'project',
      description: 'Full AI integration service',
      features: [
        'Custom AI Workflows',
        'System Integration',
        'Local Model Setup',
        'API Development',
        'Implementation Team',
        'Training & Support'
      ],
      popular: false,
      cta: 'Contact Sales',
      ctaStyle: 'custom',
      isCustom: true
    }
  ];

  const faqs = [
    {
      question: 'How does ContxtProfile improve AI responses?',
      answer: 'ContxtProfile provides AI models with detailed context about your business, brand voice, target audience, and goals. This context is automatically included in every conversation, resulting in more relevant, on-brand, and effective AI responses.'
    },
    {
      question: 'Which AI models are supported?',
      answer: 'We support all major cloud AI models (GPT-4, Claude 3, Gemini Pro) plus local models like Ollama, Gemini CLI 2.5 Pro, and any locally installed LLM. You can switch between cloud and local models seamlessly while maintaining your context.'
    },
    {
      question: 'Can I use local AI models?',
      answer: 'Yes! ContxtProfile supports local models including Ollama, Gemini CLI 2.5 Pro, and any locally installed LLM. This gives you complete privacy and control over your AI interactions while still benefiting from structured context management.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, security is our top priority. Your API keys are stored locally in your browser, your context data is encrypted, and we never store or access your AI conversations. Local model support means your data never leaves your machine.'
    },
    {
      question: 'Can I use this with my existing AI workflows?',
      answer: 'Absolutely! ContxtProfile includes export features and API access (Pro plan) to integrate with your existing tools and workflows. You can export contexts to any AI platform or build custom integrations.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! All paid plans come with a 7-day free trial. No credit card required to start. You can explore all features and see how ContxtProfile transforms your AI interactions.'
    },
    {
      question: 'What is the Custom Automation service?',
      answer: 'Our Custom Automation service provides end-to-end AI integration solutions. We build custom workflows, integrate with your existing systems, set up local models, and create automated AI processes tailored to your specific business needs.'
    }
  ];

  const handleContactSales = () => {
    // You can replace this with your actual contact method
    window.open('mailto:sales@contxtprofile.com?subject=Custom Automation Inquiry', '_blank');
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked - redirecting to app');
    // Redirect to the app after login
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkest-bg via-darker-bg to-dark-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terminal-green/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-glass-bg backdrop-blur-xl border-b border-glass-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white font-sans">ContxtProfile</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-tertiary hover:text-white transition font-medium">Features</a>
              <a href="#pricing" className="text-text-tertiary hover:text-white transition font-medium">Pricing</a>
              <a href="#testimonials" className="text-text-tertiary hover:text-white transition font-medium">Reviews</a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-6 py-2 rounded-xl font-semibold hover:shadow-glow transition"
              >
                Start Free Trial
              </motion.button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-0 right-0 z-40 bg-glass-bg backdrop-blur-xl border-b border-glass-border md:hidden"
        >
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-text-tertiary hover:text-white transition font-medium">Features</a>
            <a href="#pricing" className="block text-text-tertiary hover:text-white transition font-medium">Pricing</a>
            <a href="#testimonials" className="block text-text-tertiary hover:text-white transition font-medium">Reviews</a>
            <button
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black py-3 rounded-xl font-semibold"
            >
              Start Free Trial
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-glass-bg backdrop-blur-xl rounded-full px-6 py-3 border border-glass-border mb-8">
                <Sparkles className="w-4 h-4 text-terminal-green" />
                <span className="text-sm text-gray-300 font-medium">Trusted by 500+ businesses worldwide</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                AI that actually
                <br />
                <span className="bg-gradient-to-r from-terminal-green via-accent-blue to-accent-purple bg-clip-text text-transparent">
                  understands your business
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                Create context profiles that make GPT, Claude, Gemini, and local models deliver perfectly tailored responses for your brand, audience, and goals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 255, 145, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-glow-xl transition-all duration-300 flex items-center space-x-3 group"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-glass-border text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-glass-hover transition-all duration-300 flex items-center space-x-3 backdrop-blur-xl"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>
              
              <p className="text-sm text-gray-400 mt-6">
                7-day free trial • No credit card required • Cancel anytime
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-terminal-green mb-2">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything you need for
                <br />
                <span className="text-terminal-green">context-aware AI</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Stop fighting with generic AI responses. Create detailed business contexts that make every AI interaction perfectly tailored to your needs.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-glass-bg backdrop-blur-xl rounded-3xl p-8 border border-glass-border hover:border-glass-border-hover transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Loved by teams worldwide
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how ContxtProfile is transforming how businesses use AI
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-glass-bg backdrop-blur-xl rounded-3xl p-8 border border-glass-border"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your needs. All plans include a 7-day free trial.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-glass-bg backdrop-blur-xl rounded-2xl border transition-all duration-300 relative ${
                  plan.popular 
                    ? 'border-terminal-green shadow-lg shadow-terminal-green/20 scale-105' 
                    : plan.isCustom
                    ? 'border-green-500'
                    : 'border-glass-border hover:border-glass-border-hover'
                }`}
                style={{ paddingTop: plan.popular || plan.isCustom ? '3rem' : '1.5rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-4 py-1 rounded-full text-xs font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                {plan.isCustom && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-terminal-green text-black px-4 py-1 rounded-full text-xs font-bold">
                      Enterprise
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  {plan.isCustom && (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-terminal-green rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Workflow className="w-6 h-6 text-black" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                  <div className="text-3xl font-bold text-terminal-green mb-2">
                    {plan.price === 'Custom' ? (
                      <span className="text-green-400">Custom</span>
                    ) : (
                      <>
                        ${plan.price}
                        <span className="text-sm text-gray-400">/{plan.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.isCustom ? 'text-green-400' : 'text-terminal-green'}`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={plan.isCustom ? handleContactSales : handleGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm ${
                    plan.ctaStyle === 'primary'
                      ? 'bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black hover:shadow-glow'
                      : plan.ctaStyle === 'custom'
                      ? 'bg-gradient-to-r from-green-500 to-terminal-green text-black hover:bg-green-600'
                      : 'bg-glass-hover text-white border border-glass-border hover:border-terminal-green'
                  }`}
                >
                  {plan.isCustom && <Phone className="w-4 h-4" />}
                  <span>{plan.cta}</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Frequently asked questions
              </h2>
              <p className="text-xl text-gray-300">
                Everything you need to know about ContxtProfile
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-glass-bg backdrop-blur-xl rounded-2xl p-6 border border-glass-border"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-glass-bg to-glass-elevated backdrop-blur-xl rounded-3xl p-12 border border-glass-border"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your AI interactions?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using ContxtProfile to get better, more consistent results from AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 255, 145, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-glow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span>Start Your 7-Day Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              7-day free trial • No credit card required • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-glass-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-terminal-green to-terminal-green-dark rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-bold text-white">ContxtProfile</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The AI context management platform that makes every AI interaction perfectly tailored to your business.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-glass-bg rounded-lg flex items-center justify-center hover:bg-glass-hover transition cursor-pointer">
                  <span className="text-white text-sm font-bold">X</span>
                </div>
                <div className="w-10 h-10 bg-glass-bg rounded-lg flex items-center justify-center hover:bg-glass-hover transition cursor-pointer">
                  <span className="text-white text-sm font-bold">Li</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-glass-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ContxtProfile. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;