'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  Activity, 
  TrendingUp, 
  Target, 
  Calendar,
  Mic,
  LogOut,
  ChevronRight,
  Zap,
  Brain
} from 'lucide-react';

interface ActivityLog {
  id: string;
  type: string;
  raw_text: string;
  confidence: number;
  data: any;
  timestamp: string;
}

// Lightning Logo Component - Consistent across all pages
const LightningLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [parsedResult, setParsedResult] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchRecentActivities();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/signin');
    } else {
      setUser(user);
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (data) {
        setActivities(data);
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleQuickLog = async () => {
    if (!inputText.trim()) return;

    setParseLoading(true);
    try {
      // Call the test endpoint for now (no auth required)
      const response = await fetch('/api/test-parse-noauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (response.ok) {
        const data = await response.json();
        // For now, just show success - in production, this would save to database
        setInputText('');
        // Refresh activities after logging
        await fetchRecentActivities();
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setParseLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setProcessingVoice(true);
      setProcessingStage(0);
      setParsedResult(null);
      
      // Simulate voice processing with dynamic text changes
      const processingSteps = [
        "just...",
        "just played...",
        "just played tennis...",
        "just played tennis for...",
        "just played tennis for 90...",
        "just played tennis for 90 minutes"
      ];
      
      processingSteps.forEach((text, index) => {
        setTimeout(() => {
          setInputText(text);
          setProcessingStage(index + 1);
        }, index * 300);
      });
      
      // After all text is shown, process it
      setTimeout(() => {
        setParsedResult({
          type: 'sport',
          activity: 'Tennis',
          duration: '90 min',
          zone: 'Cardio zone',
          calories: '450 kcal',
          confidence: 95
        });
        setProcessingVoice(false);
        setIsRecording(false);
        setProcessingStage(0);
      }, processingSteps.length * 300 + 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-8 py-6 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
            </svg>
            <div>
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-blue-400">FEELSHARPER</span>
              </div>
              <div className="text-xs text-gray-400 tracking-[0.3em] uppercase">Dashboard</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Quick Input Section with Sharp Angular Design */}
        <div className="mb-8">
          <div className="relative bg-gray-900/50 backdrop-blur-xl border border-blue-500/20 p-6" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0% 100%)' }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-blue-400" size={24} />
              Quick Log
            </h2>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickLog()}
                placeholder="Just type what you did... 'ran 5k' or 'ate 2 eggs and toast'"
                className="flex-1 px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-lg transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-400 animate-pulse' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                title="Voice input"
              >
                <Mic size={24} />
              </button>
              
              <button
                onClick={handleQuickLog}
                disabled={!inputText.trim() || parseLoading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parseLoading ? 'Processing...' : 'Log'}
              </button>
            </div>

            {processingVoice && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-400"></div>
                  </div>
                  <span className="text-sm font-medium">PROCESSING VOICE...</span>
                </div>
                
                {/* Show input being built */}
                {inputText && (
                  <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800">
                    <p className="text-white font-mono text-sm">
                      "{inputText}"
                      {processingStage < 6 && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show parsed result */}
            {parsedResult && !processingVoice && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">PARSED & LOGGED</span>
                </div>
                
                <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Activity</p>
                      <p className="text-white font-medium">{parsedResult.activity}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Duration</p>
                      <p className="text-white font-medium">{parsedResult.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Zone</p>
                      <p className="text-white font-medium">{parsedResult.zone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Est. Calories</p>
                      <p className="text-white font-medium">{parsedResult.calories}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400/20">
                    <p className="text-green-400 text-xs">
                      Confidence: {parsedResult.confidence}% • Automatically tracked
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid with Sharp Angular Design */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="relative bg-gray-900/30 backdrop-blur p-6 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
               style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-blue-400" size={24} />
              <span className="text-2xl font-bold">{activities.length}</span>
            </div>
            <p className="text-gray-400 text-sm">Activities Today</p>
          </div>

          <div className="relative bg-gray-900/30 backdrop-blur p-6 border border-green-500/10 hover:border-green-500/30 transition-all duration-300"
               style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-400" size={24} />
              <span className="text-2xl font-bold">+15%</span>
            </div>
            <p className="text-gray-400 text-sm">Weekly Progress</p>
          </div>

          <div className="relative bg-gray-900/30 backdrop-blur p-6 border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
               style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <Target className="text-orange-400" size={24} />
              <span className="text-2xl font-bold">3/5</span>
            </div>
            <p className="text-gray-400 text-sm">Goals Completed</p>
          </div>

          <div className="relative bg-gray-900/30 backdrop-blur p-6 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
               style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-purple-400" size={24} />
              <span className="text-2xl font-bold">7</span>
            </div>
            <p className="text-gray-400 text-sm">Day Streak</p>
          </div>
        </div>

        {/* Recent Activities & Insights */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Activity List */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="p-4 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.raw_text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {activity.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(activity.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-600" size={20} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No activities logged yet</p>
                  <p className="text-sm mt-2">Start by typing or speaking what you did!</p>
                </div>
              )}
            </div>

            {activities.length > 0 && (
              <button className="w-full mt-4 py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                View all activities →
              </button>
            )}
          </div>

          {/* Insights Panel */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="text-blue-400" size={24} />
              AI Insights
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2">Great Progress!</h3>
                <p className="text-gray-300 text-sm">
                  You've been consistent with your workouts this week. Keep up the momentum!
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-blue-400 font-medium mb-2">Hydration Reminder</h3>
                <p className="text-gray-300 text-sm">
                  Based on today's activities, remember to drink at least 2 more glasses of water.
                </p>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <h3 className="text-orange-400 font-medium mb-2">Recovery Suggestion</h3>
                <p className="text-gray-300 text-sm">
                  Your training load is high. Consider a lighter day tomorrow for optimal recovery.
                </p>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              Get Personalized Advice
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/log')}
            className="p-4 bg-gray-900/30 backdrop-blur rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-center group"
          >
            <Activity className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Log Activity</span>
          </button>
          
          <button
            onClick={() => router.push('/my-dashboard')}
            className="p-4 bg-gray-900/30 backdrop-blur rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-center group"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm">View Stats</span>
          </button>
          
          <button
            onClick={() => router.push('/coach')}
            className="p-4 bg-gray-900/30 backdrop-blur rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-center group"
          >
            <Brain className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Ask Coach</span>
          </button>
          
          <button
            onClick={() => router.push('/settings')}
            className="p-4 bg-gray-900/30 backdrop-blur rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-center group"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </main>
    </div>
  );
}