'use client'

import { useState } from 'react'
import { User, Target, Bell, Shield, Link, Database, ChevronRight, Save, Check } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface SettingsSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)
  
  // Form states
  const [profile, setProfile] = useState({
    name: user?.email?.split('@')[0] || '',
    age: '',
    weight: '',
    height: '',
    fitnessLevel: 'intermediate'
  })
  
  const [preferences, setPreferences] = useState({
    units: 'imperial',
    timezone: 'America/New_York',
    language: 'en',
    notifications: true,
    coachingStyle: 'balanced'
  })
  
  const [goals, setGoals] = useState({
    primaryGoal: 'build_muscle',
    targetWeight: '',
    activityFrequency: '4',
    timeline: '3_months'
  })

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Basic information about you'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: <Bell className="w-5 h-5" />,
      description: 'Units, notifications, and app settings'
    },
    {
      id: 'goals',
      title: 'Goals',
      icon: <Target className="w-5 h-5" />,
      description: 'Your fitness goals and targets'
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: <Shield className="w-5 h-5" />,
      description: 'Data management and privacy settings'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Link className="w-5 h-5" />,
      description: 'Connect fitness devices and apps'
    }
  ]

  const handleSave = async () => {
    // In production, this would save to the database
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Fitness Level</label>
                <select
                  value={profile.fitnessLevel}
                  onChange={(e) => setProfile({ ...profile, fitnessLevel: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Weight ({preferences.units === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Height ({preferences.units === 'imperial' ? 'in' : 'cm'})
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                />
              </div>
            </div>
          </div>
        )
        
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Units</label>
              <select
                value={preferences.units}
                onChange={(e) => setPreferences({ ...preferences, units: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="imperial">Imperial (lbs, miles)</option>
                <option value="metric">Metric (kg, km)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Coaching Style</label>
              <select
                value={preferences.coachingStyle}
                onChange={(e) => setPreferences({ ...preferences, coachingStyle: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="gentle">Gentle Encouragement</option>
                <option value="balanced">Balanced</option>
                <option value="tough">Tough Love</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-400">Get reminders and insights</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  preferences.notifications ? 'bg-[#4169E1]' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )
        
      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <select
                value={goals.primaryGoal}
                onChange={(e) => setGoals({ ...goals, primaryGoal: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="lose_weight">Lose Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="improve_endurance">Improve Endurance</option>
                <option value="general_fitness">General Fitness</option>
                <option value="sport_performance">Sport Performance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Weight ({preferences.units === 'imperial' ? 'lbs' : 'kg'})
              </label>
              <input
                type="number"
                value={goals.targetWeight}
                onChange={(e) => setGoals({ ...goals, targetWeight: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Activity Frequency</label>
              <select
                value={goals.activityFrequency}
                onChange={(e) => setGoals({ ...goals, activityFrequency: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="2">2 days/week</option>
                <option value="3">3 days/week</option>
                <option value="4">4 days/week</option>
                <option value="5">5 days/week</option>
                <option value="6">6 days/week</option>
                <option value="7">Every day</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timeline</label>
              <select
                value={goals.timeline}
                onChange={(e) => setGoals({ ...goals, timeline: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              >
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
            </div>
          </div>
        )
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="font-medium mb-2">Data Export</h3>
              <p className="text-sm text-gray-400 mb-4">Download all your data in CSV or JSON format</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors">
                  Export as CSV
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  Export as JSON
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="font-medium mb-2">Data Sharing</h3>
              <p className="text-sm text-gray-400 mb-4">Control how your data is used</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-sm">Allow analytics for app improvement</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Share progress with community (anonymous)</span>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h3 className="font-medium mb-2 text-red-400">Delete Account</h3>
              <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all data</p>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )
        
      case 'integrations':
        return (
          <div className="space-y-4">
            {[
              { name: 'Garmin Connect', connected: false, icon: '⌚' },
              { name: 'Apple Health', connected: false, icon: '🍎' },
              { name: 'Google Fit', connected: false, icon: '🏃' },
              { name: 'Strava', connected: true, icon: '🚴' },
              { name: 'MyFitnessPal', connected: false, icon: '🍽️' }
            ].map((integration) => (
              <div key={integration.name} className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-gray-400">
                      {integration.connected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-lg transition-colors ${
                  integration.connected 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-[#4169E1]/20 hover:bg-[#4169E1]/30 text-[#4169E1]'
                }`}>
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full p-4 rounded-lg text-left transition-all
                  ${activeSection === section.id 
                    ? 'bg-[#4169E1]/20 border border-[#4169E1]/30' 
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
            
            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-left"
            >
              Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-[#1A1A1B] rounded-xl border border-white/10 p-8">
              <h2 className="text-xl font-semibold mb-6">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              
              {renderSectionContent()}
              
              {/* Save Button */}
              {['profile', 'preferences', 'goals'].includes(activeSection) && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
