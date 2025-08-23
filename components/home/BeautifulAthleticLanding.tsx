'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ArrowUpRight, Sparkles, Activity, Target, TrendingUp } from 'lucide-react';

const BeautifulAthleticLanding = () => {
  const [activeMetric, setActiveMetric] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const metrics = [
    { value: '47', unit: '→1', label: 'TAPS ELIMINATED', color: '#0EA5E9' },
    { value: '2.1', unit: 'sec', label: 'RESPONSE TIME', color: '#06B6D4' },
    { value: '95', unit: '%', label: 'ACCURACY', color: '#0284C7' },
  ];

  // Beautiful gradient animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let time = 0;
    
    const animate = () => {
      time += 0.001;
      
      // Create beautiful gradient mesh
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(14, 165, 233, ${0.03 + Math.sin(time) * 0.02})`);
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.02 + Math.cos(time) * 0.01})`);
      gradient.addColorStop(1, `rgba(2, 132, 199, ${0.03 + Math.sin(time) * 0.02})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#0F172A',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Animated gradient canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.5
        }}
      />

      {/* Beautiful gradient orbs */}
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-200px',
        right: '-200px',
        filter: 'blur(80px)',
        animation: 'float 20s ease-in-out infinite',
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
      }} />
      
      <div style={{
        position: 'fixed',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-150px',
        left: '-150px',
        filter: 'blur(80px)',
        animation: 'float 25s ease-in-out infinite reverse',
        transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
      }} />

      {/* Premium navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 48px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(14, 165, 233, 0.1)',
        transition: 'all 0.3s ease',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            clipPath: 'polygon(0 0, 85% 0, 100% 25%, 90% 100%, 0 100%, 10% 25%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
          >
            <Zap size={20} color="white" strokeWidth={3} />
          </div>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: '800',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #0F172A 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FEELSHARPER
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <Link href="/features" style={{ 
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            transition: 'color 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0EA5E9'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Features
          </Link>
          <Link href="/pricing" style={{ 
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0EA5E9'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Pricing
          </Link>
          <Link href="/sign-in" style={{ 
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0EA5E9'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Sign In
          </Link>
          <Link href="/sign-up" style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.3px',
            borderRadius: '100px',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.3)';
          }}
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section - Absolutely stunning */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '100px',
        position: 'relative'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 48px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '100px',
          alignItems: 'center'
        }}>
          
          {/* Left - Beautiful typography */}
          <div style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: '0.2s'
          }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{
                fontSize: '80px',
                fontWeight: '900',
                lineHeight: '0.95',
                letterSpacing: '-3px',
                marginBottom: '32px'
              }}>
                <span style={{ display: 'block' }}>TRAIN</span>
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0284C7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative'
                }}>
                  SMARTER
                  <Sparkles 
                    size={32} 
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-40px',
                      color: '#0EA5E9',
                      animation: 'sparkle 2s ease-in-out infinite'
                    }}
                  />
                </span>
              </h1>
              
              <p style={{
                fontSize: '22px',
                color: '#64748B',
                lineHeight: '1.6',
                maxWidth: '500px',
                fontWeight: '400'
              }}>
                The only fitness app that understands natural language. 
                Just talk. AI does the rest.
              </p>
            </div>

            {/* Beautiful conversation demo */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '40px',
              boxShadow: '0 20px 60px rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }} />
              
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700',
                  color: '#94A3B8',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    animation: 'pulse 2s infinite'
                  }} />
                  YOU SAY
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#1E293B',
                  fontWeight: '500'
                }}>
                  "Just crushed leg day, feeling strong"
                </div>
              </div>
              
              <div style={{
                borderTop: '2px solid transparent',
                borderImage: 'linear-gradient(90deg, #0EA5E9, #06B6D4) 1',
                paddingTop: '24px'
              }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700',
                  color: '#0EA5E9',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={12} />
                  AI RESPONDS
                </div>
                <div style={{ 
                  fontSize: '20px',
                  color: '#1E293B',
                  fontWeight: '500',
                  lineHeight: '1.5'
                }}>
                  Logged: Leg workout. Volume up 12% from last week. 
                  Recovery window: 72 hours. Great progress!
                </div>
              </div>
            </div>

            {/* CTAs with beautiful styling */}
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
                letterSpacing: '0.3px',
                borderRadius: '100px',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(14, 165, 233, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.35)';
              }}
              >
                Start Training Free
                <ChevronRight size={20} />
              </Link>
              
              <Link href="/demo" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 36px',
                background: 'transparent',
                color: '#0EA5E9',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '0.3px',
                border: '2px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '100px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                e.currentTarget.style.background = 'transparent';
              }}
              >
                Watch Demo
                <Activity size={18} />
              </Link>
            </div>
            
            {/* Trust badges */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '32px',
              fontSize: '14px',
              color: '#94A3B8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                </div>
                No credit card
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                </div>
                14-day trial
              </div>
            </div>
          </div>

          {/* Right - Beautiful animated metrics */}
          <div style={{
            position: 'relative',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: '0.4s'
          }}>
            <div style={{
              position: 'relative',
              width: '450px',
              height: '450px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Beautiful gradient ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'conic-gradient(from 180deg, #0EA5E9, #06B6D4, #0284C7, #0EA5E9)',
                animation: 'rotate 20s linear infinite',
                opacity: 0.1
              }} />
              
              {/* Inner glow */}
              <div style={{
                position: 'absolute',
                inset: '40px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }} />
              
              {/* Metric display */}
              <div style={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                animation: 'float 6s ease-in-out infinite'
              }}>
                <div style={{
                  fontSize: '140px',
                  fontWeight: '900',
                  lineHeight: '1',
                  background: `linear-gradient(135deg, ${metrics[activeMetric].color} 0%, #06B6D4 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 4px 20px rgba(14, 165, 233, 0.3))',
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {metrics[activeMetric].value}
                  <span style={{ fontSize: '48px' }}>{metrics[activeMetric].unit}</span>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  color: '#94A3B8',
                  transition: 'all 0.8s ease'
                }}>
                  {metrics[activeMetric].label}
                </div>
              </div>

              {/* Orbiting elements */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: i % 2 === 0 ? '12px' : '8px',
                    height: i % 2 === 0 ? '12px' : '8px',
                    background: `linear-gradient(135deg, ${metrics[i % 3].color} 0%, #06B6D4 100%)`,
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 90}deg) translateX(200px)`,
                    animation: `orbit ${15 + i * 2}s linear infinite`,
                    boxShadow: `0 0 20px ${metrics[i % 3].color}`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Stunning cards */}
      <section style={{
        padding: '140px 48px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(14, 165, 233, 0.02) 100%)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease',
            transitionDelay: '0.6s'
          }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '900',
              letterSpacing: '-2px',
              marginBottom: '24px'
            }}>
              BUILT FOR{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                EXCELLENCE
              </span>
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#64748B',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Every feature designed to help you reach peak performance
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            {[
              {
                icon: Activity,
                title: 'VOICE FIRST',
                metric: '2 SEC',
                description: 'Speak naturally. Get instant feedback.',
                gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)'
              },
              {
                icon: Target,
                title: 'AI PRECISION',
                metric: '95%',
                description: 'Understands context. Learns your patterns.',
                gradient: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)'
              },
              {
                icon: TrendingUp,
                title: 'REAL RESULTS',
                metric: '47→1',
                description: 'From complex tracking to simple conversation.',
                gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
              }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '48px',
                  position: 'relative',
                  boxShadow: '0 10px 40px rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.08)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transitionDelay: `${0.8 + i * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(14, 165, 233, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(14, 165, 233, 0.08)';
                }}
              >
                {/* Gradient orb background */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: feature.gradient,
                  borderRadius: '50%',
                  opacity: 0.1,
                  filter: 'blur(60px)'
                }} />
                
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: feature.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '32px',
                  boxShadow: `0 8px 24px ${feature.gradient.match(/#[0-9A-F]{6}/gi)?.[0]}40`
                }}>
                  <feature.icon size={28} color="white" strokeWidth={2.5} />
                </div>
                
                <div style={{
                  fontSize: '72px',
                  fontWeight: '900',
                  background: feature.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '24px',
                  lineHeight: '1'
                }}>
                  {feature.metric}
                </div>
                
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  color: '#1E293B'
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

      {/* Stunning testimonial */}
      <section style={{
        padding: '140px 48px',
        background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px),
            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 70px)
          `,
          animation: 'slide 20s linear infinite'
        }} />
        
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <Sparkles size={48} style={{ marginBottom: '32px', opacity: 0.8 }} />
          
          <div style={{
            fontSize: '40px',
            fontWeight: '300',
            lineHeight: '1.5',
            marginBottom: '48px',
            fontStyle: 'italic',
            letterSpacing: '-0.5px'
          }}>
            "I just talk to it after every workout. 
            It knows my goals, tracks my progress, 
            and pushes me exactly when I need it."
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)'
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                SARAH CHEN
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9,
                letterSpacing: '0.5px'
              }}>
                MARATHON RUNNER • BOSTON QUALIFIER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beautiful final CTA */}
      <section style={{
        padding: '140px 48px',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <h2 style={{
          fontSize: '72px',
          fontWeight: '900',
          letterSpacing: '-3px',
          marginBottom: '24px'
        }}>
          READY TO{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0284C7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            LEVEL UP?
          </span>
        </h2>
        
        <p style={{
          fontSize: '22px',
          color: '#64748B',
          marginBottom: '48px',
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          Join thousands of athletes already training smarter with AI
        </p>
        
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
          letterSpacing: '0.5px',
          borderRadius: '100px',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(14, 165, 233, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(14, 165, 233, 0.4)';
        }}
        >
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(200px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(200px) rotate(-360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(50px); }
        }
      `}</style>
    </div>
  );
};

export default BeautifulAthleticLanding;