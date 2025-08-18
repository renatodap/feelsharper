'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { useTheme } from '@/components/theme/ThemeProvider'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getMenuItems } from '@/lib/navigation/routes'
import { useAuth } from '@/components/auth/AuthProvider'
import LogoutButton from '@/components/auth/LogoutButton'

export function AuthQuick() {
  const { user, loading } = useAuth()

  if (loading) return <span className="text-sm">Loading...</span>
  
  if (!user) {
    return (
      <Link 
        href="/sign-in" 
        className="text-sm underline text-slate-700 hover:text-slate-900"
      >
        Sign in
      </Link>
    )
  }
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">
        {user.email?.split('@')[0]}
      </span>
      <LogoutButton className="text-sm" />
    </div>
  )
}

/**
 * Fixed Navbar component with proper button functionality and high-contrast design
 * Ensures all navigation links work correctly and meet WCAG AA+ standards
 * Fixed: Consistent button styling, proper mobile menu, accessible interactions
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navigation, setNavigation] = useState<any[]>([])
  const pathname = usePathname()
  const { theme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    const isAuthenticated = !!user
    setNavigation(getMenuItems(isAuthenticated, false))
  }, [user])

  return (
    <header data-theme={theme} className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm data-[theme=dark]:bg-slate-900/80 data-[theme=dark]:border-slate-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Logo />
        </div>
        
        {/* Fixed: Mobile menu button with proper functionality */}
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5 text-slate-700 hover:text-slate-900"
            aria-label="Open main menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        
        {/* Fixed: High-contrast navigation links */}
        <div className="hidden lg:flex lg:gap-x-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ` +
                  (active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50')
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
        
        {/* Fixed: Consistent CTA button */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          <AuthQuick />
          <ThemeToggle />
        </div>
      </nav>
      
      {/* Fixed: Mobile menu with proper functionality and styling */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 p-2.5 text-slate-700 hover:text-slate-900"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-neutral-200">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const active = pathname?.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={
                          `-mx-3 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-colors ` +
                          (active
                            ? 'bg-sharp-blue text-clean-white'
                            : 'text-steel-gray hover:text-sharp-blue hover:bg-neutral-50')
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
                <div className="py-6">
                  <ThemeToggle className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
