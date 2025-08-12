'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/TypographyWrapper';
import Button from '@/components/ui/Button';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  Heart, 
  Zap, 
  Moon, 
  Utensils,
  Trophy,
  Users,
  MessageCircle,
  Plus
} from 'lucide-react';

interface DashboardStats {
  streakDays: number;
  weeklyProgress: number;
  energyLevel: number;
  sleepQuality: number;
  workoutsThisWeek: number;
  caloriesLogged: boolean;
  todaysWins: string[];
  upcomingGoals: Array<{
    title: string;
    progress: number;
    dueDate: string;
  }>;
  recentAchievements: Array<{
    badge: string;
    title: string;
    earnedAt: string;
  }>;
  socialActivity: Array<{
    friend: string;
    activity: string;
    time: string;
  }>;
}

export default function UnifiedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    streakDays: 12,
    weeklyProgress: 78,
    energyLevel: 4,
    sleepQuality: 3,
    workoutsThisWeek: 4,
    caloriesLogged: true,
    todaysWins: [
      "Completed morning workout",
      "Hit protein target",
      "8 hours of sleep"
    ],
    upcomingGoals: [
      { title: "Bench Press 225lbs", progress: 85, dueDate: "2 weeks" },
      { title: "Run 5K under 25min", progress: 62, dueDate: "1 month" }
    ],
    recentAchievements: [
      { badge: "🔥", title: "7-Day Streak", earnedAt: "2 days ago" },
      { badge: "💪", title: "New PR", earnedAt: "1 week ago" }
    ],
    socialActivity: [
      { friend: "Mike", activity: "completed a 10K run", time: "2h ago" },
      { friend: "Sarah", activity: "hit a new deadlift PR", time: "4h ago" }
    ]
  });

  const [motivationalMessage, setMotivationalMessage] = useState("");

  useEffect(() => {
    // Generate contextual motivational message based on progress
    const messages = [
      `${stats.streakDays} days strong! Your consistency is building unstoppable momentum.`,
      `${stats.weeklyProgress}% weekly progress - you're crushing your targets.`,
      "Every rep, every meal, every choice matters. You're becoming the person you want to be.",
      "Progress isn&apos;t just numbers - it&apos;s the energy you feel, the confidence you carry."
    ];
    setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [stats]);

  const getEnergyColor = (level: number) => {
    if (level >= 4) return "text-green-500";
    if (level >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getSleepColor = (quality: number) => {
    if (quality >= 4) return "text-green-500";
    if (quality >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Hero Section - Motivation & Streak */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="h1" className="text-4xl font-bold mb-2">
              Day {stats.streakDays} 🔥
            </Typography>
            <Typography variant="body1" className="text-slate-300 text-lg">
              {motivationalMessage}
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="h3" className="text-2xl font-bold text-amber-400">
              {stats.weeklyProgress}%
            </Typography>
            <Typography variant="body2" className="text-slate-400">
              Weekly Progress
            </Typography>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Utensils className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Coach
          </Button>
        </div>
      </Card>

      {/* Today&apos;s Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Energy Level */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className={`w-8 h-8 ${getEnergyColor(stats.energyLevel)}`} />
            <Typography variant="h3" className={`text-2xl font-bold ${getEnergyColor(stats.energyLevel)}`}>
              {stats.energyLevel}/5
            </Typography>
          </div>
          <Typography variant="h4" className="font-semibold mb-1">Energy Level</Typography>
          <Typography variant="body2" className="text-slate-600">
            {stats.energyLevel >= 4 ? "Feeling great!" : stats.energyLevel >= 3 ? "Pretty good" : "Need rest"}
          </Typography>
        </Card>

        {/* Sleep Quality */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Moon className={`w-8 h-8 ${getSleepColor(stats.sleepQuality)}`} />
            <Typography variant="h3" className={`text-2xl font-bold ${getSleepColor(stats.sleepQuality)}`}>
              {stats.sleepQuality}/5
            </Typography>
          </div>
          <Typography variant="h4" className="font-semibold mb-1">Sleep Quality</Typography>
          <Typography variant="body2" className="text-slate-600">
            Last night's rest
          </Typography>
        </Card>

        {/* Workouts This Week */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-500" />
            <Typography variant="h3" className="text-2xl font-bold text-blue-500">
              {stats.workoutsThisWeek}
            </Typography>
          </div>
          <Typography variant="h4" className="font-semibold mb-1">Workouts</Typography>
          <Typography variant="body2" className="text-slate-600">
            This week
          </Typography>
        </Card>

        {/* Nutrition Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Utensils className={`w-8 h-8 ${stats.caloriesLogged ? 'text-green-500' : 'text-gray-400'}`} />
            <div className={`w-3 h-3 rounded-full ${stats.caloriesLogged ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          <Typography variant="h4" className="font-semibold mb-1">Nutrition</Typography>
          <Typography variant="body2" className="text-slate-600">
            {stats.caloriesLogged ? "Logged today" : "Not logged yet"}
          </Typography>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Wins */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Trophy className="w-6 h-6 text-amber-500 mr-2" />
            <Typography variant="h4" className="font-semibold">Today&apos;s Wins</Typography>
          </div>
          <div className="space-y-3">
            {stats.todaysWins.map((win, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Typography variant="body2">{win}</Typography>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Win
          </Button>
        </Card>

        {/* Goal Progress */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-500 mr-2" />
            <Typography variant="h4" className="font-semibold">Goal Progress</Typography>
          </div>
          <div className="space-y-4">
            {stats.upcomingGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body2" className="font-medium">{goal.title}</Typography>
                  <Typography variant="body2" className="text-slate-600">{goal.progress}%</Typography>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <Typography variant="body2" className="text-slate-500 text-sm mt-1">
                  Target: {goal.dueDate}
                </Typography>
              </div>
            ))}
          </div>
        </Card>

        {/* Social Activity */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-purple-500 mr-2" />
            <Typography variant="h4" className="font-semibold">Community</Typography>
          </div>
          <div className="space-y-3">
            {stats.socialActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Typography variant="body2" className="text-purple-600 font-semibold text-xs">
                    {activity.friend[0]}
                  </Typography>
                </div>
                <div className="flex-1">
                  <Typography variant="body2" className="text-sm">
                    <span className="font-medium">{activity.friend}</span> {activity.activity}
                  </Typography>
                  <Typography variant="body2" className="text-slate-500 text-xs">
                    {activity.time}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-purple-600">
            View All Activity
          </Button>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
          <Typography variant="h4" className="font-semibold">Recent Achievements</Typography>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stats.recentAchievements.map((achievement, index) => (
            <div key={index} className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 min-w-[200px]">
              <div className="text-2xl mb-2">{achievement.badge}</div>
              <Typography variant="body2" className="font-medium mb-1">{achievement.title}</Typography>
              <Typography variant="body2" className="text-slate-600 text-sm">{achievement.earnedAt}</Typography>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
