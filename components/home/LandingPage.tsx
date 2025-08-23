'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { 
  Mic, Sparkles, MessageSquare, TrendingUp, Zap,
  ChevronRight, Check, Star, ArrowRight, ChevronDown
} from 'lucide-react';

// AI typing examples for hero section
const aiExamples = [
  { text: "ran 5k this morning in 25 minutes", response: "✓ 5km run logged • Pace: 5:00/km • Great job!" },
  { text: "bench pressed 225 for 3 sets of 8", response: "✓ Bench Press logged • 3×8 @ 225lbs • New PR!" },
  { text: "played tennis for 2 hours, won 6-4 6-3", response: "✓ Tennis match logged • 2 hours • Victory recorded!" },
  { text: "weight 175, feeling strong today", response: "✓ Weight logged • 175 lbs • Down 2 lbs this week!" },
  { text: "ate salmon and quinoa for lunch", response: "✓ Meal logged • 42g protein • Perfect for recovery!" },
];

const features = [
  {
    icon: Mic,
    title: 'Just Speak',
    description: 'Say it like you\'d tell a friend',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Sparkles,
    title: 'AI Understands',
    description: '95% accuracy, zero effort',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Insights that actually help',
    gradient: 'from-green-500 to-emerald-400',
  },
];



function LandingPage() {
  const [currentExample, setCurrentExample] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  // Typing animation for AI examples
  useEffect(() => {
    const example = aiExamples[currentExample];
    
    if (isTyping) {
      if (typingText.length < example.text.length) {
        const timer = setTimeout(() => {
          setTypingText(example.text.slice(0, typingText.length + 1));
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setShowResponse(true);
        setTimeout(() => {
          setIsTyping(false);
          setTimeout(() => {
            // Reset and move to next example
            setTypingText('');
            setShowResponse(false);
            setIsTyping(true);
            setCurrentExample((prev) => (prev + 1) % aiExamples.length);
          }, 2000);
        }, 1500);
      }
    }
  }, [typingText, currentExample, isTyping]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-950 to-purple-950 opacity-50" />
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
                <span className="text-3xl font-black text-white transform -rotate-3">FS</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-8 leading-tight">
            <span className="block">Just Talk.</span>
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Does The Rest.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            The first fitness app that speaks your language. No forms, no menus, no friction.
          </p>

          {/* Live AI Demo */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">AI is listening...</span>
              </div>
              
              <div className="flex items-start gap-4">
                <Mic className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-lg font-medium text-white mb-2">
                    "{typingText}<span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse ml-0.5" />
                  </p>
                  
                  {showResponse && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm font-medium">
                        {aiExamples[currentExample].response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-3">
              Live AI demo • Watch how natural language becomes perfect tracking
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition-all"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
              <span className="ml-2">4.9 rating</span>
            </div>
            <span>•</span>
            <span>95% accuracy</span>
            <span>•</span>
            <span>No credit card required</span>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                  <div className={`inline-flex p-3 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-6xl font-black text-gray-800 absolute top-4 right-4">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-32 px-4 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            The Old Way vs <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">The FeelSharper Way</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="bg-gray-900/50 border border-red-900/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-red-400">❌ Old Way</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-300">Search through 1000+ exercises</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-300">Fill out 10+ fields per exercise</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-300">5 minutes to log a workout</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-300">Forget to track half your sessions</span>
                </li>
              </ul>
            </div>
            
            {/* New Way */}
            <div className="bg-gray-900/50 border border-green-900/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-green-400">✓ FeelSharper Way</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Just speak or type naturally</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">AI extracts all the details</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">30 seconds to log everything</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Never miss a workout again</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Social Proof */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join 10,000+ Athletes
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Who've discovered the future of fitness tracking
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold text-blue-400">95%</div>
              <div className="text-gray-400 text-sm mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">2s</div>
              <div className="text-gray-400 text-sm mt-1">Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">30d</div>
              <div className="text-gray-400 text-sm mt-1">To Habit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">10x</div>
              <div className="text-gray-400 text-sm mt-1">Faster</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          <p className="text-gray-400">4.9/5 from 2,847 reviews</p>
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-3xl p-12 border border-blue-500/30">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Ready to Feel Sharper?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Transform your fitness journey with AI that actually understands you.
              </p>
              <Link 
                href="/sign-up"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-400 mt-6">
                14-day free trial • No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default memo(LandingPage);