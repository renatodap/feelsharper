'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Target, 
  ArrowRight, 
  ArrowLeft,
  TrendingUp,
  Heart,
  Zap,
  Trophy,
  Scale,
  Dumbbell
} from 'lucide-react';

interface GoalsStepProps {
  profile: any;
  updateProfile: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const primaryGoals = [
  {
    id: 'weight_loss',
    title: 'Lose Weight',
    description: 'Burn fat and achieve a leaner physique',
    icon: Scale,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    id: 'muscle_gain',
    title: 'Build Muscle',
    description: 'Increase strength and muscle mass',
    icon: Dumbbell,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'general_fitness',
    title: 'Get Fit',
    description: 'Improve overall health and energy',
    icon: Heart,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    id: 'athletic_performance',
    title: 'Athletic Performance',
    description: 'Excel in sports and competition',
    icon: Trophy,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    id: 'endurance',
    title: 'Build Endurance',
    description: 'Improve cardiovascular fitness',
    icon: Zap,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  {
    id: 'strength',
    title: 'Get Stronger',
    description: 'Maximize power and lifting performance',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  }
];

const secondaryGoals = [
  'Better sleep quality',
  'Stress management',
  'Improved confidence',
  'More energy',
  'Better posture',
  'Pain reduction',
  'Flexibility improvement',
  'Social connections',
  'Habit building',
  'Mental clarity'
];

const timelines = [
  { id: '3_months', label: '3 Months', description: 'Quick transformation' },
  { id: '6_months', label: '6 Months', description: 'Sustainable progress' },
  { id: '1_year', label: '1 Year', description: 'Major lifestyle change' },
  { id: 'ongoing', label: 'Ongoing', description: 'Long-term commitment' }
];

export function GoalsStep({ profile, updateProfile, onNext, onPrev }: GoalsStepProps) {
  const handlePrimaryGoal = (goalId: string) => {
    updateProfile({ primaryGoal: goalId });
  };

  const handleSecondaryGoals = (goal: string) => {
    const current = profile.secondaryGoals || [];
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    updateProfile({ secondaryGoals: updated });
  };

  const handleTimeline = (timeline: string) => {
    updateProfile({ targetTimeline: timeline });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          What's your main goal?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We'll design your program around your primary objective
        </p>
      </div>

      <Card className="p-8 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Primary Goal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {primaryGoals.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => handlePrimaryGoal(goal.id)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  profile.primaryGoal === goal.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${goal.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${goal.color}`} />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {goal.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {goal.description}
                </p>
              </button>
            );
          })}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Secondary Goals (Select all that apply)
        </h3>
        <div className="flex flex-wrap gap-3 mb-8">
          {secondaryGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => handleSecondaryGoals(goal)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                profile.secondaryGoals?.includes(goal)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          What's your timeline?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timelines.map((timeline) => (
            <button
              key={timeline.id}
              onClick={() => handleTimeline(timeline.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                profile.targetTimeline === timeline.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {timeline.label}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {timeline.description}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!profile.primaryGoal || !profile.targetTimeline}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}