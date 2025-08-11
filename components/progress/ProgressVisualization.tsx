'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Calendar, 
  Camera, 
  Zap, 
  Heart, 
  Moon, 
  Dumbbell,
  Scale,
  Ruler,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: React.ReactNode;
  color: string;
  target?: number;
  isGood: boolean; // Whether increase is good or bad for this metric
}

interface TimeSeriesData {
  date: string;
  weight: number;
  energy: number;
  sleep: number;
  mood: number;
  workouts: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'strength' | 'endurance' | 'consistency' | 'nutrition' | 'wellness';
}

export default function ProgressVisualization() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [progressData, setProgressData] = useState<TimeSeriesData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ProgressMetric[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = () => {
    // Mock data - in production, this would come from API based on timeRange
    const mockData: TimeSeriesData[] = [
      { date: '2024-01-01', weight: 180, energy: 3, sleep: 6.5, mood: 3, workouts: 2 },
      { date: '2024-01-08', weight: 179, energy: 3.5, sleep: 7, mood: 3.5, workouts: 3 },
      { date: '2024-01-15', weight: 178, energy: 4, sleep: 7.5, mood: 4, workouts: 4 },
      { date: '2024-01-22', weight: 177, energy: 4.2, sleep: 7.8, mood: 4.2, workouts: 4 },
      { date: '2024-01-29', weight: 176, energy: 4.5, sleep: 8, mood: 4.5, workouts: 5 },
      { date: '2024-02-05', weight: 175, energy: 4.3, sleep: 7.5, mood: 4.3, workouts: 4 },
      { date: '2024-02-12', weight: 174, energy: 4.8, sleep: 8.2, mood: 4.7, workouts: 5 },
    ];

    setProgressData(mockData);

    // Calculate current metrics with trends
    const latest = mockData[mockData.length - 1];
    const previous = mockData[mockData.length - 2];

    setCurrentMetrics([
      {
        id: 'weight',
        name: 'Weight',
        value: latest.weight,
        unit: 'lbs',
        change: latest.weight - previous.weight,
        changeType: latest.weight < previous.weight ? 'decrease' : latest.weight > previous.weight ? 'increase' : 'stable',
        icon: <Scale className="w-5 h-5" />,
        color: '#ef4444',
        target: 170,
        isGood: false // For weight loss, decrease is good
      },
      {
        id: 'energy',
        name: 'Energy Level',
        value: latest.energy,
        unit: '/5',
        change: latest.energy - previous.energy,
        changeType: latest.energy > previous.energy ? 'increase' : latest.energy < previous.energy ? 'decrease' : 'stable',
        icon: <Zap className="w-5 h-5" />,
        color: '#f59e0b',
        target: 4.5,
        isGood: true
      },
      {
        id: 'sleep',
        name: 'Sleep Quality',
        value: latest.sleep,
        unit: 'hrs',
        change: latest.sleep - previous.sleep,
        changeType: latest.sleep > previous.sleep ? 'increase' : latest.sleep < previous.sleep ? 'decrease' : 'stable',
        icon: <Moon className="w-5 h-5" />,
        color: '#8b5cf6',
        target: 8,
        isGood: true
      },
      {
        id: 'mood',
        name: 'Mood',
        value: latest.mood,
        unit: '/5',
        change: latest.mood - previous.mood,
        changeType: latest.mood > previous.mood ? 'increase' : latest.mood < previous.mood ? 'decrease' : 'stable',
        icon: <Heart className="w-5 h-5" />,
        color: '#ec4899',
        target: 4.5,
        isGood: true
      },
      {
        id: 'workouts',
        name: 'Weekly Workouts',
        value: latest.workouts,
        unit: '/week',
        change: latest.workouts - previous.workouts,
        changeType: latest.workouts > previous.workouts ? 'increase' : latest.workouts < previous.workouts ? 'decrease' : 'stable',
        icon: <Dumbbell className="w-5 h-5" />,
        color: '#3b82f6',
        target: 5,
        isGood: true
      }
    ]);

    setRecentAchievements([
      {
        id: '1',
        title: 'Consistency Champion',
        description: '7 days in a row of logging activities',
        icon: '🔥',
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'consistency'
      },
      {
        id: '2',
        title: 'Energy Boost',
        description: 'Energy level improved by 20% this month',
        icon: '⚡',
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'wellness'
      },
      {
        id: '3',
        title: 'Sleep Master',
        description: 'Averaged 8+ hours of sleep for a week',
        icon: '😴',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        category: 'wellness'
      }
    ]);
  };

  const getTrendIcon = (changeType: string, isGood: boolean) => {
    if (changeType === 'stable') return <Minus className="w-4 h-4 text-slate-500" />;
    
    const isPositiveTrend = (changeType === 'increase' && isGood) || (changeType === 'decrease' && !isGood);
    
    if (isPositiveTrend) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const getTrendColor = (changeType: string, isGood: boolean) => {
    if (changeType === 'stable') return 'text-slate-500';
    
    const isPositiveTrend = (changeType === 'increase' && isGood) || (changeType === 'decrease' && !isGood);
    return isPositiveTrend ? 'text-green-500' : 'text-red-500';
  };

  const formatChange = (change: number, unit: string) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${unit}`;
  };

  const getProgressPercentage = (current: number, target?: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const renderMetricCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {currentMetrics.map((metric) => (
        <Card key={metric.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(metric.id)}>
          <div className="flex items-center justify-between mb-3">
            <div style={{ color: metric.color }}>
              {metric.icon}
            </div>
            {getTrendIcon(metric.changeType, metric.isGood)}
          </div>
          
          <Typography variant="h3" className="text-2xl font-bold mb-1">
            {metric.value}{metric.unit}
          </Typography>
          
          <Typography variant="body2" className="text-slate-600 mb-2">
            {metric.name}
          </Typography>
          
          <div className="flex items-center justify-between">
            <Typography variant="body2" className={`text-sm font-medium ${getTrendColor(metric.changeType, metric.isGood)}`}>
              {formatChange(metric.change, metric.unit)}
            </Typography>
            
            {metric.target && (
              <div className="text-right">
                <Typography variant="body2" className="text-xs text-slate-500">
                  {getProgressPercentage(metric.value, metric.target).toFixed(0)}% to goal
                </Typography>
              </div>
            )}
          </div>
          
          {metric.target && (
            <div className="mt-2">
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${getProgressPercentage(metric.value, metric.target)}%`,
                    backgroundColor: metric.color
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderChart = () => {
    if (selectedMetric === 'overview') {
      return (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h4" className="font-semibold">
              Progress Overview
            </Typography>
            <div className="flex gap-2">
              {['week', 'month', 'quarter', 'year'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer>
              <RechartsLineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep" />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="workouts" stroke="#3b82f6" strokeWidth={2} name="Workouts" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    const selectedMetricData = currentMetrics.find(m => m.id === selectedMetric);
    if (!selectedMetricData) return null;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div style={{ color: selectedMetricData.color }}>
              {selectedMetricData.icon}
            </div>
            <Typography variant="h4" className="font-semibold">
              {selectedMetricData.name} Trend
            </Typography>
          </div>
          <Button variant="ghost" onClick={() => setSelectedMetric('overview')}>
            Back to Overview
          </Button>
        </div>
        
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <RechartsLineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={selectedMetricData.color} 
                strokeWidth={3}
                name={selectedMetricData.name}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
        
        {selectedMetricData.target && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="font-medium">Target Progress</Typography>
                <Typography variant="body2" className="text-slate-600">
                  Current: {selectedMetricData.value}{selectedMetricData.unit} | 
                  Target: {selectedMetricData.target}{selectedMetricData.unit}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="h4" className="font-bold" style={{ color: selectedMetricData.color }}>
                  {getProgressPercentage(selectedMetricData.value, selectedMetricData.target).toFixed(0)}%
                </Typography>
                <Typography variant="body2" className="text-slate-500">Complete</Typography>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderAchievements = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6 text-amber-500" />
          <Typography variant="h4" className="font-semibold">
            Recent Achievements
          </Typography>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
            <div className="text-2xl">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <Typography variant="body2" className="font-semibold mb-1">
                {achievement.title}
              </Typography>
              <Typography variant="body2" className="text-slate-600 text-sm">
                {achievement.description}
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="body2" className="text-slate-500 text-xs">
                {achievement.earnedAt.toLocaleDateString()}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderProgressPhotos = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Camera className="w-6 h-6 text-blue-500" />
          <Typography variant="h4" className="font-semibold">
            Progress Photos
          </Typography>
        </div>
        <Button variant="outline" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Add Photo
        </Button>
      </div>
      
      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
        <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <Typography variant="h4" className="font-semibold mb-2 text-slate-600">
          Start Your Visual Journey
        </Typography>
        <Typography variant="body2" className="text-slate-500 mb-4">
          Progress photos show changes that the scale can't capture
        </Typography>
        <Button variant="primary">
          <Camera className="w-4 h-4 mr-2" />
          Take First Photo
        </Button>
      </div>
    </Card>
  );

  const renderInsights = () => (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-6 h-6 text-blue-500" />
        <Typography variant="h4" className="font-semibold text-blue-900">
          AI Insights
        </Typography>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-blue-900">
            🎯 Pattern Recognition
          </Typography>
          <Typography variant="body2" className="text-blue-800">
            Your energy levels are 23% higher on days when you sleep 7.5+ hours. Consider prioritizing sleep consistency.
          </Typography>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-blue-900">
            💪 Strength Correlation
          </Typography>
          <Typography variant="body2" className="text-blue-800">
            Your workout performance improves by 15% when you log meals consistently. Nutrition tracking is paying off!
          </Typography>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-blue-900">
            📈 Progress Prediction
          </Typography>
          <Typography variant="body2" className="text-blue-800">
            At your current rate, you'll reach your weight goal in 8-10 weeks. Stay consistent with your current approach.
          </Typography>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Your Progress Journey
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Celebrating every win, tracking what matters, building unstoppable momentum
        </Typography>
      </div>

      {/* Metric Cards */}
      {renderMetricCards()}

      {/* Main Chart */}
      {renderChart()}

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        {renderAchievements()}
        
        {/* AI Insights */}
        {renderInsights()}
      </div>

      {/* Progress Photos */}
      {renderProgressPhotos()}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="primary" size="lg">
          <Target className="w-5 h-5 mr-2" />
          Set New Goal
        </Button>
        <Button variant="outline" size="lg">
          <Calendar className="w-5 h-5 mr-2" />
          Schedule Check-in
        </Button>
        <Button variant="outline" size="lg">
          <BarChart3 className="w-5 h-5 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
}
