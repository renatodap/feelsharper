'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Dumbbell, 
  Utensils, 
  Target, 
  TrendingUp,
  Moon,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';

interface CoachCommandsProps {
  onCommandSelect: (command: string) => void;
}

export function CoachCommands({ onCommandSelect }: CoachCommandsProps) {
  const commandCategories = [
    {
      title: 'Training',
      icon: Dumbbell,
      color: 'text-blue-600',
      commands: [
        {
          title: 'Create Plan',
          description: 'Generate a personalized workout program',
          command: 'create_plan(goal: muscle_gain, experience: intermediate, days_per_week: 4)',
          shortcut: 'Create a 4-day muscle building program for an intermediate lifter'
        },
        {
          title: 'Adjust Difficulty',
          description: 'Modify current program intensity',
          command: 'adjust_plan(feedback: too_easy, focus: upper_body)',
          shortcut: 'My current program feels too easy, especially for upper body'
        },
        {
          title: 'Form Check',
          description: 'Get technique advice for exercises',
          command: 'form_check(exercise: squat, issue: knee_cave)',
          shortcut: 'Help me fix knee valgus in my squat'
        }
      ]
    },
    {
      title: 'Nutrition',
      icon: Utensils,
      color: 'text-green-600',
      commands: [
        {
          title: 'Optimize Macros',
          description: 'Adjust macro ratios for your goals',
          command: 'optimize_nutrition(goal: fat_loss, activity_level: high)',
          shortcut: 'Optimize my macros for fat loss with high training volume'
        },
        {
          title: 'Meal Timing',
          description: 'Get pre/post workout nutrition advice',
          command: 'meal_timing(workout_time: morning, duration: 90min)',
          shortcut: 'What should I eat before and after my 90-minute morning workouts?'
        },
        {
          title: 'Supplement Stack',
          description: 'Personalized supplement recommendations',
          command: 'supplement_advice(goal: recovery, budget: moderate)',
          shortcut: 'Recommend supplements to improve recovery on a moderate budget'
        }
      ]
    },
    {
      title: 'Progress',
      icon: TrendingUp,
      color: 'text-purple-600',
      commands: [
        {
          title: 'Analyze Week',
          description: 'Review recent performance data',
          command: 'analyze_week(focus: strength_gains)',
          shortcut: 'Analyze my strength progress from this week'
        },
        {
          title: 'Plateau Fix',
          description: 'Break through training plateaus',
          command: 'plateau_solution(exercise: bench_press, stuck_weeks: 3)',
          shortcut: 'I\'ve been stuck at the same bench press weight for 3 weeks'
        },
        {
          title: 'Goal Tracking',
          description: 'Monitor progress toward objectives',
          command: 'goal_progress(target: 1.5x_bodyweight_squat)',
          shortcut: 'How close am I to squatting 1.5x my bodyweight?'
        }
      ]
    },
    {
      title: 'Recovery',
      icon: Moon,
      color: 'text-indigo-600',
      commands: [
        {
          title: 'Sleep Optimization',
          description: 'Improve sleep quality and duration',
          command: 'sleep_advice(avg_hours: 6.5, quality: poor)',
          shortcut: 'I only get 6.5 hours of poor quality sleep, help me improve it'
        },
        {
          title: 'Stress Management',
          description: 'Balance training with life stress',
          command: 'stress_recovery(work_stress: high, sleep: limited)',
          shortcut: 'How do I balance training with high work stress and limited sleep?'
        },
        {
          title: 'Active Recovery',
          description: 'Plan effective rest day activities',
          command: 'active_recovery(soreness_level: moderate)',
          shortcut: 'What should I do on rest days when I\'m moderately sore?'
        }
      ]
    }
  ];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Coach Commands
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Quick access to specialized coaching functions
        </p>
      </div>

      <div className="space-y-4">
        {commandCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.title}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${category.color}`} />
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {category.title}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {category.commands.length}
                </Badge>
              </div>
              
              <div className="space-y-2 ml-6">
                {category.commands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => onCommandSelect(command.shortcut)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {command.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {command.description}
                        </div>
                      </div>
                      <Zap className="h-3 w-3 text-slate-400 flex-shrink-0 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCommandSelect('Show me today\'s workout')}
            className="justify-start text-xs"
          >
            <Activity className="h-3 w-3 mr-2" />
            Today's Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCommandSelect('Review my weekly progress')}
            className="justify-start text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-2" />
            Weekly Review
          </Button>
        </div>
      </div>
    </Card>
  );
}