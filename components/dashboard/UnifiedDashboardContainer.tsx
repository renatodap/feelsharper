'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Plus, Target, TrendingUp } from 'lucide-react';
import TodayCard from './TodayCard';
import UnifiedDashboard from './UnifiedDashboard';
import DashboardManager from './DashboardManager';

interface DashboardPreferences {
  modules: string[];
  moduleOrder: string[];
}

interface UserGoal {
  primaryGoal: string;
  weeklyHours: number;
  targetWeight?: number;
  targetDate?: string;
}

export default function UnifiedDashboardContainer() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user preferences
      const prefsResponse = await fetch('/api/user/dashboard-prefs');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData);
      } else if (prefsResponse.status === 404) {
        // New user - redirect to onboarding
        setIsNewUser(true);
      }

      // Load user goal
      const goalResponse = await fetch('/api/user/goal');
      if (goalResponse.ok) {
        const goalData = await goalResponse.json();
        setUserGoal(goalData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (modules: string[], moduleOrder: string[]) => {
    try {
      const response = await fetch('/api/user/dashboard-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules, moduleOrder })
      });

      if (response.ok) {
        setPreferences({ modules, moduleOrder });
        setShowManager(false);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const renderDashboard = () => {
    if (!preferences || preferences.modules.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Your dashboard is empty
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Add some modules to start tracking your progress
            </p>
            <Button onClick={() => setShowManager(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Modules
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <UnifiedDashboard />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome to Feel Sharper
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Let's set up your personalized wellness journey
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/onboarding')}
              className="w-full"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <div className="text-center">
              <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Setup Your Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Choose which modules you'd like to see on your dashboard
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowManager(true)}
              className="w-full"
            >
              Customize Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showManager) {
    return (
      <DashboardManager
        modules={preferences.modules}
        moduleOrder={preferences.moduleOrder}
        onSave={handleSavePreferences}
        onClose={() => setShowManager(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Dashboard
            </h1>
            {userGoal && (
              <p className="text-slate-600 dark:text-slate-400">
                Goal: {userGoal.primaryGoal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {userGoal.weeklyHours}h/week
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManager(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {renderDashboard()}
      </div>
    </div>
  );
}
