'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, ChefHat } from 'lucide-react';

export function MealPlanner() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ChefHat className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Meal Planner
        </h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        AI-powered meal planning coming soon
      </p>
      <Button variant="outline" size="sm" className="w-full">
        <Calendar className="h-4 w-4 mr-2" />
        Plan Weekly Meals
      </Button>
    </Card>
  );
}