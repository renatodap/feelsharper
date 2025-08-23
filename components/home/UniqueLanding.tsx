'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mic, Zap } from 'lucide-react';

const UniqueLanding = () => {
  const [messages, setMessages] = useState<Array<{text: string, from: 'user' | 'ai', time: string}>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Simulate real conversations happening
  useEffect(() => {
    const conversations = [
      { text: "just finished chest day", from: 'user' as const, time: '2:34pm' },
      { text: "Nice! Logged: Chest workout. You hit 8% more volume than last week. Recovery ETA: 48hrs", from: 'ai' as const, time: '2:34pm' },
      { text: "ran 10k this morning", from: 'user' as const, time: '6:23am' },
      { text: "Incredible pace! 10km in 47:23. Your VO2 max trend suggests you could break 45min soon", from: 'ai' as const, time: '6:23am' },
      { text: "weight?", from: 'user' as const, time: '7:00am' },
      { text: "Your last weight was 178 lbs (3 days ago). Want me to log a new weight?", from: 'ai' as const, time: '7:00am' },
      { text: "176", from: 'user' as const, time: '7:01am' },
      { text: "✓ Weight logged: 176 lbs. You're down 2 lbs - right on track for your goal", from: 'ai' as const, time: '7:01am' },
      { text: "feeling exhausted", from: 'user' as const, time: '9:45pm' },
      { text: "Your HRV is 15% below baseline. I'd suggest a rest day tomorrow. Sleep target: 9+ hours", from: 'ai' as const, time: '9:45pm' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < conversations.length) {
        setMessages(prev => [...prev, conversations[index]]);
        index++;
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      } else {
        index = 0;
        setMessages([]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Get actual time of day
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour < 12) setTimeOfDay('morning');
      else if (hour < 17) setTimeOfDay('afternoon');
      else setTimeOfDay('evening');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll for parallax
  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(progress * 100, 100));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
      position: 'relative'
    }}>
      
      {/* Progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '2px',
        background: 'linear-gradient(90deg, #00ff88, #00ffff)',
        zIndex: 100,
        transition: 'width 0.1s'
      }} />

      {/* Terminal-style header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.95)',
        borderBottom: '1px solid #111',
        padding: '12px 20px',
        zIndex: 50,
        fontSize: '13px',
        fontFamily: 'monospace'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: '#00ff88' }}>feelsharper:~$</span>
            <span style={{ opacity: 0.5 }}>v2.0.1</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span style={{ opacity: 0.5 }}>{new Date().toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/sign-in" style={{ color: '#888', textDecoration: 'none' }}>login</Link>
            <Link href="/sign-up" style={{ color: '#00ff88', textDecoration: 'none' }}>[start_free]</Link>
          </div>
        </div>
      </div>

      {/* Main content - Full height chat interface */}
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        paddingTop: '50px'
      }}>
        
        {/* Left side - Live chat feed */}
        <div style={{
          flex: 1,
          borderRight: '1px solid #111',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '600px'
        }}>
          {/* Chat header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #111',
            background: '#050505'
          }}>
            <h1 style={{
              fontSize: '14px',
              fontWeight: 'normal',
              marginBottom: '5px',
              color: '#00ff88'
            }}>
              FEELSHARPER.AI
            </h1>
            <p style={{ fontSize: '11px', color: '#666' }}>
              real conversations happening now • {messages.length * 142} athletes online
            </p>
          </div>

          {/* Messages */}
          <div 
            ref={chatRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: msg.from === 'user' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{
                  fontSize: '10px',
                  color: '#444',
                  marginBottom: '4px'
                }}>
                  {msg.from === 'user' ? 'athlete' : 'ai'} • {msg.time}
                </div>
                <div style={{
                  background: msg.from === 'user' ? '#0a0a0a' : '#001100',
                  border: `1px solid ${msg.from === 'user' ? '#222' : '#003300'}`,
                  padding: '12px 16px',
                  borderRadius: '3px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: msg.from === 'user' ? '#888' : '#00ff88'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #111',
            background: '#050505'
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="just type what happened..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                style={{
                  flex: 1,
                  background: '#000',
                  border: '1px solid #222',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '3px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#222'}
              />
              <button style={{
                padding: '10px 15px',
                background: '#00ff88',
                color: '#000',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Info panels */}
        <div style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505'
        }}>
          {/* Stats ticker */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #111'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
              LIVE METRICS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>2.1s</div>
                <div style={{ fontSize: '10px', color: '#666' }}>avg response</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ffff' }}>94.7%</div>
                <div style={{ fontSize: '10px', color: '#666' }}>accuracy</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0088' }}>47→1</div>
                <div style={{ fontSize: '10px', color: '#666' }}>taps saved</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffff00' }}>∞</div>
                <div style={{ fontSize: '10px', color: '#666' }}>memory</div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{
            padding: '20px',
            flex: 1
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '15px' }}>
              README.MD
            </div>
            
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#888' }}>
              <p style={{ marginBottom: '15px' }}>
                <span style={{ color: '#00ff88' }}>## how it works</span>
              </p>
              
              <p style={{ marginBottom: '10px' }}>
                <span style={{ color: '#00ffff' }}>1.</span> talk to it like you text a friend
              </p>
              <p style={{ marginBottom: '10px' }}>
                <span style={{ color: '#00ffff' }}>2.</span> ai extracts all the data
              </p>
              <p style={{ marginBottom: '10px' }}>
                <span style={{ color: '#00ffff' }}>3.</span> learns your patterns over time
              </p>
              <p style={{ marginBottom: '10px' }}>
                <span style={{ color: '#00ffff' }}>4.</span> coaches based on your goals
              </p>
              
              <p style={{ marginTop: '20px', marginBottom: '15px' }}>
                <span style={{ color: '#00ff88' }}>## examples</span>
              </p>
              
              <div style={{ 
                background: '#000', 
                border: '1px solid #222', 
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                marginBottom: '10px'
              }}>
                <span style={{ color: '#666' }}>&gt;</span> "ran 5k"<br/>
                <span style={{ color: '#00ff88' }}>✓ logged 5km run</span>
              </div>
              
              <div style={{ 
                background: '#000', 
                border: '1px solid #222', 
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                marginBottom: '10px'
              }}>
                <span style={{ color: '#666' }}>&gt;</span> "bench 225x8"<br/>
                <span style={{ color: '#00ff88' }}>✓ logged bench press</span>
              </div>
              
              <div style={{ 
                background: '#000', 
                border: '1px solid #222', 
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                <span style={{ color: '#666' }}>&gt;</span> "tired"<br/>
                <span style={{ color: '#00ff88' }}>✓ rest day suggested</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #111'
          }}>
            <Link 
              href="/sign-up" 
              style={{
                display: 'block',
                padding: '15px',
                background: 'linear-gradient(90deg, #00ff88, #00ffff)',
                color: '#000',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '3px'
              }}
            >
              START FREE [NO CARD REQUIRED]
            </Link>
            <p style={{
              fontSize: '10px',
              color: '#444',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              join {(10000 + Math.floor(scrollProgress * 100)).toLocaleString()} athletes
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #000;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #222;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default UniqueLanding;