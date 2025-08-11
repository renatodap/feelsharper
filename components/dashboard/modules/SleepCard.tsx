'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Moon, Clock, TrendingUp } from 'lucide-react';

export default function SleepCard() {
  // Mock data - in real app, this would come from props or API
  const lastNightSleep = 7.5;
  const sleepTarget = 8.0;
  const sleepQuality = 85;
  const weeklyAverage = 7.2;
  const bedtime = '10:30 PM';

  const getSleepColor = (hours: number, target: number) => {
    const percentage = (hours / target) * 100;
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSleepBgColor = (hours: number, target: number) => {
    const percentage = (hours / target) * 100;
    if (percentage >= 90) return 'bg-green-50';
    if (percentage >= 75) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getSleepBgColor(lastNightSleep, sleepTarget)}`}>
            <Moon className={`w-5 h-5 ${getSleepColor(lastNightSleep, sleepTarget)}`} />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Sleep
          </Subheading>
        </div>
      </div>

      {/* Last Night */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className={`text-3xl font-bold ${getSleepColor(lastNightSleep, sleepTarget)}`}>
            {lastNightSleep}
          </span>
          <Body className="text-slate-500 text-sm">hrs last night</Body>
        </div>
        <Body className="text-slate-600 text-sm">
          Target: {sleepTarget} hours
        </Body>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              lastNightSleep >= sleepTarget * 0.9 ? 'bg-green-500' : 
              lastNightSleep >= sleepTarget * 0.75 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((lastNightSleep / sleepTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Quality</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {sleepQuality}%
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Weekly Avg</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {weeklyAverage}h
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Bedtime</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {bedtime}
          </Body>
        </div>
      </div>

      {/* Sleep Tip */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
          <Body className="text-slate-700 text-sm">
            {lastNightSleep >= sleepTarget ? 
              'Great sleep! Keep your routine consistent.' :
              'Try going to bed 30min earlier tonight.'
            }
          </Body>
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="ghost" 
        className={`w-full ${getSleepColor(lastNightSleep, sleepTarget)} hover:${getSleepBgColor(lastNightSleep, sleepTarget)}`}
      >
        Log Sleep
      </Button>
    </Card>
  );
}
