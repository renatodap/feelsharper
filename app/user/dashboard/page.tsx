'use client';

import { useState } from 'react';
import { 
  Mic, 
  Zap, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  ChevronRight,
  Plus
} from 'lucide-react';

// Lightning Logo Component
const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample data
const recentActivities = [
  { id: 1, type: 'Tennis', duration: '90 min', time: '2 hours ago', calories: 650 },
  { id: 2, type: 'Gym', duration: '60 min', time: '1 day ago', calories: 450 },
  { id: 3, type: 'Running', duration: '30 min', time: '2 days ago', calories: 320 },
];

const weeklyStats = {
  workouts: 5,
  totalTime: '6h 30m',
  calories: 2850,
  streak: 12,
};

export default function DashboardPage() {
  const [voiceInput, setVoiceInput] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-title font-black text-white mb-2">
          Welcome Back, <span className="text-feel-primary lightning-text">Athlete</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Your performance dashboard • Track, analyze, improve
        </p>
      </div>

      {/* Quick Voice Input */}
      <div className="mb-8">
        <div 
          className="relative bg-sharpened-coal/50 backdrop-blur-sm border border-feel-primary/30 p-6 overflow-hidden sharp-container"
        >
          {/* Lightning accent in corner */}
          <div className="absolute top-0 right-0 opacity-10">
            <LightningLogo className="w-24 h-24 text-feel-primary" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Mic className="w-6 h-6 text-feel-primary" />
                <div className="absolute inset-0 bg-feel-primary/40 blur-xl scale-150 animate-pulse" />
              </div>
              <h2 className="text-xl font-title font-bold text-white">Quick Log</h2>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder="Just finished 90 minutes of tennis..."
                className="flex-1 px-4 py-3 bg-sharpened-void/50 border border-sharpened-charcoal text-white placeholder-sharpened-gray font-body focus:outline-none focus:border-feel-primary/50 transition-colors"
                style={{ 
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}
              />
              <button className="sharp-button px-6 py-3 bg-gradient-to-r from-feel-primary to-feel-secondary">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workouts', value: weeklyStats.workouts, icon: Zap, color: 'text-feel-primary' },
          { label: 'Total Time', value: weeklyStats.totalTime, icon: Calendar, color: 'text-feel-secondary' },
          { label: 'Calories', value: weeklyStats.calories.toLocaleString(), icon: TrendingUp, color: 'text-feel-accent' },
          { label: 'Day Streak', value: weeklyStats.streak, icon: Award, color: 'text-yellow-400' },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6 group hover:border-feel-primary/30 transition-all"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
            }}
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-feel-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sharpened-gray text-sm font-body">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-title font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-title font-bold text-white">Recent Activities</h2>
            <button className="text-feel-primary hover:text-feel-secondary transition-colors flex items-center gap-1 text-sm font-body">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-4 hover:border-feel-primary/30 transition-all group"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Zap className="w-5 h-5 text-feel-primary" />
                      <div className="absolute inset-0 bg-feel-primary/40 blur-sm scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <div className="font-body font-semibold text-white">{activity.type}</div>
                      <div className="text-sm text-sharpened-gray">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-title font-bold text-feel-primary">{activity.duration}</div>
                    <div className="text-sm text-sharpened-gray">{activity.calories} cal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Graph Placeholder */}
        <div>
          <h2 className="text-2xl font-title font-bold text-white mb-4">This Week's Performance</h2>
          <div 
            className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-8 h-64 flex items-center justify-center"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
            }}
          >
            <div className="text-center">
              <LightningLogo className="w-16 h-16 text-feel-primary/30 mx-auto mb-4" />
              <p className="text-sharpened-gray font-body">Performance graph coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Banner */}
      <div className="mt-8">
        <div 
          className="relative bg-gradient-to-r from-feel-primary/20 to-feel-secondary/20 backdrop-blur-sm border border-feel-primary/30 p-6 overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
          }}
        >
          <div className="absolute top-0 right-0 opacity-5">
            <LightningLogo className="w-48 h-48 text-feel-primary transform rotate-12" />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-feel-primary" />
                <h3 className="text-2xl font-title font-bold text-white">Keep the momentum!</h3>
              </div>
              <p className="text-sharpened-light-gray font-body">
                You're on a 12-day streak. Complete today's workout to keep it going!
              </p>
            </div>
            <Target className="w-16 h-16 text-feel-primary/30" />
          </div>
        </div>
      </div>
    </div>
  );
}