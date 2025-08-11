'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Flame, Trophy, Target } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'Elite', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (days >= 21) return { level: 'Champion', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (days >= 14) return { level: 'Warrior', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (days >= 7) return { level: 'Committed', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Building', color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const getNextMilestone = (days: number) => {
    if (days < 7) return { target: 7, label: '7-day streak' };
    if (days < 14) return { target: 14, label: '2-week warrior' };
    if (days < 21) return { target: 21, label: '21-day champion' };
    if (days < 30) return { target: 30, label: '30-day elite' };
    if (days < 50) return { target: 50, label: '50-day legend' };
    if (days < 100) return { target: 100, label: '100-day master' };
    return { target: days + 30, label: 'Next milestone' };
  };

  const streakLevel = getStreakLevel(streak);
  const nextMilestone = getNextMilestone(streak);
  const progress = (streak / nextMilestone.target) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Consistency Streak
        </h3>
        <Badge 
          className={`${streakLevel.bg} ${streakLevel.color} border-0`}
        >
          {streakLevel.level}
        </Badge>
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="h-8 w-8 text-orange-500" />
          <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            {streak}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          days of consistent action
        </p>
      </div>

      {/* Progress to Next Milestone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-600" />
            <span className="text-slate-600 dark:text-slate-400">
              Next: {nextMilestone.label}
            </span>
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {streak}/{nextMilestone.target}
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {nextMilestone.target - streak} days to go
        </div>
      </div>

      {/* Motivation Message */}
      <div className="mt-6 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
        {streak >= 30 ? (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-purple-600" />
            <span className="text-slate-700 dark:text-slate-300">
              Elite status! You're in the top 1% of users. 🏆
            </span>
          </div>
        ) : streak >= 7 ? (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            💪 You've built a solid habit! Keep this momentum going.
          </div>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            🌱 Every day counts. You&apos;re building something great!
          </div>
        )}
      </div>

      {/* Weekly Calendar Visual */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">This Week</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const isActive = i < (streak % 7) || streak >= 7;
            return (
              <div
                key={i}
                className={`h-6 rounded text-xs flex items-center justify-center font-medium ${
                  isActive 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}