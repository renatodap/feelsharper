import { useEffect, useState } from 'react';

export interface UsageLimit {
  current_usage: number;
  monthly_limit: number;
  reset_date: string;
}

export interface FeatureGateData {
  isEnabled: boolean;
  isLoading: boolean;
  hasAccess: boolean;
  loading: boolean;
  usageLimit: UsageLimit | null;
  upgradeRequired: boolean;
  tierRequired: 'free' | 'pro' | 'elite';
  upgradeUrl: string;
  canUse: boolean;
  trackUsage: () => Promise<void>;
  getRemainingUses: () => number;
}

export function useFeatureGate(featureName: string): FeatureGateData {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);
  const [tierRequired, setTierRequired] = useState<'free' | 'pro' | 'elite'>('free');
  
  useEffect(() => {
    // Load feature gate data
    const loadFeatureData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/features/${featureName}`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
          setHasAccess(data.hasAccess);
          setUsageLimit(data.usageLimit);
          setTierRequired(data.tierRequired || 'free');
        } else {
          // Default to enabled for MVP
          setIsEnabled(true);
          setHasAccess(true);
        }
      } catch (err) {
        // Default to enabled for MVP
        setIsEnabled(true);
        setHasAccess(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeatureData();
  }, [featureName]);
  
  const trackUsage = async () => {
    try {
      await fetch('/api/features/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: featureName })
      });
      
      // Update usage limit if needed
      if (usageLimit) {
        setUsageLimit({
          ...usageLimit,
          current_usage: usageLimit.current_usage + 1
        });
      }
    } catch (err) {
      console.error('Failed to track usage:', err);
    }
  };
  
  const getRemainingUses = () => {
    if (!usageLimit) return -1; // Unlimited
    return Math.max(0, usageLimit.monthly_limit - usageLimit.current_usage);
  };
  
  const canUse = hasAccess && (!usageLimit || usageLimit.current_usage < usageLimit.monthly_limit);
  const upgradeRequired = !hasAccess || (usageLimit && usageLimit.current_usage >= usageLimit.monthly_limit);
  const upgradeUrl = `/pricing?feature=${featureName}&tier=${tierRequired}`;
  
  return {
    isEnabled,
    isLoading,
    hasAccess,
    loading: isLoading,
    usageLimit,
    upgradeRequired,
    tierRequired,
    upgradeUrl,
    canUse,
    trackUsage,
    getRemainingUses
  };
}

// Additional export for subscription status
export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState({
    tier: 'free' as 'free' | 'pro' | 'elite',
    active: true,
    expiresAt: null as Date | null,
    cancelledAt: null as Date | null
  });
  
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error('Failed to load subscription:', err);
      }
    };
    
    loadSubscription();
  }, []);
  
  return subscription;
}