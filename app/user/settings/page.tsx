'use client';

import { useState } from 'react';
import DataPrivacy from '@/components/settings/DataPrivacy';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Moon,
  Volume2,
  Save,
  ChevronRight,
  Database,
  Download
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Profile
    name: 'John Athlete',
    email: 'john@example.com',
    timezone: 'America/New_York',
    units: 'metric',
    
    // Notifications
    workoutReminders: true,
    achievementAlerts: true,
    weeklyReport: true,
    pushNotifications: false,
    
    // Privacy
    publicProfile: false,
    shareProgress: true,
    dataCollection: true,
    
    // Preferences
    darkMode: true,
    soundEffects: true,
    autoLog: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof settings]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-title font-black text-white mb-2">
          <span className="text-feel-primary lightning-text">Settings</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Customize your FeelSharper experience
        </p>
      </div>

      {/* Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">Profile</h2>
        </div>
        
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-semibold text-sharpened-light-gray mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  className="w-full px-4 py-2 bg-sharpened-void/50 border border-sharpened-charcoal text-white font-body focus:outline-none focus:border-feel-primary/50 transition-colors"
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-sharpened-light-gray mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full px-4 py-2 bg-sharpened-void/50 border border-sharpened-charcoal text-white font-body focus:outline-none focus:border-feel-primary/50 transition-colors"
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-sharpened-light-gray mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full px-4 py-2 bg-sharpened-void/50 border border-sharpened-charcoal text-white font-body focus:outline-none focus:border-feel-primary/50 transition-colors appearance-none"
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-sharpened-light-gray mb-2">
                  Units
                </label>
                <select
                  value={settings.units}
                  onChange={(e) => setSettings({...settings, units: e.target.value})}
                  className="w-full px-4 py-2 bg-sharpened-void/50 border border-sharpened-charcoal text-white font-body focus:outline-none focus:border-feel-primary/50 transition-colors appearance-none"
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  <option value="metric">Metric (kg, km)</option>
                  <option value="imperial">Imperial (lbs, miles)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">Notifications</h2>
        </div>
        
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="space-y-4">
            {[
              { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Daily reminders to stay active' },
              { key: 'achievementAlerts', label: 'Achievement Alerts', desc: 'Notifications for new achievements' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of your weekly progress' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Mobile app notifications' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="font-body font-semibold text-white">{item.label}</div>
                  <div className="text-sm text-sharpened-gray font-body">{item.desc}</div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-14 h-7 transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-feel-primary' : 'bg-sharpened-charcoal'
                  }`}
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))'
                  }}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                       style={{ 
                         clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                       }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">Privacy</h2>
        </div>
        
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="space-y-4">
            {[
              { key: 'publicProfile', label: 'Public Profile', desc: 'Let others see your achievements' },
              { key: 'shareProgress', label: 'Share Progress', desc: 'Share workout data with friends' },
              { key: 'dataCollection', label: 'Analytics', desc: 'Help improve FeelSharper with usage data' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="font-body font-semibold text-white">{item.label}</div>
                  <div className="text-sm text-sharpened-gray font-body">{item.desc}</div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-14 h-7 transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-feel-primary' : 'bg-sharpened-charcoal'
                  }`}
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))'
                  }}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                       style={{ 
                         clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                       }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">Preferences</h2>
        </div>
        
        <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
             }}>
          <div className="space-y-4">
            {[
              { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme', icon: Moon },
              { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds for actions', icon: Volume2 },
              { key: 'autoLog', label: 'Auto-Log', desc: 'Automatically detect activities', icon: Globe },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="w-5 h-5 text-sharpened-gray" />
                  <div>
                    <div className="font-body font-semibold text-white">{item.label}</div>
                    <div className="text-sm text-sharpened-gray font-body">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-14 h-7 transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-feel-primary' : 'bg-sharpened-charcoal'
                  }`}
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))'
                  }}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                       style={{ 
                         clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                       }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="sharp-button px-8 py-3 bg-gradient-to-r from-feel-primary to-feel-secondary flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      {/* Data & Privacy Section */}
      <div className="mt-12 pt-8 border-t border-sharpened-charcoal">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-feel-primary" />
          <h2 className="text-2xl font-title font-bold text-white">Data & Privacy</h2>
        </div>
        <DataPrivacy />
      </div>
    </div>
  );
}