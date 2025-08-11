'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  ArrowRight, 
  ArrowLeft,
  Target,
  User,
  Activity,
  Clock,
  Heart,
  Brain,
  CheckCircle,
  Sparkles,
  Trophy,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react';
import { GoalsStep } from './GoalsStep';
import { MotivationStep } from './MotivationStep';

interface UserProfile {
  // Demographics
  age: number;
  gender: 'male' | 'female' | 'other';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Goals
  primaryGoal: string;
  secondaryGoals: string[];
  targetTimeline: string;
  
  // Constraints
  availableTime: number; // minutes per day
  workoutDays: string[];
  equipment: string[];
  limitations: string[];
  
  // Motivation Profile
  motivationStyle: string[];
  preferredWorkoutTime: string;
  accountabilityPreference: string;
  
  // Health Background
  injuries: string[];
  medicalConditions: string[];
  previousExperience: string[];
}

const steps = [
  'welcome',
  'demographics',
  'goals',
  'experience',
  'constraints',
  'motivation',
  'health',
  'preferences',
  'summary'
] as const;

type Step = typeof steps[number];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepIndex = steps.indexOf(currentStep);
    setProgress((stepIndex / (steps.length - 1)) * 100);
  }, [currentStep]);

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    // Save profile to Supabase
    console.log('Saving profile:', profile);
    
    // Generate personalized program
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Step {steps.indexOf(currentStep) + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[600px]">
          {currentStep === 'welcome' && (
            <WelcomeStep onNext={nextStep} />
          )}
          
          {currentStep === 'demographics' && (
            <DemographicsStep 
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 'goals' && (
            <GoalsStep 
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {/* Experience step - not yet implemented */}
          {currentStep === 'experience' && (
            <div className="text-center py-8">
              <p>Experience step coming soon...</p>
              <Button onClick={nextStep}>Next</Button>
            </div>
          )}
          
          {/* Constraints step - not yet implemented */}
          {currentStep === 'constraints' && (
            <div className="text-center py-8">
              <p>Constraints step coming soon...</p>
              <Button onClick={nextStep}>Next</Button>
            </div>
          )}
          
          {currentStep === 'motivation' && (
            <MotivationStep 
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {/* Health step - not yet implemented */}
          {currentStep === 'health' && (
            <div className="text-center py-8">
              <p>Health step coming soon...</p>
              <Button onClick={nextStep}>Next</Button>
            </div>
          )}
          
          {/* Preferences step - not yet implemented */}
          {currentStep === 'preferences' && (
            <div className="text-center py-8">
              <p>Preferences step coming soon...</p>
              <Button onClick={nextStep}>Next</Button>
            </div>
          )}
          
          {/* Summary step - not yet implemented */}
          {currentStep === 'summary' && (
            <div className="text-center py-8">
              <p>Summary step coming soon...</p>
              <Button onClick={completeOnboarding}>Complete</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Welcome to Feel Sharper
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Your journey to peak performance starts here. We'll create a personalized plan 
          that adapts to your goals, constraints, and motivation style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 text-center">
          <Brain className="h-8 w-8 mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            AI-Powered Coaching
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Personalized guidance that adapts to your progress and feedback
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <Activity className="h-8 w-8 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Comprehensive Tracking
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Workouts, nutrition, recovery, and progress all in one place
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <Heart className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Supportive Community
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Connect with like-minded individuals on similar journeys
          </p>
        </Card>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="h-5 w-5 text-amber-600" />
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">
            Why This Matters
          </h4>
        </div>
        <p className="text-amber-800 dark:text-amber-200">
          92% of people abandon their fitness goals within 3 months. We've built this platform 
          to address the specific barriers that cause failure: lack of personalization, 
          inconsistent motivation, and inadequate guidance.
        </p>
      </div>

      <Button onClick={onNext} size="lg" className="px-8 py-4">
        Let&apos;s Get Started
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
}

function DemographicsStep({ profile, updateProfile, onNext, onPrev }: any) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <User className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          This helps us create the perfect program for your body and lifestyle
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              How old are you?
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['18-25', '26-35', '36-45', '46+'].map((range) => (
                <button
                  key={range}
                  onClick={() => updateProfile({ ageRange: range })}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    profile.ageRange === range
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {range}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
                { id: 'other', label: 'Other' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateProfile({ gender: option.id })}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    profile.gender === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Activity Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              How would you describe your current activity level?
            </label>
            <div className="space-y-3">
              {[
                { 
                  id: 'sedentary', 
                  label: 'Sedentary', 
                  description: 'Desk job, little to no exercise' 
                },
                { 
                  id: 'lightly_active', 
                  label: 'Lightly Active', 
                  description: 'Light exercise/sports 1-3 days per week' 
                },
                { 
                  id: 'moderately_active', 
                  label: 'Moderately Active', 
                  description: 'Moderate exercise/sports 3-5 days per week' 
                },
                { 
                  id: 'very_active', 
                  label: 'Very Active', 
                  description: 'Hard exercise/sports 6-7 days per week' 
                }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => updateProfile({ activityLevel: level.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    profile.activityLevel === level.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {level.label}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!profile.ageRange || !profile.gender || !profile.activityLevel}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// I'll continue with the other steps... This is getting quite long, so let me create the remaining steps as separate components