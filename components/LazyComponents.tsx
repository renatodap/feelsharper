// Simplified lazy components for TypeScript compatibility
import dynamic from 'next/dynamic';

// Simple stub exports with proper default exports
export const LazyChart = dynamic(() => import('./ui/Chart'), { 
  ssr: false,
  loading: () => <div>Chart Loading...</div>
});

export const LazyCalendar = dynamic(() => import('./calendar/CalendarView'), { 
  ssr: false,
  loading: () => <div>Calendar Loading...</div>
});

export const LazyLeaderboard = dynamic(() => Promise.resolve({ default: () => <div>Leaderboard Loading...</div> }), { ssr: false });

export const LazyPricing = dynamic(() => Promise.resolve({ default: () => <div>Pricing Loading...</div> }), { ssr: false });

// Default export
const LazyComponents = {
  LazyChart,
  LazyCalendar,
  LazyLeaderboard,
  LazyPricing
};

export default LazyComponents;