'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Dumbbell, 
  Utensils, 
  Moon, 
  Scale, 
  Timer,
  MessageSquare,
  TrendingUp,
  Camera,
  Users,
  Target
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      icon: Dumbbell,
      label: 'Log Workout',
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
      href: '/log/workout'
    },
    {
      icon: Utensils,
      label: 'Log Meal',
      color: 'text-green-600',
      bg: 'bg-green-50 hover:bg-green-100',
      href: '/log/meal'
    },
    {
      icon: Moon,
      label: 'Log Sleep',
      color: 'text-purple-600',
      bg: 'bg-purple-50 hover:bg-purple-100',
      href: '/log/sleep'
    },
    {
      icon: Scale,
      label: 'Weigh In',
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100',
      href: '/log/weight'
    },
    {
      icon: Timer,
      label: 'Start Timer',
      color: 'text-red-600',
      bg: 'bg-red-50 hover:bg-red-100',
      href: '/timer'
    },
    {
      icon: MessageSquare,
      label: 'Ask Coach',
      color: 'text-brand-amber',
      bg: 'bg-amber-50 hover:bg-amber-100',
      href: '/coach'
    },
    {
      icon: TrendingUp,
      label: 'View Analytics',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      href: '/analytics'
    },
    {
      icon: Camera,
      label: 'Progress Photo',
      color: 'text-pink-600',
      bg: 'bg-pink-50 hover:bg-pink-100',
      href: '/progress/photo'
    },
    {
      icon: Users,
      label: 'Community',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 hover:bg-cyan-100',
      href: '/community'
    },
    {
      icon: Target,
      label: 'Habit Tracker',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      href: '/habits'
    }
  ];

  const handleAction = (href: string) => {
    // For now, just navigate. In production, some actions might be modals
    window.location.href = href;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Log data, start activities
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={() => handleAction(action.href)}
              className={`h-auto flex flex-col items-center gap-2 p-3 ${action.bg} ${action.color} border-0`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium leading-tight text-center">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Recently Used */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Recently Used
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('/log/workout')}
            className="flex-1 text-xs"
          >
            <Dumbbell className="h-3 w-3 mr-1" />
            Workout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('/log/meal')}
            className="flex-1 text-xs"
          >
            <Utensils className="h-3 w-3 mr-1" />
            Meal
          </Button>
        </div>
      </div>
    </Card>
  );
}