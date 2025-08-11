'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Zap,
  Clock,
  Calendar,
  Sun,
  Moon,
  Sunrise
} from 'lucide-react';

interface MotivationStepProps {
  profile: any;
  updateProfile: (updates: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const motivationStyles = [
  {
    id: 'competition',
    title: 'Competition & Challenges',
    description: 'I thrive on beating others and achieving goals',
    icon: Trophy,
    color: 'text-yellow-600',
    examples: ['Leaderboards', 'Challenges', 'Personal records']
  },
  {
    id: 'community',
    title: 'Social Support',
    description: 'I need encouragement and accountability from others',
    icon: Users,
    color: 'text-blue-600',
    examples: ['Workout buddies', 'Group challenges', 'Progress sharing']
  },
  {
    id: 'progress',
    title: 'Data & Progress',
    description: 'I love seeing numbers improve and tracking metrics',
    icon: TrendingUp,
    color: 'text-green-600',
    examples: ['Detailed analytics', 'Progress charts', 'Achievement badges']
  },
  {
    id: 'intrinsic',
    title: 'Personal Growth',
    description: 'I\'m motivated by how I feel and personal development',
    icon: Brain,
    color: 'text-purple-600',
    examples: ['Mindfulness integration', 'Energy tracking', 'Mood analysis']
  },
  {
    id: 'variety',
    title: 'Variety & Fun',
    description: 'I need changing routines and enjoyable activities',
    icon: Zap,
    color: 'text-orange-600',
    examples: ['Diverse workouts', 'Game-like features', 'Surprise challenges']
  },
  {
    id: 'routine',
    title: 'Structure & Consistency',
    description: 'I prefer predictable schedules and clear plans',
    icon: Calendar,
    color: 'text-indigo-600',
    examples: ['Scheduled workouts', 'Habit tracking', 'Clear progressions']
  }
];

const workoutTimes = [
  { id: 'early_morning', label: 'Early Morning', time: '5:00-7:00 AM', icon: Sunrise },
  { id: 'morning', label: 'Morning', time: '7:00-10:00 AM', icon: Sun },
  { id: 'lunch', label: 'Lunch Break', time: '11:00 AM-2:00 PM', icon: Clock },
  { id: 'afternoon', label: 'Afternoon', time: '2:00-6:00 PM', icon: Sun },
  { id: 'evening', label: 'Evening', time: '6:00-9:00 PM', icon: Moon },
  { id: 'flexible', label: 'Flexible', time: 'Changes daily', icon: Zap }
];

const accountabilityTypes = [
  {
    id: 'self_directed',
    title: 'Self-Directed',
    description: 'I prefer to work independently and self-monitor'
  },
  {
    id: 'peer_support',
    title: 'Peer Support',
    description: 'I work best with workout partners or small groups'
  },
  {
    id: 'coach_guidance',
    title: 'Expert Guidance',
    description: 'I want regular check-ins with fitness professionals'
  },
  {
    id: 'community_driven',
    title: 'Community Driven',
    description: 'I thrive in large groups and social environments'
  }
];

export function MotivationStep({ profile, updateProfile, onNext, onPrev }: MotivationStepProps) {
  const handleMotivationStyle = (style: string) => {
    const current = profile.motivationStyles || [];
    const updated = current.includes(style)
      ? current.filter((s: string) => s !== style)
      : [...current, style];
    updateProfile({ motivationStyles: updated });
  };

  const handleWorkoutTime = (time: string) => {
    updateProfile({ preferredWorkoutTime: time });
  };

  const handleAccountability = (type: string) => {
    updateProfile({ accountabilityPreference: type });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          What motivates you?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Understanding your motivation style helps us create the perfect experience for you
        </p>
      </div>

      <Card className="p-8 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          Motivation Style (Select all that apply)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {motivationStyles.map((style) => {
            const Icon = style.icon;
            const isSelected = profile.motivationStyles?.includes(style.id);
            
            return (
              <button
                key={style.id}
                onClick={() => handleMotivationStyle(style.id)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`h-6 w-6 ${style.color} flex-shrink-0 mt-1`} />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {style.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {style.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {style.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          When do you prefer to work out?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {workoutTimes.map((time) => {
            const Icon = time.icon;
            return (
              <button
                key={time.id}
                onClick={() => handleWorkoutTime(time.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  profile.preferredWorkoutTime === time.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-3 text-slate-600" />
                <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                  {time.label}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {time.time}
                </div>
              </button>
            );
          })}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          What type of accountability works best for you?
        </h3>
        <div className="space-y-4">
          {accountabilityTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleAccountability(type.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                profile.accountabilityPreference === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {type.title}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {profile.motivationStyles?.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Your Motivation Profile
            </h4>
          </div>
          <p className="text-slate-700 dark:text-slate-300">
            Based on your selections, we&apos;ll emphasize{' '}
            <strong>
              {profile.motivationStyles?.slice(0, 2).map((style: string) => 
                motivationStyles.find(s => s.id === style)?.title
              ).join(' and ')}
            </strong>{' '}
            in your experience. We'll include features like leaderboards, progress analytics, 
            and community challenges to keep you engaged.
          </p>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!profile.motivationStyles?.length || !profile.preferredWorkoutTime || !profile.accountabilityPreference}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}