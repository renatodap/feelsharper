'use client';

import Card from '@/components/ui/Card';
import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function ProgressCharts() {
  const [activeChart, setActiveChart] = useState<'weight' | 'strength' | 'volume'>('weight');

  // Mock data - would be fetched from Supabase
  const weightData = [
    { date: '1/8', weight: 78.2 },
    { date: '2/8', weight: 78.0 },
    { date: '3/8', weight: 77.8 },
    { date: '4/8', weight: 77.6 },
    { date: '5/8', weight: 77.5 },
    { date: '6/8', weight: 77.3 },
    { date: '7/8', weight: 77.1 },
    { date: '8/8', weight: 77.0 },
    { date: '9/8', weight: 76.9 },
    { date: '10/8', weight: 76.8 },
    { date: '11/8', weight: 76.7 },
  ];

  const strengthData = [
    { exercise: 'Squat', current: 120, previous: 115 },
    { exercise: 'Bench', current: 85, previous: 82.5 },
    { exercise: 'Deadlift', current: 140, previous: 135 },
    { exercise: 'OHP', current: 55, previous: 52.5 },
  ];

  const volumeData = [
    { week: 'W1', volume: 12500 },
    { week: 'W2', volume: 13200 },
    { week: 'W3', volume: 13800 },
    { week: 'W4', volume: 11500 }, // Deload week
    { week: 'W5', volume: 14200 },
    { week: 'W6', volume: 14800 },
  ];

  const bodyCompositionData = [
    { name: 'Muscle', value: 65, color: '#10b981' },
    { name: 'Fat', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 20, color: '#6b7280' },
  ];

  const chartTabs = [
    { id: 'weight', label: 'Weight Trend', icon: '📈' },
    { id: 'strength', label: 'Strength PRs', icon: '💪' },
    { id: 'volume', label: 'Training Volume', icon: '📊' },
  ] as const;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Progress Analytics
        </h2>
        
        {/* Chart Tabs */}
        <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeChart === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="h-80">
        {activeChart === 'weight' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value) => [`${value} kg`, 'Weight']}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'strength' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strengthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="exercise" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value, name) => [`${value} kg`, name === 'current' ? 'Current' : 'Previous']}
              />
              <Bar dataKey="previous" fill="#94a3b8" name="Previous" radius={[2, 2, 0, 0]} />
              <Bar dataKey="current" fill="#10b981" name="Current" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'volume' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="week" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value) => [`${value.toLocaleString()} kg`, 'Training Volume']}
              />
              <Bar 
                dataKey="volume" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                name="Volume"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">-1.5kg</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">This Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">+12.5kg</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Lifted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">85%</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Goal Progress</div>
        </div>
      </div>
    </Card>
  );
}