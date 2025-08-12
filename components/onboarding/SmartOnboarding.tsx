'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/TypographyWrapper';
import Button from '@/components/ui/Button';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Clock, 
  Dumbbell, 
  Heart, 
  Brain,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface OnboardingData {
  currentGoal: string;
  experience: string;
  timeAvailable: string;
  equipment: string[];
  constraints: string[];
  motivation: string;
  previousAttempts: string;
}

interface PersonalizedPlan {
  title: string;
  description: string;
  weeklySchedule: string;
  firstWeekFocus: string[];
  keyPrinciples: string[];
  commonPitfalls: string[];
  successTips: string[];
}

export default function SmartOnboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    currentGoal: '',
    experience: '',
    timeAvailable: '',
    equipment: [],
    constraints: [],
    motivation: '',
    previousAttempts: ''
  });
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 6;

  const generatePersonalizedPlan = () => {
    setIsGenerating(true);
    
    // Simulate AI plan generation based on user inputs
    setTimeout(() => {
      const plans = {
        'weight_loss_beginner_busy': {
          title: "The Busy Professional's Fat Loss System",
          description: "A sustainable approach designed for your hectic schedule. No overwhelm, just consistent progress.",
          weeklySchedule: "3 x 30-minute sessions + 2 x 15-minute walks",
          firstWeekFocus: [
            "Master 5 basic bodyweight movements",
            "Establish morning routine (10 minutes)",
            "Track meals with voice logging (no counting yet)",
            "Set up sleep schedule"
          ],
          keyPrinciples: [
            "Consistency beats intensity",
            "Progress, not perfection",
            "Small wins compound",
            "Recovery is part of the plan"
          ],
          commonPitfalls: [
            "Trying to do too much too soon",
            "All-or-nothing thinking",
            "Comparing to others",
            "Ignoring sleep and stress"
          ],
          successTips: [
            "Schedule workouts like meetings",
            "Prep healthy snacks Sunday",
            "Use the 2-minute rule for habits",
            "Celebrate small victories daily"
          ]
        },
        'muscle_gain_intermediate': {
          title: "The Intelligent Muscle Building Protocol",
          description: "Science-based approach to maximize muscle growth while managing your busy life.",
          weeklySchedule: "4 x 45-minute strength sessions + 2 x cardio",
          firstWeekFocus: [
            "Establish progressive overload tracking",
            "Optimize protein intake timing",
            "Set up recovery metrics",
            "Create meal prep system"
          ],
          keyPrinciples: [
            "Progressive overload is king",
            "Recovery drives growth",
            "Nutrition timing matters",
            "Consistency over perfection"
          ],
          commonPitfalls: [
            "Ego lifting without progression",
            "Neglecting compound movements",
            "Insufficient protein",
            "Poor sleep hygiene"
          ],
          successTips: [
            "Track every workout",
            "Prioritize compound movements",
            "Eat protein within 2 hours post-workout",
            "Get 7-9 hours of quality sleep"
          ]
        }
      };

      // Simple logic to select plan based on goal and experience
      const key = `${data.currentGoal}_${data.experience}${data.timeAvailable.includes('busy') ? '_busy' : ''}`;
      setPlan(plans[key as keyof typeof plans] || plans.weight_loss_beginner_busy);
      setIsGenerating(false);
    }, 2000);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      generatePersonalizedPlan();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateData = (field: keyof OnboardingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                What's your main goal right now?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Be honest - what do you actually want to achieve?
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'weight_loss', title: 'Lose Weight & Feel Better', desc: 'Drop fat, gain energy and confidence' },
                { id: 'muscle_gain', title: 'Build Muscle & Strength', desc: 'Get stronger, look better, feel powerful' },
                { id: 'endurance', title: 'Improve Endurance', desc: 'Run faster, last longer, feel unstoppable' },
                { id: 'general_health', title: 'Overall Health & Vitality', desc: 'Sleep better, think clearer, live better' }
              ].map((goal) => (
                <Card 
                  key={goal.id}
                  className={`p-4 cursor-pointer transition-all ${
                    data.currentGoal === goal.id 
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateData('currentGoal', goal.id)}
                >
                  <Typography variant="h4" className="font-semibold mb-2">{goal.title}</Typography>
                  <Typography variant="body2" className="text-slate-600">{goal.desc}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Dumbbell className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                What's your experience level?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                This helps us customize everything to your current abilities
              </Typography>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'beginner', title: 'Beginner', desc: 'New to fitness or getting back after a long break' },
                { id: 'intermediate', title: 'Intermediate', desc: 'Been working out for 6+ months consistently' },
                { id: 'advanced', title: 'Advanced', desc: '2+ years of consistent training experience' }
              ].map((level) => (
                <Card 
                  key={level.id}
                  className={`p-4 cursor-pointer transition-all ${
                    data.experience === level.id 
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateData('experience', level.id)}
                >
                  <Typography variant="h4" className="font-semibold mb-2">{level.title}</Typography>
                  <Typography variant="body2" className="text-slate-600">{level.desc}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                How much time can you realistically commit?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Be honest about your schedule - we'll work with what you have
              </Typography>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'busy', title: '2-3 hours per week', desc: 'Super busy, need maximum efficiency' },
                { id: 'moderate', title: '4-5 hours per week', desc: 'Can commit to regular sessions' },
                { id: 'dedicated', title: '6+ hours per week', desc: 'Fitness is a priority, have good time flexibility' }
              ].map((time) => (
                <Card 
                  key={time.id}
                  className={`p-4 cursor-pointer transition-all ${
                    data.timeAvailable === time.id 
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateData('timeAvailable', time.id)}
                >
                  <Typography variant="h4" className="font-semibold mb-2">{time.title}</Typography>
                  <Typography variant="body2" className="text-slate-600">{time.desc}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                What equipment do you have access to?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                Select all that apply - we'll design around what you have
              </Typography>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Home gym', 'Commercial gym', 'Dumbbells', 'Resistance bands', 
                'Pull-up bar', 'Bodyweight only', 'Cardio equipment', 'Kettlebells'
              ].map((equipment) => (
                <Card 
                  key={equipment}
                  className={`p-3 cursor-pointer transition-all text-center ${
                    data.equipment.includes(equipment)
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    const newEquipment = data.equipment.includes(equipment)
                      ? data.equipment.filter(e => e !== equipment)
                      : [...data.equipment, equipment];
                    updateData('equipment', newEquipment);
                  }}
                >
                  <Typography variant="body2" className="font-medium">{equipment}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                Any constraints we should know about?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                This helps us avoid what doesn't work for you
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Previous injuries', 'Joint issues', 'Time constraints', 'Travel frequently',
                'Dietary restrictions', 'Sleep issues', 'High stress job', 'Family commitments'
              ].map((constraint) => (
                <Card 
                  key={constraint}
                  className={`p-3 cursor-pointer transition-all ${
                    data.constraints.includes(constraint)
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    const newConstraints = data.constraints.includes(constraint)
                      ? data.constraints.filter(c => c !== constraint)
                      : [...data.constraints, constraint];
                    updateData('constraints', newConstraints);
                  }}
                >
                  <Typography variant="body2" className="font-medium text-center">{constraint}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Brain className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <Typography variant="h2" className="text-2xl font-bold mb-2">
                What's your biggest motivation?
              </Typography>
              <Typography variant="body1" className="text-slate-600">
                This is your "why" - we'll remind you when things get tough
              </Typography>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'confidence', title: 'Feel confident in my own skin', desc: 'Look good, feel amazing' },
                { id: 'energy', title: 'Have more energy for life', desc: 'Keep up with family, work, and hobbies' },
                { id: 'health', title: 'Improve long-term health', desc: 'Age gracefully, prevent disease' },
                { id: 'performance', title: 'Perform better in sports/life', desc: 'Be stronger, faster, more capable' },
                { id: 'example', title: 'Be a good example', desc: 'Show family/friends what\'s possible' }
              ].map((motivation) => (
                <Card 
                  key={motivation.id}
                  className={`p-4 cursor-pointer transition-all ${
                    data.motivation === motivation.id 
                      ? 'ring-2 ring-amber-500 bg-amber-50' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateData('motivation', motivation.id)}
                >
                  <Typography variant="h4" className="font-semibold mb-2">{motivation.title}</Typography>
                  <Typography variant="body2" className="text-slate-600">{motivation.desc}</Typography>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (plan) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Your Personalized Plan is Ready!
          </Typography>
          <Typography variant="body1" className="text-slate-600">
            Designed specifically for your goals, schedule, and constraints
          </Typography>
        </div>

        <Card className="p-8 bg-gradient-to-r from-amber-50 to-amber-100">
          <Typography variant="h2" className="text-2xl font-bold mb-4 text-amber-900">
            {plan.title}
          </Typography>
          <Typography variant="body1" className="text-amber-800 mb-6">
            {plan.description}
          </Typography>
          <div className="bg-white rounded-lg p-4">
            <Typography variant="h4" className="font-semibold mb-2">Weekly Schedule</Typography>
            <Typography variant="body2" className="text-slate-700">{plan.weeklySchedule}</Typography>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-6 h-6 text-blue-500 mr-2" />
              <Typography variant="h4" className="font-semibold">Your First Week Focus</Typography>
            </div>
            <div className="space-y-2">
              {plan.firstWeekFocus.map((focus, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2" />
                  <Typography variant="body2">{focus}</Typography>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-green-500 mr-2" />
              <Typography variant="h4" className="font-semibold">Key Principles</Typography>
            </div>
            <div className="space-y-2">
              {plan.keyPrinciples.map((principle, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2" />
                  <Typography variant="body2">{principle}</Typography>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <Typography variant="h4" className="font-semibold">Avoid These Pitfalls</Typography>
            </div>
            <div className="space-y-2">
              {plan.commonPitfalls.map((pitfall, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2" />
                  <Typography variant="body2">{pitfall}</Typography>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-500 mr-2" />
              <Typography variant="h4" className="font-semibold">Success Tips</Typography>
            </div>
            <div className="space-y-2">
              {plan.successTips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2" />
                  <Typography variant="body2">{tip}</Typography>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="px-8">
            Start My Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Typography variant="body2" className="text-slate-600 mt-4">
            Your plan will adapt as you progress - no overwhelm, just results
          </Typography>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-6" />
        <Typography variant="h2" className="text-2xl font-bold mb-2">
          Creating Your Personalized Plan...
        </Typography>
        <Typography variant="body1" className="text-slate-600">
          Analyzing your goals, schedule, and constraints to build the perfect approach for you
        </Typography>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <Typography variant="body2" className="text-slate-600">
            Step {step} of {totalSteps}
          </Typography>
          <Typography variant="body2" className="text-slate-600">
            {Math.round((step / totalSteps) * 100)}% Complete
          </Typography>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={
            (step === 1 && !data.currentGoal) ||
            (step === 2 && !data.experience) ||
            (step === 3 && !data.timeAvailable) ||
            (step === 4 && data.equipment.length === 0) ||
            (step === 6 && !data.motivation)
          }
        >
          {step === totalSteps ? 'Generate My Plan' : 'Next'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
