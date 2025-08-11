'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Dumbbell, Play, TrendingUp } from 'lucide-react';

export default function WorkoutCard() {
  // Mock data - in real app, this would come from props or API
  const workoutsThisWeek = 3;
  const workoutsTarget = 4;
  const nextWorkout = 'Upper Body';
  const lastPR = 'Bench Press: 85kg';
  const streak = 12;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Dumbbell className="w-5 h-5 text-purple-500" />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Workouts
          </Subheading>
        </div>
        <div className="text-right">
          <Body className="text-purple-600 text-xs font-medium">
            {streak} day streak
          </Body>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-2xl font-bold text-slate-900">
            {workoutsThisWeek}
          </span>
          <Body className="text-slate-500 text-sm">/ {workoutsTarget} this week</Body>
        </div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((workoutsThisWeek / workoutsTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Next Workout */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <Body className="text-slate-600 text-xs uppercase tracking-wide mb-1">
          Next Up
        </Body>
        <Body className="text-slate-900 font-medium">
          {nextWorkout}
        </Body>
      </div>

      {/* Recent PR */}
      <div className="mb-4 flex items-center space-x-2">
        <TrendingUp className="w-4 h-4 text-green-500" />
        <Body className="text-slate-600 text-sm">
          Recent PR: <span className="font-medium text-slate-900">{lastPR}</span>
        </Body>
      </div>

      {/* Action */}
      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center">
        <Play className="w-4 h-4 mr-2" />
        Start Workout
      </Button>
    </Card>
  );
}
