/**
 * Insights Page Tests
 * TDD Step 4: Test Implementation (with mocks - failing tests)
 * 
 * IMPORTANT: These tests use mocks and are expected to FAIL initially.
 * They will pass once the actual implementation is complete (TDD Step 5).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InsightsPage from '../page';
import type { Insight, InsightsResponse, CoachQAResponse } from '@/lib/types/mvp';

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

// Mock data
const mockInsights: Insight[] = [
  {
    id: 'insight-1',
    user_id: 'test-user-id',
    rule_id: 'underfueled',
    title: "You're underfueled pre-run",
    body: 'Your recent runs show low energy. Try eating 30-60 minutes before.',
    severity: 'warning',
    evidence_json: { 
      logs: ['log-1', 'log-2'],
      pattern: 'low_energy_runs'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'insight-2',
    user_id: 'test-user-id',
    rule_id: 'hydration',
    title: 'Hydration levels need attention',
    body: 'You logged less than 2L of water yesterday.',
    severity: 'info',
    evidence_json: {
      logs: ['log-3'],
      pattern: 'low_hydration'
    },
    created_at: new Date().toISOString()
  }
];

const mockCriticalQuestion = {
  id: 'q-1',
  question: 'Are you targeting weight loss this week?',
  options: ['Yes', 'No', 'Maintenance']
};

// Mock fetch responses
global.fetch = jest.fn((url: string) => {
  if (url.includes('/api/insights')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve<InsightsResponse>({
        insights: mockInsights,
        criticalQuestion: mockCriticalQuestion
      })
    });
  }
  
  if (url.includes('/api/coach/qa')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve<CoachQAResponse>({
        answer: 'Based on your recent workouts, yes, you should prioritize protein intake.',
        relatedLogs: ['log-1', 'log-2'],
        confidence: 0.85
      })
    });
  }

  if (url.includes('/api/coach/answer')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  }

  return Promise.reject(new Error('Unknown endpoint'));
}) as jest.Mock;

describe('InsightsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('Should render with no insights for new user', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ insights: [], criticalQuestion: null })
        })
      );

      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Log a meal or workout now/i)).toBeInTheDocument();
      });
    });

    test('Should display maximum 3 insight cards', async () => {
      const manyInsights = [...mockInsights, ...mockInsights].slice(0, 5);
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ insights: manyInsights, criticalQuestion: null })
        })
      );

      render(<InsightsPage />);
      
      await waitFor(() => {
        const insightCards = screen.getAllByTestId(/^insight-card-/);
        expect(insightCards).toHaveLength(3); // Maximum 3 cards
      });
    });

    test('Should show date range selector with correct options', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Last 7d')).toBeInTheDocument();
        
        const selector = screen.getByRole('button', { name: /Last 7d/i });
        fireEvent.click(selector);
        
        expect(screen.getByText('Last 14d')).toBeInTheDocument();
        expect(screen.getByText('Last 30d')).toBeInTheDocument();
      });
    });

    test('Should display critical question banner when applicable', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(mockCriticalQuestion.question)).toBeInTheDocument();
        mockCriticalQuestion.options.forEach(option => {
          expect(screen.getByRole('button', { name: option })).toBeInTheDocument();
        });
      });
    });

    test('Should render Ask Coach micro-chat input', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Should I lift after a 5k?/i)).toBeInTheDocument();
      });
    });
  });

  describe('Insight Generation', () => {
    test('Should generate insights from activity logs', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/insights'),
          expect.any(Object)
        );
        expect(screen.getByText(mockInsights[0].title)).toBeInTheDocument();
      });
    });

    test('Should prioritize insights by severity', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const cards = screen.getAllByTestId(/^insight-card-/);
        const firstCard = cards[0];
        expect(firstCard).toHaveTextContent('Act Now'); // warning severity
      });
    });

    test('Should refresh insights on button click', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /Refresh/i });
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });

    test('Should update insights when date range changes', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const selector = screen.getByRole('button', { name: /Last 7d/i });
        fireEvent.click(selector);
        
        const option14d = screen.getByText('Last 14d');
        fireEvent.click(option14d);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('range=14'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Insight Interactions', () => {
    test('Should expand insight card on click', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
        fireEvent.click(expandButton);
        
        expect(screen.getByText(/Why you're seeing this/i)).toBeInTheDocument();
      });
    });

    test('Should show evidence when expanded', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
        fireEvent.click(expandButton);
        
        expect(screen.getByText(/low_energy_runs/i)).toBeInTheDocument();
      });
    });

    test('Should execute primary action on button click', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const actionButton = screen.getByRole('button', { name: /Add pre-run carbs/i });
        fireEvent.click(actionButton);
        
        // Should navigate or trigger action
        expect(screen.getByText(/Navigating to log/i)).toBeInTheDocument();
      });
    });

    test('Should snooze insight for 7 days', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
        fireEvent.click(expandButton);
        
        const snoozeButton = screen.getByRole('button', { name: /Dismiss for 7 days/i });
        fireEvent.click(snoozeButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/insights/snooze'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('insight-1')
          })
        );
      });
    });
  });

  describe('Coach Features', () => {
    test('Should answer critical question and update insights', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const yesButton = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/coach/answer'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Yes')
          })
        );
      });
    });

    test('Should process Ask Coach question', async () => {
      const user = userEvent.setup();
      render(<InsightsPage />);
      
      await waitFor(async () => {
        const input = screen.getByPlaceholderText(/Should I lift after a 5k?/i);
        await user.type(input, 'Should I eat before morning runs?');
        await user.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/coach/qa'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Should I eat before morning runs?')
          })
        );
      });
    });

    test('Should return single paragraph response', async () => {
      const user = userEvent.setup();
      render(<InsightsPage />);
      
      await waitFor(async () => {
        const input = screen.getByPlaceholderText(/Should I lift after a 5k?/i);
        await user.type(input, 'Test question');
        await user.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(screen.getByText(/Based on your recent workouts/i)).toBeInTheDocument();
        const response = screen.getByTestId('coach-response');
        expect(response.textContent?.length).toBeLessThanOrEqual(400);
      });
    });

    test('Should show related logs link', async () => {
      const user = userEvent.setup();
      render(<InsightsPage />);
      
      await waitFor(async () => {
        const input = screen.getByPlaceholderText(/Should I lift after a 5k?/i);
        await user.type(input, 'Test question');
        await user.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /See related logs/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('Should be keyboard navigable', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        const firstFocusable = screen.getAllByRole('button')[0];
        firstFocusable.focus();
        expect(document.activeElement).toBe(firstFocusable);
        
        // Tab through elements
        userEvent.tab();
        expect(document.activeElement).not.toBe(firstFocusable);
      });
    });

    test('Should have proper ARIA labels', async () => {
      render(<InsightsPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('region', { name: /insights/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh insights/i })).toBeInTheDocument();
      });
    });
  });
});