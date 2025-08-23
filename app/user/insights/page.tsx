'use client';

import { 
  TrendingUp,
  Brain,
  Target,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Award
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample insights data
const insights = [
  {
    id: 1,
    type: 'performance',
    title: 'Peak Performance Hours',
    insight: 'Your best workouts happen between 4-6 PM. Your average intensity is 23% higher during this window.',
    recommendation: 'Schedule important training sessions in the late afternoon for optimal results.',
    trend: 'up',
    impact: 'high'
  },
  {
    id: 2,
    type: 'recovery',
    title: 'Recovery Pattern',
    insight: 'You typically need 48 hours between high-intensity tennis sessions for full recovery.',
    recommendation: 'Consider active recovery activities like yoga or swimming on rest days.',
    trend: 'stable',
    impact: 'medium'
  },
  {
    id: 3,
    type: 'consistency',
    title: 'Weekly Consistency',
    insight: 'Your workout frequency drops 40% on Wednesdays and Thursdays.',
    recommendation: 'Set reminders or schedule lighter activities mid-week to maintain momentum.',
    trend: 'down',
    impact: 'high'
  },
  {
    id: 4,
    type: 'improvement',
    title: 'Cardio Improvement',
    insight: 'Your average running pace has improved by 8% over the last month.',
    recommendation: 'Increase distance gradually - you\'re ready for longer runs.',
    trend: 'up',
    impact: 'medium'
  }
];

const aiRecommendations = [
  {
    priority: 'high',
    title: 'Optimize Tennis Training',
    description: 'Based on your patterns, adding 15 minutes of serve practice would significantly improve match performance.'
  },
  {
    priority: 'medium',
    title: 'Hydration Reminder',
    description: 'Your afternoon workouts could benefit from increased pre-workout hydration.'
  },
  {
    priority: 'low',
    title: 'Cross-Training Opportunity',
    description: 'Adding swimming once a week could improve your tennis endurance.'
  }
];

export default function InsightsPage() {
  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <ChevronUp className="w-5 h-5 text-green-400" />;
      case 'down': return <ChevronDown className="w-5 h-5 text-red-400" />;
      default: return <div className="w-5 h-5 rounded-full bg-yellow-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'border-red-400/30 bg-red-400/5';
      case 'medium': return 'border-yellow-400/30 bg-yellow-400/5';
      default: return 'border-green-400/30 bg-green-400/5';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-title font-black text-white mb-2">
          AI-Powered <span className="text-feel-primary lightning-text">Insights</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Personalized recommendations based on your training patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-feel-primary/20 to-feel-secondary/10 backdrop-blur-sm border border-feel-primary/30 p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-feel-primary" />
            <span className="text-3xl font-title font-bold text-feel-primary">87%</span>
          </div>
          <h3 className="font-title font-bold text-white mb-1">Performance Score</h3>
          <p className="text-sm text-sharpened-light-gray font-body">Above average for your fitness level</p>
        </div>

        <div className="bg-gradient-to-br from-green-400/20 to-green-600/10 backdrop-blur-sm border border-green-400/30 p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-title font-bold text-green-400">+12%</span>
          </div>
          <h3 className="font-title font-bold text-white mb-1">Weekly Progress</h3>
          <p className="text-sm text-sharpened-light-gray font-body">Improvement from last week</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/10 backdrop-blur-sm border border-yellow-400/30 p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-title font-bold text-yellow-400">4/5</span>
          </div>
          <h3 className="font-title font-bold text-white mb-1">Goals Met</h3>
          <p className="text-sm text-sharpened-light-gray font-body">This week's targets</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">AI Recommendations</h2>
        </div>

        <div className="space-y-3">
          {aiRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`bg-sharpened-coal/30 backdrop-blur-sm border p-4 hover:border-feel-primary/30 transition-all ${
                rec.priority === 'high' ? 'border-red-400/30' : 
                rec.priority === 'medium' ? 'border-yellow-400/30' : 
                'border-green-400/30'
              }`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`px-2 py-1 text-xs font-body font-semibold ${
                  rec.priority === 'high' ? 'text-red-400 bg-red-400/10' : 
                  rec.priority === 'medium' ? 'text-yellow-400 bg-yellow-400/10' : 
                  'text-green-400 bg-green-400/10'
                }`}>
                  {rec.priority.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-title font-bold text-white mb-1">{rec.title}</h3>
                  <p className="text-sharpened-light-gray font-body text-sm">{rec.description}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-sharpened-gray hover:text-green-400 cursor-pointer transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Insights */}
      <div>
        <h2 className="text-2xl font-title font-bold text-white mb-4">Performance Insights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6 hover:border-feel-primary/30 transition-all ${getImpactColor(insight.impact)}`}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <LightningLogo className="w-6 h-6 text-feel-primary" />
                  <h3 className="font-title font-bold text-white text-lg">{insight.title}</h3>
                </div>
                {getTrendIcon(insight.trend)}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-feel-secondary" />
                    <span className="text-xs font-body font-semibold text-feel-secondary uppercase tracking-wider">Insight</span>
                  </div>
                  <p className="text-sharpened-light-gray font-body text-sm">{insight.insight}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-feel-accent" />
                    <span className="text-xs font-body font-semibold text-feel-accent uppercase tracking-wider">Action</span>
                  </div>
                  <p className="text-white font-body text-sm">{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-feel-primary/10 to-feel-secondary/10 backdrop-blur-sm border border-feel-primary/30 p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="w-10 h-10 text-feel-primary" />
              <div>
                <h3 className="text-xl font-title font-bold text-white">You're in the top 15%</h3>
                <p className="text-sharpened-light-gray font-body">Of all FeelSharper athletes this month</p>
              </div>
            </div>
            <button className="sharp-button px-6 py-3 bg-gradient-to-r from-feel-primary to-feel-secondary">
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}