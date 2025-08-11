'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Scale, TrendingDown, TrendingUp, Plus } from 'lucide-react';

export default function WeightCard() {
  // Mock data - in real app, this would come from props or API
  const currentWeight = 78.2;
  const previousWeight = 78.8;
  const goalWeight = 75.0;
  const weeklyChange = currentWeight - previousWeight;
  const totalProgress = previousWeight - currentWeight;

  const isDecreasing = weeklyChange < 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Weight
          </Subheading>
        </div>
        <Button variant="ghost" className="p-2">
          <Plus className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* Current Weight */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-slate-900">
            {currentWeight}
          </span>
          <Body className="text-slate-500 text-sm">kg</Body>
        </div>
        <Body className="text-slate-600 text-sm">
          Current weight
        </Body>
      </div>

      {/* Progress */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">This week</Body>
          <div className="flex items-center space-x-1">
            {isDecreasing ? (
              <TrendingDown className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-500" />
            )}
            <Body className={`text-sm font-medium ${
              isDecreasing ? 'text-green-600' : 'text-red-600'
            }`}>
              {isDecreasing ? '' : '+'}{weeklyChange.toFixed(1)}kg
            </Body>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Goal</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {goalWeight}kg
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">To go</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {(currentWeight - goalWeight).toFixed(1)}kg
          </Body>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <Body className="text-slate-600 text-xs">Progress</Body>
          <Body className="text-slate-600 text-xs">
            {Math.round((totalProgress / (previousWeight - goalWeight)) * 100)}%
          </Body>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((totalProgress / (previousWeight - goalWeight)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="ghost" 
        className="w-full text-blue-600 hover:bg-blue-50"
      >
        View Details
      </Button>
    </Card>
  );
}
