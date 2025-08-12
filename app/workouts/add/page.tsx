"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Dumbbell, Bot, Edit3, Save } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  reps?: number;
  weight?: number;
  distance?: number;
  duration_sec?: number;
  rpe?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Simple deterministic workout parser (no LLM required)
function parseWorkoutText(text: string): Exercise[] {
  const exercises: Exercise[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Match patterns like: "Bench Press 3x5 @ 60kg" or "Squat 5x3 135lb"
    const exerciseMatch = line.match(/^([^0-9]+?)[\s]*(\d+)x(\d+)[\s]*[@]?[\s]*(\d+(?:\.\d+)?)\s*(kg|lb|lbs)?/i);
    
    if (exerciseMatch) {
      const [, exerciseName, sets, reps, weight, unit] = exerciseMatch;
      const weightInKg = unit?.toLowerCase().includes('lb') ? parseFloat(weight) * 0.453592 : parseFloat(weight);
      
      const exercise: Exercise = {
        id: generateId(),
        name: exerciseName.trim(),
        sets: []
      };
      
      // Create the specified number of sets
      for (let i = 0; i < parseInt(sets); i++) {
        exercise.sets.push({
          id: generateId(),
          reps: parseInt(reps),
          weight: weightInKg
        });
      }
      
      exercises.push(exercise);
    }
    // Match cardio patterns like: "5k run 27:30" or "10km bike 45:00"
    else {
      const cardioMatch = line.match(/^(\d+(?:\.\d+)?)\s*(k|km|mi|mile)?\s*([^0-9]+?)[\s]*(\d+):(\d+)/i);
      
      if (cardioMatch) {
        const [, distance, unit, exerciseName, minutes, seconds] = cardioMatch;
        const distanceInKm = unit?.toLowerCase().includes('mi') ? parseFloat(distance) * 1.60934 : parseFloat(distance);
        const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
        
        exercises.push({
          id: generateId(),
          name: exerciseName.trim(),
          sets: [{
            id: generateId(),
            distance: distanceInKm,
            duration_sec: totalSeconds
          }]
        });
      }
    }
  }
  
  return exercises;
}

export default function AddWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aiMode = searchParams?.get('mode') === 'ai';
  
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [aiText, setAiText] = useState('');
  const [isAiMode, setIsAiMode] = useState(aiMode);

  const handleAiParse = () => {
    if (!aiText.trim()) return;
    
    const parsed = parseWorkoutText(aiText);
    setExercises(parsed);
    setIsAiMode(false);
    
    // Generate a title if not set
    if (!workoutTitle && parsed.length > 0) {
      const exerciseNames = parsed.map(e => e.name).slice(0, 2);
      setWorkoutTitle(exerciseNames.join(', ') + (parsed.length > 2 ? ', ...' : ''));
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      name: '',
      sets: [{
        id: generateId(),
        reps: 0,
        weight: 0
      }]
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { id: generateId(), reps: 0, weight: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const handleSave = async () => {
    if (exercises.length === 0) return;

    // In real app, save to Supabase here
    console.log('Saving workout:', {
      title: workoutTitle,
      notes: workoutNotes,
      exercises,
      date: new Date().toISOString().split('T')[0]
    });

    router.push('/workouts');
  };

  if (isAiMode) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">AI Workout Parser</h1>
              <p className="text-text-secondary">Paste or type your workout and we'll parse it</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* AI Text Input */}
            <div className="bg-surface border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-navy" />
                <h3 className="text-lg font-semibold">Workout Text</h3>
              </div>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Paste your workout here...&#10;&#10;Examples:&#10;Bench Press 3x5 @ 60kg&#10;Squat 5x3 135lb&#10;Deadlift 1x5 140kg&#10;5k run 27:30"
                className="w-full h-64 px-4 py-3 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus resize-none"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAiParse}
                disabled={!aiText.trim()}
                className="px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Parse Workout
              </button>
              <button
                onClick={() => setIsAiMode(false)}
                className="px-6 py-3 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-2 transition-colors"
              >
                Manual Entry
              </button>
            </div>

            {/* Examples */}
            <div className="mt-8 p-6 bg-surface-2 border border-border rounded-xl">
              <h4 className="font-semibold mb-3">Supported Formats:</h4>
              <div className="space-y-2 text-sm text-text-secondary">
                <p><code className="bg-surface px-2 py-1 rounded">Exercise 3x5 @ 60kg</code> - Strength training</p>
                <p><code className="bg-surface px-2 py-1 rounded">Bench Press 5x3 135lb</code> - With pounds</p>
                <p><code className="bg-surface px-2 py-1 rounded">5k run 27:30</code> - Cardio with time</p>
                <p><code className="bg-surface px-2 py-1 rounded">10km bike 45:00</code> - Distance cardio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Log Workout</h1>
            <p className="text-text-secondary">Track your exercises, sets, and reps</p>
          </div>
          <button
            onClick={() => setIsAiMode(true)}
            className="inline-flex items-center px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-surface-2 transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Parser
          </button>
        </div>

        {/* Workout Details */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Workout Title
              </label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Cardio"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-text-secondary text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus h-24 resize-none"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6 mb-8">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="bg-surface border border-border rounded-xl p-6">
              
              {/* Exercise Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise name (e.g., Bench Press)"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus font-medium"
                  />
                </div>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-sm text-text-muted font-medium">
                  <div className="col-span-1">Set</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3">Weight (kg)</div>
                  <div className="col-span-3">RPE (1-10)</div>
                  <div className="col-span-2"></div>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-text-muted">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseFloat(e.target.value) || undefined)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="1"
                        max="10"
                        step="0.5"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => removeSet(exercise.id, set.id)}
                        disabled={exercise.sets.length === 1}
                        className="p-1 text-error hover:bg-error/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSet(exercise.id)}
                className="mt-4 inline-flex items-center px-3 py-1 bg-navy/20 text-navy rounded-lg hover:bg-navy/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Set
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={addExercise}
            className="inline-flex items-center px-4 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Exercise
          </button>
          
          <button
            onClick={handleSave}
            disabled={exercises.length === 0}
            className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
}