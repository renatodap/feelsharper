/**
 * App Navigation Component
 * Main navigation for authenticated users with MVP pages
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap, 
  PenLine, 
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Brain,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import SettingsSlideOver from '@/components/settings/SettingsSlideOver';
import type { UserPreferences } from '@/lib/types/mvp';

// Lightning Logo Component
const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
  </svg>
);

// Navigation items for MVP
const navigation = [
  { name: 'Insights', href: '/insights', icon: Brain, description: 'AI Coach' },
  { name: 'Log', href: '/log', icon: PenLine, description: 'Quick Log' },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Your Stats' },
];

// Mobile navigation items (bottom bar)
const mobileNavigation = [
  { name: 'Insights', href: '/insights', icon: Brain },
  { name: 'Log', href: '/log', icon: PenLine },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export default function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: user?.id || '',
    units_weight: 'lbs',
    units_distance: 'mi',
    units_volume: 'oz',
    time_format: '12h',
    persona_preset: 'auto',
    coaching_style: 'direct',
    goals_json: {},
  });

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSavePreferences = async (prefs: Partial<UserPreferences>) => {
    // Save to database
    const supabase = createClient();
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        ...preferences,
        ...prefs,
        user_id: user?.id,
      });

    if (!error) {
      setPreferences(prev => ({ ...prev, ...prefs }));
    }
  };

  const handleExportData = async () => {
    // Export user data
    const response = await fetch('/api/export');
    if (response.ok) {
      const data = await response.blob();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feelsharper-data.json';
      a.click();
    }
  };

  const handleDeleteAccount = async () => {
    // Soft delete account
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Additional cleanup would go here
      router.push('/');
    }
  };

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/sign') || pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Desktop Navigation - Top Bar */}
      <header className="hidden md:block fixed top-0 w-full z-40 bg-[#0A0A0B]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <LightningLogo className="w-8 h-8 text-[#4169E1]" />
                <div className="absolute inset-0 bg-[#4169E1]/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#4169E1]">FEEL</span>
                <span className="text-white">SHARPER</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative px-4 py-2 flex items-center gap-2 font-medium text-sm transition-all rounded-lg
                      ${isActive 
                        ? 'text-[#4169E1] bg-[#4169E1]/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-gray-400">
                  {user.email}
                </span>
              )}
              
              {/* Avatar with Settings */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#4169E1] to-blue-600 flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Open settings"
              >
                <User className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1B]/95 backdrop-blur-sm border-t border-white/10">
        <div className="flex justify-around items-center h-16">
          {mobileNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center flex-1 py-2 transition-all
                  ${isActive 
                    ? 'text-[#4169E1]' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4169E1]" />
                )}
              </Link>
            );
          })}
          
          {/* Settings Button for Mobile */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-400 hover:text-white transition-all"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* Mobile Header with Avatar */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-[#0A0A0B]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex justify-between items-center h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <LightningLogo className="w-6 h-6 text-[#4169E1]" />
            <span className="text-lg font-bold">
              <span className="text-[#4169E1]">FEEL</span>
              <span className="text-white">SHARPER</span>
            </span>
          </Link>
          
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4169E1] to-blue-600 flex items-center justify-center"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:pt-16 pt-14 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Settings Slide-Over */}
      {user && (
        <SettingsSlideOver
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={{
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name,
            provider: user.app_metadata?.provider || 'email'
          }}
          preferences={preferences}
          onSave={handleSavePreferences}
          onExport={handleExportData}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
}