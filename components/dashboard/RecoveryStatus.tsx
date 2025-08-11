'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Moon, Heart, Zap, AlertCircle } from 'lucide-react';

interface RecoveryStatusProps {
  sleepHours: number;
  sleepTarget: number;
}

export function RecoveryStatus({ sleepHours, sleepTarget }: RecoveryStatusProps) {
  // Mock recovery data - would come from sleep logs, HRV, etc.
  const recoveryData = {
    sleepQuality: 8.2,
    restingHR: 58,
    hrv: 42,
    stressLevel: 3, // 1-10 scale
    readinessScore: 85,
  };

  const getSleepStatus = (hours: number, target: number) => {
    const percentage = (hours / target) * 100;
    if (percentage >= 95) return { status: 'Excellent', color: 'bg-green-100 text-green-800', icon: '😴' };
    if (percentage >= 85) return { status: 'Good', color: 'bg-blue-100 text-blue-800', icon: '🌙' };
    if (percentage >= 70) return { status: 'Fair', color: 'bg-yellow-100 text-yellow-800', icon: '😪' };
    return { status: 'Poor', color: 'bg-red-100 text-red-800', icon: '😵' };
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { level: 'High', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const sleepStatus = getSleepStatus(sleepHours, sleepTarget);
  const readinessLevel = getReadinessLevel(recoveryData.readinessScore);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Recovery Status
        </h3>
        <Badge className={`${readinessLevel.bg} ${readinessLevel.color} border-0`}>
          {readinessLevel.level} Readiness
        </Badge>
      </div>

      {/* Readiness Score Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#e2e8f0"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={recoveryData.readinessScore >= 85 ? '#10b981' : recoveryData.readinessScore >= 70 ? '#f59e0b' : '#ef4444'}
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${(recoveryData.readinessScore / 100) * 62.8} 62.8`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {recoveryData.readinessScore}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              ready
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Metrics */}
      <div className="space-y-4">
        {/* Sleep */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <Moon className="h-4 w-4 text-indigo-600" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Sleep Quality
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {sleepHours}h of {sleepTarget}h
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`${sleepStatus.color} border-0 text-xs`}>
              {sleepStatus.status} {sleepStatus.icon}
            </Badge>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Score: {recoveryData.sleepQuality}/10
            </div>
          </div>
        </div>

        {/* Heart Rate Variability */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-red-600" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Heart Rate Variability
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                RHR: {recoveryData.restingHR} bpm
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {recoveryData.hrv}ms
            </div>
            <div className="text-xs text-green-600">
              +2ms vs avg
            </div>
          </div>
        </div>

        {/* Stress Level */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Stress Level
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Physiological
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {recoveryData.stressLevel}/10
            </div>
            <div className="text-xs text-green-600">
              Low stress
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Recommendations */}
      <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Recovery Insight
          </span>
        </div>
        {recoveryData.readinessScore >= 85 ? (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🚀 Your body is ready for a high-intensity session today!
          </p>
        ) : recoveryData.readinessScore >= 70 ? (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ⚡ Good for moderate training. Listen to your body during warmup.
          </p>
        ) : (
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🧘 Consider active recovery today. Focus on mobility, light cardio, or rest.
          </p>
        )}
      </div>

      {/* 7-day Recovery Trend */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">7-Day Trend</div>
        <div className="flex items-end justify-between gap-1 h-8">
          {[78, 82, 85, 80, 77, 84, 85].map((score, index) => (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{
                height: `${(score / 100) * 100}%`,
                backgroundColor: score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>7d</span>
          <span>Today</span>
        </div>
      </div>
    </Card>
  );
}