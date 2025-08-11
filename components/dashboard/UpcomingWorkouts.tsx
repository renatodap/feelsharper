'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  Heart,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function UpcomingWorkouts() {
  // Mock data - would come from training plan in database
  const upcomingWorkouts = [
    {
      id: 1,
      title: 'Upper Body Push',
      type: 'strength',
      scheduledTime: '2:00 PM',
      duration: 60,
      exercises: ['Bench Press', 'Overhead Press', 'Dips', 'Tricep Extensions'],
      difficulty: 'moderate',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'LISS Cardio',
      type: 'cardio',
      scheduledTime: '7:00 AM',
      duration: 30,
      exercises: ['Incline Walk', 'Zone 2 Heart Rate'],
      difficulty: 'easy',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Full Body Circuit',
      type: 'strength',
      scheduledTime: 'Tomorrow 10:00 AM',
      duration: 45,
      exercises: ['Squats', 'Pull-ups', 'Push-ups', 'Planks'],
      difficulty: 'hard',
      status: 'upcoming'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'cardio':
        return <Heart className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'text-blue-600 bg-blue-50';
      case 'cardio':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-purple-600 bg-purple-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStartWorkout = (workoutId: number) => {
    // Navigate to workout logging page with pre-filled template
    window.location.href = `/log/workout?template=${workoutId}`;
  };

  const handleViewProgram = () => {
    window.location.href = '/program';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Upcoming Workouts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your AI-generated training plan
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewProgram}
          className="text-xs"
        >
          View Program
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {upcomingWorkouts.map((workout, index) => (
          <div
            key={workout.id}
            className={`rounded-lg border p-4 transition-all hover:shadow-sm ${
              index === 0 
                ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50' 
                : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(workout.type)}`}>
                  {getTypeIcon(workout.type)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {workout.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{workout.scheduledTime}</span>
                    <span>•</span>
                    <span>{workout.duration}min</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${getDifficultyColor(workout.difficulty)} border-0 text-xs`}
                >
                  {workout.difficulty}
                </Badge>
                {index === 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                    Next
                  </Badge>
                )}
              </div>
            </div>

            {/* Exercise Preview */}
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Key Exercises
              </div>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.slice(0, 3).map((exercise) => (
                  <span
                    key={exercise}
                    className="px-2 py-1 text-xs bg-white rounded border text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
                  >
                    {exercise}
                  </span>
                ))}
                {workout.exercises.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-slate-200 rounded text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    +{workout.exercises.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-3 w-3" />
                <span>
                  {workout.status === 'scheduled' ? 'Today' : 'Scheduled'}
                </span>
              </div>
              <Button
                size="sm"
                variant={index === 0 ? 'default' : 'secondary'}
                onClick={() => handleStartWorkout(workout.id)}
                className={index === 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {index === 0 ? (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Start Now
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">This Week</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            3 of 5 workouts completed
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
            style={{ width: '60%' }}
          />
        </div>
      </div>
    </Card>
  );
}