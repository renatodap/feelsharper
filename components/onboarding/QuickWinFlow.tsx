"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Target, CheckCircle2, ArrowRight } from 'lucide-react';

interface QuickWinFlowProps {
  onComplete: () => void;
  onBack?: () => void;
}

export default function QuickWinFlow({ onComplete, onBack }: QuickWinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      title: "Quick Setup",
      description: "Let's get your profile ready",
      action: () => {
        setCompletedSteps([...completedSteps, 0]);
        setCurrentStep(1);
      }
    },
    {
      title: "First Goal",
      description: "What's your main health focus?",
      action: () => {
        setCompletedSteps([...completedSteps, 1]);
        setCurrentStep(2);
      }
    },
    {
      title: "All Set!",
      description: "You're ready to start your journey",
      action: onComplete
    }
  ];

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Current step */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Target className="w-12 h-12 text-primary mx-auto mb-2" />
              <Badge variant="outline">Quick Win</Badge>
            </div>
            
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-text-secondary mb-6">
              {steps[currentStep].description}
            </p>

            <div className="space-y-3">
              <Button 
                onClick={steps[currentStep].action}
                className="w-full"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {onBack && currentStep === 0 && (
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="w-full"
                >
                  Back to Options
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed steps indicator */}
        {completedSteps.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-text-secondary">
              {completedSteps.length} step{completedSteps.length > 1 ? 's' : ''} completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}