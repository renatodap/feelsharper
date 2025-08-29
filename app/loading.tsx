export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white overflow-hidden relative flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <svg className="w-16 h-16 text-blue-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
          </svg>
          <div className="absolute inset-0 w-16 h-16 bg-blue-400/20 blur-2xl"></div>
        </div>
        
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
        </div>
        
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}