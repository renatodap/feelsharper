'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';

interface Insight {
  id: string;
  title: string;
  summary: string;
  details: string;
  confidence: number;
  actionable: boolean;
  action?: {
    label: string;
    route: string;
  };
  category: 'performance' | 'nutrition' | 'recovery' | 'habit' | 'health';
  priority: number;
}

export default function CoachInsightsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
    fetchInsights();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/sign-in');
      return;
    }
    setUser(session.user);
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights/daily', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || getMockInsights());
      } else {
        // Use mock insights for now
        setInsights(getMockInsights());
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights(getMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const getMockInsights = (): Insight[] => {
    return [
      {
        id: '1',
        title: 'Recovery Pattern Detected',
        summary: 'Your performance improves 23% with 8+ hours of sleep',
        details: 'Analysis of your last 30 days shows a strong correlation between sleep duration and workout performance. On days with 8+ hours of sleep, your average workout intensity increased by 23% and perceived effort decreased by 15%. Consider prioritizing sleep before important training sessions.',
        confidence: 92,
        actionable: true,
        action: {
          label: 'Log tonight\'s sleep goal',
          route: '/log'
        },
        category: 'recovery',
        priority: 1
      },
      {
        id: '2',
        title: 'Protein Intake Optimization',
        summary: 'You\'re averaging 20g below your daily protein target',
        details: 'Based on your weight (175 lbs) and training volume, your optimal protein intake is 140g/day. You\'ve been averaging 120g/day this week. Adding a protein shake post-workout or Greek yogurt as a snack could help you reach your target and improve recovery.',
        confidence: 88,
        actionable: true,
        action: {
          label: 'Log protein intake',
          route: '/log'
        },
        category: 'nutrition',
        priority: 2
      },
      {
        id: '3',
        title: 'Weekly Volume Trending Up',
        summary: 'Training volume increased 15% - monitor for overtraining',
        details: 'Your training volume has increased from 12 to 14 hours/week over the past month. While progressive overload is good, watch for signs of overtraining: decreased performance, persistent fatigue, or mood changes. Consider a deload week if you notice these symptoms.',
        confidence: 85,
        actionable: false,
        category: 'performance',
        priority: 3
      }
    ];
  };

  const toggleExpanded = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-blue-400';
    return 'text-yellow-400';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'nutrition': return '🥗';
      case 'recovery': return '😴';
      case 'habit': return '🎯';
      case 'health': return '❤️';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing your data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Coach Insights
            </h1>
            <p className="text-gray-400">
              Your top {insights.length} personalized insights for today
            </p>
            <Button
              onClick={refreshInsights}
              disabled={refreshing}
              className="mt-4"
              variant="outline"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Insights'}
            </Button>
          </div>

          {/* Insights Cards */}
          <div className="space-y-6">
            {insights.map((insight) => (
              <Card 
                key={insight.id}
                className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Insight Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(insight.category)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {insight.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm ${getConfidenceColor(insight.confidence)}`}>
                            {insight.confidence}% confidence
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400 capitalize">
                            {insight.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insight Summary */}
                  <p className="text-gray-300 mb-4 text-lg">
                    {insight.summary}
                  </p>

                  {/* Expandable Details */}
                  {expandedInsights.has(insight.id) && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 leading-relaxed">
                        {insight.details}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => toggleExpanded(insight.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {expandedInsights.has(insight.id) ? 'Show less' : 'Learn more'}
                    </button>
                    
                    {insight.actionable && insight.action && (
                      <Button
                        onClick={() => router.push(insight.action!.route)}
                        variant="primary"
                        size="sm"
                      >
                        {insight.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/log')}
                variant="outline"
                className="w-full"
              >
                Log Activity
              </Button>
              <Button
                onClick={() => router.push('/coach')}
                variant="outline"
                className="w-full"
              >
                Ask Coach
              </Button>
              <Button
                onClick={() => router.push('/my-dashboard')}
                variant="outline"
                className="w-full"
              >
                View Dashboard
              </Button>
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className="w-full"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}