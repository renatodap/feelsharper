"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Trophy, 
  Award, 
  Zap, 
  TrendingUp,
  Target,
  Flame,
  Star,
  Medal,
  Crown,
  Lock,
  Unlock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  xp: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'nutrition' | 'workout' | 'consistency' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  achievements: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  // Nutrition Achievements
  {
    id: 'first-meal',
    title: 'First Bite',
    description: 'Log your first meal',
    icon: Apple,
    xp: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'nutrition',
    rarity: 'common'
  },
  {
    id: 'protein-master',
    title: 'Protein Master',
    description: 'Hit your protein goal 7 days in a row',
    icon: Target,
    xp: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    category: 'nutrition',
    rarity: 'rare'
  },
  {
    id: 'calorie-wizard',
    title: 'Calorie Wizard',
    description: 'Stay within calorie goal for 30 days',
    icon: Flame,
    xp: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    category: 'nutrition',
    rarity: 'epic'
  },
  
  // Workout Achievements
  {
    id: 'first-workout',
    title: 'Getting Started',
    description: 'Complete your first workout',
    icon: Dumbbell,
    xp: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'workout',
    rarity: 'common'
  },
  {
    id: 'workout-warrior',
    title: 'Workout Warrior',
    description: 'Complete 20 workouts',
    icon: Medal,
    xp: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    category: 'workout',
    rarity: 'rare'
  },
  {
    id: 'iron-will',
    title: 'Iron Will',
    description: 'Workout 100 days',
    icon: Crown,
    xp: 1000,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: 'workout',
    rarity: 'legendary'
  },
  
  // Consistency Achievements
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: '7 day logging streak',
    icon: Flame,
    xp: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    category: 'consistency',
    rarity: 'common'
  },
  {
    id: 'month-streak',
    title: 'Monthly Master',
    description: '30 day logging streak',
    icon: Star,
    xp: 300,
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    category: 'consistency',
    rarity: 'epic'
  },
  {
    id: 'century-streak',
    title: 'Century Club',
    description: '100 day logging streak',
    icon: Trophy,
    xp: 2000,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    category: 'consistency',
    rarity: 'legendary'
  },
  
  // Milestone Achievements
  {
    id: 'level-10',
    title: 'Double Digits',
    description: 'Reach level 10',
    icon: Zap,
    xp: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: 'milestone',
    rarity: 'rare'
  },
  {
    id: 'level-50',
    title: 'Elite Status',
    description: 'Reach level 50',
    icon: Crown,
    xp: 1000,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    category: 'milestone',
    rarity: 'legendary'
  }
];

const LEVEL_REWARDS = [
  { level: 5, reward: 'Unlock custom meal plans', icon: '🍽️' },
  { level: 10, reward: 'Advanced analytics unlocked', icon: '📊' },
  { level: 20, reward: 'AI Coach personality selection', icon: '🤖' },
  { level: 30, reward: 'Premium workout templates', icon: '💪' },
  { level: 50, reward: 'Elite badge & leaderboard access', icon: '👑' }
];

export default function GamificationSystem() {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
    streak: 0,
    achievements: []
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Load user stats from localStorage (or API)
    const saved = localStorage.getItem('userGameStats');
    if (saved) {
      const stats = JSON.parse(saved);
      setUserStats(stats);
      
      // Update achievements based on saved progress
      const updatedAchievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: stats.achievements.includes(a.id)
      }));
      setAchievements(updatedAchievements);
    }

    // Simulate progress (replace with real data)
    simulateProgress();
  }, []);

  const simulateProgress = () => {
    // Simulate some progress for demo
    setTimeout(() => {
      addXP(25, 'Daily login bonus');
    }, 1000);
  };

  const addXP = (amount: number, reason: string) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpToNext = prev.xpToNextLevel;
      
      // Check for level up
      if (newXp >= xpToNext) {
        newLevel++;
        const remainingXp = newXp - xpToNext;
        xpToNext = newLevel * 100; // Progressive XP requirement
        
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
        
        return {
          ...prev,
          level: newLevel,
          xp: remainingXp,
          xpToNextLevel: xpToNext,
          totalXp: prev.totalXp + amount
        };
      }
      
      return {
        ...prev,
        xp: newXp,
        totalXp: prev.totalXp + amount
      };
    });
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;
    
    setAchievements(prev => prev.map(a => 
      a.id === achievementId ? { ...a, unlocked: true } : a
    ));
    
    setUserStats(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievementId]
    }));
    
    // Show unlock animation
    setUnlockedAchievement(achievement);
    setTimeout(() => setUnlockedAchievement(null), 3000);
    
    // Award XP
    addXP(achievement.xp, `Achievement: ${achievement.title}`);
    
    // Save to localStorage
    const newStats = {
      ...userStats,
      achievements: [...userStats.achievements, achievementId]
    };
    localStorage.setItem('userGameStats', JSON.stringify(newStats));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10';
      case 'rare': return 'bg-blue-500/10';
      case 'epic': return 'bg-purple-500/10';
      case 'legendary': return 'bg-yellow-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const progressPercentage = (userStats.xp / userStats.xpToNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground p-8 rounded-2xl animate-bounce">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You reached level {userStats.level}!</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Animation */}
      {unlockedAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <Card className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/50">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <p className="font-semibold">Achievement Unlocked!</p>
                <p className="text-sm">{unlockedAchievement.title}</p>
                <p className="text-xs text-muted-foreground">+{unlockedAchievement.xp} XP</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Stats Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{userStats.level}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Level {userStats.level}</h3>
              <p className="text-sm text-muted-foreground">
                {userStats.totalXp.toLocaleString()} Total XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{userStats.streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {userStats.level + 1}</span>
            <span>{userStats.xp} / {userStats.xpToNextLevel} XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Daily Challenges */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Daily Challenges</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Log all meals</p>
                <p className="text-xs text-muted-foreground">+50 XP</p>
              </div>
            </div>
            <span className="text-xs text-green-500">Completed</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Complete a workout</p>
                <p className="text-xs text-muted-foreground">+75 XP</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">0/1</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Hit protein goal</p>
                <p className="text-xs text-muted-foreground">+25 XP</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">80/150g</span>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <div>
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'nutrition', 'workout', 'consistency', 'milestone'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => {
            const Icon = achievement.icon;
            const progress = (achievement.progress / achievement.maxProgress) * 100;
            
            return (
              <Card 
                key={achievement.id}
                className={cn(
                  "p-4 transition-all",
                  achievement.unlocked && "bg-gradient-to-r from-primary/5 to-primary/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-3 rounded-lg",
                    achievement.unlocked ? getRarityBg(achievement.rarity) : "bg-muted"
                  )}>
                    {achievement.unlocked ? (
                      <Icon className={cn("w-6 h-6", getRarityColor(achievement.rarity))} />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-medium",
                        !achievement.unlocked && "text-muted-foreground"
                      )}>
                        {achievement.title}
                      </h4>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        getRarityBg(achievement.rarity),
                        getRarityColor(achievement.rarity)
                      )}>
                        +{achievement.xp} XP
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlocked && (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <Unlock className="w-3 h-3" />
                        <span>Unlocked</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Rewards */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Upcoming Rewards</h3>
        <div className="space-y-3">
          {LEVEL_REWARDS.filter(r => r.level > userStats.level).slice(0, 3).map((reward) => (
            <div key={reward.level} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reward.icon}</span>
                <div>
                  <p className="font-medium text-sm">{reward.reward}</p>
                  <p className="text-xs text-muted-foreground">Level {reward.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {reward.level - userStats.level} levels away
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Add missing imports
import { Check, Apple, Dumbbell } from 'lucide-react';