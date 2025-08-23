"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClarifyingQuestionProps {
  originalInput: string;
  confidence: number;
  questions: Question[];
  onClarified: (answers: Record<string, any>) => void;
  onSkip: () => void;
}

interface Question {
  id: string;
  text: string;
  type: 'select' | 'number' | 'text' | 'boolean';
  options?: string[];
  placeholder?: string;
  unit?: string;
}

export function ClarifyingQuestion({
  originalInput,
  confidence,
  questions,
  onClarified,
  onSkip
}: ClarifyingQuestionProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      onClarified(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-sharpened-coal/50 to-sharpened-void/50 
                     border-feel-primary/20 backdrop-blur-md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-feel-secondary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-sharpened-white">
              Need a bit more detail
            </h3>
            <p className="text-sm text-sharpened-light-gray mt-1">
              Confidence: {confidence}% - Let me help you log this more accurately
            </p>
          </div>
        </div>
        
        {/* Original Input */}
        <div className="p-3 rounded-lg bg-sharpened-void/50 border border-sharpened-charcoal">
          <p className="text-sm text-sharpened-gray">You said:</p>
          <p className="text-sharpened-white mt-1">"{originalInput}"</p>
        </div>
        
        {/* Current Question */}
        <div className="space-y-3">
          <p className="text-sharpened-white font-medium">
            {currentQuestion.text}
          </p>
          
          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map(option => (
                <Button
                  key={option}
                  variant="outline"
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "justify-start border-sharpened-charcoal/50",
                    "hover:bg-feel-primary/10 hover:border-feel-primary/50",
                    "transition-all duration-200"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'number' && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={currentQuestion.placeholder}
                className="flex-1 bg-sharpened-void/50 border-sharpened-charcoal/50
                         focus:border-feel-primary/50 text-sharpened-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    if (input.value) {
                      handleAnswer(parseFloat(input.value));
                    }
                  }
                }}
              />
              {currentQuestion.unit && (
                <span className="text-sharpened-gray">{currentQuestion.unit}</span>
              )}
            </div>
          )}
          
          {currentQuestion.type === 'text' && (
            <Input
              type="text"
              placeholder={currentQuestion.placeholder}
              className="bg-sharpened-void/50 border-sharpened-charcoal/50
                       focus:border-feel-primary/50 text-sharpened-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleAnswer(e.currentTarget.value);
                }
              }}
            />
          )}
          
          {currentQuestion.type === 'boolean' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleAnswer(true)}
                className="flex-1 border-green-500/50 hover:bg-green-500/10"
              >
                <Check className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 border-red-500/50 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          )}
        </div>
        
        {/* Progress and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-sharpened-charcoal/50">
          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentQuestionIndex
                    ? "bg-feel-primary w-6"
                    : index < currentQuestionIndex
                    ? "bg-feel-secondary"
                    : "bg-sharpened-charcoal"
                )}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-sharpened-gray hover:text-sharpened-white"
              >
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-sharpened-gray hover:text-sharpened-white"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ClarifyingQuestion;