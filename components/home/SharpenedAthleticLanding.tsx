'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ArrowUpRight, Activity, Trophy, Target, Flame, TrendingUp, Users, Star } from 'lucide-react';

const SharpenedAthleticLanding = () => {
  const [activeMetric, setActiveMetric] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const metrics = [
    { value: '47', unit: '→1', label: 'TAPS ELIMINATED' },
    { value: '2.1', unit: 'sec', label: 'RESPONSE TIME' },
    { value: '95', unit: '%', label: 'ACCURACY' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => setMessageVisible(true), 1000);
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-black text-white overflow-hidden relative" style={{
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="sharp-bg" />
          <div className="hex-pattern" />
          
          {/* Lightning Strikes */}
          <div className="lightning-strike" style={{ left: '20%', animationDelay: '0s' }} />
          <div className="lightning-strike" style={{ left: '50%', animationDelay: '1.5s' }} />
          <div className="lightning-strike" style={{ left: '80%', animationDelay: '3s' }} />
          
          {/* Floating Sharp Elements */}
          <div className="floating-sharp" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className="floating-sharp" style={{ top: '60%', right: '15%', animationDelay: '2s' }} />
          <div className="floating-sharp" style={{ bottom: '30%', left: '25%', animationDelay: '4s' }} />
          
          {/* Mouse Follow Light */}
          <div
            className="pointer-events-none fixed w-96 h-96 rounded-full"
            style={{
              background: `radial-gradient(circle at center, rgba(0, 212, 255, 0.15), transparent)`,
              transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
              transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        </div>

        {/* Sharp Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-[100] sharp-card" style={{
          padding: '20px 40px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative electric-border"
                 style={{
                   clipPath: 'polygon(0 0, 90% 0, 100% 30%, 85% 100%, 0 100%, 10% 30%)'
                 }}>
              <Zap size={20} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tight electric-text">
              SHARPENED
            </span>
          </div>
          
          <div className="flex gap-8 items-center">
            <Link href="/sign-in" className="text-gray-300 hover:text-cyan-400 transition-colors font-semibold text-sm tracking-wide uppercase">
              SIGN IN
            </Link>
            <Link href="/sign-up">
              <button className="sharp-button px-6 py-3 text-sm">
                START FREE
              </button>
            </Link>
          </div>
        </nav>

        {/* Electric Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 z-10" style={{
          paddingTop: '80px'
        }}>
          <div className="max-w-7xl mx-auto text-center relative">
            {/* Scan Line Effect */}
            <div className="scan-line" />
            
            {/* Logo Animation */}
            <div className="mb-8" style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(-50px)',
              transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
            }}>
              <div className="inline-block relative">
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />
                <h1 
                  className="relative text-8xl md:text-9xl font-black tracking-tighter glitch"
                  data-text="SHARPENED"
                  style={{
                    marginBottom: '24px'
                  }}
                >
                  SHARP<span className="electric-text">ENED</span>
                </h1>
                <div className="text-2xl font-medium text-gray-300 mb-6">
                  Featuring <span className="text-cyan-400 font-bold">Feel Sharper</span> • Coming Soon: <span className="text-purple-400 font-bold">Study Sharper</span>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl mb-12 font-light tracking-wide" style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              transitionDelay: '0.3s'
            }}>
              <span className="text-cyan-400">PERFORMANCE</span> • 
              <span className="text-purple-400"> PRODUCTIVITY</span> • 
              <span className="text-pink-400"> POTENTIAL</span>
            </p>

            {/* Interactive Demo Card */}
            <div className="sharp-card electric-border p-8 mb-12 max-w-2xl mx-auto" style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              transitionDelay: '0.5s'
            }}>
              <div className="mb-6">
                <div className="text-xs font-bold text-gray-400 tracking-widest mb-2 uppercase">
                  YOU SAY
                </div>
                <div className="text-xl text-cyan-400 font-medium italic">
                  "Just crushed leg day" → Feel Sharper
                </div>
              </div>
              
              <div className="border-t-2 border-gradient-to-r from-purple-500 to-pink-500 pt-6">
                <div className="energy-bar mb-4" />
                <div className="text-xs font-bold text-purple-400 tracking-widest mb-2 uppercase">
                  AI RESPONDS
                </div>
                <div className="text-xl text-white font-medium">
                  Logged: Leg workout. Volume up 12% from last week. 
                  Recovery window: 72 hours.
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16" style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              transitionDelay: '0.7s'
            }}>
              <Link href="/sign-up">
                <button className="sharp-button text-lg px-8 py-4 min-w-[200px] relative group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    START NOW
                    <Zap className="w-5 h-5" />
                  </span>
                  <div className="energy-bar absolute bottom-0 left-0 right-0" />
                </button>
              </Link>
              
              <Link href="#demo">
                <button className="relative px-8 py-4 border-2 border-cyan-400 text-cyan-400 font-bold uppercase tracking-wider overflow-hidden group sharp-transition">
                  <span className="relative z-10 flex items-center gap-2">
                    WATCH DEMO
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8" style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              transitionDelay: '0.9s'
            }}>
              {[
                { value: '10K+', label: 'Athletes', icon: Users },
                { value: '98%', label: 'Success Rate', icon: Trophy },
                { value: '500K+', label: 'Workouts', icon: Activity },
                { value: '4.9★', label: 'Rating', icon: Star },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="sharp-card p-6 electric-border"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-cyan-400 neon-glow" />
                  <div className="text-3xl font-black electric-text">{stat.value}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 px-4 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl md:text-7xl font-black mb-6">
                <span className="glitch" data-text="CUTTING EDGE">CUTTING EDGE</span>
              </h2>
              <p className="text-xl text-gray-400">Performance technology that gives you the edge</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Track workouts in seconds with our intuitive voice input',
                  gradient: 'from-blue-500 to-cyan-400',
                },
                {
                  icon: Target,
                  title: 'Precision Coaching',
                  description: 'AI analyzes your form and provides instant feedback',
                  gradient: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Flame,
                  title: 'Burn Brighter',
                  description: 'Personalized programs that adapt to your progress',
                  gradient: 'from-orange-500 to-red-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Sharp Progress',
                  description: 'Visual analytics that show your improvement trajectory',
                  gradient: 'from-green-500 to-emerald-500',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group"
                  style={{
                    opacity: 0,
                    transform: 'translateY(50px)',
                    animation: `fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s forwards`
                  }}
                >
                  <div className="sharp-card p-8 h-full hover:transform hover:translateY(-10px) transition-all duration-300">
                    <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                    <div className="energy-bar mt-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-4 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="sharp-card p-16 electric-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <h2 className="text-5xl md:text-6xl font-black mb-6 relative z-10">
                READY TO <span className="electric-text">LEVEL UP?</span>
              </h2>
              <p className="text-xl mb-10 text-gray-300 relative z-10">
                Join thousands of athletes reaching their peak performance
              </p>
              <Link href="/sign-up">
                <button className="sharp-button text-xl px-12 py-5 relative z-10">
                  <span className="flex items-center gap-3">
                    UNLEASH YOUR POTENTIAL
                    <Zap className="w-6 h-6" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default SharpenedAthleticLanding;