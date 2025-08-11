'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CoachCommands } from './CoachCommands';
import { CoachInsights } from './CoachInsights';
import { 
  Send, 
  Brain, 
  Mic, 
  Plus,
  RotateCcw,
  Sparkles,
  User,
  Bot,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: 'workout' | 'nutrition' | 'recovery' | 'goal';
    data?: any;
  };
}

export function AIFitnessCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample conversation starters
  const conversationStarters = [
    'How should I adjust my training based on my sleep quality?',
    'Create a workout plan for my goals',
    'Analyze my nutrition from yesterday',
    'Why am I not seeing progress in my bench press?',
    'What should I eat pre and post workout?',
    'How do I break through a plateau?',
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI Fitness Coach. I've analyzed your recent activity and I&apos;m here to help optimize your training, nutrition, and recovery.

I can help you with:
🏋️ **Training Plans** - Create personalized workout programs
🥗 **Nutrition Guidance** - Macro optimization and meal timing
📊 **Progress Analysis** - Review your data and identify improvements
🎯 **Goal Setting** - Break down objectives into actionable steps
😴 **Recovery Optimization** - Sleep, stress, and rest day planning

What would you like to work on today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the enhanced AI assistant API
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          sessionId,
          context: {
            type: 'fitness_coach',
            userGoals: ['strength', 'muscle_gain'], // Would come from user profile
            recentWorkouts: [], // Would come from database
            nutritionData: {}, // Would come from database
            sleepData: {} // Would come from database
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        context: data.context
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/🏋️|🥗|📊|🎯|😴|💪|🔥|⚡|🌟/g, '<span class="text-lg">$&</span>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                AI Fitness Coach
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Your personal elite coach, nutritionist, and sports scientist
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                AI Online
              </Badge>
              <Button variant="outline" size="sm" onClick={clearConversation}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[70vh] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-3xl rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-12'
                          : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 mr-12'
                      }`}
                    >
                      <div 
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessageContent(message.content) 
                        }}
                      />
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 dark:bg-slate-600">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Coach is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                {/* Conversation Starters */}
                {messages.length === 1 && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Try asking:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conversationStarters.slice(0, 3).map((starter, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(starter)}
                          className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask your AI coach anything about training, nutrition, or recovery..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:border-slate-700 dark:bg-slate-800"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coach Commands */}
            <CoachCommands onCommandSelect={sendMessage} />
            
            {/* Today's Insights */}
            <CoachInsights />

            {/* Chat History */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Recent Sessions
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="font-medium text-slate-900 dark:text-slate-100">Workout plan review</div>
                  <div className="text-slate-600 dark:text-slate-400">Yesterday</div>
                </div>
                <div className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="font-medium text-slate-900 dark:text-slate-100">Nutrition optimization</div>
                  <div className="text-slate-600 dark:text-slate-400">2 days ago</div>
                </div>
                <div className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="font-medium text-slate-900 dark:text-slate-100">Recovery strategies</div>
                  <div className="text-slate-600 dark:text-slate-400">1 week ago</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}