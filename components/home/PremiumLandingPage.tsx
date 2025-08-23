'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Mic, Sparkles, MessageSquare, TrendingUp, Zap,
  ChevronRight, Check, Star, ArrowRight, ChevronDown,
  Activity, Brain, Trophy, Users, Target, Flame,
  BarChart3, Clock, Shield, Smartphone
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';
import GlassCard from '@/components/ui/GlassCard';
import SharpenedLogo from '@/components/ui/SharpenedLogo';

const PremiumLandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // AI typing examples
  const aiExamples = [
    { text: "ran 5k this morning, felt amazing", response: "✓ 5km run logged • Great pace! You're 15% faster than last week" },
    { text: "bench pressed 225 for 3 sets of 8", response: "✓ New PR! Progressive overload detected • Rest 48hrs for optimal gains" },
    { text: "played tennis 2 hours, won 6-4 6-3", response: "✓ Match logged • Win rate up 20% • Backhand improving significantly" },
    { text: "weight 175, body feels strong", response: "✓ Weight trending down • On track for your goal • -2 lbs this week" },
    { text: "ate grilled salmon with quinoa", response: "✓ 42g protein logged • Perfect post-workout meal • Omega-3 boost!" },
  ];

  const [currentExample, setCurrentExample] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Typing animation
  useEffect(() => {
    const example = aiExamples[currentExample];
    
    if (typingText.length < example.text.length) {
      const timer = setTimeout(() => {
        setTypingText(example.text.slice(0, typingText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else if (!showResponse) {
      setTimeout(() => setShowResponse(true), 500);
    } else {
      setTimeout(() => {
        setTypingText('');
        setShowResponse(false);
        setCurrentExample((prev) => (prev + 1) % aiExamples.length);
      }, 3000);
    }
  }, [typingText, showResponse, currentExample]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)',
            bottom: '-10%',
            right: '-10%',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px)`,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Floating Logo */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-50">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>
              <SharpenedLogo variant="feel" size="xl" animated glow />
            </div>
          </div>
          
          {/* Hero Text */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-center mb-8 leading-tight">
            <span className="block animate-slide-up-fade">Just Talk.</span>
            <span className="block text-gradient animate-slide-up-fade animation-delay-200">
              AI Does The Rest.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 text-center mb-12 max-w-3xl mx-auto animate-slide-up-fade animation-delay-400">
            The first fitness app that speaks your language. 
            <span className="text-gradient font-bold"> Zero friction.</span> Maximum results.
          </p>

          {/* Live AI Demo - Glass morphism */}
          <div className="max-w-3xl mx-auto mb-12 animate-slide-up-fade animation-delay-600">
            <GlassCard variant="heavy" glow gradient>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <span className="text-sm text-gray-400">AI Coach is listening...</span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Mic className="w-8 h-8 text-blue-400" />
                  <div className="absolute inset-0 w-8 h-8 text-blue-400 blur-xl animate-glow" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-medium text-white mb-4">
                    "{typingText}
                    <span className="inline-block w-0.5 h-6 bg-blue-400 animate-pulse ml-1" />
                  </p>
                  
                  {showResponse && (
                    <div className="animate-slide-up-fade">
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl backdrop-blur-xl">
                        <p className="text-green-400 font-medium flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {aiExamples[currentExample].response}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up-fade animation-delay-800">
            <PremiumButton 
              variant="primary" 
              size="xl" 
              glow 
              shimmer 
              magnetic
              className="group"
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </PremiumButton>
            
            <PremiumButton 
              variant="secondary" 
              size="xl"
              className="group"
            >
              <Link href="/demo" className="flex items-center gap-2">
                Watch Demo
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </PremiumButton>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">2 sec response</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">95% accuracy</span>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <ChevronDown className="w-8 h-8 text-gray-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Grid with 3D cards */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-center mb-20">
            <span className="text-gradient">Revolutionary Features</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI That Understands',
                description: 'Natural language processing with 95% accuracy. Just speak like you would to a friend.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Flame,
                title: 'Habit Formation',
                description: 'Science-backed behavioral design that creates lasting change in 30 days.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: BarChart3,
                title: 'Real Insights',
                description: 'Pattern detection and predictive analytics that actually help you improve.',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group"
                onMouseEnter={() => setActiveFeature(index)}
                style={{
                  transform: `translateY(${scrollY * 0.1 * (index + 1)}px)`
                }}
              >
                <GlassCard 
                  variant="heavy" 
                  hover 
                  glow={activeFeature === index}
                  className="h-full"
                >
                  <div className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-6 flex items-center text-blue-400 font-medium">
                    Learn more
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-2 transition-transform" />
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-8">
                <span className="text-gradient">See It In Action</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Watch how FeelSharper transforms your fitness journey with AI-powered intelligence 
                that adapts to your unique needs and goals.
              </p>
              
              <div className="space-y-4">
                {[
                  'Voice-first logging in any language',
                  'Instant AI coaching feedback',
                  'Pattern detection across all activities',
                  'Predictive recommendations',
                  'Habit streak tracking'
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 animate-slide-up-fade"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <PremiumButton variant="gradient" size="lg" glow shimmer>
                  <Link href="/demo" className="flex items-center gap-2">
                    Watch Full Demo
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </PremiumButton>
              </div>
            </div>
            
            <div className="relative">
              {/* Phone mockup with glass effect */}
              <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
                <div className="glass-heavy rounded-[3rem] p-4 border-8 border-gray-900">
                  <div className="bg-black rounded-[2rem] p-6 h-[600px] overflow-hidden">
                    {/* Mock app interface */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <SharpenedLogo variant="feel" size="md" />
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                      </div>
                      
                      <GlassCard variant="light">
                        <p className="text-sm text-gray-400 mb-2">You said:</p>
                        <p className="text-white">"Ran 5k this morning"</p>
                      </GlassCard>
                      
                      <GlassCard variant="color">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-blue-400 mt-1" />
                          <div>
                            <p className="text-sm text-blue-400 mb-1">AI Coach</p>
                            <p className="text-white text-sm">Great pace! You're getting faster. Your VO2 max is improving.</p>
                          </div>
                        </div>
                      </GlassCard>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <GlassCard variant="light" className="p-4">
                          <p className="text-xs text-gray-400 mb-1">Weekly Avg</p>
                          <p className="text-2xl font-bold text-gradient">24.5km</p>
                        </GlassCard>
                        <GlassCard variant="light" className="p-4">
                          <p className="text-xs text-gray-400 mb-1">Streak</p>
                          <p className="text-2xl font-bold text-gradient">12 days</p>
                        </GlassCard>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around phone */}
                <div className="absolute -top-10 -left-10 animate-float">
                  <GlassCard variant="light" className="p-3">
                    <Mic className="w-6 h-6 text-blue-400" />
                  </GlassCard>
                </div>
                <div className="absolute -bottom-10 -right-10 animate-float animation-delay-1000">
                  <GlassCard variant="light" className="p-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof with animated counters */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-20">
            <span className="text-gradient">Trusted by Athletes Worldwide</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { value: '10,000+', label: 'Active Users', icon: Users },
              { value: '95%', label: 'Accuracy Rate', icon: Target },
              { value: '2 sec', label: 'Response Time', icon: Clock },
              { value: '30 days', label: 'To Habit', icon: Flame }
            ].map((stat, index) => (
              <GlassCard key={index} variant="heavy" hover>
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
          
          {/* Testimonial carousel */}
          <div className="max-w-3xl mx-auto">
            <GlassCard variant="heavy" glow>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-xl text-gray-300 mb-6 italic">
                "FeelSharper completely changed how I track my fitness. 
                I just talk to it like a friend and it handles everything. 
                The AI coach feels like having a personal trainer 24/7."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-gray-400">Marathon Runner</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-gradient">Ready to Feel Sharper?</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Join thousands of athletes who've discovered the future of fitness tracking.
          </p>
          
          <div className="inline-block">
            <PremiumButton 
              variant="primary" 
              size="xl" 
              glow 
              shimmer 
              magnetic
              className="text-xl px-12 py-6"
            >
              <Link href="/sign-up" className="flex items-center gap-3">
                Start Your Free Trial
                <div className="flex items-center">
                  <ArrowRight className="w-6 h-6" />
                  <Zap className="w-6 h-6 -ml-3 text-yellow-400" />
                </div>
              </Link>
            </PremiumButton>
          </div>
          
          <p className="text-sm text-gray-400 mt-8">
            14-day free trial • No credit card required • Cancel anytime
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              iOS & Android
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              24/7 Support
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PremiumLandingPage;