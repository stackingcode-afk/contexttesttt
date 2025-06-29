import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Brain, 
  GraduationCap, 
  MessageSquare, 
  Heart, 
  Laptop, 
  Calendar, 
  BookOpen, 
  Lightbulb, 
  Users,
  ArrowRight,
  X
} from 'lucide-react';

interface ProfileTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  emoji: string;
  description: string;
  useCases: string[];
  fields: {
    businessInfo: Partial<{
      name: string;
      website: string;
      audience: string;
      niche: string;
      offer: string;
    }>;
    customFields: Record<string, any>;
  };
}

interface ProfileTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProfileTemplate, customName?: string) => void;
}

const ProfileTemplateSelector: React.FC<ProfileTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);
  const [customName, setCustomName] = useState('');

  const templates: ProfileTemplate[] = [
    {
      id: 'business',
      name: 'Business Profile',
      icon: Building2,
      emoji: '🏢',
      description: 'Complete business context for marketing, sales, and customer interactions.',
      useCases: ['Marketing campaigns', 'Sales copy', 'Customer support', 'Brand messaging'],
      fields: {
        businessInfo: {
          name: '',
          website: '',
          audience: '',
          niche: '',
          offer: '',
        },
        customFields: {},
      },
    },
    {
      id: 'personal-development',
      name: 'Personal Development',
      icon: Brain,
      emoji: '🧠',
      description: 'Tracks goals, values, limiting beliefs, routines.',
      useCases: ['Coaching prompts', 'Journaling assistants', 'Self-reflection bots', 'Goal tracking'],
      fields: {
        businessInfo: {
          name: 'Personal Development Journey',
          niche: 'Personal Growth',
          audience: 'Self',
        },
        customFields: {
          currentGoals: [],
          coreValues: [],
          limitingBeliefs: [],
          dailyRoutines: [],
          weeklyReflections: [],
          monthlyMilestones: [],
        },
      },
    },
    {
      id: 'student-learning',
      name: 'Student / Learning Profile',
      icon: GraduationCap,
      emoji: '🧑‍🎓',
      description: 'Stores learning goals, preferred formats, cognitive style.',
      useCases: ['AI tutors', 'Study assistants', 'Concept explanations', 'Learning optimization'],
      fields: {
        businessInfo: {
          name: 'Learning Profile',
          niche: 'Education',
          audience: 'Student',
        },
        customFields: {
          learningGoals: [],
          preferredFormats: ['videos', 'examples', 'flashcards', 'text'],
          courseNames: [],
          weakSubjects: [],
          cognitiveStyle: '',
          studySchedule: '',
          learningPreferences: [],
        },
      },
    },
    {
      id: 'social-media',
      name: 'Social Media Persona',
      icon: MessageSquare,
      emoji: '💬',
      description: 'Influencer or brand tone, audience type, preferred hashtags, hook styles.',
      useCases: ['Consistent captions', 'Tweet generation', 'Story creation', 'Hook development'],
      fields: {
        businessInfo: {
          name: 'Social Media Brand',
          niche: 'Content Creation',
        },
        customFields: {
          platforms: ['Instagram', 'Twitter', 'TikTok', 'LinkedIn'],
          audienceType: '',
          preferredHashtags: [],
          hookStyles: [],
          contentPillars: [],
          postingSchedule: '',
          engagementStyle: '',
        },
      },
    },
    {
      id: 'health-wellness',
      name: 'Health & Wellness Tracker',
      icon: Heart,
      emoji: '🧘',
      description: 'Daily habits, fitness goals, dietary preferences.',
      useCases: ['Workout plans', 'Meal prep', 'Recovery tracking', 'Wellness journaling'],
      fields: {
        businessInfo: {
          name: 'Health & Wellness Journey',
          niche: 'Health & Fitness',
          audience: 'Personal',
        },
        customFields: {
          fitnessGoals: [],
          dietaryPreferences: [],
          dailyHabits: [],
          workoutTypes: [],
          healthMetrics: [],
          sleepSchedule: '',
          stressManagement: [],
        },
      },
    },
    {
      id: 'freelance-work',
      name: 'Freelance Work OS',
      icon: Laptop,
      emoji: '🧑‍💻',
      description: 'Project types, client niches, deliverables, communication tone.',
      useCases: ['Cold emails', 'Client onboarding', 'Pitch decks', 'Project management'],
      fields: {
        businessInfo: {
          name: 'Freelance Business',
          niche: 'Freelancing',
        },
        customFields: {
          projectTypes: [],
          clientNiches: [],
          deliverables: [],
          communicationTone: '',
          pricingStructure: '',
          servicePackages: [],
          clientOnboardingProcess: [],
        },
      },
    },
    {
      id: 'life-organizer',
      name: 'Life Organizer',
      icon: Calendar,
      emoji: '🧳',
      description: 'High-level goals, current projects, decision values, reminders.',
      useCases: ['Executive assistant', 'Project management', 'Decision making', 'Life planning'],
      fields: {
        businessInfo: {
          name: 'Life Organization System',
          niche: 'Personal Productivity',
          audience: 'Personal',
        },
        customFields: {
          lifeGoals: [],
          currentProjects: [],
          decisionValues: [],
          priorities: [],
          timeBlocks: [],
          weeklyReviews: [],
          quarterlyPlanning: [],
        },
      },
    },
    {
      id: 'reading-notes',
      name: 'Reading/Note-Taking Companion',
      icon: BookOpen,
      emoji: '📚',
      description: 'Book list, frameworks, preferred note formats.',
      useCases: ['Summary generation', 'Highlight extraction', 'Knowledge synthesis', 'Research organization'],
      fields: {
        businessInfo: {
          name: 'Knowledge Management System',
          niche: 'Learning & Research',
          audience: 'Personal',
        },
        customFields: {
          readingList: [],
          frameworks: [],
          noteFormats: ['Zettelkasten', 'Cornell Notes', 'Mind Maps'],
          favoriteAuthors: [],
          researchTopics: [],
          keyInsights: [],
          bookRecommendations: [],
        },
      },
    },
    {
      id: 'research-ideas',
      name: 'Research/Idea Generator',
      icon: Lightbulb,
      emoji: '🧪',
      description: 'Topic interests, previous ideas, style of exploration.',
      useCases: ['Novel angles', 'Project ideas', 'Content creation', 'Research directions'],
      fields: {
        businessInfo: {
          name: 'Research & Innovation Lab',
          niche: 'Research & Development',
          audience: 'Researchers',
        },
        customFields: {
          topicInterests: [],
          previousIdeas: [],
          explorationStyle: ['analytical', 'contrarian', 'creative', 'systematic'],
          researchMethods: [],
          ideationTechniques: [],
          collaborators: [],
          resourceLibrary: [],
        },
      },
    },
    {
      id: 'creative-brain',
      name: 'Creative Brain Profile',
      icon: Lightbulb,
      emoji: '🧑‍🎨',
      description: 'Style, genre, inspirations, structure preferences.',
      useCases: ['Creative direction', 'Artistic guidance', 'Content creation', 'Style development'],
      fields: {
        businessInfo: {
          name: 'Creative Portfolio',
          niche: 'Creative Arts',
          audience: 'Artists & Creators',
        },
        customFields: {
          creativeStyle: '',
          preferredGenres: [],
          inspirations: [],
          structurePreferences: [],
          mediums: [],
          creativeProcess: [],
          portfolioPieces: [],
        },
      },
    },
    {
      id: 'agency-client',
      name: 'Agency/SMMA Client Profiles',
      icon: Users,
      emoji: '🧾',
      description: 'Standardized intake form with niche, offer, pain points, ad angles.',
      useCases: ['Onboarding docs', 'Ad copy', 'Client reports', 'Campaign strategy'],
      fields: {
        businessInfo: {
          name: '',
          website: '',
          audience: '',
          niche: '',
          offer: '',
        },
        customFields: {
          clientType: '',
          painPoints: [],
          adAngles: [],
          competitorAnalysis: [],
          campaignGoals: [],
          budget: '',
          timeline: '',
          successMetrics: [],
        },
      },
    },
  ];

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, customName);
      setSelectedTemplate(null);
      setCustomName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-card-bg to-card-hover rounded-xl border border-border-light backdrop-blur-sm w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-gray">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">
                <span className="text-terminal-green">{'>'}</span> Choose Profile Template
              </h2>
              <p className="text-text-gray font-mono mt-1">
                Select a template that matches your use case
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-gray hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Template Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-terminal-green bg-gradient-to-br from-terminal-green/10 to-terminal-green/5 shadow-lg shadow-terminal-green/20'
                        : 'border-border-light hover:border-terminal-green/50 bg-gradient-to-br from-darker-bg to-dark-bg'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{template.emoji}</div>
                      <div>
                        <h3 className="text-white font-medium font-mono text-sm">
                          {template.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-text-gray text-xs mb-3 font-mono leading-relaxed">
                      {template.description}
                    </p>
                    
                    <div className="space-y-1">
                      {template.useCases.slice(0, 2).map((useCase, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-terminal-green rounded-full"></div>
                          <span className="text-text-gray text-xs font-mono">{useCase}</span>
                        </div>
                      ))}
                      {template.useCases.length > 2 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-terminal-green rounded-full"></div>
                          <span className="text-text-gray text-xs font-mono">
                            +{template.useCases.length - 2} more...
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <div className="w-80 border-l border-border-gray p-6 bg-gradient-to-b from-darker-bg to-dark-bg">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{selectedTemplate.emoji}</div>
                    <h3 className="text-xl font-semibold text-white font-mono">
                      {selectedTemplate.name}
                    </h3>
                  </div>
                  <p className="text-text-gray text-sm font-mono leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3 font-mono">Use Cases:</h4>
                  <div className="space-y-2">
                    {selectedTemplate.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <ArrowRight className="w-3 h-3 text-terminal-green" />
                        <span className="text-text-gray text-sm font-mono">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-gray mb-2 font-mono">
                    Profile Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={`My ${selectedTemplate.name}`}
                    className="w-full bg-gray-800 border border-border-gray rounded-lg px-3 py-2 text-white focus:border-terminal-green focus:outline-none font-mono text-sm"
                  />
                  <p className="text-text-gray text-xs mt-1 font-mono">
                    Leave empty to use default name
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSelectTemplate}
                  className="w-full bg-gradient-to-r from-terminal-green to-terminal-green-dark text-black py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-terminal-green/20 transition-all duration-300 flex items-center justify-center space-x-2 font-mono"
                >
                  <span>Create Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileTemplateSelector;