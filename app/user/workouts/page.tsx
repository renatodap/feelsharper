'use client';

import { useState } from 'react';
import { 
  Activity,
  Calendar,
  Clock,
  Flame,
  Filter,
  Search,
  Plus,
  ChevronDown
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample workout data
const workouts = [
  { 
    id: 1, 
    date: '2024-01-22', 
    type: 'Tennis', 
    duration: 90, 
    calories: 650, 
    intensity: 'High',
    notes: 'Great serve practice, worked on backhand'
  },
  { 
    id: 2, 
    date: '2024-01-21', 
    type: 'Strength Training', 
    duration: 60, 
    calories: 450, 
    intensity: 'Medium',
    notes: 'Upper body focus - chest and shoulders'
  },
  { 
    id: 3, 
    date: '2024-01-20', 
    type: 'Running', 
    duration: 30, 
    calories: 320, 
    intensity: 'Medium',
    notes: '5K run at steady pace'
  },
  { 
    id: 4, 
    date: '2024-01-19', 
    type: 'Tennis', 
    duration: 120, 
    calories: 880, 
    intensity: 'High',
    notes: 'Match play - won 6-4, 7-5'
  },
  { 
    id: 5, 
    date: '2024-01-18', 
    type: 'Yoga', 
    duration: 45, 
    calories: 180, 
    intensity: 'Low',
    notes: 'Recovery and flexibility focus'
  },
];

const intensityColors = {
  Low: 'text-green-400 bg-green-400/10 border-green-400/30',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  High: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const workoutTypes = ['All', 'Tennis', 'Running', 'Strength Training', 'Yoga'];

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || workout.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-title font-black text-white mb-2">
              Your <span className="text-feel-primary lightning-text">Workouts</span>
            </h1>
            <p className="text-sharpened-light-gray font-body">
              Track every session, analyze your performance
            </p>
          </div>
          <button className="sharp-button px-6 py-3 bg-gradient-to-r from-feel-primary to-feel-secondary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Log Workout</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Workouts', value: workouts.length, icon: Activity },
          { label: 'Total Time', value: `${Math.floor(workouts.reduce((acc, w) => acc + w.duration, 0) / 60)}h`, icon: Clock },
          { label: 'Calories Burned', value: workouts.reduce((acc, w) => acc + w.calories, 0).toLocaleString(), icon: Flame },
          { label: 'This Week', value: '5', icon: Calendar },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-4"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sharpened-gray text-xs font-body uppercase tracking-wider">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-feel-primary/60" />
            </div>
            <div className="text-2xl font-title font-bold text-feel-primary">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sharpened-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts..."
            className="w-full pl-12 pr-4 py-3 bg-sharpened-void/50 border border-sharpened-charcoal text-white placeholder-sharpened-gray font-body focus:outline-none focus:border-feel-primary/50 transition-colors"
            style={{ 
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
            }}
          />
        </div>
        
        <div className="flex gap-2">
          {workoutTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 font-body text-sm transition-all ${
                filterType === type
                  ? 'bg-feel-primary text-white'
                  : 'bg-sharpened-charcoal/50 text-sharpened-light-gray hover:text-white'
              }`}
              style={{ 
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal hover:border-feel-primary/30 transition-all group"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-feel-primary/10 flex items-center justify-center"
                         style={{ 
                           clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'
                         }}>
                      <Activity className="w-6 h-6 text-feel-primary" />
                    </div>
                    <div className="absolute inset-0 bg-feel-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-title font-bold text-white">{workout.type}</h3>
                      <span className={`px-2 py-1 text-xs font-body font-semibold border ${intensityColors[workout.intensity as keyof typeof intensityColors]}`}
                            style={{ 
                              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                            }}>
                        {workout.intensity}
                      </span>
                    </div>
                    <p className="text-sharpened-gray font-body text-sm">{workout.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-title font-bold text-feel-primary">{workout.duration} min</div>
                  <div className="text-sm text-sharpened-gray font-body">{workout.calories} calories</div>
                </div>
              </div>

              {workout.notes && (
                <div className="pt-4 border-t border-sharpened-charcoal">
                  <p className="text-sharpened-light-gray font-body">{workout.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <button className="text-feel-primary hover:text-feel-secondary text-sm font-body transition-colors">
                  View Details
                </button>
                <button className="text-sharpened-gray hover:text-white text-sm font-body transition-colors">
                  Edit
                </button>
                <button className="text-sharpened-gray hover:text-red-400 text-sm font-body transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkouts.length === 0 && (
        <div className="text-center py-12">
          <LightningLogo className="w-16 h-16 text-feel-primary/30 mx-auto mb-4" />
          <p className="text-sharpened-gray font-body">No workouts found</p>
        </div>
      )}
    </div>
  );
}