'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Utensils, Plus } from 'lucide-react';

export default function NutritionCard() {
  // Mock data - in real app, this would come from props or API
  const caloriesConsumed = 1420;
  const caloriesTarget = 1800;
  const proteinConsumed = 85;
  const proteinTarget = 110;
  const carbsConsumed = 140;
  const carbsTarget = 180;
  const fatConsumed = 65;
  const fatTarget = 80;

  const caloriesRemaining = caloriesTarget - caloriesConsumed;
  const proteinRemaining = proteinTarget - proteinConsumed;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Utensils className="w-5 h-5 text-green-500" />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Nutrition
          </Subheading>
        </div>
        <Button variant="ghost" className="p-2">
          <Plus className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* Calories */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-2xl font-bold text-slate-900">
            {caloriesRemaining}
          </span>
          <Body className="text-slate-500 text-sm">kcal left</Body>
        </div>
        <Body className="text-slate-600 text-sm">
          {caloriesConsumed} / {caloriesTarget} consumed
        </Body>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((caloriesConsumed / caloriesTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Macros */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Protein</Body>
          <div className="text-right">
            <Body className="text-slate-900 text-sm font-medium">
              {proteinConsumed}g / {proteinTarget}g
            </Body>
            <Body className={`text-xs ${proteinRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {proteinRemaining > 0 ? `${proteinRemaining}g to go` : 'Target hit!'}
            </Body>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Carbs</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {carbsConsumed}g / {carbsTarget}g
          </Body>
        </div>

        <div className="flex items-center justify-between">
          <Body className="text-slate-600 text-sm">Fat</Body>
          <Body className="text-slate-900 text-sm font-medium">
            {fatConsumed}g / {fatTarget}g
          </Body>
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="ghost" 
        className="w-full text-green-600 hover:bg-green-50"
      >
        Log Meal
      </Button>
    </Card>
  );
}
