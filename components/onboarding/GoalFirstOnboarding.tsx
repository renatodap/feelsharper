'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import ReferralCodeInput from '@/components/referrals/ReferralCodeInput';
import { 
  Target, 
  Clock, 
  CheckSquare, 
  ArrowRight, 
  ArrowLeft,
  TrendingDown,
  Dumbbell,
  Zap,
  Trophy,
  Heart
} from 'lucide-react';

interface OnboardingData {
  primaryGoal: string;
  weeklyHours: number;
  trackingModules: string[];
}

const GOALS = [
  {
    id: 'weight_loss',
    title: 'Weight Loss',
    description: 'Lose fat, get lean, feel confident',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  {
    id: 'muscle_gain',
    title: 'Muscle Gain',
    description: 'Build strength, add size, get stronger',
    icon: Dumbbell,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Run faster, go longer, build stamina',
    icon: Zap,
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  {
    id: 'sport_specific',
    title: 'Sport Performance',
    description: 'Excel at your sport, compete better',
    icon: Trophy,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'general_health',
    title: 'General Health',
    description: 'Feel better, live longer, stay active',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50'
  }
];

const TIME_OPTIONS = [
  { hours: 3, label: '3 hours/week', description: 'Quick wins, minimal time' },
  { hours: 5, label: '5 hours/week', description: 'Balanced approach' },
  { hours: 7, label: '7 hours/week', description: 'Serious progress' },
  { hours: 10, label: '10+ hours/week', description: 'Maximum results' }
];

const TRACKING_MODULES = [
  { id: 'weight', label: 'Weight Tracking', description: 'Daily weigh-ins and trends' },
  { id: 'nutrition', label: 'Nutrition', description: 'Calories, macros, meal logging' },
  { id: 'workouts', label: 'Workouts', description: 'Strength training and progress' },
  { id: 'cardio', label: 'Cardio', description: 'Running, cycling, endurance' },
  { id: 'recovery', label: 'Recovery', description: 'Sleep, stress, mobility' },
  { id: 'progress', label: 'Progress Photos', description: 'Visual transformation tracking' }
];

export default function GoalFirstOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [referralApplied, setReferralApplied] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    primaryGoal: '',
    weeklyHours: 0,
    trackingModules: []
  });

  // Check for referral code in URL params
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && !referralApplied) {
      // Auto-apply referral code if present in URL
      fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: refCode })
      }).then(response => {
        if (response.ok) {
          setReferralApplied(true);
        }
      }).catch(console.error);
    }
  }, [searchParams, referralApplied]);

  const handleGoalSelect = (goalId: string) => {
    setData(prev => ({ ...prev, primaryGoal: goalId }));
  };

  const handleTimeSelect = (hours: number) => {
    setData(prev => ({ ...prev, weeklyHours: hours }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setData(prev => ({
      ...prev,
      trackingModules: prev.trackingModules.includes(moduleId)
        ? prev.trackingModules.filter(id => id !== moduleId)
        : [...prev.trackingModules, moduleId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save goal and preferences
      const goalResponse = await fetch('/api/user/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryGoal: data.primaryGoal,
          weeklyHours: data.weeklyHours
        })
      });

      if (!goalResponse.ok) throw new Error('Failed to save goal');

      // Save dashboard preferences
      const modules = ['today', ...data.trackingModules];
      const prefsResponse = await fetch('/api/user/dashboard-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules,
          moduleOrder: modules
        })
      });

      if (!prefsResponse.ok) throw new Error('Failed to save preferences');

      // Qualify referral if user was referred
      try {
        await fetch('/api/referrals/qualify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Failed to qualify referral:', error);
        // Don't block onboarding completion for referral errors
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.primaryGoal !== '';
      case 2: return data.weeklyHours > 0;
      case 3: return data.trackingModules.length > 0;
      default: return false;
    }
  };

  const selectedGoal = GOALS.find(g => g.id === data.primaryGoal);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Body className="text-slate-600 text-sm">
              Step {currentStep} of 3
            </Body>
            <Body className="text-slate-600 text-sm">
              {Math.round((currentStep / 3) * 100)}% complete
            </Body>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: Goal Selection */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <Heading className="text-2xl font-bold mb-2">
                  What's your primary goal?
                </Heading>
                <Body className="text-slate-600">
                  Choose your main focus. We'll customize everything around this.
                </Body>
              </div>

              <div className="grid gap-4">
                {GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = data.primaryGoal === goal.id;
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-4 ${goal.bgColor}`}>
                          <Icon className={`w-6 h-6 ${goal.color}`} />
                        </div>
                        <div className="flex-1">
                          <Subheading className="font-semibold mb-1">
                            {goal.title}
                          </Subheading>
                          <Body className="text-slate-600 text-sm">
                            {goal.description}
                          </Body>
                        </div>
                        {isSelected && (
                          <CheckSquare className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Time Commitment */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <Heading className="text-2xl font-bold mb-2">
                  How much time can you commit?
                </Heading>
                <Body className="text-slate-600">
                  Be honest. We'll build a plan that fits your schedule.
                </Body>
              </div>

              <div className="grid gap-4">
                {TIME_OPTIONS.map((option) => {
                  const isSelected = data.weeklyHours === option.hours;
                  
                  return (
                    <button
                      key={option.hours}
                      onClick={() => handleTimeSelect(option.hours)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Subheading className="font-semibold mb-1">
                            {option.label}
                          </Subheading>
                          <Body className="text-slate-600 text-sm">
                            {option.description}
                          </Body>
                        </div>
                        {isSelected && (
                          <CheckSquare className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Tracking Preferences */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <CheckSquare className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <Heading className="text-2xl font-bold mb-2">
                  What do you want to track?
                </Heading>
                <Body className="text-slate-600">
                  Select the metrics that matter for your {selectedGoal?.title.toLowerCase()} goal.
                </Body>
              </div>

              <div className="grid gap-3">
                {TRACKING_MODULES.map((module) => {
                  const isSelected = data.trackingModules.includes(module.id);
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleModuleToggle(module.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Subheading className="font-semibold mb-1">
                            {module.label}
                          </Subheading>
                          <Body className="text-slate-600 text-sm">
                            {module.description}
                          </Body>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-amber-500 border-amber-500' 
                            : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <CheckSquare className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <Body className="text-slate-600 text-sm">
                  <strong>Selected:</strong> {data.trackingModules.length} modules
                  {data.trackingModules.length > 0 && (
                    <span className="ml-2">
                      ({data.trackingModules.map(id => 
                        TRACKING_MODULES.find(m => m.id === id)?.label
                      ).join(', ')})
                    </span>
                  )}
                </Body>
              </div>

              {/* Referral Code Input - Only show if not already applied via URL */}
              {!referralApplied && (
                <div className="mt-6">
                  <ReferralCodeInput 
                    onCodeApplied={(success, message) => {
                      if (success) {
                        setReferralApplied(true);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex items-center bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? (
                'Setting up...'
              ) : currentStep === 3 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
