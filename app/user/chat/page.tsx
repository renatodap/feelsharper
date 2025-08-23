'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send,
  Bot,
  User,
  Heart,
  Brain,
  Target,
  Sparkles
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  type?: 'support' | 'goal' | 'recovery' | 'motivation';
};

// Sample conversation starters
const conversationStarters = [
  { icon: Heart, text: "I need motivation", type: 'motivation' as const },
  { icon: Target, text: "Help me set a goal", type: 'goal' as const },
  { icon: Brain, text: "I missed a workout", type: 'recovery' as const },
  { icon: Sparkles, text: "What should I focus on?", type: 'support' as const }
];

export default function CoachChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey! I'm your AI coach. I'm here to support your journey. What's on your mind today?",
      sender: 'coach',
      timestamp: new Date(),
      type: 'support'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (text.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: text,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([...messages, userMessage]);
      setInput('');
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const coachResponse: Message = {
          id: messages.length + 2,
          text: getCoachResponse(text),
          sender: 'coach',
          timestamp: new Date(),
          type: detectMessageType(text)
        };
        setMessages(prev => [...prev, coachResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const detectMessageType = (text: string): Message['type'] => {
    const lower = text.toLowerCase();
    if (lower.includes('goal') || lower.includes('target')) return 'goal';
    if (lower.includes('missed') || lower.includes('failed')) return 'recovery';
    if (lower.includes('motivation') || lower.includes('help')) return 'motivation';
    return 'support';
  };

  const getCoachResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    
    if (lower.includes('motivation')) {
      return "Remember why you started this journey. You're not just exercising, you're becoming the person you want to be. Every workout is a vote for your new identity as an athlete. You've got this! 💪";
    }
    
    if (lower.includes('goal')) {
      return "Let's make this concrete and achievable. Who do you want to become? Instead of 'I want to exercise more,' try 'I am someone who never misses a Monday workout.' What identity are you building?";
    }
    
    if (lower.includes('missed') || lower.includes('failed')) {
      return "Missing one workout doesn't break your identity. You're still an athlete. The key is getting back on track immediately. Remember: never miss twice. What's your plan for tomorrow?";
    }
    
    if (lower.includes('focus')) {
      return "Based on your patterns, focus on consistency over intensity. You perform best with 4-5 moderate sessions per week rather than 2-3 intense ones. Small, consistent actions build lasting habits.";
    }
    
    return "That's a great point. Tell me more about how you're feeling about your progress. Remember, sustainable change comes from small, consistent actions aligned with who you want to become.";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-heading font-black text-white mb-2">
          Coach <span className="text-feel-primary lightning-text">Chat</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Empathetic support & identity-based goal setting
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal overflow-hidden"
           style={{
             clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
           }}>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start gap-3">
                  {message.sender === 'coach' && (
                    <div className="w-8 h-8 bg-feel-primary/20 flex items-center justify-center"
                         style={{
                           clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                         }}>
                      <Bot className="w-5 h-5 text-feel-primary" />
                    </div>
                  )}
                  
                  <div className={`p-4 ${
                    message.sender === 'user' 
                      ? 'bg-feel-primary/20 border border-feel-primary/30' 
                      : 'bg-sharpened-void/50 border border-sharpened-charcoal'
                  }`}
                       style={{
                         clipPath: message.sender === 'user'
                           ? 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%, 0 0)'
                           : 'polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)'
                       }}>
                    <p className="font-body text-white">{message.text}</p>
                    <span className="text-xs text-sharpened-gray font-body mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-sharpened-charcoal flex items-center justify-center"
                         style={{
                           clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                         }}>
                      <User className="w-5 h-5 text-sharpened-light-gray" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-feel-primary/20 flex items-center justify-center"
                     style={{
                       clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                     }}>
                  <Bot className="w-5 h-5 text-feel-primary" />
                </div>
                <div className="bg-sharpened-void/50 border border-sharpened-charcoal p-4"
                     style={{
                       clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)'
                     }}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-feel-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-feel-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-feel-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-sharpened-charcoal">
          <div className="flex gap-2 mb-4">
            {conversationStarters.map((starter, index) => (
              <button
                key={index}
                onClick={() => handleSend(starter.text)}
                className="flex items-center gap-2 px-3 py-2 bg-sharpened-void/50 border border-sharpened-charcoal hover:border-feel-primary/50 transition-all text-sm font-body text-sharpened-light-gray hover:text-white"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
                <starter.icon className="w-4 h-4" />
                <span>{starter.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-sharpened-charcoal">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-sharpened-void/50 border border-sharpened-charcoal text-white placeholder-sharpened-gray font-body focus:outline-none focus:border-feel-primary/50 transition-colors"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}
            />
            <button
              onClick={() => handleSend()}
              className="px-6 py-3 bg-feel-primary hover:bg-feel-secondary text-white font-heading font-bold transition-colors"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}