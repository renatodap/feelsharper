'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Users, Crown, Shield, Globe, Lock } from 'lucide-react';

interface Squad {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  max_members: number;
  squad_type: string;
  created_at: string;
  memberCount: number;
  invite_code?: string;
}

interface SquadCardProps {
  squad: Squad;
  isJoined?: boolean;
  onJoin?: (squadId: string) => void;
  onLeave?: (squadId: string) => void;
  className?: string;
}

export default function SquadCard({ 
  squad, 
  isJoined = false, 
  onJoin, 
  onLeave, 
  className = '' 
}: SquadCardProps) {
  const getSquadTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge_based': return Shield;
      case 'goal_specific': return Crown;
      default: return Users;
    }
  };

  const getSquadTypeBadge = (type: string) => {
    switch (type) {
      case 'challenge_based': return { label: 'Challenge', color: 'bg-blue-100 text-blue-800' };
      case 'goal_specific': return { label: 'Goal-Focused', color: 'bg-green-100 text-green-800' };
      default: return { label: 'General', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleJoin = () => {
    if (onJoin && !isJoined) {
      onJoin(squad.id);
    }
  };

  const handleLeave = () => {
    if (onLeave && isJoined) {
      onLeave(squad.id);
    }
  };

  const TypeIcon = getSquadTypeIcon(squad.squad_type);
  const typeBadge = getSquadTypeBadge(squad.squad_type);
  const isAtCapacity = squad.memberCount >= squad.max_members;

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <TypeIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{squad.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={typeBadge.color}>
                {typeBadge.label}
              </Badge>
              {squad.is_public ? (
                <Globe className="w-4 h-4 text-green-500" title="Public squad" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" title="Private squad" />
              )}
            </div>
          </div>
        </div>
      </div>

      {squad.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {squad.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{squad.memberCount}/{squad.max_members}</span>
          </div>
          <span>•</span>
          <span>Created {new Date(squad.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full bg-slate-200 rounded-full h-2 mr-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtCapacity ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${(squad.memberCount / squad.max_members) * 100}%` }}
          />
        </div>

        {isJoined ? (
          <Button
            onClick={handleLeave}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Leave
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={isAtCapacity}
            size="sm"
            className={`${
              isAtCapacity 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isAtCapacity ? 'Full' : 'Join'}
          </Button>
        )}
      </div>

      {isAtCapacity && (
        <p className="text-xs text-red-600 mt-2 text-center">
          This squad is at maximum capacity
        </p>
      )}
    </Card>
  );
}
