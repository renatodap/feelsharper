/**
 * CommonLogsBar Test Suite
 * TDD Step 4: Test Implementation with Mocks
 * 
 * This file contains tests with mocks that will fail initially.
 * All mock objects are prefixed with "Mock" as per TDD requirements.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommonLogsBar } from './CommonLogsBar';
import type { QuickLog, QuickLogPreferences } from './types';

// Mock data for testing
const MockQuickLogs: QuickLog[] = [
  {
    id: '1',
    activity: 'Morning coffee',
    type: 'food',
    frequency: 15,
    lastLogged: new Date('2025-08-29T08:00:00'),
    isPinned: false,
    isHidden: false,
    icon: 'coffee',
    data: {
      raw_text: 'coffee with milk',
      parsed_data: { item: 'coffee', calories: 50 },
      confidence: 95,
    },
  },
  {
    id: '2',
    activity: '5k run',
    type: 'exercise',
    frequency: 8,
    lastLogged: new Date('2025-08-28T18:00:00'),
    isPinned: true,
    isHidden: false,
    icon: 'running',
    data: {
      raw_text: 'ran 5k',
      parsed_data: { activity: 'running', distance: 5, unit: 'km' },
      confidence: 90,
    },
  },
  {
    id: '3',
    activity: 'Weight check',
    type: 'weight',
    frequency: 5,
    lastLogged: new Date('2025-08-29T06:00:00'),
    isPinned: false,
    isHidden: false,
    icon: 'scale',
    data: {
      raw_text: 'weight 175',
      parsed_data: { weight: 175, unit: 'lbs' },
      confidence: 98,
    },
  },
];

// Mock localStorage
const MockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock parse API
const MockParseAPI = jest.fn();

// Mock toast system
const MockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
};

// Replace global objects for testing
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: MockLocalStorage,
  });
  (global as any).toast = MockToast;
});

describe('CommonLogsBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    test('should render with no quick logs (new user)', () => {
      render(<CommonLogsBar quickLogs={[]} />);
      
      const emptyState = screen.getByText(/no quick logs yet/i);
      expect(emptyState).toBeInTheDocument();
    });

    test('should render quick logs from frequency data', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      expect(screen.getByText('Morning coffee')).toBeInTheDocument();
      expect(screen.getByText('5k run')).toBeInTheDocument();
      expect(screen.getByText('Weight check')).toBeInTheDocument();
    });

    test('should apply Sharpened brand styling', () => {
      const { container } = render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const bar = container.querySelector('.common-logs-bar');
      expect(bar).toHaveStyle({
        backgroundColor: 'rgb(10, 10, 10)', // #0A0A0A
      });
      
      // Check for clip-path on buttons
      const buttons = container.querySelectorAll('.quick-log-button');
      buttons.forEach(button => {
        expect(button).toHaveStyle({
          clipPath: expect.stringContaining('polygon'),
        });
      });
    });

    test('should render icons for each activity type', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      // Check for icon elements
      expect(screen.getByTestId('icon-coffee')).toBeInTheDocument();
      expect(screen.getByTestId('icon-running')).toBeInTheDocument();
      expect(screen.getByTestId('icon-scale')).toBeInTheDocument();
    });

    test('should show pinned logs first', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('5k run'); // Pinned item first
    });
  });

  describe('Interaction Tests', () => {
    test('should log activity on button click', async () => {
      const onQuickLog = jest.fn();
      render(
        <CommonLogsBar 
          quickLogs={MockQuickLogs} 
          onQuickLog={onQuickLog}
        />
      );
      
      const coffeeButton = screen.getByText('Morning coffee');
      fireEvent.click(coffeeButton);
      
      await waitFor(() => {
        expect(onQuickLog).toHaveBeenCalledWith(MockQuickLogs[0]);
      });
      
      // Check for loading state
      expect(coffeeButton).toHaveAttribute('aria-busy', 'true');
      
      // Check for success toast
      await waitFor(() => {
        expect(MockToast.success).toHaveBeenCalledWith('Activity logged!');
      });
    });

    test('should handle long press for edit', async () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const button = screen.getByText('Morning coffee');
      
      // Simulate long press
      fireEvent.mouseDown(button);
      await new Promise(resolve => setTimeout(resolve, 600));
      fireEvent.mouseUp(button);
      
      // Check for edit modal
      await waitFor(() => {
        expect(screen.getByText(/edit quick log/i)).toBeInTheDocument();
      });
    });

    test('should show visual feedback on interaction', async () => {
      const { container } = render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const button = container.querySelector('.quick-log-button');
      
      // Hover
      fireEvent.mouseEnter(button!);
      expect(button).toHaveClass('hover:border-blue-500');
      
      // Active
      fireEvent.mouseDown(button!);
      expect(button).toHaveClass('active:scale-95');
    });
  });

  describe('Data Management Tests', () => {
    test('should track frequency correctly', async () => {
      const { rerender } = render(<CommonLogsBar quickLogs={[]} />);
      
      // Simulate logging same activity 3 times
      const newLog: QuickLog = {
        ...MockQuickLogs[0],
        frequency: 3,
      };
      
      rerender(<CommonLogsBar quickLogs={[newLog]} />);
      
      // Should now appear in quick logs
      expect(screen.getByText('Morning coffee')).toBeInTheDocument();
    });

    test('should persist quick logs in localStorage', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      expect(MockLocalStorage.setItem).toHaveBeenCalledWith(
        'feelsharper_quick_logs',
        expect.any(String)
      );
    });

    test('should sync with database', async () => {
      MockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(MockQuickLogs)
      );
      
      render(<CommonLogsBar userId="test-user" />);
      
      // Wait for sync
      await waitFor(() => {
        expect(MockParseAPI).toHaveBeenCalledWith({
          endpoint: '/api/quick-logs/sync',
          userId: 'test-user',
        });
      });
    });
  });

  describe('Customization Tests', () => {
    test('should allow pinning logs', async () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const button = screen.getByText('Morning coffee');
      
      // Right click for context menu
      fireEvent.contextMenu(button);
      
      const pinOption = await screen.findByText('Pin to quick logs');
      fireEvent.click(pinOption);
      
      // Check that it's now pinned
      expect(button.closest('.quick-log-button')).toHaveClass('pinned');
    });

    test('should respect max display setting', () => {
      const manyLogs = Array.from({ length: 15 }, (_, i) => ({
        ...MockQuickLogs[0],
        id: `${i}`,
        activity: `Activity ${i}`,
      }));
      
      render(<CommonLogsBar quickLogs={manyLogs} maxDisplay={5} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });
  });

  describe('Performance Tests', () => {
    test('should render within 100ms', () => {
      const start = performance.now();
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });

    test('should respond to tap within 50ms', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const button = screen.getByText('Morning coffee');
      const start = performance.now();
      
      fireEvent.click(button);
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Accessibility Tests', () => {
    test('should be keyboard navigable', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const buttons = screen.getAllByRole('button');
      
      // Tab to first button
      userEvent.tab();
      expect(buttons[0]).toHaveFocus();
      
      // Arrow to next
      userEvent.keyboard('{ArrowRight}');
      expect(buttons[1]).toHaveFocus();
    });

    test('should have ARIA labels', () => {
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const button = screen.getByText('Morning coffee');
      expect(button).toHaveAttribute('aria-label', 'Quick log: Morning coffee');
      expect(button).toHaveAttribute('role', 'button');
    });

    test('should meet touch target size', () => {
      const { container } = render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const buttons = container.querySelectorAll('.quick-log-button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle API failures gracefully', async () => {
      const onQuickLog = jest.fn().mockRejectedValue(new Error('API Error'));
      
      render(
        <CommonLogsBar 
          quickLogs={MockQuickLogs} 
          onQuickLog={onQuickLog}
        />
      );
      
      const button = screen.getByText('Morning coffee');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(MockToast.error).toHaveBeenCalledWith(
          'Failed to log activity. Please try again.'
        );
      });
    });

    test('should handle localStorage quota exceeded', () => {
      MockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      // Should clear old data and retry
      expect(MockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Responsive Design Tests', () => {
    test('should adapt to mobile layout', () => {
      // Mock mobile viewport
      window.innerWidth = 375;
      
      const { container } = render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const bar = container.querySelector('.common-logs-bar');
      expect(bar).toHaveClass('overflow-x-auto');
      expect(bar).toHaveClass('flex-nowrap');
    });

    test('should adapt to desktop layout', () => {
      // Mock desktop viewport
      window.innerWidth = 1440;
      
      const { container } = render(<CommonLogsBar quickLogs={MockQuickLogs} />);
      
      const bar = container.querySelector('.common-logs-bar');
      expect(bar).toHaveClass('grid');
      expect(bar).toHaveClass('grid-cols-auto-fit');
    });
  });
});