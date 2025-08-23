'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ArrowUpRight, Sparkles, Activity, Target, TrendingUp } from 'lucide-react';

const FixedBeautifulLanding = () => {
  const [activeMetric, setActiveMetric] = useState(0);

  const metrics = [
    { value: '47→1', label: 'TAPS ELIMINATED', color: '#0EA5E9' },
    { value: '2.1s', label: 'RESPONSE TIME', color: '#06B6D4' },
    { value: '95%', label: 'ACCURACY', color: '#0284C7' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: '#0F172A'
    }}>
      
      {/* Beautiful gradient background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.5,
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-200px',
          right: '-200px',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
          filter: 'blur(100px)'
        }} />
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 48px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(14, 165, 233, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)'
          }}>
            <Zap size={20} color="white" strokeWidth={3} />
          </div>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            FEELSHARPER
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link href="/sign-in" style={{ 
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Sign In
          </Link>
          <Link href="/sign-up" style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '700',
            borderRadius: '100px',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)'
          }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 48px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '80px',
          alignItems: 'center'
        }}>
          
          {/* Left - Content */}
          <div>
            <h1 style={{
              fontSize: '72px',
              fontWeight: '900',
              lineHeight: '1',
              letterSpacing: '-2px',
              marginBottom: '32px'
            }}>
              <span style={{ display: 'block' }}>TRAIN</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SMARTER
              </span>
            </h1>
            
            <p style={{
              fontSize: '22px',
              color: '#64748B',
              lineHeight: '1.6',
              marginBottom: '48px',
              maxWidth: '500px'
            }}>
              The only fitness app that understands natural language. 
              Just talk. AI does the rest.
            </p>

            {/* Demo Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '40px',
              boxShadow: '0 20px 60px rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.1)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700',
                  color: '#94A3B8',
                  letterSpacing: '1.5px',
                  marginBottom: '12px'
                }}>
                  YOU SAY
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#1E293B'
                }}>
                  "Just crushed leg day, feeling strong"
                </div>
              </div>
              
              <div style={{
                borderTop: '2px solid #0EA5E9',
                paddingTop: '24px'
              }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700',
                  color: '#0EA5E9',
                  letterSpacing: '1.5px',
                  marginBottom: '12px'
                }}>
                  AI RESPONDS
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#1E293B'
                }}>
                  Logged: Leg workout. Volume up 12%. Recovery: 72 hours.
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link href="/sign-up" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '100px',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)'
              }}>
                Start Training Free
                <ChevronRight size={20} />
              </Link>
              
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                No credit card • 14-day trial
              </span>
            </div>
          </div>

          {/* Right - Metrics */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'relative',
              width: '400px',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Background circle */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(14, 165, 233, 0.05)',
                border: '2px solid rgba(14, 165, 233, 0.1)'
              }} />
              
              {/* Metric display */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '120px',
                  fontWeight: '900',
                  lineHeight: '1',
                  background: `linear-gradient(135deg, ${metrics[activeMetric].color} 0%, #06B6D4 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '16px'
                }}>
                  {metrics[activeMetric].value}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  color: '#94A3B8'
                }}>
                  {metrics[activeMetric].label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '120px 48px',
        background: 'rgba(14, 165, 233, 0.02)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '900',
              letterSpacing: '-2px',
              marginBottom: '24px'
            }}>
              BUILT FOR <span style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>EXCELLENCE</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                icon: Activity,
                title: 'VOICE FIRST',
                metric: '2 SEC',
                description: 'Speak naturally. Get instant feedback.'
              },
              {
                icon: Target,
                title: 'AI PRECISION',
                metric: '95%',
                description: 'Understands context. Learns your patterns.'
              },
              {
                icon: TrendingUp,
                title: 'REAL RESULTS',
                metric: '47→1',
                description: 'From complex tracking to simple conversation.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 10px 40px rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.08)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '32px'
                }}>
                  <feature.icon size={28} color="white" />
                </div>
                
                <div style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '24px'
                }}>
                  {feature.metric}
                </div>
                
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  fontSize: '16px',
                  color: '#64748B',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{
        padding: '120px 48px',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Sparkles size={48} style={{ marginBottom: '32px' }} />
          
          <div style={{
            fontSize: '36px',
            fontWeight: '300',
            lineHeight: '1.5',
            marginBottom: '48px',
            fontStyle: 'italic'
          }}>
            "I just talk to it after every workout. 
            It knows my goals, tracks my progress, 
            and pushes me exactly when I need it."
          </div>
          
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>SARAH CHEN</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>MARATHON RUNNER • BOSTON QUALIFIER</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '120px 48px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '64px',
          fontWeight: '900',
          letterSpacing: '-2px',
          marginBottom: '48px'
        }}>
          READY TO <span style={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>LEVEL UP?</span>
        </h2>
        
        <Link href="/sign-up" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px 56px',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
          color: 'white',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: '700',
          borderRadius: '100px',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.4)'
        }}>
          START YOUR FREE TRIAL
          <ArrowUpRight size={24} />
        </Link>
        
        <div style={{
          marginTop: '32px',
          fontSize: '16px',
          color: '#94A3B8'
        }}>
          10,000+ athletes • 14 days free • Cancel anytime
        </div>
      </section>
    </div>
  );
};

export default FixedBeautifulLanding;