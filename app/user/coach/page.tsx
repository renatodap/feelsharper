'use client';

import { useState } from 'react';
import { 
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Award,
  Users,
  Flame,
  ChevronRight
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample data for AI Coach Dashboard
const todaysMission = {
  title: "Complete Your Evening Workout",
  description: "A healthy person like you maintains consistency. Your usual 6 PM session awaits.",
  identity: "You're an athlete who never misses a scheduled workout",
  reward: "+50 XP on completion"
};

const topInsights = [
  {
    id: 1,
    type: 'achievement',
    title: "12-Day Streak! 🔥",
    message: "You're in the top 5% of consistent athletes",
    celebration: true
  },
  {
    id: 2,
    type: 'insight',
    title: "Peak Performance Window",
    message: "Your best workouts happen between 4-6 PM",
    actionable: true
  },
  {
    id: 3,
    type: 'progress',
    title: "Goal Within Reach",
    message: "2 more workouts to hit your weekly target",
    proximity: 80
  }
];

const communityAchievements = [
  { name: "Sarah K.", achievement: "30-day streak", time: "2 hours ago" },
  { name: "Mike T.", achievement: "First 5K run", time: "4 hours ago" },
  { name: "Alex R.", achievement: "100 workouts", time: "1 day ago" }
];

export default function AICoachDashboard() {
  const [streak, setStreak] = useState(12);
  const [level, setLevel] = useState(8);
  const [xp, setXp] = useState(2450);
  const [nextLevelXp] = useState(3000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-white mb-2">
          AI Coach <span className="text-feel-primary lightning-text">Dashboard</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Your personalized habit formation center
        </p>
      </div>

      {/* Today's Mission - Identity Reinforcement */}
      <div className="mb-8">
        <div 
          className="relative bg-gradient-to-r from-feel-primary/20 to-feel-secondary/20 backdrop-blur-sm border border-feel-primary/30 p-6 overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
          }}
        >
          {/* Lightning accent */}
          <div className="absolute top-0 right-0 opacity-10">
            <LightningLogo className="w-32 h-32 text-feel-primary" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Today's Mission</h2>
            </div>
            
            <h3 className="text-xl font-heading font-bold text-white mb-2">{todaysMission.title}</h3>
            <p className="text-sharpened-light-gray font-body mb-3">{todaysMission.description}</p>
            
            <div className="bg-sharpened-black/30 p-3 mb-4"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                 }}>
              <p className="text-feel-accent font-body italic">"{todaysMission.identity}"</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-feel-primary font-body font-semibold">{todaysMission.reward}</span>
              <button className="px-6 py-2 bg-feel-primary hover:bg-feel-secondary text-white font-heading font-bold transition-colors"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}>
                Start Mission
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Streak Counter */}
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Flame className="w-8 h-8 text-orange-400" />
            <div className="text-3xl font-heading font-black text-orange-400">{streak}</div>
          </div>
          <h3 className="font-heading font-bold text-white mb-1">Day Streak</h3>
          <p className="text-sm text-sharpened-light-gray font-body">Keep the momentum going!</p>
          <div className="mt-4 flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`flex-1 h-2 ${i < 5 ? 'bg-orange-400' : 'bg-sharpened-charcoal'}`}
                   style={{
                     clipPath: 'polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px))'
                   }} />
            ))}
          </div>
        </div>

        {/* Level & XP */}
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-feel-primary" />
            <div className="text-3xl font-heading font-black text-feel-primary">LVL {level}</div>
          </div>
          <h3 className="font-heading font-bold text-white mb-1">Experience</h3>
          <p className="text-sm text-sharpened-light-gray font-body mb-3">{xp} / {nextLevelXp} XP</p>
          <div className="bg-sharpened-void/50 h-3 overflow-hidden"
               style={{
                 clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))'
               }}>
            <div className="h-full bg-gradient-to-r from-feel-primary to-feel-secondary"
                 style={{ width: `${(xp / nextLevelXp) * 100}%` }} />
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div className="text-3xl font-heading font-black text-yellow-400">15</div>
          </div>
          <h3 className="font-heading font-bold text-white mb-1">Badges Earned</h3>
          <p className="text-sm text-sharpened-light-gray font-body mb-3">3 new this week</p>
          <div className="flex gap-2">
            {['🏃', '💪', '🎯', '⚡', '🔥'].map((badge, i) => (
              <div key={i} className="w-8 h-8 bg-sharpened-void/50 flex items-center justify-center text-lg"
                   style={{
                     clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                   }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Insights with Celebrations */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-white mb-4">Today's Insights</h2>
        <div className="space-y-4">
          {topInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-sharpened-coal/30 backdrop-blur-sm border p-4 transition-all ${
                insight.celebration ? 'border-yellow-400/50 animate-pulse' : 'border-sharpened-charcoal'
              }`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {insight.celebration && <Trophy className="w-5 h-5 text-yellow-400" />}
                    {insight.actionable && <Zap className="w-5 h-5 text-feel-primary" />}
                    {insight.proximity && <TrendingUp className="w-5 h-5 text-green-400" />}
                    <h3 className="font-heading font-bold text-white">{insight.title}</h3>
                  </div>
                  <p className="text-sharpened-light-gray font-body">{insight.message}</p>
                </div>
                {insight.actionable && (
                  <button className="text-feel-primary hover:text-feel-secondary transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof - Community Achievements */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-heading font-bold text-white">Community Achievements</h2>
        </div>
        
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-4"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
             }}>
          <div className="space-y-3">
            {communityAchievements.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-sharpened-charcoal last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-feel-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-feel-primary">{item.name[0]}</span>
                  </div>
                  <div>
                    <span className="font-body font-semibold text-white">{item.name}</span>
                    <span className="text-sharpened-gray font-body"> achieved </span>
                    <span className="font-body font-semibold text-feel-primary">{item.achievement}</span>
                  </div>
                </div>
                <span className="text-xs text-sharpened-gray font-body">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}