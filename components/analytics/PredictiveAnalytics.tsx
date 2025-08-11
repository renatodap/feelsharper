'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  BarChart3,
  LineChart,
  PieChart,
  Settings
} from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'warning' | 'milestone';
  category: 'performance' | 'recovery' | 'nutrition' | 'goal_progress';
  title: string;
  description: string;
  confidence: number; // 0-100
  timeline: string;
  actionItems?: string[];
  data?: any;
}

interface AnalyticsData {
  weightTrend: {
    current: number;
    predicted30Day: number;
    predicted90Day: number;
    confidence: number;
  };
  performanceMetrics: {
    strength: { trend: 'up' | 'down' | 'stable'; change: number };
    endurance: { trend: 'up' | 'down' | 'stable'; change: number };
    consistency: { trend: 'up' | 'down' | 'stable'; change: number };
  };
  recoveryScore: {
    current: number;
    trend: 'improving' | 'declining' | 'stable';
    factors: string[];
  };
  goalProgress: {
    primaryGoal: string;
    completionPercentage: number;
    estimatedCompletion: string;
    onTrack: boolean;
  };
}

// Mock data - in production this would come from ML models
const mockInsights: PredictiveInsight[] = [
  {
    id: '1',
    type: 'prediction',
    category: 'goal_progress',
    title: 'Goal Achievement Forecast',
    description: 'Based on your current progress rate, you\'re likely to reach your weight loss goal 2 weeks ahead of schedule.',
    confidence: 87,
    timeline: '4-6 weeks',
    actionItems: [
      'Maintain current caloric deficit',
      'Consider adding 1 more cardio session per week',
      'Ensure adequate protein intake (150g daily)'
    ]
  },
  {
    id: '2',
    type: 'warning',
    category: 'recovery',
    title: 'Recovery Decline Detected',
    description: 'Your HRV and sleep quality have decreased by 15% over the past week. Overtraining risk is elevated.',
    confidence: 92,
    timeline: 'Next 1-2 weeks',
    actionItems: [
      'Schedule 2 rest days this week',
      'Reduce training intensity by 10-15%',
      'Focus on sleep hygiene and stress management',
      'Consider massage or active recovery'
    ]
  },
  {
    id: '3',
    type: 'recommendation',
    category: 'performance',
    title: 'Strength Plateau Breakthrough',
    description: 'Your squat has plateaued for 3 weeks. ML analysis suggests changing rep ranges and adding pause squats.',
    confidence: 78,
    timeline: '2-3 weeks',
    actionItems: [
      'Switch to 8-12 rep range for 2 weeks',
      'Add pause squats (2 sets)',
      'Increase frequency to 2x per week',
      'Focus on eccentric control'
    ]
  },
  {
    id: '4',
    type: 'milestone',
    category: 'nutrition',
    title: 'Protein Consistency Milestone',
    description: 'Congratulations! You\'ve hit your protein target 14 days in a row. This consistency will accelerate muscle growth.',
    confidence: 100,
    timeline: 'Achieved',
    actionItems: [
      'Keep up the excellent consistency',
      'Consider timing protein around workouts',
      'Track muscle recovery improvements'
    ]
  }
];

const mockAnalytics: AnalyticsData = {
  weightTrend: {
    current: 185.2,
    predicted30Day: 182.5,
    predicted90Day: 178.8,
    confidence: 84
  },
  performanceMetrics: {
    strength: { trend: 'up', change: 8.5 },
    endurance: { trend: 'stable', change: 2.1 },
    consistency: { trend: 'up', change: 15.3 }
  },
  recoveryScore: {
    current: 72,
    trend: 'declining',
    factors: ['Sleep quality down 10%', 'HRV decreased', 'Stress levels elevated']
  },
  goalProgress: {
    primaryGoal: 'Lose 15 lbs by April',
    completionPercentage: 47,
    estimatedCompletion: 'March 18, 2025',
    onTrack: true
  }
};

export function PredictiveAnalytics() {
  const [insights, setInsights] = useState<PredictiveInsight[]>(mockInsights);
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredInsights = insights.filter(insight => 
    filterCategory === 'all' || insight.category === filterCategory
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'recommendation': return Brain;
      case 'warning': return AlertTriangle;
      case 'milestone': return CheckCircle;
      default: return Target;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600 bg-blue-50';
      case 'recommendation': return 'text-purple-600 bg-purple-50';
      case 'warning': return 'text-red-600 bg-red-50';
      case 'milestone': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            AI Analytics & Predictions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Intelligent insights powered by machine learning analysis of your data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-6 w-6 text-blue-600" />
            <Badge className={analytics.goalProgress.onTrack ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {analytics.goalProgress.onTrack ? 'On Track' : 'Behind'}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {analytics.goalProgress.completionPercentage}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Goal Progress
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${analytics.goalProgress.completionPercentage}%` }}
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-sm text-slate-600">Strength</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              +{analytics.performanceMetrics.strength.change}%
            </span>
            {getTrendIcon(analytics.performanceMetrics.strength.trend)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            vs Last Month
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Heart className="h-6 w-6 text-red-600" />
            <span className="text-sm text-slate-600">Recovery</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {analytics.recoveryScore.current}
            </span>
            {getTrendIcon(analytics.recoveryScore.trend)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Recovery Score
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-6 w-6 text-purple-600" />
            <span className="text-sm text-slate-600">Consistency</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              +{analytics.performanceMetrics.consistency.change}%
            </span>
            {getTrendIcon(analytics.performanceMetrics.consistency.trend)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Workout Adherence
          </div>
        </Card>
      </div>

      {/* Weight Prediction Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weight Trend Prediction
          </h3>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(timeframe => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe as any)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Chart placeholder - in production this would be a real chart */}
            <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">
                  Interactive weight prediction chart would appear here
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">Current Weight</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {analytics.weightTrend.current} lbs
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-200 mb-1">30-Day Prediction</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {analytics.weightTrend.predicted30Day} lbs
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                {analytics.weightTrend.confidence}% confidence
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">90-Day Projection</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analytics.weightTrend.predicted90Day} lbs
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Goal target: 175 lbs
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          All Insights
        </Button>
        {['performance', 'recovery', 'nutrition', 'goal_progress'].map(category => (
          <Button
            key={category}
            variant={filterCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(category)}
          >
            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          🧠 AI-Powered Insights
        </h3>
        
        {filteredInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type);
          const colorClasses = getInsightColor(insight.type);
          
          return (
            <Card key={insight.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {insight.title}
                    </h4>
                    <Badge variant="secondary">
                      {insight.confidence}% confidence
                    </Badge>
                    <Badge className="text-xs">
                      {insight.timeline}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    {insight.description}
                  </p>
                  
                  {insight.actionItems && (
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Recommended Actions:
                      </div>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recovery Analysis
          </h3>
          
          <div className="space-y-4">
            {analytics.recoveryScore.factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{factor}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">
              Recommendation
            </div>
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Focus on sleep optimization and stress management this week. Consider reducing training intensity by 10-15%.
            </p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Performance Trends
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Strength</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">+8.5% this month</div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Endurance</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">+2.1% this month</div>
              </div>
              <Target className="h-5 w-5 text-slate-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Consistency</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">+15.3% this month</div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}