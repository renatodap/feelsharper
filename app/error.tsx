'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Lightning Logo Component
const LightningLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
  </svg>
);

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white overflow-hidden relative flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-red-400/20 blur-2xl"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Something went wrong!
        </h1>
        
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Don't worry, even the best athletes stumble sometimes. 
          Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 group"
          >
            <RefreshCw className="mr-2 w-5 h-5" />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-semibold transition-all duration-200"
          >
            <Home className="mr-2 w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800 max-w-2xl mx-auto text-left">
            <p className="text-xs text-gray-500 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Sharp angular decorative element */}
        <div className="mt-16 flex justify-center">
          <div 
            className="w-64 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"
            style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
          />
        </div>
      </div>
    </div>
  );
}