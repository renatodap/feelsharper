'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Trophy,
  Share2,
  BarChart3,
  Repeat,
  Home
} from 'lucide-react';

interface WorkoutSummaryProps {
  session?: unknown;
  onStartNew: () => void;
  onViewProgress: () => void;
}

export function WorkoutSummary({ onStartNew, onViewProgress }: WorkoutSummaryProps) {
  // Mock data - would be calculated from actual session
  const summaryData = {
    duration: 62, // minutes
    totalVolume: 12750, // kg
    setsCompleted: 16,
    personalRecords: 2,
    caloriesBurned: 340,
    avgRestTime: 95, // seconds
    muscleGroupsTargeted: ['Chest', 'Shoulders', 'Triceps'],
    topExercises: [
      { name: 'Bench Press', weight: 85, reps: 5, isPersonalRecord: true },
      { name: 'Overhead Press', weight: 55, reps: 6, isPersonalRecord: false },
      { name: 'Dips', weight: 0, reps: 12, isPersonalRecord: false },
    ],
    comparisonToPrevious: {
      volumeChange: +8.5, // percentage
      durationChange: -5, // percentage
      strengthGains: true
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const achievements = [
    {
      icon: Trophy,
      title: '2 Personal Records!',
      description: 'New PRs in Bench Press and total volume',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: Target,
      title: 'Volume Goal Exceeded',
      description: '+8.5% more than last workout',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Zap,
      title: 'Consistency Streak',
      description: '13 days of logged workouts',
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  const handleShareWorkout = () => {
    // Share functionality - could integrate with social media or copy to clipboard
    const shareText = `Just crushed a ${formatTime(summaryData.duration)} workout! 💪\n\n` +
      `📊 ${summaryData.setsCompleted} sets completed\n` +
      `🏋️ ${summaryData.totalVolume.toLocaleString()}kg total volume\n` +
      `🔥 ${summaryData.personalRecords} personal records!\n\n` +
      `#FeelSharper #FitnessGoals`;
    
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      // Show toast notification
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 dark:bg-green-900/50">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Workout Complete! 🎉
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Great job! Here's how you performed today.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Session Overview
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatTime(summaryData.duration)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Duration</div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {summaryData.totalVolume.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Volume (kg)</div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {summaryData.caloriesBurned}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Calories Burned</div>
                </div>
                
                <div className="text-center p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {summaryData.personalRecords}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Personal Records</div>
                </div>
              </div>

              {/* Progress vs Last Workout */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg dark:from-green-950/50 dark:to-blue-950/50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    Progress vs Last Workout
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400">Volume Change</div>
                    <div className={`font-semibold ${summaryData.comparisonToPrevious.volumeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summaryData.comparisonToPrevious.volumeChange > 0 ? '+' : ''}{summaryData.comparisonToPrevious.volumeChange}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400">Duration Change</div>
                    <div className={`font-semibold ${summaryData.comparisonToPrevious.durationChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {summaryData.comparisonToPrevious.durationChange > 0 ? '+' : ''}{summaryData.comparisonToPrevious.durationChange}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Exercises */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Top Exercises
              </h2>
              <div className="space-y-4">
                {summaryData.topExercises.map((exercise, index) => (
                  <div key={exercise.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:bg-blue-900/50">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {exercise.name}
                          {exercise.isPersonalRecord && (
                            <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                              PR!
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Best set: {exercise.weight > 0 ? `${exercise.weight}kg × ` : ''}{exercise.reps} reps
                        </div>
                      </div>
                    </div>
                    {exercise.isPersonalRecord && (
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Today's Achievements
              </h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${achievement.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                What&apos;s Next?
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={onViewProgress}
                  className="w-full justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShareWorkout}
                  className="w-full justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Workout
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onStartNew}
                  className="w-full justify-start"
                >
                  <Repeat className="h-4 w-4 mr-2" />
                  Log Another Workout
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </Card>

            {/* Recovery Reminder */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recovery Tips
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Don't forget to prioritize recovery for optimal results!
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Hydrate within 30 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Consume protein (20-30g)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Log your meal</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}