"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function FrictionlessOnboardingManager() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Feel Sharper",
      description: "Let's get you started with tracking your health journey",
      action: () => setCurrentStep(1)
    },
    {
      title: "Set Your Goals",
      description: "What would you like to focus on?",
      action: () => setCurrentStep(2)
    },
    {
      title: "Ready to Go!",
      description: "You're all set up. Let's start tracking.",
      action: () => router.push('/today')
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {currentStepData.title}
          </h2>
          <p className="text-text-secondary mb-6">
            {currentStepData.description}
          </p>
          <Button 
            onClick={currentStepData.action}
            className="w-full"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Button>
          {currentStep > 0 && (
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="w-full mt-2"
            >
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}