'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Activity, 
  MessageCircle,
  User,
  LogOut,
  Zap,
  Menu,
  X
} from 'lucide-react';

// Lightning Logo Component
const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

const navigation = [
  { name: 'AI Coach', href: '/user/coach', icon: Zap },
  { name: 'Quick Log', href: '/user/log', icon: Activity },
  { name: 'Dashboard', href: '/user/dashboard', icon: Home },
  { name: 'Chat', href: '/user/chat', icon: MessageCircle },
  { name: 'Profile', href: '/user/profile', icon: User },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sharpened-black text-white">
      {/* Lightning Grid Background */}
      <div className="lightning-grid" />
      
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-sharpened-void/95 backdrop-blur-sm border-b border-feel-primary/20">
        {/* Lightning accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-feel-primary to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/user" className="flex items-center gap-3 group">
              <div className="relative">
                <LightningLogo className="w-8 h-8 text-feel-primary" />
                <div className="absolute inset-0 bg-feel-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-heading font-black text-feel-primary">FEELSHARPER</span>
                <div className="w-px h-5 bg-feel-primary/30" />
                <span className="text-sm font-heading text-sharpened-gray uppercase tracking-wider">USER</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      relative px-4 py-2 flex items-center gap-2 font-medium text-sm transition-all
                      ${isActive 
                        ? 'text-feel-primary' 
                        : 'text-sharpened-light-gray hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-body">{item.name}</span>
                    {isActive && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-feel-primary to-transparent" />
                        <div className="absolute inset-0 bg-feel-primary/5" />
                      </>
                    )}
                  </Link>
                );
              })}
              
              {/* Sign Out Button */}
              <button
                onClick={() => console.log('Sign out clicked')}
                className="ml-4 px-4 py-2 flex items-center gap-2 text-sm text-sharpened-light-gray hover:text-red-400 transition-colors font-body"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-sharpened-light-gray hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sharpened-void/95 backdrop-blur-sm border-t border-feel-primary/20">
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      block px-4 py-3 rounded-lg flex items-center gap-3 transition-all
                      ${isActive 
                        ? 'bg-feel-primary/10 text-feel-primary' 
                        : 'text-sharpened-light-gray hover:bg-sharpened-charcoal hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-body font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => console.log('Sign out clicked')}
                className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-body font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}