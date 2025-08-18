import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release Health
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filtering
  beforeSend(event, hint) {
    // Filter out non-critical errors
    const error = hint.originalException;
    
    // Ignore specific error types
    if (error && error.toString().includes('ECONNREFUSED')) {
      return null;
    }
    
    // Remove sensitive data
    if (event.request) {
      if (event.request.cookies) {
        delete event.request.cookies;
      }
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-supabase-auth'];
      }
    }
    
    // Remove API keys from context
    if (event.contexts && event.contexts.app) {
      const appContext = event.contexts.app;
      Object.keys(appContext).forEach(key => {
        if (key.toLowerCase().includes('key') || 
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('token')) {
          delete appContext[key];
        }
      });
    }
    
    return event;
  },
  
  // Capture console errors
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],
});