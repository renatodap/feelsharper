'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { Camera, TrendingUp, Calendar } from 'lucide-react';

export default function ProgressCard() {
  // Mock data - in real app, this would come from props or API
  const totalPhotos = 12;
  const lastPhotoDate = '3 days ago';
  const streak = 4; // weeks
  const nextPhotoReminder = 'Tomorrow';

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Camera className="w-5 h-5 text-indigo-500" />
          </div>
          <Subheading className="font-semibold text-slate-900">
            Progress Photos
          </Subheading>
        </div>
        <div className="text-right">
          <Body className="text-indigo-600 text-xs font-medium">
            {streak}w streak
          </Body>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-2xl font-bold text-slate-900">
            {totalPhotos}
          </span>
          <Body className="text-slate-500 text-sm">photos captured</Body>
        </div>
        <Body className="text-slate-600 text-sm">
          Last photo: {lastPhotoDate}
        </Body>
      </div>

      {/* Progress Grid Preview */}
      <div className="mb-4">
        <Body className="text-slate-600 text-xs uppercase tracking-wide mb-2">
          Recent Progress
        </Body>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Next Reminder */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <Body className="text-slate-700 text-sm">
            Next photo: <span className="font-medium">{nextPhotoReminder}</span>
          </Body>
        </div>
      </div>

      {/* Action */}
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center">
        <Camera className="w-4 h-4 mr-2" />
        Take Photo
      </Button>
    </Card>
  );
}
