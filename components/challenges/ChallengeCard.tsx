'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Zap, 
  TrendingDown, 
  Dumbbell, 
  Apple 
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  challenge_type: string;
  category: string;
  participantCount: number;
  max_participants?: number;
  userParticipation?: {
    progress: any;
    final_score?: number;
    rank?: number;
    is_completed: boolean;
  } | null;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  className?: string;
}

export default function ChallengeCard({ 
  challenge, 
  onJoin, 
  onLeave, 
  className = '' 
}: ChallengeCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight_loss': return TrendingDown;
      case 'workouts': return Dumbbell;
      case 'steps': return Zap;
      case 'nutrition': return Apple;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight_loss': return 'bg-red-100 text-red-800';
      case 'workouts': return 'bg-blue-100 text-blue-800';
      case 'steps': return 'bg-green-100 text-green-800';
      case 'nutrition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual';
      case 'squad': return 'Squad';
      case 'global': return 'Global';
      default: return type;
    }
  };

  const isStarted = new Date(challenge.starts_at) <= new Date();
  const isEnded = new Date(challenge.ends_at) <= new Date();
  const isJoined = !!challenge.userParticipation;
  const isAtCapacity = challenge.max_participants && 
    challenge.participantCount >= challenge.max_participants;

  const daysUntilStart = Math.ceil(
    (new Date(challenge.starts_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysUntilEnd = Math.ceil(
    (new Date(challenge.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleJoin = () => {
    if (onJoin && !isJoined && !isEnded && !isAtCapacity) {
      onJoin(challenge.id);
    }
  };

  const handleLeave = () => {
    if (onLeave && isJoined && !isEnded) {
      onLeave(challenge.id);
    }
  };

  const CategoryIcon = getCategoryIcon(challenge.category);
  const categoryColor = getCategoryColor(challenge.category);

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isEnded ? 'bg-gray-100' : 'bg-amber-100'
          }`}>
            <CategoryIcon className={`w-6 h-6 ${
              isEnded ? 'text-gray-500' : 'text-amber-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={categoryColor}>
                {challenge.category.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">
                {getTypeLabel(challenge.challenge_type)}
              </Badge>
            </div>
          </div>
        </div>

        {isJoined && challenge.userParticipation?.rank && (
          <div className="flex items-center space-x-1 text-amber-600">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">#{challenge.userParticipation.rank}</span>
          </div>
        )}
      </div>

      {challenge.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {challenge.description}
        </p>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-slate-500">
            <Users className="w-4 h-4" />
            <span>
              {challenge.participantCount}
              {challenge.max_participants && ` / ${challenge.max_participants}`} participants
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {isEnded 
                ? 'Ended' 
                : isStarted 
                  ? `${daysUntilEnd} days left`
                  : `Starts in ${daysUntilStart} days`
              }
            </span>
          </div>
        </div>

        {isJoined && challenge.userParticipation && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-800">Your Progress</span>
              {challenge.userParticipation.is_completed && (
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              )}
            </div>
            {challenge.userParticipation.final_score && (
              <p className="text-sm text-amber-700 mt-1">
                Score: {challenge.userParticipation.final_score}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {isEnded ? (
          <Button disabled className="w-full bg-gray-300 text-gray-500">
            Challenge Ended
          </Button>
        ) : isJoined ? (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {/* Navigate to challenge details */}}
            >
              View Progress
            </Button>
            {!isStarted && (
              <Button
                onClick={handleLeave}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Leave
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={isAtCapacity}
            className={`w-full ${
              isAtCapacity 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isAtCapacity ? 'Full' : 'Join Challenge'}
          </Button>
        )}
      </div>

      {isAtCapacity && !isJoined && (
        <p className="text-xs text-red-600 mt-2 text-center">
          This challenge is at maximum capacity
        </p>
      )}
    </Card>
  );
}
