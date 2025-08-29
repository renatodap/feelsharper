'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic, Zap, TrendingUp, ArrowRight, Activity, Brain, Target, ChevronRight } from 'lucide-react';

// Lightning Logo Component - Sharpened Brand
const LightningLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Real AI Demo Examples - Actual FeelSharper capabilities
const aiExamples = [
  { input: "Just played tennis for 90 minutes", output: { activity: "Tennis", duration: "90 min", zone: "Cardio", calories: "450 kcal" } },
  { input: "Did my usual morning workout", output: { activity: "Workout", duration: "45 min", zone: "Mixed", calories: "320 kcal" } },
  { input: "Ate a protein bowl after training", output: { activity: "Nutrition", protein: "35g", carbs: "45g", calories: "420 kcal" } },
  { input: "Feeling tired, should I rest?", output: { insight: "Recovery needed", suggestion: "Light activity", recovery: "8-10 hours sleep" } }
];

const SharpenedLanding = () => {
  const [currentExample, setCurrentExample] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  // Enhanced typing animation with processing stages
  useEffect(() => {
    const example = aiExamples[currentExample].input;
    
    if (typingText.length < example.length) {
      const timer = setTimeout(() => {
        setTypingText(example.slice(0, typingText.length + 1));
        // Show processing dots as text builds
        setProcessingStage(Math.floor((typingText.length / example.length) * 3));
      }, 60);
      return () => clearTimeout(timer);
    } else {
      // Show output after typing completes
      setTimeout(() => {
        setShowOutput(true);
      }, 500);
      
      // Reset and move to next example
      setTimeout(() => {
        setTypingText('');
        setShowOutput(false);
        setProcessingStage(0);
        setCurrentExample((prev) => (prev + 1) % aiExamples.length);
      }, 3500);
    }
  }, [typingText, currentExample]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* DRAMATIC SHARPENED HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-blue-500/30">
        {/* Lightning Strike Top Border */}
        <div 
          className="bg-gradient-to-r from-blue-500/40 via-blue-400/60 to-blue-500/40 h-1"
          style={{ clipPath: 'polygon(0 0, 30% 0, 35% 100%, 65% 100%, 70% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <LightningLogo className="w-10 h-10 text-blue-400 relative z-10" />
              <div className="absolute -inset-2 bg-blue-400/30 blur-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-blue-400">SHARPENED</span>
              <div className="w-0.5 h-6 bg-blue-400/60" />
              <span className="text-lg font-bold tracking-wide text-white">FEELSHARPER</span>
            </div>
          </div>
          <Link 
            href="/signin"
            className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 font-black text-lg transition-all overflow-hidden group"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <LightningLogo className="w-4 h-4" />
              START FREE
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </header>

      {/* Hero Section with Diagonal Elements */}
      <section className="relative pt-20 min-h-screen flex items-center">
        {/* MASSIVE LIGHTNING BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Giant Lightning Bolt SVG Background */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full scale-150" viewBox="0 0 2000 2000" fill="currentColor">
              <path className="text-blue-400" d="M1316.51,114.18l-179.59,539.46c119.07,100.86,266.86,187.13,380.91,292.16,16.83,15.5,52.29,42.07,46.89,65.3l-881.44,874.73,179.44-546.25-393.53-298.18c-12.77-15.4-41.59-28.37-32.85-51.14L1316.51,114.18Z"/>
            </svg>
          </div>
          
          {/* Animated Lightning Strikes */}
          <div className="absolute top-1/4 left-1/3 opacity-20">
            <LightningLogo className="w-32 h-32 text-blue-400 animate-pulse" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 opacity-15">
            <LightningLogo className="w-48 h-48 text-blue-500 animate-pulse transform rotate-45" />
          </div>
          
          {/* Diagonal Lightning Strikes */}
          <div 
            className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-br from-blue-500/10 to-transparent"
            style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)' }}
          />
          
          {/* Electric Glow Effects */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* MASSIVE SHARPENED BRANDING */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <LightningLogo className="w-24 h-24 text-blue-400 relative z-10" />
                <div className="absolute inset-0 bg-blue-400/40 blur-2xl scale-150 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-blue-400 tracking-wider">FEELSHARPER</h1>
                <div className="flex items-center gap-2 mt-1">
                  <LightningLogo className="w-5 h-5 text-blue-400/80 animate-pulse" />
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent" />
                  <p className="text-lg font-bold text-gray-300 tracking-widest">SHARPENED</p>
                  <div className="w-8 h-0.5 bg-gradient-to-l from-blue-400 to-transparent" />
                  <LightningLogo className="w-5 h-5 text-blue-400/80 animate-pulse transform scale-x-[-1]" />
                </div>
              </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              Just <span className="text-blue-400">Talk.</span><br />
              <span className="relative">
                AI Does Everything
                <div className="absolute -right-8 -top-2">
                  <LightningLogo className="w-6 h-6 text-blue-400/40 animate-pulse" />
                </div>
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              The first fitness tracker that speaks your language. 
              No forms, no menus, no friction.
            </p>

            <div className="flex gap-4 mb-12">
              <Link 
                href="/signin"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold transition-all flex items-center gap-2"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                ENTER APP
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-white font-bold transition-all"
              >
                Watch Demo
              </button>
            </div>

            {/* Real FeelSharper Metrics - Sharp Angular Cards */}
            <div className="flex gap-6 text-sm">
              {[
                { value: "0.3s", label: "Parse Time", desc: "Natural language processing" },
                { value: "47→1", label: "Tap Reduction", desc: "From traditional apps" },
                { value: "100%", label: "AI Powered", desc: "No manual input needed" }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="relative bg-gray-900/30 border border-blue-500/20 p-4"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                >
                  <div className="text-2xl font-black text-blue-400">{stat.value}</div>
                  <div className="text-gray-300 font-semibold">{stat.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.desc}</div>
                  {/* Sharp accent */}
                  <div 
                    className="absolute top-0 right-0 w-3 h-3 bg-blue-500/30"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Demo */}
          <div className="relative">
            <div 
              className="bg-gray-900/50 backdrop-blur-xl border border-blue-500/30 p-8 shadow-2xl"
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
            >
              {/* Processing indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        processingStage > i ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  typingText.length > 0 ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {typingText.length > 0 ? 'PROCESSING VOICE...' : 'WAITING...'}
                </span>
              </div>

              {/* Voice input visualization */}
              <div className="bg-gray-950/50 rounded-lg p-4 mb-6 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    typingText.length > 0 ? 'bg-blue-500/30' : 'bg-blue-500/20'
                  }`}>
                    <Mic className={`w-5 h-5 transition-colors ${
                      typingText.length > 0 ? 'text-blue-300' : 'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg font-mono">
                      {typingText ? `"${typingText}"` : <span className="text-gray-500">Listening...</span>}
                      {typingText.length > 0 && typingText.length < aiExamples[currentExample].input.length && (
                        <span className="animate-pulse">|</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed result with smooth transition */}
              <div className={`space-y-4 transition-all duration-500 ${
                showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">PARSED & LOGGED</span>
                </div>
                
                <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(aiExamples[currentExample].output).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-gray-400 text-xs mb-1 capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-white font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400/20">
                    <p className="text-green-400 text-xs">95% confidence • Automatically tracked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharp corner accents */}
            <div 
              className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/20"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
            />
            <div 
              className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-500/20"
              style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section with Sharp Design */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black mb-4">Lightning Fast Intelligence</h3>
            <p className="text-gray-400">Powered by cutting-edge AI that understands you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Smart Parsing",
                description: "AI understands context and automatically categorizes your activities",
                color: "blue"
              },
              {
                icon: <Activity className="w-8 h-8" />,
                title: "Instant Insights",
                description: "Get personalized recommendations based on your patterns",
                color: "green"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Progress Tracking",
                description: "Visualize your journey with intelligent analytics",
                color: "purple"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="relative bg-gray-900/30 border border-gray-800 p-6 hover:border-blue-500/50 transition-all group"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
              >
                <div className={`w-12 h-12 bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:bg-${feature.color}-500/30 transition-colors`}
                     style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                  <div className={`text-${feature.color}-400`}>{feature.icon}</div>
                </div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
                
                {/* Sharp corner accent */}
                <div 
                  className={`absolute top-0 right-0 w-4 h-4 bg-${feature.color}-500/20 group-hover:bg-${feature.color}-500/30 transition-colors`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <LightningLogo className="w-16 h-16 text-blue-400 mx-auto" />
            <div className="absolute inset-0 bg-blue-400/30 blur-2xl animate-pulse" />
          </div>
          <h3 className="text-4xl font-black mb-4">Ready to Feel Sharper?</h3>
          <p className="text-xl text-gray-400 mb-8">Join thousands already tracking smarter, not harder</p>
          <Link 
            href="/signin"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xl transition-all group"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <LightningLogo className="w-6 h-6" />
            START YOUR FREE TRIAL
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SharpenedLanding;