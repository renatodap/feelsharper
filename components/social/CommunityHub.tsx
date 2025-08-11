'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Users, 
  Trophy, 
  TrendingUp,
  MessageSquare,
  Heart,
  Share2,
  Crown,
  Flame,
  Target,
  Calendar,
  MapPin,
  Clock,
  Zap,
  Award,
  Star
} from 'lucide-react';

interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streak: number;
  goals: string[];
  location: string;
  workoutTime: string;
  compatibility: number; // 0-100
  badges: string[];
  stats: {
    workoutsThisWeek: number;
    totalVolume: number;
    consistency: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  duration: string;
  reward: string;
  category: 'individual' | 'team' | 'community';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'buddies' | 'leaderboard'>('feed');
  const [potentialBuddies, setPotentialBuddies] = useState<CommunityUser[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    // Mock data - would come from Supabase with real user matching algorithm
    setPotentialBuddies([
      {
        id: '1',
        name: 'Alex Chen',
        avatar: '👨‍💼',
        level: 15,
        streak: 23,
        goals: ['Muscle Gain', 'Strength'],
        location: '2.3 miles away',
        workoutTime: 'Morning (6-8 AM)',
        compatibility: 94,
        badges: ['Consistency King', 'PR Crusher'],
        stats: {
          workoutsThisWeek: 5,
          totalVolume: 15400,
          consistency: 89
        }
      },
      {
        id: '2',
        name: 'Maria Rodriguez',
        avatar: '👩‍🔬',
        level: 12,
        streak: 18,
        goals: ['Endurance', 'General Fitness'],
        location: '1.8 miles away',
        workoutTime: 'Evening (6-8 PM)',
        compatibility: 87,
        badges: ['Marathon Ready', 'Early Bird'],
        stats: {
          workoutsThisWeek: 4,
          totalVolume: 8200,
          consistency: 95
        }
      },
      {
        id: '3',
        name: 'Jake Thompson',
        avatar: '👨‍🚀',
        level: 20,
        streak: 45,
        goals: ['Weight Loss', 'Athletic Performance'],
        location: '0.9 miles away',
        workoutTime: 'Lunch (12-1 PM)',
        compatibility: 91,
        badges: ['Transformation', 'Mentor', 'Elite'],
        stats: {
          workoutsThisWeek: 6,
          totalVolume: 18900,
          consistency: 97
        }
      }
    ]);

    setActiveChallenges([
      {
        id: '1',
        title: 'February Fitness Frenzy',
        description: 'Complete 20 workouts this month',
        participants: 1247,
        duration: '23 days left',
        reward: 'Exclusive badge + 30% supplement discount',
        category: 'community',
        difficulty: 'intermediate'
      },
      {
        id: '2',
        title: 'Squat Challenge',
        description: 'Increase your squat by 10% in 4 weeks',
        participants: 89,
        duration: '12 days left',
        reward: 'Personal training session',
        category: 'individual',
        difficulty: 'advanced'
      },
      {
        id: '3',
        title: 'Team Transformation',
        description: 'Form a team of 4 and lose 50 lbs combined',
        participants: 156,
        duration: '45 days left',
        reward: 'Group retreat weekend',
        category: 'team',
        difficulty: 'beginner'
      }
    ]);
  };

  const tabs = [
    { id: 'feed', label: 'Community Feed', icon: MessageSquare },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'buddies', label: 'Find Buddies', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Community Hub
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Connect, compete, and achieve your goals together
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid gap-6">
          {activeTab === 'feed' && <CommunityFeed />}
          {activeTab === 'challenges' && <ChallengesView challenges={activeChallenges} />}
          {activeTab === 'buddies' && <WorkoutBuddies buddies={potentialBuddies} />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
      </div>
    </div>
  );
}

function CommunityFeed() {
  const feedItems = [
    {
      id: '1',
      user: { name: 'Alex Chen', avatar: '👨‍💼', level: 15 },
      type: 'achievement',
      content: 'Just hit a new PR on bench press! 225 lbs x 5 reps 🔥',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      media: null
    },
    {
      id: '2',
      user: { name: 'Maria Rodriguez', avatar: '👩‍🔬', level: 12 },
      type: 'milestone',
      content: 'Completed my first marathon! 26.2 miles in 3:45:32. The training paid off!',
      timestamp: '5 hours ago',
      likes: 67,
      comments: 23,
      media: 'progress_photo'
    },
    {
      id: '3',
      user: { name: 'Community', avatar: '🏆', level: null },
      type: 'challenge',
      content: 'New community challenge starting tomorrow: "February Fitness Frenzy" - Join 1,247 others!',
      timestamp: '8 hours ago',
      likes: 156,
      comments: 45,
      media: null
    }
  ];

  return (
    <div className="space-y-6">
      {feedItems.map(item => (
        <Card key={item.id} className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{item.user.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.user.name}
                </span>
                {item.user.level && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Level {item.user.level}
                  </Badge>
                )}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                {item.content}
              </p>
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{item.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-600 hover:text-blue-500 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{item.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-600 hover:text-green-500 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChallengesView({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {challenges.map(challenge => (
        <Card key={challenge.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {challenge.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                {challenge.description}
              </p>
            </div>
            <Badge className={`
              ${challenge.category === 'community' ? 'bg-purple-100 text-purple-800' : 
                challenge.category === 'team' ? 'bg-green-100 text-green-800' : 
                'bg-blue-100 text-blue-800'}
            `}>
              {challenge.category}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-slate-600" />
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {challenge.participants}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Participants
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-slate-600" />
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {challenge.duration}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Remaining
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Reward
              </span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {challenge.reward}
            </p>
          </div>

          <Button className="w-full">
            Join Challenge
          </Button>
        </Card>
      ))}
    </div>
  );
}

function WorkoutBuddies({ buddies }: { buddies: CommunityUser[] }) {
  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🤝 Find Your Perfect Workout Partner
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          We've matched you with people who share similar goals, schedules, and are located nearby. 
          Research shows you're 95% more likely to stick to your fitness goals with an accountability partner!
        </p>
      </div>

      <div className="space-y-6">
        {buddies.map(buddy => (
          <Card key={buddy.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{buddy.avatar}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {buddy.name}
                    </h3>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {buddy.compatibility}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Level {buddy.level}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {buddy.streak} day streak
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {buddy.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {buddy.goals.map(goal => (
                      <Badge key={goal} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {buddy.compatibility}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Compatibility
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {buddy.stats.workoutsThisWeek}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  This Week
                </div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {buddy.stats.totalVolume.toLocaleString()}kg
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Total Volume
                </div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {buddy.stats.consistency}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Consistency
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Preferred workout time:
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {buddy.workoutTime}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
                <Button size="sm">
                  Connect
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Leaderboard() {
  const leaderboardData = [
    { rank: 1, name: 'Jake Thompson', avatar: '👨‍🚀', points: 2847, streak: 45, badge: 'Elite' },
    { rank: 2, name: 'Sarah Kim', avatar: '👩‍⚕️', points: 2634, streak: 38, badge: 'Champion' },
    { rank: 3, name: 'Alex Chen', avatar: '👨‍💼', points: 2456, streak: 23, badge: 'Warrior' },
    { rank: 4, name: 'Maria Rodriguez', avatar: '👩‍🔬', points: 2298, streak: 18, badge: 'Dedicated' },
    { rank: 5, name: 'You', avatar: '👤', points: 2156, streak: 12, badge: 'Rising Star' }
  ];

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="p-6 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            #5
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Your Global Rank
          </div>
        </Card>
        
        <Card className="p-6 text-center">
          <Flame className="h-8 w-8 mx-auto mb-3 text-orange-500" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            12 Days
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Current Streak
          </div>
        </Card>
        
        <Card className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-blue-600" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            2,156
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Points
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Global Leaderboard
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Points earned through consistency, achievements, and community participation
          </p>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {leaderboardData.map((user, index) => (
            <div key={user.rank} className={`p-4 flex items-center gap-4 ${
              user.name === 'You' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
            }`}>
              <div className="flex items-center justify-center w-8 h-8">
                {user.rank <= 3 ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    user.rank === 1 ? 'bg-yellow-500' :
                    user.rank === 2 ? 'bg-gray-400' :
                    'bg-amber-600'
                  }`}>
                    {user.rank}
                  </div>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    #{user.rank}
                  </span>
                )}
              </div>
              
              <div className="text-2xl">{user.avatar}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {user.name}
                  </span>
                  <Badge className={`text-xs ${
                    user.badge === 'Elite' ? 'bg-purple-100 text-purple-800' :
                    user.badge === 'Champion' ? 'bg-yellow-100 text-yellow-800' :
                    user.badge === 'Warrior' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.badge}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {user.streak} day streak
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  points
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}