import { Metadata } from 'next';
import { NaturalLanguageInput } from '@/components/NaturalLanguageInput';
import SimpleHeader from '@/components/navigation/SimpleHeader';

export const metadata: Metadata = {
  title: 'Natural Language Demo | Feel Sharper',
  description: 'Try our AI-powered natural language fitness tracking',
};

export default function NaturalLanguageDemo() {
  return (
    <main className="min-h-screen bg-bg">
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Natural Language Fitness Tracking
          </h1>
          <p className="text-xl text-text-secondary mb-2">
            Just tell us what you did. No forms, no searching.
          </p>
          <p className="text-sm text-text-muted">
            🚀 Powered by AI • 🎯 Instant logging • 💬 Smart coaching
          </p>
        </div>

        {/* Main Input Component */}
        <NaturalLanguageInput />

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="text-2xl mb-2">🗣️</div>
            <h3 className="font-semibold text-text-primary mb-1">Voice Input</h3>
            <p className="text-sm text-text-secondary">
              Click the mic and speak naturally
            </p>
          </div>
          
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-text-primary mb-1">AI Parsing</h3>
            <p className="text-sm text-text-secondary">
              Understands weight, food, workouts, mood & more
            </p>
          </div>
          
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-text-primary mb-1">Smart Coach</h3>
            <p className="text-sm text-text-secondary">
              Get personalized insights and motivation
            </p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-12 bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            What Can I Track?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-text-primary mb-2">📊 Metrics</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• "Weight 175" or "I weigh 80 kg"</li>
                <li>• "Energy 8/10" or "Feeling energetic"</li>
                <li>• "Slept 8 hours" or "Got 7.5 hrs sleep"</li>
                <li>• "Drank 64 oz water" or "Had 2 liters"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">🍽️ Nutrition</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• "Had eggs for breakfast"</li>
                <li>• "Chicken salad for lunch"</li>
                <li>• "Ate steak and vegetables"</li>
                <li>• "Apple as a snack"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">💪 Workouts</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• "Ran 5k in 25 minutes"</li>
                <li>• "Walked 2 miles"</li>
                <li>• "Cycled for 30 minutes"</li>
                <li>• "Did chest and back workout"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">😊 Wellbeing</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• "Feeling great today"</li>
                <li>• "Mood is good"</li>
                <li>• "Stressed from work"</li>
                <li>• "Very tired"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 text-center text-sm text-text-muted">
          <p>
            This is a demo of our Natural Language MVP. 
            {' '}
            <a href="/onboarding" className="text-primary hover:underline">
              Sign up
            </a>
            {' '}
            to save your data and track progress over time.
          </p>
        </div>
      </div>
    </main>
  );
}