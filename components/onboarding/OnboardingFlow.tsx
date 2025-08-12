"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Target, Dumbbell, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type GoalType = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health' | 'sport_specific' | 'marathon';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type UnitWeight = 'kg' | 'lb';
type UnitDistance = 'km' | 'mi';

interface OnboardingData {
  goalType: GoalType | null;
  experience: ExperienceLevel | null;
  unitsWeight: UnitWeight;
  unitsDistance: UnitDistance;
  targetWeight?: number;
  targetDate?: string;
  constraints: {
    injuries: string[];
    timeConstraints: string[];
    equipment: string[];
    dietaryRestrictions: string[];
  };
  dashboardPreferences: {
    showWeight: boolean;
    showWorkouts: boolean;
    showNutrition: boolean;
    showSleep: boolean;
    showProgress: boolean;
  };
}

const goals = [
  { id: 'weight_loss', label: 'Lose Weight', icon: Target, description: 'Burn fat and reach your target weight' },
  { id: 'muscle_gain', label: 'Build Muscle', icon: Dumbbell, description: 'Gain strength and muscle mass' },
  { id: 'endurance', label: 'Improve Endurance', icon: Heart, description: 'Build cardiovascular fitness' },
  { id: 'general_health', label: 'General Health', icon: Zap, description: 'Overall wellness and vitality' },
  { id: 'sport_specific', label: 'Sport Performance', icon: Target, description: 'Train for specific sports' },
  { id: 'marathon', label: 'Marathon Training', icon: Heart, description: 'Prepare for long-distance running' },
] as const;

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness or getting back into it' },
  { id: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine, some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced athlete or fitness enthusiast' },
] as const;

const constraintOptions = {
  injuries: ['Lower back', 'Knee', 'Shoulder', 'Ankle', 'Wrist', 'Hip', 'Neck'],
  timeConstraints: ['Very busy (15-30 min)', 'Moderate time (30-60 min)', 'Flexible schedule (60+ min)'],
  equipment: ['Home gym', 'Commercial gym', 'Bodyweight only', 'Minimal equipment'],
  dietaryRestrictions: ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free'],
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goalType: null,
    experience: null,
    unitsWeight: 'kg',
    unitsDistance: 'km',
    constraints: {
      injuries: [],
      timeConstraints: [],
      equipment: [],
      dietaryRestrictions: [],
    },
    dashboardPreferences: {
      showWeight: true,
      showWorkouts: true,
      showNutrition: true,
      showSleep: true,
      showProgress: true,
    },
  });

  const steps = [
    { title: 'Welcome to Feel Sharper', subtitle: 'Let\'s personalize your experience' },
    { title: 'What\'s your main goal?', subtitle: 'Choose your primary focus' },
    { title: 'Experience level?', subtitle: 'Help us tailor your programs' },
    { title: 'Units & preferences', subtitle: 'Set your measurement preferences' },
    { title: 'Any constraints?', subtitle: 'Let us know about limitations' },
    { title: 'Customize your dashboard', subtitle: 'Choose what you want to track' },
    { title: 'You\'re all set!', subtitle: 'Ready to start your journey' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConstraintToggle = (category: keyof typeof constraintOptions, value: string) => {
    setData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [category]: prev.constraints[category].includes(value)
          ? prev.constraints[category].filter(item => item !== value)
          : [...prev.constraints[category], value],
      },
    }));
  };

  const handleDashboardToggle = (key: keyof OnboardingData['dashboardPreferences']) => {
    setData(prev => ({
      ...prev,
      dashboardPreferences: {
        ...prev.dashboardPreferences,
        [key]: !prev.dashboardPreferences[key],
      },
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Update profile
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          goal_type: data.goalType,
          experience: data.experience,
          units_weight: data.unitsWeight,
          units_distance: data.unitsDistance,
          constraints_json: data.constraints,
        });

      // Create goal if target weight is set
      if (data.targetWeight && data.goalType) {
        await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            type: data.goalType,
            target_value: data.targetWeight,
            target_date: data.targetDate || null,
            metrics: { dashboard_preferences: data.dashboardPreferences },
          });
      }

      // Create settings
      await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          theme: 'system',
          notifications: { email: true, push: false },
        });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.goalType !== null;
      case 2: return data.experience !== null;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  We'll ask you a few questions to personalize your experience and help you achieve your goals faster.
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map(({ id, label, icon: Icon, description }) => (
                  <button
                    key={id}
                    onClick={() => setData(prev => ({ ...prev, goalType: id as GoalType }))}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                      data.goalType === id
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6 mb-2",
                      data.goalType === id ? "text-amber-600" : "text-slate-400"
                    )} />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{label}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <RadioGroup
                value={data.experience || ''}
                onValueChange={(value) => setData(prev => ({ ...prev, experience: value as ExperienceLevel }))}
                className="space-y-4"
              >
                {experienceLevels.map(({ id, label, description }) => (
                  <div key={id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value={id} id={id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={id} className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                        {label}
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Weight Units
                    </Label>
                    <RadioGroup
                      value={data.unitsWeight}
                      onValueChange={(value) => setData(prev => ({ ...prev, unitsWeight: value as UnitWeight }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kg" id="kg" />
                        <Label htmlFor="kg">Kilograms</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lb" id="lb" />
                        <Label htmlFor="lb">Pounds</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Distance Units
                    </Label>
                    <RadioGroup
                      value={data.unitsDistance}
                      onValueChange={(value) => setData(prev => ({ ...prev, unitsDistance: value as UnitDistance }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="km" id="km" />
                        <Label htmlFor="km">Kilometers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mi" id="mi" />
                        <Label htmlFor="mi">Miles</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {(data.goalType === 'weight_loss' || data.goalType === 'muscle_gain') && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="targetWeight" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Target Weight ({data.unitsWeight})
                      </Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        placeholder={`Enter target weight in ${data.unitsWeight}`}
                        value={data.targetWeight || ''}
                        onChange={(e) => setData(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) || undefined }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Target Date (Optional)
                      </Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={data.targetDate || ''}
                        onChange={(e) => setData(prev => ({ ...prev, targetDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                {Object.entries(constraintOptions).map(([category, options]) => (
                  <div key={category}>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block capitalize">
                      {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${category}-${option}`}
                            checked={data.constraints[category as keyof typeof constraintOptions].includes(option)}
                            onCheckedChange={() => handleConstraintToggle(category as keyof typeof constraintOptions, option)}
                          />
                          <Label htmlFor={`${category}-${option}`} className="text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Choose which metrics you want to see on your dashboard:
                </p>
                {Object.entries(data.dashboardPreferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <Label htmlFor={key} className="font-medium capitalize cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace('show', '').trim()}
                    </Label>
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={() => handleDashboardToggle(key as keyof OnboardingData['dashboardPreferences'])}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStep === 6 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Perfect! Your personalized dashboard is ready. Let's start tracking your progress and achieving your goals.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700"
              >
                <span>{isLoading ? 'Setting up...' : 'Complete Setup'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
