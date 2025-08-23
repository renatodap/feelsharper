'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mic, Sparkles, TrendingUp, ChevronRight, Star,
  ArrowRight, Check, Activity, Brain, Target, Clock
} from 'lucide-react';
import '@/app/brand.css';

const BrandedLanding = () => {
  const [currentExample, setCurrentExample] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showAiResponse, setShowAiResponse] = useState(false);
  
  // Natural conversation examples
  const examples = [
    { 
      user: "I ran 5k this morning", 
      ai: "Great job! That's 12% faster than your average. Your fitness is improving." 
    },
    { 
      user: "Bench pressed 225 for 8 reps", 
      ai: "New personal record! You've increased strength by 15% this month." 
    },
    { 
      user: "Feeling tired today", 
      ai: "Your recovery score suggests a light workout or rest day would be optimal." 
    },
    { 
      user: "What should I eat after my workout?", 
      ai: "Based on your session, aim for 35g protein within 30 minutes. Try chicken and rice." 
    }
  ];

  // Typing animation effect
  useEffect(() => {
    const example = examples[currentExample];
    let charIndex = 0;
    setDisplayText('');
    setShowAiResponse(false);

    const typeInterval = setInterval(() => {
      if (charIndex <= example.user.length) {
        setDisplayText(example.user.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowAiResponse(true);
          setTimeout(() => {
            setCurrentExample((prev) => (prev + 1) % examples.length);
          }, 3000);
        }, 500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentExample]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--black-primary)' }}>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass" style={{ 
        borderBottom: '1px solid var(--black-border)',
        padding: 'var(--space-4) 0'
      }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>F</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700' }}>FeelSharper</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section" style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Hero Content */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
              <h1 style={{ 
                fontSize: 'var(--text-hero)', 
                fontWeight: '900',
                lineHeight: '1',
                marginBottom: 'var(--space-6)'
              }}>
                Track fitness by
                <span className="text-gradient"> talking</span>
              </h1>
              
              <p style={{ 
                fontSize: 'var(--text-lg)', 
                color: 'var(--gray-400)',
                maxWidth: '600px',
                margin: '0 auto var(--space-8)'
              }}>
                The first fitness app that actually understands you. 
                No forms, no searching, just natural conversation.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/sign-up" className="btn btn-primary" style={{ 
                  fontSize: '18px', 
                  padding: 'var(--space-4) var(--space-8)',
                  gap: 'var(--space-3)'
                }}>
                  Start Free Trial
                  <ArrowRight size={20} />
                </Link>
                <button className="btn btn-secondary" style={{ 
                  fontSize: '18px', 
                  padding: 'var(--space-4) var(--space-8)',
                  gap: 'var(--space-3)'
                }}>
                  <Mic size={20} />
                  Try Voice Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-6)', 
                justifyContent: 'center',
                marginTop: 'var(--space-6)',
                fontSize: 'var(--text-sm)',
                color: 'var(--gray-500)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  14-day free trial
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  No credit card
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Live Demo */}
            <div className="card glow-hover" style={{ 
              maxWidth: '800px', 
              margin: '0 auto',
              background: 'var(--black-card)',
              padding: 'var(--space-8)'
            }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                    AI Coach is listening...
                  </span>
                </div>

                {/* User Input */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <Mic size={20} style={{ color: 'var(--blue-primary)', marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: 'var(--text-lg)', 
                        color: 'var(--white)',
                        minHeight: '28px'
                      }}>
                        "{displayText}
                        <span style={{
                          display: 'inline-block',
                          width: '2px',
                          height: '20px',
                          background: 'var(--blue-primary)',
                          marginLeft: '2px',
                          animation: 'pulse 1s infinite',
                          verticalAlign: 'text-bottom'
                        }} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {showAiResponse && (
                  <div className="animate-slide-up" style={{ 
                    marginLeft: 'var(--space-8)',
                    padding: 'var(--space-4)',
                    background: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                      <Sparkles size={20} style={{ color: 'var(--blue-light)', marginTop: '2px' }} />
                      <p style={{ color: 'var(--gray-100)' }}>
                        {examples[currentExample].ai}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: 'var(--black-elevated)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ 
              fontSize: 'var(--text-display)', 
              fontWeight: '700',
              marginBottom: 'var(--space-4)'
            }}>
              Why athletes love <span className="text-gradient">FeelSharper</span>
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--gray-400)' }}>
              Built for how you actually want to track fitness
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              {
                icon: Mic,
                title: 'Just speak naturally',
                description: 'Say "ran 5k" or "bench pressed 225" and we handle the rest',
                stat: '2 seconds'
              },
              {
                icon: Brain,
                title: 'AI that understands context',
                description: 'Knows your routines, preferences, and training patterns',
                stat: '95% accuracy'
              },
              {
                icon: TrendingUp,
                title: 'Insights that matter',
                description: 'Personalized recommendations based on your actual progress',
                stat: '10x faster'
              },
              {
                icon: Activity,
                title: 'Complete fitness tracking',
                description: 'Workouts, nutrition, recovery, and mood in one place',
                stat: 'All-in-one'
              }
            ].map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto var(--space-4)',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <feature.icon size={28} color="white" />
                </div>
                <h3 style={{ fontSize: 'var(--text-h4)', marginBottom: 'var(--space-2)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--gray-400)', marginBottom: 'var(--space-4)' }}>
                  {feature.description}
                </p>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--blue-primary)',
                  fontWeight: '600'
                }}>
                  {feature.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'var(--space-1)',
              marginBottom: 'var(--space-4)'
            }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill="var(--warning)" color="var(--warning)" />
              ))}
            </div>
            
            <blockquote style={{ 
              fontSize: 'var(--text-h3)', 
              fontWeight: '300',
              lineHeight: '1.4',
              marginBottom: 'var(--space-6)',
              color: 'var(--gray-100)'
            }}>
              "Finally, a fitness app that gets me. I just talk to it like a friend 
              and it handles everything. Game changer."
            </blockquote>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)'
              }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>Sarah Mitchell</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                  Marathon Runner • Boston
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ background: 'var(--black-elevated)' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-8)',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            {[
              { value: '10,000+', label: 'Active Athletes' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '2 sec', label: 'Response Time' },
              { value: '4.9/5', label: 'App Rating' }
            ].map((stat, index) => (
              <div key={index}>
                <div style={{ 
                  fontSize: 'var(--text-display)', 
                  fontWeight: '900',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 'var(--space-2)'
                }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ 
            textAlign: 'center',
            padding: 'var(--space-16)',
            background: 'linear-gradient(135deg, var(--black-card) 0%, var(--black-elevated) 100%)',
            border: '1px solid var(--blue-primary)',
            boxShadow: 'var(--shadow-glow-sm)'
          }}>
            <h2 style={{ 
              fontSize: 'var(--text-display)', 
              marginBottom: 'var(--space-4)'
            }}>
              Start tracking the <span className="text-gradient">smart way</span>
            </h2>
            <p style={{ 
              fontSize: 'var(--text-lg)', 
              color: 'var(--gray-400)',
              marginBottom: 'var(--space-8)'
            }}>
              Join thousands of athletes already using AI to optimize their fitness
            </p>
            <Link href="/sign-up" className="btn btn-primary" style={{ 
              fontSize: '20px', 
              padding: 'var(--space-5) var(--space-10)'
            }}>
              Start Your Free Trial
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default BrandedLanding;