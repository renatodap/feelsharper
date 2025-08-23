'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ArrowUpRight, Activity, Target, TrendingUp } from 'lucide-react';

const LightningLanding = () => {
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
      background: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Lightning bolt accent - signature element */}
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '-5%',
        width: '300px',
        height: '600px',
        opacity: 0.1,
        transform: 'rotate(15deg)',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <svg viewBox="0 0 100 200" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <path
            d="M 20 0 L 10 80 L 40 80 L 30 200 L 90 70 L 60 70 L 80 0 Z"
            fill="url(#lightning-gradient)"
          />
        </svg>
      </div>

      {/* Electric grid pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* Navigation with sharp angles */}
      <nav style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 48px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(14, 165, 233, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Lightning bolt logo */}
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            clipPath: 'polygon(20% 0%, 0% 40%, 30% 40%, 10% 100%, 70% 30%, 40% 30%, 80% 0%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} color="white" strokeWidth={3} style={{ visibility: 'hidden' }} />
          </div>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: '800',
            letterSpacing: '-0.5px',
            color: '#FFFFFF'
          }}>
            FEELSHARPER
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link href="/sign-in" style={{ 
            color: '#94A3B8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'color 0.3s'
          }}>
            Sign In
          </Link>
          <Link href="/sign-up" style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '700',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            display: 'inline-block',
            transition: 'transform 0.3s'
          }}>
            START FREE
          </Link>
        </div>
      </nav>

      {/* Hero Section with angular layout */}
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
              fontSize: '80px',
              fontWeight: '900',
              lineHeight: '0.9',
              letterSpacing: '-3px',
              marginBottom: '32px'
            }}>
              <span style={{ display: 'block', color: '#FFFFFF' }}>TRAIN</span>
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative'
              }}>
                SHARPER
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-60px',
                  transform: 'translateY(-50%) rotate(-15deg)',
                  width: '40px',
                  height: '40px'
                }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <path
                      d="M 30 0 L 20 40 L 40 40 L 30 100 L 80 35 L 55 35 L 70 0 Z"
                      fill="#0EA5E9"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </span>
            </h1>
            
            <p style={{
              fontSize: '22px',
              color: '#94A3B8',
              lineHeight: '1.6',
              marginBottom: '48px',
              maxWidth: '500px'
            }}>
              The only fitness app that understands natural language. 
              Just talk. AI does the rest.
            </p>

            {/* Demo Card with sharp angles */}
            <div style={{
              background: '#0A0A0A',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
              padding: '32px',
              marginBottom: '40px',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              position: 'relative'
            }}>
              {/* Lightning accent in corner */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '20px',
                height: '30px',
                opacity: 0.3
              }}>
                <svg viewBox="0 0 50 100" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M 15 0 L 10 40 L 20 40 L 15 100 L 40 30 L 25 30 L 35 0 Z"
                    fill="#0EA5E9"
                  />
                </svg>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700',
                  color: '#0EA5E9',
                  letterSpacing: '1.5px',
                  marginBottom: '12px'
                }}>
                  YOU SAY
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#FFFFFF'
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
                  color: '#06B6D4',
                  letterSpacing: '1.5px',
                  marginBottom: '12px'
                }}>
                  AI RESPONDS
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#FFFFFF'
                }}>
                  Logged: Leg workout. Volume up 12%. Recovery: 72 hours.
                </div>
              </div>
            </div>

            {/* CTAs with angular design */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link href="/sign-up" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '700',
                clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 100%, 15px 100%)',
                transition: 'transform 0.3s',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)'
              }}>
                START TRAINING FREE
                <ChevronRight size={20} />
              </Link>
              
              <span style={{ fontSize: '14px', color: '#64748B' }}>
                No credit card • 14-day trial
              </span>
            </div>
          </div>

          {/* Right - Animated metrics with lightning */}
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
              {/* Angular background shape */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(14, 165, 233, 0.05)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                border: '2px solid rgba(14, 165, 233, 0.2)',
                animation: 'rotate 20s linear infinite'
              }} />
              
              {/* Metric display */}
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '120px',
                  fontWeight: '900',
                  lineHeight: '1',
                  background: `linear-gradient(135deg, ${metrics[activeMetric].color} 0%, #06B6D4 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '16px',
                  transition: 'all 0.5s ease'
                }}>
                  {metrics[activeMetric].value}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  color: '#64748B'
                }}>
                  {metrics[activeMetric].label}
                </div>
              </div>

              {/* Lightning bolts around metrics */}
              {[0, 120, 240].map((rotation, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${rotation}deg) translateX(180px)`,
                    width: '20px',
                    height: '30px'
                  }}
                >
                  <svg viewBox="0 0 50 100" style={{ width: '100%', height: '100%' }}>
                    <path
                      d="M 15 0 L 10 40 L 20 40 L 15 100 L 40 30 L 25 30 L 35 0 Z"
                      fill={metrics[i].color}
                      opacity="0.3"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features with angular cards */}
      <section style={{
        padding: '120px 48px',
        background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 100%)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '900',
              letterSpacing: '-2px',
              marginBottom: '24px',
              color: '#FFFFFF'
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
                description: 'Speak naturally. Get instant feedback.',
                clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
              },
              {
                icon: Target,
                title: 'AI PRECISION',
                metric: '95%',
                description: 'Understands context. Learns your patterns.',
                clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)'
              },
              {
                icon: TrendingUp,
                title: 'REAL RESULTS',
                metric: '47→1',
                description: 'From complex tracking to simple conversation.',
                clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: '#0A0A0A',
                clipPath: feature.clipPath,
                padding: '48px',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                position: 'relative',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)';
              }}
              >
                {/* Small lightning accent */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '15px',
                  height: '25px',
                  opacity: 0.2
                }}>
                  <svg viewBox="0 0 50 100" style={{ width: '100%', height: '100%' }}>
                    <path
                      d="M 15 0 L 10 40 L 20 40 L 15 100 L 40 30 L 25 30 L 35 0 Z"
                      fill="#0EA5E9"
                    />
                  </svg>
                </div>

                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
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
                  marginBottom: '12px',
                  color: '#FFFFFF'
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

      {/* Testimonial with angular design */}
      <section style={{
        padding: '120px 48px',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        clipPath: 'polygon(0 5%, 100% 0, 100% 95%, 0 100%)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Lightning icon */}
          <div style={{ display: 'inline-block', marginBottom: '32px' }}>
            <Zap size={48} />
          </div>
          
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
        textAlign: 'center',
        background: '#000000'
      }}>
        <h2 style={{
          fontSize: '72px',
          fontWeight: '900',
          letterSpacing: '-3px',
          marginBottom: '48px',
          color: '#FFFFFF'
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
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.4)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          START YOUR FREE TRIAL
          <ArrowUpRight size={24} />
        </Link>
        
        <div style={{
          marginTop: '32px',
          fontSize: '16px',
          color: '#64748B'
        }}>
          10,000+ athletes • 14 days free • Cancel anytime
        </div>
      </section>

      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LightningLanding;