"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  fitness_goals: string[] | null;
  user_type: 'endurance' | 'strength' | 'sport' | 'professional' | 'weight_mgmt' | null;
  dietary_preferences: any;
  health_conditions: string[] | null;
  timezone: string | null;
  preferred_units: 'metric' | 'imperial';
  notification_preferences: any;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // Form state
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [userType, setUserType] = useState<UserProfile['user_type']>(null);
  const [timezone, setTimezone] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [goals, setGoals] = useState<string[]>([]);
  const [dietaryPrefs, setDietaryPrefs] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    keto: false,
    paleo: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in?redirect=/profile');
      return;
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setAge(data.age?.toString() || '');
        setWeight(data.weight_kg?.toString() || '');
        setHeight(data.height_cm?.toString() || '');
        setUserType(data.user_type);
        setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        setUnits(data.preferred_units || 'metric');
        setGoals(data.fitness_goals || []);
        setDietaryPrefs(data.dietary_preferences || dietaryPrefs);
      } else {
        // Create initial profile
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: null,
          age: null,
          weight_kg: null,
          height_cm: null,
          fitness_goals: [],
          user_type: null,
          dietary_preferences: {},
          health_conditions: [],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferred_units: 'metric' as const,
          notification_preferences: {},
          created_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updates = {
        id: user.id,
        full_name: fullName || null,
        age: age ? parseInt(age) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        user_type: userType,
        timezone,
        preferred_units: units,
        fitness_goals: goals,
        dietary_preferences: dietaryPrefs,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleDietaryPref = (pref: keyof typeof dietaryPrefs) => {
    setDietaryPrefs(prev => ({
      ...prev,
      [pref]: !prev[pref]
    }));
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-2 border rounded-lg bg-surface-secondary text-text-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-2 border rounded-lg bg-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    min="13"
                    max="120"
                    className="w-full p-2 border rounded-lg bg-surface"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-surface"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Physical Stats */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Physical Stats</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Units</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="metric"
                      checked={units === 'metric'}
                      onChange={(e) => setUnits('metric')}
                      className="mr-2"
                    />
                    Metric (kg, cm)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="imperial"
                      checked={units === 'imperial'}
                      onChange={(e) => setUnits('imperial')}
                      className="mr-2"
                    />
                    Imperial (lbs, inches)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weight {units === 'metric' ? '(kg)' : '(lbs)'}
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={units === 'metric' ? '70' : '155'}
                    step="0.1"
                    className="w-full p-2 border rounded-lg bg-surface"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Height {units === 'metric' ? '(cm)' : '(inches)'}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={units === 'metric' ? '175' : '69'}
                    step="0.1"
                    className="w-full p-2 border rounded-lg bg-surface"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Fitness Profile */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Fitness Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">User Type</label>
                <select
                  value={userType || ''}
                  onChange={(e) => setUserType(e.target.value as UserProfile['user_type'])}
                  className="w-full p-2 border rounded-lg bg-surface"
                >
                  <option value="">Select your primary focus</option>
                  <option value="endurance">Endurance Athlete</option>
                  <option value="strength">Strength Training</option>
                  <option value="sport">Sport Specific</option>
                  <option value="professional">Professional/Busy</option>
                  <option value="weight_mgmt">Weight Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fitness Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Lose Weight',
                    'Build Muscle',
                    'Improve Endurance',
                    'Increase Strength',
                    'Better Health',
                    'Athletic Performance',
                    'Flexibility',
                    'Mental Wellness'
                  ].map(goal => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={goals.includes(goal)}
                        onChange={() => toggleGoal(goal)}
                        className="mr-2"
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Dietary Preferences */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                vegetarian: 'Vegetarian',
                vegan: 'Vegan',
                glutenFree: 'Gluten-Free',
                dairyFree: 'Dairy-Free',
                keto: 'Keto',
                paleo: 'Paleo'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dietaryPrefs[key as keyof typeof dietaryPrefs]}
                    onChange={() => toggleDietaryPref(key as keyof typeof dietaryPrefs)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/today')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}