'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2,
  Zap,
  Utensils,
  Moon,
  Dumbbell,
  Plane,
  Briefcase,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Brain,
  Target
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'workout' | 'meal' | 'sleep' | 'work' | 'travel' | 'social' | 'recovery';
  startTime: Date;
  endTime: Date;
  location?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  priority: 'low' | 'medium' | 'high';
  adaptable: boolean; // Can this be automatically rescheduled?
  backup?: CalendarEvent; // Backup plan if this fails
  aiSuggested?: boolean;
}

interface LifeContext {
  workSchedule: 'flexible' | 'fixed' | 'shift' | 'travel';
  familyCommitments: 'low' | 'medium' | 'high';
  travelFrequency: 'none' | 'occasional' | 'frequent';
  stressLevel: number; // 1-5
  energyPattern: 'morning' | 'evening' | 'consistent';
}

export default function SmartCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lifeContext, setLifeContext] = useState<LifeContext>({
    workSchedule: 'flexible',
    familyCommitments: 'medium',
    travelFrequency: 'occasional',
    stressLevel: 3,
    energyPattern: 'morning'
  });
  const [showAdaptations, setShowAdaptations] = useState(false);
  const [adaptationSuggestions, setAdaptationSuggestions] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadCalendarData();
    generateAdaptations();
  }, [currentDate, lifeContext]);

  const loadCalendarData = () => {
    // Mock calendar data
    const today = new Date();
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Morning Strength Training',
        type: 'workout',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
        location: 'Home Gym',
        status: 'scheduled',
        priority: 'high',
        adaptable: true,
        backup: {
          id: '1b',
          title: '20-min HIIT Backup',
          type: 'workout',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 20),
          location: 'Anywhere',
          status: 'scheduled',
          priority: 'medium',
          adaptable: true
        }
      },
      {
        id: '2',
        title: 'Protein-Rich Lunch',
        type: 'meal',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
        status: 'scheduled',
        priority: 'medium',
        adaptable: true,
        aiSuggested: true
      },
      {
        id: '3',
        title: 'Important Client Meeting',
        type: 'work',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
        location: 'Office',
        status: 'scheduled',
        priority: 'high',
        adaptable: false
      },
      {
        id: '4',
        title: 'Evening Walk',
        type: 'recovery',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 30),
        status: 'scheduled',
        priority: 'low',
        adaptable: true,
        aiSuggested: true
      },
      {
        id: '5',
        title: 'Sleep Optimization',
        type: 'sleep',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 22, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 6, 0),
        status: 'scheduled',
        priority: 'high',
        adaptable: false
      }
    ];

    setEvents(mockEvents);
  };

  const generateAdaptations = () => {
    // AI-powered adaptations based on life context and schedule conflicts
    const suggestions: CalendarEvent[] = [
      {
        id: 'adapt1',
        title: 'Stress-Detected: Switch to Yoga',
        type: 'workout',
        startTime: new Date(),
        endTime: new Date(),
        status: 'scheduled',
        priority: 'medium',
        adaptable: true,
        aiSuggested: true
      },
      {
        id: 'adapt2',
        title: 'Travel Day: Hotel Room Workout',
        type: 'workout',
        startTime: new Date(),
        endTime: new Date(),
        status: 'scheduled',
        priority: 'medium',
        adaptable: true,
        aiSuggested: true
      }
    ];

    setAdaptationSuggestions(suggestions);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="w-4 h-4" />;
      case 'meal': return <Utensils className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'travel': return <Plane className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'recovery': return <Zap className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string, status: string) => {
    const baseColors = {
      workout: 'blue',
      meal: 'green',
      sleep: 'purple',
      work: 'gray',
      travel: 'orange',
      social: 'pink',
      recovery: 'yellow'
    };

    const color = baseColors[type as keyof typeof baseColors] || 'gray';
    
    if (status === 'completed') return `bg-${color}-100 border-${color}-300 text-${color}-800`;
    if (status === 'missed') return `bg-red-100 border-red-300 text-red-800`;
    if (status === 'rescheduled') return `bg-orange-100 border-orange-300 text-orange-800`;
    
    return `bg-${color}-50 border-${color}-200 text-${color}-700`;
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'medium': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'low': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default: return null;
    }
  };

  const handleEventStatusChange = (eventId: string, newStatus: CalendarEvent['status']) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };

  const handleAdaptEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event?.backup) {
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, status: 'rescheduled' } : e
      ).concat([{ ...event.backup, status: 'scheduled' }]));
    }
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => 
      event.startTime.toDateString() === currentDate.toDateString()
    );

    return (
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <Typography variant="h4" className="font-semibold mb-2 text-slate-600">
              No events scheduled
            </Typography>
            <Typography variant="body2" className="text-slate-500 mb-4">
              Add your first activity to start building your routine
            </Typography>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </Card>
        ) : (
          dayEvents.map((event) => (
            <Card key={event.id} className={`p-4 border-l-4 ${getEventColor(event.type, event.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getEventIcon(event.type)}
                  <div>
                    <Typography variant="body2" className="font-semibold">
                      {event.title}
                    </Typography>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {event.location && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getPriorityIndicator(event.priority)}
                  {event.aiSuggested && (
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      AI Suggested
                    </div>
                  )}
                  {event.adaptable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAdaptEvent(event.id)}
                      className="text-blue-600"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {event.backup && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <Typography variant="body2" className="text-slate-600 text-sm mb-1">
                    Backup Plan:
                  </Typography>
                  <Typography variant="body2" className="font-medium text-sm">
                    {event.backup.title}
                  </Typography>
                </div>
              )}
              
              <div className="flex space-x-2 mt-3">
                {event.status === 'scheduled' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEventStatusChange(event.id, 'completed')}
                      className="text-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEventStatusChange(event.id, 'missed')}
                      className="text-red-600"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Missed
                    </Button>
                  </>
                )}
                
                {event.status === 'completed' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </div>
                )}
                
                {event.status === 'missed' && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Missed
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderAdaptiveInsights = () => (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <Typography variant="h4" className="font-semibold text-purple-900">
          Smart Adaptations
        </Typography>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-purple-900">
            🔄 Schedule Conflict Detected
          </Typography>
          <Typography variant="body2" className="text-purple-800 mb-3">
            Your 7 AM workout conflicts with an early meeting. Switch to lunch break workout?
          </Typography>
          <div className="flex space-x-2">
            <Button variant="primary" size="sm">Accept</Button>
            <Button variant="ghost" size="sm">Decline</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-purple-900">
            ✈️ Travel Day Optimization
          </Typography>
          <Typography variant="body2" className="text-purple-800 mb-3">
            Flying tomorrow? I've prepared a hotel room workout and healthy airport meal options.
          </Typography>
          <Button variant="outline" size="sm">View Travel Plan</Button>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <Typography variant="body2" className="font-medium mb-2 text-purple-900">
            😰 Stress Level Alert
          </Typography>
          <Typography variant="body2" className="text-purple-800 mb-3">
            High stress detected. Switching tonight's HIIT to restorative yoga for better recovery.
          </Typography>
          <Button variant="outline" size="sm">Approve Change</Button>
        </div>
      </div>
    </Card>
  );

  const renderLifeContextSettings = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-6 h-6 text-blue-500" />
        <Typography variant="h4" className="font-semibold">
          Life Context Settings
        </Typography>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Typography variant="body2" className="font-medium mb-2">Work Schedule</Typography>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg"
            value={lifeContext.workSchedule}
            onChange={(e) => setLifeContext(prev => ({ ...prev, workSchedule: e.target.value as any }))}
          >
            <option value="flexible">Flexible</option>
            <option value="fixed">Fixed Hours</option>
            <option value="shift">Shift Work</option>
            <option value="travel">Frequent Travel</option>
          </select>
        </div>
        
        <div>
          <Typography variant="body2" className="font-medium mb-2">Family Commitments</Typography>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg"
            value={lifeContext.familyCommitments}
            onChange={(e) => setLifeContext(prev => ({ ...prev, familyCommitments: e.target.value as any }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <Typography variant="body2" className="font-medium mb-2">Energy Pattern</Typography>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg"
            value={lifeContext.energyPattern}
            onChange={(e) => setLifeContext(prev => ({ ...prev, energyPattern: e.target.value as any }))}
          >
            <option value="morning">Morning Person</option>
            <option value="evening">Evening Person</option>
            <option value="consistent">Consistent Energy</option>
          </select>
        </div>
        
        <div>
          <Typography variant="body2" className="font-medium mb-2">Current Stress Level</Typography>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={lifeContext.stressLevel}
            onChange={(e) => setLifeContext(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Smart Calendar
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Adapts to your life, not the other way around
          </Typography>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Typography variant="body2" className="font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString()}
            </Typography>
            <Button variant="ghost" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex space-x-2">
        {['day', 'week', 'month'].map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? 'primary' : 'ghost'}
            onClick={() => setViewMode(mode as any)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          {viewMode === 'day' && renderDayView()}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Adaptive Insights */}
          {renderAdaptiveInsights()}
          
          {/* Life Context Settings */}
          {renderLifeContextSettings()}
        </div>
      </div>
    </div>
  );
}
