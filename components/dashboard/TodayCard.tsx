'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Settings,
  ChevronRight
} from 'lucide-react';

interface TodayCardProps {
  primaryGoal?: string;
  weeklyHours?: number;
  onQuickAction?: (action: string) => void;
}

interface GoalConfig {
  title: string;
  color: string;
  bgColor: string;
  todayFocus: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
  quickActions: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
}

const GOAL_CONFIGS: Record<string, GoalConfig> = {
  weight_loss: {
    title: 'Weight Loss',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    todayFocus: 'Lock in 110g protein today. Stay in your deficit zone.',
    keyMetrics: [
      { label: 'Calories Left', value: '380', unit: 'kcal' },
      { label: 'Protein Target', value: '110', unit: 'g' }
    ],
    quickActions: [
      { label: 'Log Meal', action: 'log_meal', variant: 'primary' },
      { label: 'Adjust Calories', action: 'adjust_calories', variant: 'secondary' }
    ]
  },
  muscle_gain: {
    title: 'Muscle Gain',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    todayFocus: 'Heavy squat day. 140g protein locked in.',
    keyMetrics: [
      { label: 'Protein Target', value: '140', unit: 'g' },
      { label: 'Workout Planned', value: 'Upper', unit: '' }
    ],
    quickActions: [
      { label: 'Start Workout', action: 'start_workout', variant: 'primary' },
      { label: 'Log Protein', action: 'log_protein', variant: 'secondary' }
    ]
  },
  endurance: {
    title: 'Endurance',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    todayFocus: 'Easy day: 30-40min Zone 2. Build your aerobic base.',
    keyMetrics: [
      { label: 'Run Target', value: '35', unit: 'min' },
      { label: 'Zone', value: '2', unit: '' }
    ],
    quickActions: [
      { label: 'Start Run', action: 'start_run', variant: 'primary' },
      { label: 'Log Recovery', action: 'log_recovery', variant: 'secondary' }
    ]
  },
  sport_specific: {
    title: 'Sport Performance',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    todayFocus: 'Power training + mobility. Peak performance mode.',
    keyMetrics: [
      { label: 'Training', value: 'Power', unit: '' },
      { label: 'Recovery', value: 'High', unit: '' }
    ],
    quickActions: [
      { label: 'Start Training', action: 'start_training', variant: 'primary' },
      { label: 'Mobility Check', action: 'mobility_check', variant: 'secondary' }
    ]
  },
  general_health: {
    title: 'General Health',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    todayFocus: 'Move well, eat well, sleep well. Simple fundamentals.',
    keyMetrics: [
      { label: 'Activity', value: '30', unit: 'min' },
      { label: 'Sleep Target', value: '8', unit: 'hrs' }
    ],
    quickActions: [
      { label: 'Log Activity', action: 'log_activity', variant: 'primary' },
      { label: 'Plan Meals', action: 'plan_meals', variant: 'secondary' }
    ]
  }
};

export default function TodayCard({ 
  primaryGoal = 'general_health', 
  weeklyHours = 5,
  onQuickAction 
}: TodayCardProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [coachMessage, setCoachMessage] = useState<string>('');

  const config = GOAL_CONFIGS[primaryGoal] || GOAL_CONFIGS.general_health;

  useEffect(() => {
    // Update current time
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate contextual coach message
    const messages = [
      config.todayFocus,
      `${weeklyHours}hrs/week = consistent progress. You're building something lasting.`,
      'Every choice matters. Every rep counts. You\'re becoming who you want to be.',
      'Progress isn\'t just numbers—it\'s the energy you feel, the confidence you carry.'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCoachMessage(randomMessage);
  }, [config.todayFocus, weeklyHours]);

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    } else {
      // Default behavior - could integrate with actual functionality
      console.log(`Quick action: ${action}`);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Card className={`p-6 ${config.bgColor} border-l-4 border-l-amber-500`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Target className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <Heading className="text-xl font-bold text-slate-900">
              Today&apos;s Focus
            </Heading>
            <Body className="text-slate-600 text-sm">
              {today} • {currentTime}
            </Body>
          </div>
        </div>
        <div className="text-right">
          <Body className="text-slate-500 text-xs uppercase tracking-wide">
            {config.title}
          </Body>
          <div className="flex items-center text-slate-400">
            <Calendar className="w-4 h-4 mr-1" />
            <Body className="text-xs">
              {weeklyHours}h/week
            </Body>
          </div>
        </div>
      </div>

      {/* Coach Message */}
      <div className="mb-6 p-4 bg-white/60 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-amber-100 rounded-full">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <Body className="text-slate-700 font-medium">
              {coachMessage}
            </Body>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {config.keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white/60 rounded-lg p-3">
            <Body className="text-slate-600 text-xs uppercase tracking-wide mb-1">
              {metric.label}
            </Body>
            <div className="flex items-baseline">
              <Subheading className="text-2xl font-bold text-slate-900">
                {metric.value}
              </Subheading>
              {metric.unit && (
                <Body className="text-slate-500 text-sm ml-1">
                  {metric.unit}
                </Body>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Body className="text-slate-600 font-medium text-sm">
            Quick Actions
          </Body>
          <button className="flex items-center text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-4 h-4 mr-1" />
            <Body className="text-xs">
              Customize
            </Body>
          </button>
        </div>
        
        <div className="flex gap-3">
          {config.quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className={`flex-1 ${
                action.variant === 'primary'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {action.label}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-white/50">
        <div className="flex items-center justify-between text-xs">
          <Body className="text-slate-500">
            Daily Progress
          </Body>
          <Body className="text-slate-600 font-medium">
            3/5 actions complete
          </Body>
        </div>
        <div className="mt-2 w-full bg-white/60 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }} />
        </div>
      </div>
    </Card>
  );
}
