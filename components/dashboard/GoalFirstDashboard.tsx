'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TodayCard from './TodayCard';
import ModuleGrid from './ModuleGrid';
import DashboardManager from './DashboardManager';
import CoachPanel from '../coach/CoachPanel';
import Button from '@/components/ui/Button';
import { MessageCircle, Settings } from 'lucide-react';

interface UserGoal {
  primaryGoal?: string;
  weeklyHours?: number;
  onboardingCompleted?: boolean;
}

interface DashboardPrefs {
  modules: string[];
  moduleOrder: string[];
}

export default function GoalFirstDashboard() {
  const router = useRouter();
  const [userGoal, setUserGoal] = useState<UserGoal>({});
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPrefs>({
    modules: [],
    moduleOrder: []
  });
  const [loading, setLoading] = useState(true);
  const [showDashboardManager, setShowDashboardManager] = useState(false);
  const [showCoachPanel, setShowCoachPanel] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user goal
      const goalResponse = await fetch('/api/user/goal');
      if (goalResponse.ok) {
        const goalData = await goalResponse.json();
        setUserGoal(goalData);
        
        // If onboarding not completed, redirect to onboarding
        if (!goalData.onboardingCompleted) {
          router.push('/onboarding');
          return;
        }
      }

      // Fetch dashboard preferences
      const prefsResponse = await fetch('/api/user/dashboard-prefs');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setDashboardPrefs(prefsData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    // Handle quick actions from TodayCard
    switch (action) {
      case 'log_meal':
        router.push('/log/meal');
        break;
      case 'start_workout':
        router.push('/log/workout');
        break;
      case 'start_run':
        router.push('/log/workout?type=cardio');
        break;
      case 'adjust_calories':
        // Could open a modal or navigate to nutrition settings
        console.log('Adjust calories action');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleSaveDashboardPrefs = async (modules: string[], moduleOrder: string[]) => {
    try {
      const response = await fetch('/api/user/dashboard-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules, moduleOrder })
      });

      if (response.ok) {
        setDashboardPrefs({ modules, moduleOrder });
        setShowDashboardManager(false);
        // TODO: Show success toast
      }
    } catch (error) {
      console.error('Failed to save dashboard preferences:', error);
      // TODO: Show error toast
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Today Card */}
        <TodayCard
          primaryGoal={userGoal.primaryGoal}
          weeklyHours={userGoal.weeklyHours}
          onQuickAction={handleQuickAction}
        />

        {/* Module Grid */}
        <ModuleGrid
          modules={dashboardPrefs.modules}
          moduleOrder={dashboardPrefs.moduleOrder}
          onCustomize={() => setShowDashboardManager(true)}
        />
      </div>

      {/* Floating Coach Button */}
      <button
        onClick={() => setShowCoachPanel(true)}
        className="fixed bottom-6 right-6 bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
        aria-label="Open AI Coach"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Dashboard Manager Modal */}
      {showDashboardManager && (
        <DashboardManager
          modules={dashboardPrefs.modules}
          moduleOrder={dashboardPrefs.moduleOrder}
          onSave={handleSaveDashboardPrefs}
          onClose={() => setShowDashboardManager(false)}
        />
      )}

      {/* Coach Panel */}
      <CoachPanel
        isOpen={showCoachPanel}
        onClose={() => setShowCoachPanel(false)}
        primaryGoal={userGoal.primaryGoal}
      />
    </div>
  );
}
