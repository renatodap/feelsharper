/**
 * Insights Page (MVP Implementation)
 * TDD Step 5: Feature Implementation
 * 
 * Displays 2-3 AI-generated insights, critical question, and micro-chat.
 * NO MOCKS IN PRODUCTION CODE as per TDD requirements.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, ChevronDown, ChevronUp, Info, AlertTriangle, 
  AlertCircle, Send, Clock, X, Target
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { Insight, InsightsResponse, CoachQAResponse } from '@/lib/types/mvp';

// Severity icons and colors
const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Info'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    label: 'Act Now'
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Critical'
  }
};

// Insight Card Component
function InsightCard({ 
  insight, 
  onSnooze,
  onAction 
}: { 
  insight: Insight;
  onSnooze: (id: string) => void;
  onAction: (insight: Insight) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[insight.severity];
  const Icon = config.icon;

  return (
    <div 
      className={`p-4 rounded-xl ${config.bg} ${config.border} border transition-all duration-200`}
      data-testid={`insight-card-${insight.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h3 className="text-white font-medium mb-2">{insight.title}</h3>
          <p className="text-gray-300 text-sm">{insight.body}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={expanded ? 'collapse' : 'expand'}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Primary Action */}
      <button
        onClick={() => onAction(insight)}
        className={`mt-3 px-4 py-2 ${config.bg} hover:opacity-80 border ${config.border} rounded-lg text-sm font-medium ${config.color} transition-opacity`}
      >
        {insight.evidence_json?.action?.label || 'Take Action'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Why you're seeing this</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {insight.evidence_json?.logs?.map((logId: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span>Activity log: {logId}</span>
                </li>
              ))}
              {insight.evidence_json?.pattern && (
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-500 rounded-full" />
                  <span>Pattern: {insight.evidence_json.pattern}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">What to do</h4>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. {insight.evidence_json?.steps?.[0] || 'Follow the recommended action'}</li>
              <li>2. {insight.evidence_json?.steps?.[1] || 'Track your progress'}</li>
              <li>3. {insight.evidence_json?.steps?.[2] || 'Adjust as needed'}</li>
            </ol>
          </div>

          <div className="flex gap-2">
            {insight.evidence_json?.autoTrack && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300">Auto-track?</span>
              </label>
            )}
            <button
              onClick={() => onSnooze(insight.id)}
              className="ml-auto text-sm text-gray-400 hover:text-gray-300"
            >
              Dismiss for 7 days
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Critical Question Component
function CriticalQuestion({ 
  question,
  onAnswer 
}: { 
  question: InsightsResponse['criticalQuestion'];
  onAnswer: (answer: string) => void;
}) {
  if (!question) return null;

  return (
    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
      <p className="text-white font-medium mb-3">{question.question}</p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onAnswer(option)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-colors"
          >
            {option}
          </button>
        ))}
        <button
          onClick={() => onAnswer('other')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 transition-colors"
        >
          Other...
        </button>
      </div>
    </div>
  );
}

// Ask Coach Micro-Chat Component
function AskCoach() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAsk = async () => {
    if (!question.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/coach/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          question
        })
      });

      if (response.ok) {
        const data: CoachQAResponse = await response.json();
        setAnswer(data.answer);
      }
    } catch (error) {
      console.error('Failed to get coach answer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Ask Coach</h3>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="e.g., Should I lift after a 5k?"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#4169E1]"
          disabled={loading}
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          className="p-2 bg-[#4169E1] hover:bg-[#4169E1]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      {answer && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg" data-testid="coach-response">
          <p className="text-sm text-gray-300">{answer}</p>
          <a 
            href={`/log?filter=related`}
            className="text-xs text-[#4169E1] hover:underline mt-2 inline-block"
          >
            See related logs →
          </a>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Coaching is informational, not medical.
      </p>
    </div>
  );
}

export default function InsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [criticalQuestion, setCriticalQuestion] = useState<InsightsResponse['criticalQuestion'] | null>(null);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, dateRange]);

  const fetchInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/insights?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      if (response.ok) {
        const data: InsightsResponse = await response.json();
        // Limit to 3 insights max
        setInsights(data.insights.slice(0, 3));
        setCriticalQuestion(data.criticalQuestion);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const handleSnooze = async (insightId: string) => {
    try {
      await fetch(`/api/insights/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId })
      });
      
      // Remove from UI
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Failed to snooze insight:', error);
    }
  };

  const handleAction = (insight: Insight) => {
    // Navigate to appropriate page based on action type
    if (insight.evidence_json?.action?.type === 'log') {
      window.location.href = '/log';
    }
    console.log('Action taken for insight:', insight.id);
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!criticalQuestion || !user) return;

    try {
      await fetch('/api/coach/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          questionId: criticalQuestion.id,
          answer
        })
      });

      // Refresh insights after answering
      await fetchInsights();
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white" role="region" aria-label="insights">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coach</h1>
            <p className="text-gray-400">Your personalized insights</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                className="px-4 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                onClick={() => {
                  // Simple cycle through ranges
                  setDateRange(prev => prev === 7 ? 14 : prev === 14 ? 30 : 7);
                }}
              >
                <Clock className="w-4 h-4" />
                Last {dateRange}d
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg transition-colors"
              aria-label="Refresh insights"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Explain Button */}
            <button
              onClick={() => alert('Insights are generated based on your activity patterns and goals.')}
              className="p-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Insights Stack */}
        {insights.length > 0 ? (
          <div className="space-y-4 mb-6">
            {insights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onSnooze={handleSnooze}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-xl text-center mb-6">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No insights yet. Keep logging to see patterns!</p>
            <a
              href="/log"
              className="inline-flex items-center px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg text-white font-medium transition-colors"
            >
              Log a meal or workout now
            </a>
          </div>
        )}

        {/* Critical Question */}
        {criticalQuestion && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Quick check</h2>
            <CriticalQuestion
              question={criticalQuestion}
              onAnswer={handleAnswerQuestion}
            />
          </div>
        )}

        {/* Ask Coach */}
        <AskCoach />
      </div>
    </div>
  );
}