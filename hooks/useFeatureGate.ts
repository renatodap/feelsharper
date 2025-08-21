import { useEffect, useState } from 'react';

export function useFeatureGate(featureName: string) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // For MVP, all features are enabled
    setIsEnabled(true);
    setIsLoading(false);
  }, [featureName]);
  
  return { isEnabled, isLoading };
}