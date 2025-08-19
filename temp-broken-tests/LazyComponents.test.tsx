/**
 * Unit Tests for LazyComponents
 * Tests that lazy loading components render properly
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  LazyWorkoutLogger, 
  LazyNutritionTracker, 
  LazyProgressTracker,
  LazyAICoach,
  LazyLoad 
} from '@/components/LazyComponents';

// Mock the heavy components
jest.mock('@/components/workouts/WorkoutLogger', () => {
  return function MockWorkoutLogger() {
    return <div data-testid="workout-logger">Workout Logger Component</div>;
  };
});

jest.mock('@/components/nutrition/NutritionTracker', () => {
  return function MockNutritionTracker() {
    return <div data-testid="nutrition-tracker">Nutrition Tracker Component</div>;
  };
});

jest.mock('@/components/progress/ProgressTracker', () => {
  return function MockProgressTracker() {
    return <div data-testid="progress-tracker">Progress Tracker Component</div>;
  };
});

jest.mock('@/components/coach/AICoach', () => {
  return function MockAICoach() {
    return <div data-testid="ai-coach">AI Coach Component</div>;
  };
});

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return function mockDynamic(
    dynamicImport: () => Promise<{ default: React.ComponentType<any> }>,
    options?: { loading?: () => React.ReactElement; ssr?: boolean }
  ) {
    const Component = React.lazy(dynamicImport);
    
    return function DynamicComponent(props: any) {
      return (
        <React.Suspense fallback={options?.loading ? options.loading() : <div>Loading...</div>}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  };
});

describe('LazyComponents', () => {
  it('should render LazyWorkoutLogger with loading state', async () => {
    render(<LazyWorkoutLogger />);
    
    // Should initially show loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Then show the actual component
    expect(await screen.findByTestId('workout-logger')).toBeInTheDocument();
  });

  it('should render LazyNutritionTracker with loading state', async () => {
    render(<LazyNutritionTracker />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByTestId('nutrition-tracker')).toBeInTheDocument();
  });

  it('should render LazyProgressTracker with loading state', async () => {
    render(<LazyProgressTracker />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByTestId('progress-tracker')).toBeInTheDocument();
  });

  it('should render LazyAICoach with loading state', async () => {
    render(<LazyAICoach />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByTestId('ai-coach')).toBeInTheDocument();
  });

  it('should render LazyLoad wrapper correctly', async () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    
    render(<LazyLoad component={TestComponent} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByTestId('test-component')).toBeInTheDocument();
  });

  it('should render custom fallback for LazyLoad', () => {
    const TestComponent = () => <div>Test Component</div>;
    const customFallback = <div data-testid="custom-fallback">Custom Loading...</div>;
    
    render(<LazyLoad component={TestComponent} fallback={customFallback} />);
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
});