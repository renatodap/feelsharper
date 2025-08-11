'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Dumbbell, 
  Clock, 
  Target,
  Heart,
  Zap,
  Star,
  Plus
} from 'lucide-react';

interface WorkoutTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'hybrid';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  exercises: string[];
  description: string;
  popularity: number; // 1-5 stars
  estimatedCalories: number;
}

export function WorkoutTemplates({ onSelectTemplate }: WorkoutTemplatesProps) {
  const templates: Template[] = [
    {
      id: 'upper_push',
      name: 'Upper Body Push',
      type: 'strength',
      duration: 60,
      difficulty: 'intermediate',
      focus: ['Chest', 'Shoulders', 'Triceps'],
      exercises: ['Bench Press', 'Overhead Press', 'Dips', 'Lateral Raises'],
      description: 'Focus on pushing movements for upper body development',
      popularity: 5,
      estimatedCalories: 280
    },
    {
      id: 'hiit_cardio',
      name: 'HIIT Cardio Blast',
      type: 'cardio',
      duration: 30,
      difficulty: 'advanced',
      focus: ['Cardio', 'Fat Burn'],
      exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees'],
      description: 'High-intensity intervals for maximum calorie burn',
      popularity: 4,
      estimatedCalories: 350
    },
    {
      id: 'full_body_beginner',
      name: 'Full Body Starter',
      type: 'strength',
      duration: 45,
      difficulty: 'beginner',
      focus: ['Full Body', 'Foundation'],
      exercises: ['Goblet Squats', 'Push-ups', 'Bent-over Rows', 'Planks'],
      description: 'Perfect introduction to strength training',
      popularity: 5,
      estimatedCalories: 200
    },
    {
      id: 'leg_day_intense',
      name: 'Leg Day Destroyer',
      type: 'strength',
      duration: 75,
      difficulty: 'advanced',
      focus: ['Legs', 'Glutes', 'Power'],
      exercises: ['Squats', 'Romanian Deadlifts', 'Bulgarian Split Squats', 'Calf Raises'],
      description: 'Comprehensive leg workout for strength and size',
      popularity: 4,
      estimatedCalories: 320
    },
    {
      id: 'upper_pull',
      name: 'Upper Body Pull',
      type: 'strength',
      duration: 55,
      difficulty: 'intermediate',
      focus: ['Back', 'Biceps', 'Rear Delts'],
      exercises: ['Pull-ups', 'Barbell Rows', 'Face Pulls', 'Bicep Curls'],
      description: 'Pulling movements for back development and posture',
      popularity: 5,
      estimatedCalories: 260
    },
    {
      id: 'steady_state_cardio',
      name: 'Zone 2 Cardio',
      type: 'cardio',
      duration: 40,
      difficulty: 'beginner',
      focus: ['Endurance', 'Recovery'],
      exercises: ['Easy Jog', 'Bike Ride', 'Incline Walk'],
      description: 'Low-intensity steady state for aerobic base building',
      popularity: 3,
      estimatedCalories: 250
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
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'cardio':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-purple-50 text-purple-600 border-purple-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-slate-300'
            }`}
          />
        ))}
        <span className="text-xs text-slate-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  // Group templates by type
  const strengthTemplates = templates.filter(t => t.type === 'strength');
  const cardioTemplates = templates.filter(t => t.type === 'cardio');

  return (
    <div>
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Workout Templates
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose from AI-optimized workout programs
          </p>
        </div>

        {/* Template Categories */}
        <div className="space-y-6">
          {/* Strength Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Strength Training
              </h4>
              <Badge variant="secondary" className="text-xs">
                {strengthTemplates.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {strengthTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer dark:border-slate-700"
                  onClick={() => onSelectTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {template.name}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                      </p>
                    </div>
                    <Badge 
                      className={`${getTypeColor(template.type)} border text-xs`}
                    >
                      {getTypeIcon(template.type)}
                      <span className="ml-1">{template.type}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{template.estimatedCalories} kcal</span>
                    </div>
                    <Badge 
                      className={`${getDifficultyColor(template.difficulty)} text-xs`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.focus.slice(0, 3).map((focus) => (
                        <span
                          key={focus}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded dark:bg-slate-800 dark:text-slate-400"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                    {renderStars(template.popularity)}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Key exercises: {template.exercises.slice(0, 3).join(', ')}
                      {template.exercises.length > 3 && ` +${template.exercises.length - 3} more`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cardio Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Cardio Sessions
              </h4>
              <Badge variant="secondary" className="text-xs">
                {cardioTemplates.length}
              </Badge>
            </div>
            <div className="grid gap-3">
              {cardioTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer dark:border-slate-700"
                  onClick={() => onSelectTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {template.name}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                      </p>
                    </div>
                    <Badge 
                      className={`${getTypeColor(template.type)} border text-xs`}
                    >
                      {getTypeIcon(template.type)}
                      <span className="ml-1">{template.type}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{template.estimatedCalories} kcal</span>
                    </div>
                    <Badge 
                      className={`${getDifficultyColor(template.difficulty)} text-xs`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.focus.map((focus) => (
                        <span
                          key={focus}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded dark:bg-slate-800 dark:text-slate-400"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                    {renderStars(template.popularity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Custom Template */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {/* TODO: Navigate to template builder */}}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Template
          </Button>
        </div>
      </Card>
    </div>
  );
}