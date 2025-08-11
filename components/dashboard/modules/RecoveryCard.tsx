'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Heart, Battery, AlertCircle } from 'lucide-react';

export default function RecoveryCard() {
  // Mock data - in real app, this would come from props or API
  const recoveryScore = 78;
  const hrv = 42;
  const restingHR = 58;
  const stressLevel = 'Low';
  const recommendation = 'Good for moderate training';

  const getRecoveryColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRecoveryBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getRecoveryBgColor(recoveryScore)}`}>
            <Heart className={`w-5 h-5 ${getRecoveryColor(recoveryScore)}`} />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Recovery
          </Subheading>
        </div>
      </div>

      {/* Recovery Score */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className={`text-3xl font-bold ${getRecoveryColor(recoveryScore)}`}>
            {recoveryScore}
          </span>
          <Body className="text-slate-500 text-sm">/ 100</Body>
        </div>
        <Body className="text-slate-600 text-sm">
          Recovery Score
        </Body>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">HRV</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {hrv}ms
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Resting HR</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {restingHR} bpm
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Stress</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {stressLevel}
          </Body>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Battery className="w-4 h-4 text-slate-500 mt-0.5" />
          <Body className="text-slate-700 text-sm">
            {recommendation}
          </Body>
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="ghost" 
        className={`w-full ${getRecoveryColor(recoveryScore)} hover:${getRecoveryBgColor(recoveryScore)}`}
      >
        View Details
      </Button>
    </Card>
  );
}
