'use client';

import { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  Download
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample progress data
const monthlyProgress = [
  { month: 'Jan', workouts: 18, calories: 12500, hours: 24 },
  { month: 'Feb', workouts: 22, calories: 15200, hours: 30 },
  { month: 'Mar', workouts: 20, calories: 14100, hours: 28 },
  { month: 'Apr', workouts: 24, calories: 16800, hours: 32 },
  { month: 'May', workouts: 26, calories: 18200, hours: 35 },
  { month: 'Jun', workouts: 28, calories: 19600, hours: 38 },
];

const goals = [
  { id: 1, name: 'Monthly Workouts', target: 30, current: 22, unit: 'sessions' },
  { id: 2, name: 'Weekly Tennis', target: 3, current: 2, unit: 'matches' },
  { id: 3, name: 'Running Distance', target: 50, current: 38, unit: 'km' },
  { id: 4, name: 'Strength Sessions', target: 8, current: 6, unit: 'workouts' },
];

const achievements = [
  { id: 1, name: '30-Day Streak', icon: Trophy, earned: true, date: '2024-01-15' },
  { id: 2, name: 'Calorie Crusher', icon: Zap, earned: true, date: '2024-01-10' },
  { id: 3, name: 'Tennis Champion', icon: Target, earned: false, progress: 80 },
  { id: 4, name: 'Marathon Ready', icon: TrendingUp, earned: false, progress: 60 },
];

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-title font-black text-white mb-2">
              Your <span className="text-feel-primary lightning-text">Progress</span>
            </h1>
            <p className="text-sharpened-light-gray font-body">
              Track your fitness journey and celebrate achievements
            </p>
          </div>
          <button className="sharp-button px-6 py-3 bg-gradient-to-r from-feel-primary to-feel-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8">
        {['week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-6 py-2 font-body font-semibold capitalize transition-all ${
              selectedPeriod === period
                ? 'bg-feel-primary text-white'
                : 'bg-sharpened-charcoal/50 text-sharpened-light-gray hover:text-white'
            }`}
            style={{ 
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="mb-8">
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
             }}>
          <h2 className="text-2xl font-title font-bold text-white mb-6">6-Month Overview</h2>
          
          {/* Simple Bar Chart Visualization */}
          <div className="space-y-4">
            {monthlyProgress.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <span className="w-12 text-sharpened-gray font-body text-sm">{month.month}</span>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 bg-sharpened-void/50 h-8 relative overflow-hidden"
                       style={{ 
                         clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                       }}>
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-feel-primary to-feel-secondary"
                      style={{ width: `${(month.workouts / 30) * 100}%` }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-body font-semibold text-white">
                      {month.workouts} workouts
                    </span>
                  </div>
                  <span className="text-feel-primary font-title font-bold">{month.hours}h</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-sharpened-charcoal">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-title font-bold text-feel-primary">+45%</div>
                <div className="text-sm text-sharpened-gray font-body">Workout Frequency</div>
              </div>
              <div>
                <div className="text-2xl font-title font-bold text-feel-secondary">+32%</div>
                <div className="text-sm text-sharpened-gray font-body">Total Duration</div>
              </div>
              <div>
                <div className="text-2xl font-title font-bold text-feel-accent">+28%</div>
                <div className="text-sm text-sharpened-gray font-body">Calories Burned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-title font-bold text-white mb-4">Current Goals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percentage = Math.round((goal.current / goal.target) * 100);
            return (
              <div
                key={goal.id}
                className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-4 hover:border-feel-primary/30 transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-body font-semibold text-white">{goal.name}</h3>
                  <span className="text-feel-primary font-title font-bold">{percentage}%</span>
                </div>
                
                <div className="bg-sharpened-void/50 h-3 mb-2 overflow-hidden"
                     style={{ 
                       clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))'
                     }}>
                  <div 
                    className="h-full bg-gradient-to-r from-feel-primary to-feel-secondary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sharpened-gray font-body">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  {percentage >= 100 && (
                    <span className="text-green-400 font-body font-semibold">Complete!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-title font-bold text-white">Achievements</h2>
          <button className="text-feel-primary hover:text-feel-secondary transition-colors flex items-center gap-1 text-sm font-body">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative bg-sharpened-coal/30 backdrop-blur-sm border p-4 text-center group hover:border-feel-primary/30 transition-all ${
                achievement.earned ? 'border-feel-primary/50' : 'border-sharpened-charcoal'
              }`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
              }}
            >
              {achievement.earned && (
                <div className="absolute top-2 right-2">
                  <LightningLogo className="w-4 h-4 text-feel-primary" />
                </div>
              )}
              
              <div className={`inline-flex items-center justify-center w-16 h-16 mb-3 ${
                achievement.earned ? 'bg-feel-primary/20 text-feel-primary' : 'bg-sharpened-void/50 text-sharpened-gray'
              }`}
                   style={{ 
                     clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                   }}>
                <achievement.icon className="w-8 h-8" />
              </div>
              
              <h3 className={`font-body font-semibold text-sm mb-1 ${
                achievement.earned ? 'text-white' : 'text-sharpened-gray'
              }`}>
                {achievement.name}
              </h3>
              
              {achievement.earned ? (
                <p className="text-xs text-feel-primary font-body">{achievement.date}</p>
              ) : (
                <div className="mt-2">
                  <div className="bg-sharpened-void/50 h-1 mb-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-feel-primary/50 to-feel-secondary/50"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-sharpened-gray font-body">{achievement.progress}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}