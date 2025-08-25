'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic, Zap, TrendingUp, ArrowRight } from 'lucide-react';

// Lightning Logo Component - Sharpened Brand
const LightningLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Real AI Demo Examples - Actual FeelSharper capabilities
const aiExamples = [
  "Just played tennis for 90 minutes",
  "Did my usual morning workout", 
  "Feeling tired today, should I rest?",
  "Ate a protein bowl after training"
];

const SharpenedLanding = () => {
  const [currentExample, setCurrentExample] = useState(0);
  const [typingText, setTypingText] = useState('');

  // Typing animation
  useEffect(() => {
    const example = aiExamples[currentExample];
    if (typingText.length < example.length) {
      const timer = setTimeout(() => {
        setTypingText(example.slice(0, typingText.length + 1));
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setTypingText('');
        setCurrentExample((prev) => (prev + 1) % aiExamples.length);
      }, 2000);
    }
  }, [typingText, currentExample]);

  return (
    <div className="min-h-screen bg-sharpened-black text-white font-body">
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
              <div className="absolute -inset-1 bg-blue-500/20 blur-lg" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-feel-primary font-title">SHARPENED</span>
              <div className="w-0.5 h-6 bg-blue-400/60" />
              <span className="text-lg font-bold tracking-wide text-white font-title">FEELSHARPER</span>
            </div>
          </div>
          <Link 
            href="/sign-up"
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
        {/* MASSIVE LIGHTNING BACKGROUND - Sharpened Brand */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Giant Lightning Bolt SVG Background */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full scale-150" viewBox="0 0 2000 2000" fill="currentColor">
              <path className="text-blue-400" d="M1316.51,114.18l-179.59,539.46c119.07,100.86,266.86,187.13,380.91,292.16,16.83,15.5,52.29,42.07,46.89,65.3l-881.44,874.73,179.44-546.25-393.53-298.18c-12.77-15.4-41.59-28.37-32.85-51.14L1316.51,114.18Z"/>
            </svg>
          </div>
          
          {/* Animated Lightning Strikes */}
          <div className="absolute top-1/4 left-1/3 opacity-20">
            <div style={{ animationDuration: '3s' }}>
              <LightningLogo className="w-32 h-32 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-1/3 right-1/4 opacity-15">
            <div style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <LightningLogo className="w-48 h-48 text-blue-500 animate-pulse transform rotate-45" />
            </div>
          </div>
          <div className="absolute top-2/3 left-1/5 opacity-10">
            <div style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <LightningLogo className="w-24 h-24 text-blue-300 animate-pulse transform -rotate-12" />
            </div>
          </div>
          
          {/* Diagonal Lightning Strikes */}
          <div 
            className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-br from-blue-500/20 to-transparent"
            style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)' }}
          />
          <div 
            className="absolute bottom-0 left-0 w-2/3 h-3/4 bg-gradient-to-tr from-blue-600/15 to-transparent"
            style={{ clipPath: 'polygon(0 50%, 70% 0, 100% 70%, 30% 100%, 0 100%)' }}
          />
          
          {/* Lightning Strike Lines */}
          <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-blue-400/40 via-transparent to-blue-400/40 transform rotate-12 blur-sm" />
          <div className="absolute top-0 right-1/4 w-0.5 h-2/3 bg-gradient-to-b from-transparent via-blue-300/50 to-transparent transform -rotate-6" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-t from-blue-500/40 via-transparent to-transparent transform rotate-45" />
          
          {/* Electric Glow Effects */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* MASSIVE SHARPENED BRANDING */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <LightningLogo className="w-24 h-24 text-blue-400 relative z-10" />
                <div className="absolute inset-0 bg-blue-400/40 blur-2xl scale-150 animate-pulse" />
                <div className="absolute -inset-2 bg-blue-500/20 blur-xl scale-125" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-feel-primary tracking-wider font-title">FEELSHARPER</h1>
                <div className="flex items-center gap-2 mt-1">
                  <LightningLogo className="w-5 h-5 text-blue-400/80 animate-pulse" />
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent" />
                  <p className="text-lg font-bold text-gray-300 tracking-widest font-title">SHARPENED</p>
                  <div className="w-8 h-0.5 bg-gradient-to-l from-blue-400 to-transparent" />
                  <LightningLogo className="w-5 h-5 text-blue-400/80 animate-pulse transform scale-x-[-1]" />
                </div>
              </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-6 font-title">
              Just <span className="text-feel-primary">Talk.</span><br />
              <span className="relative">
                AI Does Everything
                <div className="absolute -right-8 -top-2">
                  <LightningLogo className="w-6 h-6 text-feel-primary/40 animate-pulse" />
                </div>
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              The first fitness tracker that speaks your language. 
              No forms, no menus, no friction.
            </p>

            <div className="flex gap-4 mb-12">
              <Link 
                href="/user"
                className="group px-8 py-4 bg-gradient-to-r from-feel-primary to-feel-secondary hover:from-feel-secondary hover:to-feel-primary text-white font-bold transition-all flex items-center gap-2 sharp-button"
              >
                ENTER APP
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/demo"
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-white font-bold rounded-lg transition-all"
              >
                Watch Demo
              </Link>
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

          {/* Right: AI Demo with Dramatic Sharp Edges */}
          <div className="relative">
            {/* Main demo container with extreme angular cuts */}
            <div 
              className="relative bg-gray-900/60 backdrop-blur-sm border border-blue-500/30 p-8 overflow-hidden" 
              style={{ clipPath: 'polygon(0 0, calc(100% - 60px) 0, 100% 30px, 100% calc(100% - 30px), calc(100% - 30px) 100%, 30px 100%, 0 calc(100% - 60px))' }}
            >
              {/* Sharp accent corner */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/40 to-transparent"
                style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 40%)' }}
              />
              
              {/* AI Status with sharp indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div 
                    className="w-4 h-4 bg-green-400 animate-pulse"
                    style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
                  />
                  <div className="absolute inset-0 bg-green-400/30 blur-sm animate-pulse" />
                </div>
                <span className="text-sm text-gray-300 font-semibold tracking-wide">PROCESSING VOICE...</span>
              </div>

              {/* Voice input with lightning accent */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <Mic className="w-6 h-6 text-blue-400 mt-1" />
                  <LightningLogo className="w-3 h-3 text-blue-400/60 absolute -top-1 -right-1" />
                </div>
                <div className="flex-1">
                  <p className="text-lg text-white mb-2 font-medium">
                    "{typingText}<span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse ml-1" />
                  </p>
                </div>
              </div>

              {/* AI Response with sharp container */}
              <div 
                className="bg-green-500/10 border border-green-500/30 p-4 relative"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <LightningLogo className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">PARSED & LOGGED</span>
                </div>
                <p className="text-green-300 text-sm">
                  Tennis session • 90 min • Cardio zone • Skill practice
                </p>
                <div className="text-xs text-green-400/70 mt-1">
                  Calories, duration, and performance automatically tracked
                </div>
              </div>
            </div>
            
            {/* Floating sharp elements */}
            <div 
              className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500/20 blur-sm"
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            />
            <div 
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400/30 blur-sm"
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section with Lightning */}
      <section className="py-24 px-6 relative">
        {/* Lightning Strike Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 opacity-[0.02]">
            <LightningLogo className="w-96 h-96 text-blue-400 transform rotate-12" />
          </div>
          <div className="absolute bottom-0 left-1/3 opacity-[0.02]">
            <LightningLogo className="w-64 h-64 text-blue-500 transform -rotate-45" />
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <LightningLogo className="w-12 h-12 text-feel-primary" />
              <h3 className="text-5xl font-black tracking-tight font-title">
                LIGHTNING-FAST <span className="text-feel-primary">TRACKING</span>
              </h3>
              <LightningLogo className="w-12 h-12 text-feel-primary transform scale-x-[-1]" />
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "Speak Naturally", desc: "Just talk like you would to a friend" },
              { icon: Zap, title: "AI Processes", desc: "95% accuracy, zero manual input" },
              { icon: TrendingUp, title: "Track Progress", desc: "Insights that actually help you improve" }
            ].map((feature, i) => (
              <div key={i} className="relative group">
                <div className="bg-gray-900/60 border border-blue-500/20 hover:border-blue-400/60 p-8 transition-all overflow-hidden"
                     style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))' }}>
                  
                  {/* Lightning accent in corner */}
                  <div className="absolute top-0 right-0">
                    <LightningLogo className="w-8 h-8 text-blue-500/20 transform rotate-12" />
                  </div>
                  
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 relative overflow-hidden"
                       style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
                    <feature.icon className="w-7 h-7 text-white relative z-10" />
                    <LightningLogo className="w-3 h-3 text-blue-300/60 absolute top-1 right-1" />
                  </div>
                  
                  <h4 className="text-2xl font-black mb-3 text-blue-400">{feature.title}</h4>
                  <p className="text-gray-300 font-medium">{feature.desc}</p>
                  
                  {/* Step number with lightning */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-1">
                    <span className="text-5xl font-black text-blue-500/30">{i + 1}</span>
                    <LightningLogo className="w-6 h-6 text-blue-500/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-24 px-6 bg-gray-900/20">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-16 font-russo">
            Old Way vs <span className="text-blue-400">FeelSharper Way</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-900/20 border border-red-900/30 p-8"
                 style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
              <h4 className="text-2xl font-bold text-red-400 mb-6">❌ Traditional Apps</h4>
              <ul className="space-y-3 text-gray-300">
                <li>• Search through 1000+ exercises</li>
                <li>• Fill 10+ fields per workout</li>
                <li>• 5 minutes to log anything</li>
                <li>• Forget half your workouts</li>
              </ul>
            </div>

            <div className="bg-green-900/20 border border-green-900/30 p-8"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
              <h4 className="text-2xl font-bold text-green-400 mb-6">✓ FeelSharper</h4>
              <ul className="space-y-3 text-gray-300">
                <li>• Just speak naturally</li>
                <li>• AI extracts everything</li>
                <li>• 30 seconds total</li>
                <li>• Never miss a session</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sharp Angular CTA - Sharpened Brand */}
      <section className="py-24 px-6 relative">
        {/* Background angular elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-600/5"
            style={{ clipPath: 'polygon(0 0, 80% 0, 100% 100%, 20% 100%)' }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div 
            className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-blue-500/30 p-12 overflow-hidden"
            style={{ clipPath: 'polygon(60px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 60px) 100%, 0 100%, 0 30px)' }}
          >
            {/* Sharp corner accents */}
            <div 
              className="absolute top-0 left-0 w-20 h-20 bg-blue-500/20"
              style={{ clipPath: 'polygon(0 0, 70% 0, 0 70%)' }}
            />
            <div 
              className="absolute bottom-0 right-0 w-16 h-16 bg-blue-400/20"
              style={{ clipPath: 'polygon(30% 100%, 100% 100%, 100% 30%)' }}
            />
            
            {/* Logo with glow effect */}
            <div className="relative inline-block mb-6">
              <LightningLogo className="w-20 h-20 text-blue-400 relative z-10" />
              <div className="absolute inset-0 bg-blue-400/30 blur-xl scale-150" />
            </div>
            
            <h3 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight font-russo">
              <span className="block relative">
                FEEL THE
                <LightningLogo className="w-8 h-8 text-blue-400/30 absolute -left-12 top-2 animate-pulse" />
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 relative">
                ⚡ SHARPENED ⚡
              </span>
              <span className="block relative">
                DIFFERENCE
                <LightningLogo className="w-8 h-8 text-blue-400/30 absolute -right-12 top-2 animate-pulse transform scale-x-[-1]" />
              </span>
            </h3>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Built by athletes, for athletes. No compromises, no friction.
              <br />Just the most advanced fitness AI ever created.
            </p>
            
            <Link 
              href="/sign-up"
              className="relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xl transition-all overflow-hidden group"
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                START NOW
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <div className="mt-8 text-sm text-gray-400 space-y-1">
              <div>Free forever • No credit card • Real AI</div>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <LightningLogo className="w-3 h-3" />
                <span className="font-semibold">Powered by Sharpened</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARPENED FOOTER */}
      <footer className="border-t border-blue-500/30 bg-gray-900/30 py-12 px-6 relative">
        {/* Lightning strike border */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-blue-400/80 to-blue-500/60"
          style={{ clipPath: 'polygon(0 0, 25% 100%, 50% 0, 75% 100%, 100% 0, 100% 100%, 0 100%)' }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <LightningLogo className="w-12 h-12 text-blue-400 relative z-10" />
                <div className="absolute -inset-1 bg-blue-400/20 blur-lg animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-400 tracking-wider">SHARPENED</span>
                  <LightningLogo className="w-4 h-4 text-blue-400/80" />
                </div>
                <div className="text-gray-300 font-semibold">FeelSharper • StudySharper • WorkSharper</div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-gray-400 text-sm mb-1">
                © 2024 Sharpened Technologies. All rights reserved.
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 text-blue-400/80">
                <LightningLogo className="w-3 h-3" />
                <span className="text-xs font-bold tracking-widest">CUTTING-EDGE AI</span>
                <LightningLogo className="w-3 h-3 transform scale-x-[-1]" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SharpenedLanding;