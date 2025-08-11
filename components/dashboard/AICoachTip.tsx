'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Brain, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CoachTip {
  type: 'nutrition' | 'training' | 'recovery' | 'motivation';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export function AICoachTip() {
  const [currentTip, setCurrentTip] = useState<CoachTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock tips - in production, these would come from AI analysis
  const tips: CoachTip[] = [
    {
      type: 'nutrition',
      priority: 'high',
      title: 'Protein Gap Detected',
      message: 'You\'re 25g short of your protein target. Consider adding a protein shake or Greek yogurt to hit your goals.',
      action: 'Log Meal',
      actionUrl: '/log/meal'
    },
    {
      type: 'training',
      priority: 'medium',
      title: 'Volume Increase Ready',
      message: 'Your RPE has been consistently 7/10. Consider increasing weight by 2.5kg on your main lifts next session.',
      action: 'View Workout',
      actionUrl: '/log/workout'
    },
    {
      type: 'recovery',
      priority: 'high',
      title: 'Sleep Quality Declining',
      message: 'Your sleep has averaged 6.2h over the last 3 days. Poor recovery may impact tomorrow\'s performance.',
      action: 'Sleep Tips',
      actionUrl: '/blog/fix-your-sleep-in-3-days'
    },
    {
      type: 'motivation',
      priority: 'low',
      title: 'Consistency Streak!',
      message: 'Amazing! You\'ve logged workouts 12 days straight. This consistency will compound into serious results.',
      action: 'View Progress',
      actionUrl: '/dashboard'
    },
    {
      type: 'training',
      priority: 'medium',
      title: 'Form Check Suggestion',
      message: 'Your squat volume increased 15% but RPE stayed the same. Great progress! Focus on depth consistency.',
      action: 'Log Workout',
      actionUrl: '/log/workout'
    }
  ];

  useEffect(() => {
    // Set initial tip
    setCurrentTip(tips[0]);
  }, []);

  const getNewTip = async () => {
    setIsLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
      setIsLoading(false);
    }, 800);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'nutrition': return '🥗';
      case 'training': return '💪';
      case 'recovery': return '😴';
      default: return '🎯';
    }
  };

  if (!currentTip) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${getPriorityBorder(currentTip.priority)} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand-amber" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            AI Coach
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={getNewTip}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeEmoji(currentTip.type)}</span>
          {getPriorityIcon(currentTip.priority)}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {currentTip.title}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {currentTip.message}
        </p>

        {currentTip.action && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 bg-brand-amber/10 text-brand-amber hover:bg-brand-amber/20"
            onClick={() => {
              if (currentTip.actionUrl) {
                window.location.href = currentTip.actionUrl;
              }
            }}
          >
            {currentTip.action}
          </Button>
        )}
      </div>

      {/* AI Analysis Badge */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Based on your recent activity patterns</span>
        </div>
      </div>
    </Card>
  );
}