'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/TypographyWrapper';
import Button from '@/components/ui/Button';
import { 
  Users, 
  Trophy, 
  Heart, 
  MessageCircle, 
  Share2, 
  Target, 
  Zap, 
  Calendar, 
  Award,
  TrendingUp,
  Fire,
  Plus,
  UserPlus,
  Crown,
  Medal
} from 'lucide-react';

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  level: number;
  achievements: string[];
  isAccountabilityPartner?: boolean;
}

interface ActivityFeedItem {
  id: string;
  user: CommunityMember;
  type: 'workout' | 'achievement' | 'goal' | 'milestone';
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  duration: string;
  reward: string;
  progress: number;
  isJoined: boolean;
  category: 'fitness' | 'nutrition' | 'wellness';
}

export default function SocialCommunity() {
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'partners' | 'leaderboard'>('feed');
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [accountabilityPartners, setAccountabilityPartners] = useState<CommunityMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<CommunityMember[]>([]);

  useEffect(() => {
    // Simulate loading community data
    loadCommunityData();
  }, []);

  const loadCommunityData = () => {
    // Mock data - in production, this would come from API
    setActivityFeed([
      {
        id: '1',
        user: { id: '1', name: 'Mike Chen', avatar: '🏃‍♂️', streak: 15, level: 8, achievements: ['marathon'] },
        type: 'workout',
        content: 'Crushed a 10K run in 42:30! New personal best 🔥',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 12,
        comments: 3,
        isLiked: false
      },
      {
        id: '2',
        user: { id: '2', name: 'Sarah Johnson', avatar: '💪', streak: 23, level: 12, achievements: ['strength', 'consistency'] },
        type: 'achievement',
        content: 'Hit a new deadlift PR - 225lbs! Consistency pays off 💪',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 18,
        comments: 5,
        isLiked: true
      },
      {
        id: '3',
        user: { id: '3', name: 'Alex Rivera', avatar: '🧘‍♀️', streak: 7, level: 4, achievements: ['mindfulness'] },
        type: 'milestone',
        content: 'Completed my first week of daily meditation. Feeling more centered already ✨',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 9,
        comments: 2,
        isLiked: false
      }
    ]);

    setChallenges([
      {
        id: '1',
        title: '30-Day Consistency Challenge',
        description: 'Complete at least one workout every day for 30 days',
        participants: 247,
        duration: '23 days left',
        reward: 'Consistency Master badge + 500 points',
        progress: 60,
        isJoined: true,
        category: 'fitness'
      },
      {
        id: '2',
        title: 'Protein Power Week',
        description: 'Hit your protein target every day this week',
        participants: 156,
        duration: '4 days left',
        reward: 'Nutrition Pro badge + 200 points',
        progress: 85,
        isJoined: false,
        category: 'nutrition'
      },
      {
        id: '3',
        title: 'Sleep Optimization Challenge',
        description: 'Get 7+ hours of quality sleep for 14 consecutive days',
        participants: 89,
        duration: '11 days left',
        reward: 'Sleep Master badge + 300 points',
        progress: 25,
        isJoined: true,
        category: 'wellness'
      }
    ]);

    setAccountabilityPartners([
      { id: '4', name: 'Jordan Kim', avatar: '🎯', streak: 18, level: 9, achievements: ['goal_crusher'], isAccountabilityPartner: true },
      { id: '5', name: 'Taylor Swift', avatar: '🏋️‍♀️', streak: 31, level: 15, achievements: ['iron_will', 'consistency'], isAccountabilityPartner: true }
    ]);

    setLeaderboard([
      { id: '6', name: 'Emma Stone', avatar: '👑', streak: 45, level: 20, achievements: ['legend', 'consistency', 'strength'] },
      { id: '2', name: 'Sarah Johnson', avatar: '💪', streak: 23, level: 12, achievements: ['strength', 'consistency'] },
      { id: '4', name: 'Jordan Kim', avatar: '🎯', streak: 18, level: 9, achievements: ['goal_crusher'] },
      { id: '1', name: 'Mike Chen', avatar: '🏃‍♂️', streak: 15, level: 8, achievements: ['marathon'] },
      { id: '7', name: 'Chris Evans', avatar: '⚡', streak: 12, level: 7, achievements: ['dedication'] }
    ]);
  };

  const likePost = (postId: string) => {
    setActivityFeed(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, isJoined: !challenge.isJoined, participants: challenge.isJoined ? challenge.participants - 1 : challenge.participants + 1 }
        : challenge
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Zap className="w-4 h-4" />;
      case 'nutrition': return <Target className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'text-blue-500 bg-blue-50';
      case 'nutrition': return 'text-green-500 bg-green-50';
      case 'wellness': return 'text-purple-500 bg-purple-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const renderActivityFeed = () => (
    <div className="space-y-4">
      {activityFeed.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-xl">
                {item.user.avatar}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Typography variant="body2" className="font-semibold">
                  {item.user.name}
                </Typography>
                <div className="flex items-center text-amber-500">
                  <Fire className="w-4 h-4 mr-1" />
                  <Typography variant="body2" className="text-xs font-medium">
                    {item.user.streak}
                  </Typography>
                </div>
                <Typography variant="body2" className="text-slate-500 text-xs">
                  Level {item.user.level}
                </Typography>
                <Typography variant="body2" className="text-slate-400 text-xs">
                  • {getTimeAgo(item.timestamp)}
                </Typography>
              </div>
              
              <Typography variant="body2" className="mb-4">
                {item.content}
              </Typography>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likePost(item.id)}
                  className={`${item.isLiked ? 'text-red-500' : 'text-slate-500'} hover:text-red-500`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${item.isLiked ? 'fill-current' : ''}`} />
                  {item.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-500">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {item.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-green-500">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(challenge.category)}`}>
                {getCategoryIcon(challenge.category)}
              </div>
              <div>
                <Typography variant="h4" className="font-semibold mb-1">
                  {challenge.title}
                </Typography>
                <Typography variant="body2" className="text-slate-600">
                  {challenge.description}
                </Typography>
              </div>
            </div>
            <Button
              variant={challenge.isJoined ? "secondary" : "primary"}
              size="sm"
              onClick={() => joinChallenge(challenge.id)}
            >
              {challenge.isJoined ? 'Joined' : 'Join'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Typography variant="body2" className="text-slate-500 text-xs">Participants</Typography>
              <Typography variant="body2" className="font-semibold">{challenge.participants}</Typography>
            </div>
            <div>
              <Typography variant="body2" className="text-slate-500 text-xs">Duration</Typography>
              <Typography variant="body2" className="font-semibold">{challenge.duration}</Typography>
            </div>
            <div className="col-span-2">
              <Typography variant="body2" className="text-slate-500 text-xs">Reward</Typography>
              <Typography variant="body2" className="font-semibold">{challenge.reward}</Typography>
            </div>
          </div>
          
          {challenge.isJoined && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2" className="text-slate-600">Your Progress</Typography>
                <Typography variant="body2" className="font-semibold">{challenge.progress}%</Typography>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderAccountabilityPartners = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="h4" className="font-semibold">
          Your Accountability Partners
        </Typography>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Find Partners
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountabilityPartners.map((partner) => (
          <Card key={partner.id} className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                {partner.avatar}
              </div>
              <div>
                <Typography variant="h4" className="font-semibold mb-1">
                  {partner.name}
                </Typography>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-amber-500">
                    <Fire className="w-4 h-4 mr-1" />
                    <Typography variant="body2" className="text-sm font-medium">
                      {partner.streak} day streak
                    </Typography>
                  </div>
                  <Typography variant="body2" className="text-slate-500 text-sm">
                    Level {partner.level}
                  </Typography>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {partner.achievements.map((achievement, index) => (
                <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {achievement}
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div className="text-center">
          <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <Typography variant="h4" className="font-semibold mb-2">
            Find Your Perfect Accountability Partner
          </Typography>
          <Typography variant="body2" className="text-purple-700 mb-4">
            Get matched with someone who shares your goals, schedule, and commitment level
          </Typography>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Get Matched
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Typography variant="h4" className="font-semibold mb-2">
          Weekly Leaderboard
        </Typography>
        <Typography variant="body2" className="text-slate-600">
          Based on consistency, achievements, and community engagement
        </Typography>
      </div>
      
      {leaderboard.map((member, index) => (
        <Card key={member.id} className={`p-4 ${index < 3 ? 'border-2 border-amber-200 bg-amber-50' : ''}`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8">
              {index === 0 && <Crown className="w-6 h-6 text-yellow-500" />}
              {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
              {index === 2 && <Award className="w-6 h-6 text-amber-600" />}
              {index > 2 && (
                <Typography variant="body2" className="font-bold text-slate-500">
                  #{index + 1}
                </Typography>
              )}
            </div>
            
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-xl">
              {member.avatar}
            </div>
            
            <div className="flex-1">
              <Typography variant="body2" className="font-semibold">
                {member.name}
              </Typography>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-500">
                  <Fire className="w-4 h-4 mr-1" />
                  <Typography variant="body2" className="text-sm">
                    {member.streak}
                  </Typography>
                </div>
                <Typography variant="body2" className="text-slate-500 text-sm">
                  Level {member.level}
                </Typography>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {member.achievements.slice(0, 2).map((achievement, achievementIndex) => (
                <span key={achievementIndex} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {achievement}
                </span>
              ))}
              {member.achievements.length > 2 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                  +{member.achievements.length - 2}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Community
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Connect, compete, and celebrate your fitness journey together
        </Typography>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
        {[
          { id: 'feed', label: 'Activity Feed', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'challenges', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
          { id: 'partners', label: 'Partners', icon: <Users className="w-4 h-4" /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Crown className="w-4 h-4" /> }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className="mb-2"
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'feed' && renderActivityFeed()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'partners' && renderAccountabilityPartners()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
}
