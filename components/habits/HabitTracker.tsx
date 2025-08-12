'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Flame,
  Target,
  CheckCircle,
  Circle,
  Plus,
  TrendingUp,
  Calendar,
  Trophy,
  Zap,
  Star,
  Award
} from 'lucide-react';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'wellness' | 'mindset';
  frequency: 'daily' | 'weekly';
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  completedDates: string[]; // Last 30 days
  color: string;
  icon: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlockedAt?: string;
  requirement: string;
}

const defaultHabits: Habit[] = [
  {
    id: '1',
    title: 'Morning Workout',
    description: 'Complete a 30+ minute workout',
    category: 'fitness',
    frequency: 'daily',
    currentStreak: 12,
    bestStreak: 28,
    completedToday: true,
    completedDates: Array.from({length: 12}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }),
    color: 'text-blue-600',
    icon: Target
  },
  {
    id: '2',
    title: 'Protein Goal',
    description: 'Hit daily protein target (150g)',
    category: 'nutrition',
    frequency: 'daily',
    currentStreak: 8,
    bestStreak: 15,
    completedToday: false,
    completedDates: Array.from({length: 8}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i - 1); // Skip today
      return date.toISOString().split('T')[0];
    }),
    color: 'text-green-600',
    icon: Zap
  },
  {
    id: '3',
    title: '8 Glasses of Water',
    description: 'Drink at least 2L of water',
    category: 'wellness',
    frequency: 'daily',
    currentStreak: 18,
    bestStreak: 32,
    completedToday: true,
    completedDates: Array.from({length: 18}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }),
    color: 'text-cyan-600',
    icon: Trophy
  },
  {
    id: '4',
    title: 'Quality Sleep',
    description: 'Get 7+ hours of sleep',
    category: 'wellness',
    frequency: 'daily',
    currentStreak: 5,
    bestStreak: 12,
    completedToday: false,
    completedDates: Array.from({length: 5}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i - 1);
      return date.toISOString().split('T')[0];
    }),
    color: 'text-purple-600',
    icon: Star
  }
];

const achievements: Achievement[] = [
  {
    id: 'first_week',
    title: 'First Week Strong',
    description: 'Complete any habit for 7 days in a row',
    icon: Award,
    color: 'text-yellow-600',
    requirement: '7-day streak',
    unlockedAt: '2025-01-28'
  },
  {
    id: 'workout_warrior',
    title: 'Workout Warrior',
    description: 'Complete 10 workouts in a row',
    icon: Trophy,
    color: 'text-red-600',
    requirement: '10 workout streak',
    unlockedAt: '2025-02-05'
  },
  {
    id: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Hit water goal for 14 days straight',
    icon: Star,
    color: 'text-blue-600',
    requirement: '14-day water streak'
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Maintain 4+ habits for 30 days',
    icon: Flame,
    color: 'text-orange-600',
    requirement: '30-day multi-habit streak'
  }
];

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [showAchievements, setShowAchievements] = useState(false);

  const toggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const today = new Date().toISOString().split('T')[0];
        const wasCompleted = habit.completedToday;
        
        let newCompletedDates = [...habit.completedDates];
        let newStreak = habit.currentStreak;
        
        if (!wasCompleted) {
          // Mark as completed
          newCompletedDates = [today, ...habit.completedDates];
          newStreak = habit.currentStreak + 1;
        } else {
          // Mark as incomplete
          newCompletedDates = habit.completedDates.filter(date => date !== today);
          newStreak = Math.max(0, habit.currentStreak - 1);
        }

        return {
          ...habit,
          completedToday: !wasCompleted,
          completedDates: newCompletedDates,
          currentStreak: newStreak,
          bestStreak: Math.max(habit.bestStreak, newStreak)
        };
      }
      return habit;
    }));
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-yellow-600';
    return 'text-slate-600';
  };

  const getCompletionRate = (habit: Habit) => {
    const period = selectedPeriod === 'week' ? 7 : 30;
    const recentDates = habit.completedDates.slice(0, period);
    return Math.round((recentDates.length / period) * 100);
  };

  const totalStreaks = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  const completedToday = habits.filter(h => h.completedToday).length;
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalStreaks}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Streak Days
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {completedToday}/{habits.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Completed Today
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h), 0) / habits.length)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Weekly Success Rate
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {unlockedAchievements}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Achievements Unlocked
          </div>
        </Card>
      </div>

      {/* Period Selector & Achievement Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Last 30 Days
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAchievements(!showAchievements)}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Achievements
        </Button>
      </div>

      {/* Achievements Panel */}
      {showAchievements && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            🏆 Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const isUnlocked = !!achievement.unlockedAt;
              
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    isUnlocked 
                      ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' 
                      : 'border-slate-200 bg-slate-50 dark:bg-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 ${isUnlocked ? achievement.color : 'text-slate-400'}`} />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {achievement.title}
                        {isUnlocked && <span className="ml-2">✓</span>}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {achievement.description}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.requirement}
                      </Badge>
                      {isUnlocked && (
                        <div className="text-xs text-green-600 mt-1">
                          Unlocked {achievement.unlockedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const Icon = habit.icon;
          const completionRate = getCompletionRate(habit);
          
          return (
            <Card key={habit.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {habit.completedToday ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-400" />
                    )}
                  </button>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {habit.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {habit.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Current Streak */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStreakColor(habit.currentStreak)}`}>
                      {habit.currentStreak}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Current
                    </div>
                  </div>
                  
                  {/* Best Streak */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                      {habit.bestStreak}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Best
                    </div>
                  </div>
                  
                  {/* Completion Rate */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                      {completionRate}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedPeriod === 'week' ? '7-day' : '30-day'} rate
                    </div>
                  </div>
                  
                  <Badge className={`${
                    habit.category === 'fitness' ? 'bg-blue-100 text-blue-800' :
                    habit.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                    habit.category === 'wellness' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {habit.category}
                  </Badge>
                </div>
              </div>
              
              {/* Visual Calendar */}
              <div className="flex gap-1 overflow-x-auto">
                {Array.from({length: selectedPeriod === 'week' ? 7 : 30}, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  const dateStr = date.toISOString().split('T')[0];
                  const isCompleted = habit.completedDates.includes(dateStr);
                  const isToday = i === 0;
                  
                  return (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-sm ${
                        isCompleted
                          ? 'bg-green-500'
                          : isToday && habit.completedToday
                          ? 'bg-green-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      } ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={date.toLocaleDateString()}
                    />
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add New Habit Button */}
      <Card className="p-6">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Habit
        </Button>
      </Card>
    </div>
  );
}