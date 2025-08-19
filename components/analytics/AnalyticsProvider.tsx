'use client';

import React, { createContext, useContext } from 'react';

// Simplified analytics context for TypeScript compatibility
interface AnalyticsContextType {
  analytics: {
    track: (event: string, properties?: any) => void;
    identify: (userId: string, properties?: any) => void;
    reset: () => void;
  };
  isInitialized: boolean;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackConversion: (step: string, funnel: string, properties?: Record<string, any>) => void;
  isFeatureEnabled: (flagKey: string) => boolean;
  privacyLevel: 'minimal' | 'standard' | 'full';
  updatePrivacyLevel: (level: 'minimal' | 'standard' | 'full') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const contextValue: AnalyticsContextType = {
    analytics: {
      track: () => {},
      identify: () => {},
      reset: () => {}
    },
    isInitialized: true,
    trackEvent: () => {},
    trackConversion: () => {},
    isFeatureEnabled: () => false,
    privacyLevel: 'standard',
    updatePrivacyLevel: () => {}
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}