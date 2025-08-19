"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  className?: string;
}

export default function ChatAssistant({ className = '' }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your FeelSharper AI assistant. I can help you with nutrition advice, weight tracking insights, and fitness guidance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Prepare context (last 5 messages)
      const context = messages.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('You\'ve sent too many messages. Please wait a moment before trying again.');
        } else if (response.status === 403) {
          setError(`${data.error} (Current usage: $${data.currentUsage?.toFixed(2) || '0.00'})`);
        } else {
          setError(data.error || 'Failed to get response');
        }
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show usage info if on free tier
      if (data.usage?.tier === 'free' && data.usage?.cost) {
        const cost = parseFloat(data.usage.cost);
        if (cost > 0.40) {
          setError(`You're approaching your free tier limit. Usage: $${cost.toFixed(2)}/$0.50`);
        }
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-[500px] bg-surface border border-border rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="p-2 bg-navy/10 rounded-lg">
          <Bot className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">AI Assistant</h3>
          <p className="text-xs text-text-secondary">Powered by FeelSharper AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-navy" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-navy text-white'
                  : 'bg-surface-2 border border-border text-text-primary'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-white/60' : 'text-text-muted'
              }`}>
                {message.timestamp.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-surface-2 border border-border rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-text-primary" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-navy" />
            </div>
            <div className="bg-surface-2 border border-border rounded-xl p-3">
              <Loader className="w-4 h-4 text-text-secondary animate-spin" />
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about fitness..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Free tier: 100 messages/month • <a href="/pricing" className="text-navy hover:underline">Upgrade for more</a>
        </p>
      </div>
    </div>
  );
}