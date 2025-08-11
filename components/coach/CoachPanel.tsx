'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  MessageCircle, 
  X, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CoachInsight {
  id: string;
  insight_type: string;
  title: string;
  message: string;
  action_label?: string;
  action_payload?: any;
  priority: number;
}

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  primaryGoal?: string;
}

export default function CoachPanel({ isOpen, onClose, primaryGoal }: CoachPanelProps) {
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && insights.length === 0) {
      fetchInsights();
    }
  }, [isOpen]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coach/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (insight: CoachInsight) => {
    if (!insight.action_payload) return;

    setLoading(true);
    try {
      const response = await fetch('/api/coach/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId: insight.id,
          actionPayload: insight.action_payload
        })
      });

      if (response.ok) {
        setAppliedActions(prev => new Set([...prev, insight.id]));
        // Show success feedback
        setTimeout(() => {
          setAppliedActions(prev => {
            const newSet = new Set(prev);
            newSet.delete(insight.id);
            return newSet;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string, priority: number) => {
    switch (type) {
      case 'training':
        return <Zap className="w-5 h-5 text-purple-500" />;
      case 'nutrition':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'recovery':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-purple-50';
      case 'nutrition':
        return 'bg-green-50';
      case 'recovery':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-50 p-4">
      <Card className="w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <Heading className="text-lg font-bold text-slate-900">
                Your Coach
              </Heading>
              <Body className="text-slate-600 text-sm">
                Personalized insights & quick actions
              </Body>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && insights.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <Subheading className="text-slate-900 font-semibold mb-2">
                No insights available
              </Subheading>
              <Body className="text-slate-600">
                Keep logging your activities to get personalized coaching insights.
              </Body>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const isApplied = appliedActions.has(insight.id);
                
                return (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.priority === 1 ? 'border-l-red-500' :
                      insight.priority === 2 ? 'border-l-yellow-500' : 'border-l-blue-500'
                    } ${getInsightBgColor(insight.insight_type)}`}
                  >
                    {/* Insight Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="p-1 bg-white rounded-full">
                        {getInsightIcon(insight.insight_type, insight.priority)}
                      </div>
                      <div className="flex-1">
                        <Subheading className="font-semibold text-slate-900 mb-1">
                          {insight.title}
                        </Subheading>
                        <Body className="text-slate-700 text-sm">
                          {insight.message}
                        </Body>
                      </div>
                    </div>

                    {/* Action Button */}
                    {insight.action_label && (
                      <div className="mt-3">
                        <Button
                          onClick={() => applyRecommendation(insight)}
                          disabled={loading || isApplied}
                          className={`w-full text-sm ${
                            isApplied
                              ? 'bg-green-600 text-white'
                              : insight.insight_type === 'training'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : insight.insight_type === 'nutrition'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : insight.insight_type === 'recovery'
                              ? 'bg-orange-600 hover:bg-orange-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : isApplied ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : null}
                          {isApplied ? 'Applied!' : insight.action_label}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <Body className="text-slate-500 text-xs text-center">
            Insights refresh based on your latest activity and progress.
          </Body>
        </div>
      </Card>
    </div>
  );
}
