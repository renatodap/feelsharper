'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Calendar,
  Dumbbell,
  Apple,
  Moon,
  Zap,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;

interface AIRecommendation {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'goal';
  title: string;
  description: string;
  reasoning: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface UserProgress {
  workouts_this_week: number;
  calories_avg: number;
  protein_avg: number;
  sleep_avg: number;
  goal_progress: number;
  recent_trends: string[];
}

export default function AIPersonalCoach() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Load user progress data
      const progressResponse = await fetch('/api/coach/progress');
      let progressData = null;
      if (progressResponse.ok) {
        progressData = await progressResponse.json();
        setUserProgress(progressData);
      }

      // Generate AI recommendations
      const recommendations = generateRecommendations(progressData);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
      // Show default recommendations
      setRecommendations(getDefaultRecommendations());
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (progress: UserProgress | null): AIRecommendation[] => {
    const recs: AIRecommendation[] = [];

    if (!progress) {
      return getDefaultRecommendations();
    }

    // Workout recommendations
    if (progress.workouts_this_week < 3) {
      recs.push({
        id: 'increase_frequency',
        type: 'workout',
        title: 'Increase Workout Frequency',
        description: 'You\'ve only worked out ' + progress.workouts_this_week + ' times this week. Aim for at least 3-4 sessions.',
        reasoning: 'Consistent training frequency is crucial for progress and habit formation.',
        action: 'Schedule 2 more workouts this week',
        priority: 'high',
        category: 'Training'
      });
    }

    // Nutrition recommendations
    if (progress.protein_avg < 1.6) {
      recs.push({
        id: 'increase_protein',
        type: 'nutrition',
        title: 'Boost Your Protein Intake',
        description: 'Your average protein intake is ' + progress.protein_avg.toFixed(1) + 'g/kg. Aim for 1.6-2.2g/kg for optimal results.',
        reasoning: 'Adequate protein supports muscle recovery, growth, and satiety.',
        action: 'Add a protein source to each meal',
        priority: 'medium',
        category: 'Nutrition'
      });
    }

    // Recovery recommendations
    if (progress.sleep_avg < 7) {
      recs.push({
        id: 'improve_sleep',
        type: 'recovery',
        title: 'Prioritize Sleep Quality',
        description: 'You\'re averaging ' + progress.sleep_avg.toFixed(1) + ' hours of sleep. Aim for 7-9 hours for optimal recovery.',
        reasoning: 'Quality sleep is essential for muscle recovery, hormone regulation, and performance.',
        action: 'Set a consistent bedtime routine',
        priority: 'high',
        category: 'Recovery'
      });
    }

    // Goal progress recommendations
    if (progress.goal_progress < 0.7) {
      recs.push({
        id: 'adjust_approach',
        type: 'goal',
        title: 'Adjust Your Approach',
        description: 'You\'re at ' + Math.round(progress.goal_progress * 100) + '% of your goal. Let\'s optimize your strategy.',
        reasoning: 'Consistent progress requires periodic strategy adjustments based on results.',
        action: 'Review and modify your current plan',
        priority: 'medium',
        category: 'Strategy'
      });
    }

    // Trend-based recommendations
    if (progress.recent_trends.includes('plateau')) {
      recs.push({
        id: 'break_plateau',
        type: 'workout',
        title: 'Break Through Your Plateau',
        description: 'Your progress has stalled. Time to shake things up with new challenges.',
        reasoning: 'Plateaus are normal but require strategic changes to overcome.',
        action: 'Try progressive overload or new exercises',
        priority: 'high',
        category: 'Training'
      });
    }

    return recs.length > 0 ? recs : getDefaultRecommendations();
  };

  const getDefaultRecommendations = (): AIRecommendation[] => [
    {
      id: 'start_tracking',
      type: 'goal',
      title: 'Start Consistent Tracking',
      description: 'Begin logging your workouts and meals to get personalized insights.',
      reasoning: 'Data-driven decisions lead to better results and faster progress.',
      action: 'Log your next workout and meal',
      priority: 'high',
      category: 'Getting Started'
    },
    {
      id: 'set_schedule',
      type: 'workout',
      title: 'Create a Workout Schedule',
      description: 'Consistency is key. Plan your workouts for the week ahead.',
      reasoning: 'Scheduled workouts are 3x more likely to be completed.',
      action: 'Block time in your calendar for 3-4 workouts',
      priority: 'medium',
      category: 'Planning'
    },
    {
      id: 'hydration_focus',
      type: 'nutrition',
      title: 'Focus on Hydration',
      description: 'Aim for 2-3 liters of water daily to support performance and recovery.',
      reasoning: 'Proper hydration improves energy, focus, and exercise performance.',
      action: 'Track your daily water intake',
      priority: 'low',
      category: 'Nutrition'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default: return 'border-slate-200 bg-slate-50 dark:bg-slate-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Zap className="h-4 w-4 text-red-600" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Lightbulb className="h-4 w-4 text-green-600" />;
      default: return <Brain className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="h-5 w-5" />;
      case 'nutrition': return <Apple className="h-5 w-5" />;
      case 'recovery': return <Moon className="h-5 w-5" />;
      case 'goal': return <Target className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Analyzing your progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>AI Personal Coach</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personalized insights based on your progress
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAIRecommendations}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Summary */}
      {userProgress && (
        <Card>
          <CardHeader>
            <CardTitle>This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Dumbbell className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold">{userProgress.workouts_this_week}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Workouts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Apple className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold">{Math.round(userProgress.calories_avg)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Calories</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-2xl font-bold">{userProgress.protein_avg.toFixed(1)}g</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Protein/kg</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Moon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-2xl font-bold">{userProgress.sleep_avg.toFixed(1)}h</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Sleep</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
        {recommendations.map((rec) => (
          <Card key={rec.id} className={getPriorityColor(rec.priority)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-1">
                    {getPriorityIcon(rec.priority)}
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-medium">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {rec.description}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      {rec.reasoning}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="text-xs">
                        {rec.action}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRec(rec)}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedRec.type)}
                  <CardTitle>{selectedRec.title}</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRec(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Why This Matters</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedRec.reasoning}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recommended Action</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedRec.action}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  Take Action
                </Button>
                <Button variant="outline" onClick={() => setSelectedRec(null)}>
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
