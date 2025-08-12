'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
import Input from '@/components/ui/Input';
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;
// Simple Slider component
const Slider = ({ value, onValueChange, min, max, step, className }: any) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value?.[0] || 0}
    onChange={(e) => onValueChange([Number(e.target.value)])}
    className={`w-full ${className || ''}`}
  />
);
// Simple Textarea component
const Textarea = ({ className, ...props }: any) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} {...props} />;
import { 
  CheckCircle2, 
  Scale, 
  Moon, 
  Heart, 
  Battery, 
  Brain,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CheckinStep {
  id: string;
  title: string;
  icon: any;
  component: React.ReactNode;
}

export function DailyCheckin() {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkinData, setCheckinData] = useState({
    weight: '',
    sleepHours: 7,
    sleepQuality: 5,
    energyLevel: 5,
    stressLevel: 5,
    moodRating: 5,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Save weight if provided
      if (checkinData.weight) {
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: parseFloat(checkinData.weight) })
        });
      }

      // Save sleep data
      // Note: This would need a sleep API endpoint to be created
      // await fetch('/api/sleep', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     sleep_duration: checkinData.sleepHours,
      //     quality: checkinData.sleepQuality
      //   })
      // });

      toast({
        title: 'Check-in Complete!',
        description: 'Your daily metrics have been recorded. Keep up the great work!'
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save check-in data',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: CheckinStep[] = [
    {
      id: 'weight',
      title: 'Morning Weight',
      icon: Scale,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Best measured first thing in the morning, after bathroom
          </p>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="75.5"
              value={checkinData.weight}
              onChange={(e) => setCheckinData({ ...checkinData, weight: e.target.value })}
              className="text-2xl font-bold h-16 text-center"
            />
          </div>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleNext}
          >
            Skip for today
          </Button>
        </div>
      )
    },
    {
      id: 'sleep',
      title: 'Sleep Quality',
      icon: Moon,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Hours of Sleep</Label>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm w-12">{checkinData.sleepHours}h</span>
              <Slider
                value={[checkinData.sleepHours]}
                onValueChange={([value]: number[]) => setCheckinData({ ...checkinData, sleepHours: value })}
                min={3}
                max={12}
                step={0.5}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label>Sleep Quality</Label>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm w-12">{checkinData.sleepQuality}/10</span>
              <Slider
                value={[checkinData.sleepQuality]}
                onValueChange={([value]: number[]) => setCheckinData({ ...checkinData, sleepQuality: value })}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 = Terrible, 10 = Perfect
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'wellness',
      title: 'How You Feel',
      icon: Heart,
      component: (
        <div className="space-y-6">
          <div>
            <Label>Energy Level</Label>
            <div className="flex items-center gap-4 mt-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[checkinData.energyLevel]}
                onValueChange={([value]: number[]) => setCheckinData({ ...checkinData, energyLevel: value })}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{checkinData.energyLevel}/10</span>
            </div>
          </div>

          <div>
            <Label>Stress Level</Label>
            <div className="flex items-center gap-4 mt-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[checkinData.stressLevel]}
                onValueChange={([value]: number[]) => setCheckinData({ ...checkinData, stressLevel: value })}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{checkinData.stressLevel}/10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 = Very calm, 10 = Very stressed
            </p>
          </div>

          <div>
            <Label>Overall Mood</Label>
            <div className="flex items-center gap-4 mt-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[checkinData.moodRating]}
                onValueChange={([value]: number[]) => setCheckinData({ ...checkinData, moodRating: value })}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{checkinData.moodRating}/10</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      title: 'Quick Notes',
      icon: Brain,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Any thoughts about your training, nutrition, or how you're feeling?
          </p>
          <Textarea
            placeholder="Optional: Add any notes about today..."
            value={checkinData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCheckinData({ ...checkinData, notes: e.target.value })}
            rows={5}
          />
        </div>
      )
    },
    {
      id: 'summary',
      title: 'Check-in Summary',
      icon: CheckCircle2,
      component: (
        <div className="space-y-4">
          <div className="space-y-3">
            {checkinData.weight && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{checkinData.weight} kg</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Sleep</span>
              <span className="font-medium">{checkinData.sleepHours}h, Quality {checkinData.sleepQuality}/10</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Energy</span>
              <span className="font-medium">{checkinData.energyLevel}/10</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Stress</span>
              <span className="font-medium">{checkinData.stressLevel}/10</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Mood</span>
              <span className="font-medium">{checkinData.moodRating}/10</span>
            </div>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            Complete Check-in
          </Button>
        </div>
      )
    }
  ];

  const CurrentIcon = steps[currentStep].icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CurrentIcon className="h-5 w-5 text-primary" />
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="min-h-[300px]">
          {steps[currentStep].component}
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}