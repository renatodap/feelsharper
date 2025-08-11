'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Activity, Play, Timer } from 'lucide-react';

export default function CardioCard() {
  // Mock data - in real app, this would come from props or API
  const weeklyTarget = 150; // minutes
  const weeklyCompleted = 95;
  const lastRun = { distance: 5.2, time: '24:30', pace: '4:42' };
  const todayTarget = 'Easy 30min Zone 2';

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Cardio
          </Subheading>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-2xl font-bold text-slate-900">
            {weeklyCompleted}
          </span>
          <Body className="text-slate-500 text-sm">/ {weeklyTarget} min this week</Body>
        </div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((weeklyCompleted / weeklyTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Last Session */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <Body className="text-slate-600 text-xs uppercase tracking-wide mb-2">
          Last Run
        </Body>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <Body className="text-slate-900 font-bold text-sm">{lastRun.distance}km</Body>
            <Body className="text-slate-500 text-xs">Distance</Body>
          </div>
          <div>
            <Body className="text-slate-900 font-bold text-sm">{lastRun.time}</Body>
            <Body className="text-slate-500 text-xs">Time</Body>
          </div>
          <div>
            <Body className="text-slate-900 font-bold text-sm">{lastRun.pace}/km</Body>
            <Body className="text-slate-500 text-xs">Pace</Body>
          </div>
        </div>
      </div>

      {/* Today's Target */}
      <div className="mb-4 flex items-center space-x-2">
        <Timer className="w-4 h-4 text-orange-500" />
        <Body className="text-slate-600 text-sm">
          Today: <span className="font-medium text-slate-900">{todayTarget}</span>
        </Body>
      </div>

      {/* Action */}
      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center">
        <Play className="w-4 h-4 mr-2" />
        Start Run
      </Button>
    </Card>
  );
}
