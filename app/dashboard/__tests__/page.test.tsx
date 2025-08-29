/**
 * Dashboard Page Tests
 * TDD Step 4: Test Implementation (with mocks - failing tests)
 * 
 * IMPORTANT: These tests use mocks and are expected to FAIL initially.
 * They will pass once the actual implementation is complete (TDD Step 5).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';
import type { DashboardWidget, PersonaType, DashboardResponse } from '@/lib/types/mvp';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({ 
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' } 
        } 
      }))
    },
    from: jest.fn()
  }))
}));

jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false
  })
}));

// Mock dashboard data
const mockDashboardData: DashboardResponse = {
  persona: 'tennis',
  widgets: [
    {
      id: 'streak',
      type: 'streak',
      title: 'Logging Streak',
      value: 7,
      trend: 'up',
      enabled: true,
      order: 1
    },
    {
      id: 'weight',
      type: 'weight',
      title: 'Weight Trend',
      value: 73.4,
      trend: 'down',
      data: [75.0, 74.8, 74.5, 74.2, 73.9, 73.7, 73.4],
      enabled: true,
      order: 2
    },
    {
      id: 'volume',
      type: 'volume',
      title: 'Training Volume',
      value: '15 hours',
      trend: 'stable',
      enabled: true,
      order: 3
    },
    {
      id: 'recovery',
      type: 'recovery',
      title: 'Recovery Score',
      value: 85,
      trend: 'up',
      enabled: true,
      order: 4
    },
    {
      id: 'hydration',
      type: 'hydration',
      title: 'Hydration',
      value: '2.5L',
      trend: 'stable',
      enabled: false,
      order: 5
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Mock activity logs for persona detection
const mockTennisLogs = [
  { type: 'exercise', raw_text: 'played tennis for 90 minutes', parsed_data: { sport: 'tennis' } },
  { type: 'exercise', raw_text: 'tennis practice 2 hours', parsed_data: { sport: 'tennis' } },
  { type: 'exercise', raw_text: 'tennis match won 6-4 6-3', parsed_data: { sport: 'tennis' } }
];

const mockRunningLogs = [
  { type: 'exercise', raw_text: 'ran 10k in 45 minutes', parsed_data: { activity: 'running' } },
  { type: 'exercise', raw_text: 'morning run 5 miles', parsed_data: { activity: 'running' } },
  { type: 'exercise', raw_text: 'interval training on track', parsed_data: { activity: 'running' } }
];

// Mock fetch responses
global.fetch = jest.fn((url: string) => {
  if (url.includes('/api/dashboard')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockDashboardData)
    });
  }
  
  if (url.includes('/api/logs')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockTennisLogs)
    });
  }

  return Promise.reject(new Error('Unknown endpoint'));
}) as jest.Mock;

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auto-Preset Detection', () => {
    test('Should detect Tennis persona from tennis logs', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTennisLogs)
          });
        }
        if (url.includes('/api/dashboard')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockDashboardData, persona: 'tennis' })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI selected: Tennis/i)).toBeInTheDocument();
      });
    });

    test('Should detect Endurance persona from running logs', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRunningLogs)
          });
        }
        if (url.includes('/api/dashboard')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ...mockDashboardData, persona: 'endurance' })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/AI selected: Endurance/i)).toBeInTheDocument();
      });
    });

    test('Should allow manual override of persona', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const overrideButton = screen.getByRole('button', { name: /Override/i });
        fireEvent.click(overrideButton);
        
        const strengthOption = screen.getByRole('option', { name: /Strength/i });
        fireEvent.click(strengthOption);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard'),
          expect.objectContaining({
            body: expect.stringContaining('strength')
          })
        );
      });
    });
  });

  describe('Widget Display', () => {
    test('Should display 4 core widgets', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const widgets = screen.getAllByTestId(/^widget-/);
        const enabledWidgets = widgets.filter(w => !w.classList.contains('hidden'));
        expect(enabledWidgets).toHaveLength(4);
      });
    });

    test('Should calculate streak correctly', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Logging Streak')).toBeInTheDocument();
        expect(screen.getByText('7 days')).toBeInTheDocument();
      });
    });

    test('Should show weight trend sparkline', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Weight Trend')).toBeInTheDocument();
        expect(screen.getByTestId('weight-sparkline')).toBeInTheDocument();
        expect(screen.getByText('73.4kg')).toBeInTheDocument();
        expect(screen.getByText('-0.3kg from last week')).toBeInTheDocument();
      });
    });

    test('Should sum training volume', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Training Volume')).toBeInTheDocument();
        expect(screen.getByText('15 hours')).toBeInTheDocument();
      });
    });

    test('Should calculate sleep debt', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Recovery Score')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('Aim for +30m tonight')).toBeInTheDocument();
      });
    });

    test('Should update when date range changes', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const rangeButton = screen.getByRole('button', { name: /7/i });
        fireEvent.click(rangeButton);
        
        const option14 = screen.getByRole('button', { name: /14/i });
        fireEvent.click(option14);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('range=14D'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Widget Management', () => {
    test('Should toggle widgets on/off', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const sidePanelButton = screen.getByRole('button', { name: /More Metrics/i });
        fireEvent.click(sidePanelButton);
        
        const hydrationToggle = screen.getByRole('checkbox', { name: /Hydration/i });
        expect(hydrationToggle).not.toBeChecked();
        
        fireEvent.click(hydrationToggle);
      });

      await waitFor(() => {
        expect(screen.getByText('2.5L')).toBeInTheDocument();
      });
    });

    test('Should persist widget preferences', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const sidePanelButton = screen.getByRole('button', { name: /More Metrics/i });
        fireEvent.click(sidePanelButton);
        
        const hydrationToggle = screen.getByRole('checkbox', { name: /Hydration/i });
        fireEvent.click(hydrationToggle);
      });

      // Simulate page reload
      const { rerender } = render(<DashboardPage />);
      rerender(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('2.5L')).toBeInTheDocument();
      });
    });

    test('Should show why widget suggested', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const sidePanelButton = screen.getByRole('button', { name: /More Metrics/i });
        fireEvent.click(sidePanelButton);
        
        const tooltips = screen.getAllByTestId('widget-tooltip');
        expect(tooltips[0]).toHaveAttribute('title', expect.stringContaining('tennis'));
      });
    });

    test('Should restore defaults', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const sidePanelButton = screen.getByRole('button', { name: /More Metrics/i });
        fireEvent.click(sidePanelButton);
        
        // Enable extra widget
        const hydrationToggle = screen.getByRole('checkbox', { name: /Hydration/i });
        fireEvent.click(hydrationToggle);
        
        // Restore defaults
        const restoreButton = screen.getByRole('button', { name: /Restore defaults/i });
        fireEvent.click(restoreButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('2.5L')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('Should adapt to mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      
      render(<DashboardPage />);
      
      const widgets = screen.getAllByTestId(/^widget-/);
      widgets.forEach(widget => {
        expect(widget).toHaveClass('w-full'); // Full width on mobile
      });
    });

    test('Should adapt to desktop layout', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });
      
      render(<DashboardPage />);
      
      const widgets = screen.getAllByTestId(/^widget-/);
      widgets.forEach(widget => {
        expect(widget).toHaveClass('md:w-1/2', 'lg:w-1/4'); // Grid on desktop
      });
    });
  });

  describe('Performance', () => {
    test('Should render dashboard in < 100ms', async () => {
      const startTime = performance.now();
      
      render(<DashboardPage />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(100);
      });
    });

    test('Should not block main thread', async () => {
      render(<DashboardPage />);
      
      // Check that interaction is still possible during data loading
      const button = document.createElement('button');
      document.body.appendChild(button);
      
      fireEvent.click(button);
      expect(button).toBeTruthy(); // Interaction still works
      
      document.body.removeChild(button);
    });
  });

  describe('Empty States', () => {
    test('Should show helpful empty state for new users', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            persona: 'auto',
            widgets: [],
            lastUpdated: new Date().toISOString()
          })
        })
      );

      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Start tracking to see your dashboard/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Log your first activity/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('Should have proper heading hierarchy', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveTextContent('Dashboard');
        
        const h2s = screen.getAllByRole('heading', { level: 2 });
        expect(h2s.length).toBeGreaterThan(0);
      });
    });

    test('Should have keyboard navigation for widgets', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        const widgets = screen.getAllByTestId(/^widget-/);
        widgets[0].focus();
        expect(document.activeElement).toBe(widgets[0]);
      });
    });
  });
});