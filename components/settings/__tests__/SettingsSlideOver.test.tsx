/**
 * Settings SlideOver Tests
 * TDD Step 4: Test Implementation (with mocks - failing tests)
 * 
 * IMPORTANT: These tests use mocks and are expected to FAIL initially.
 * They will pass once the actual implementation is complete (TDD Step 5).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsSlideOver from '../SettingsSlideOver';
import type { UserPreferences, SettingsSlideOverProps } from '@/lib/types/mvp';

// Mock user data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  provider: 'email'
};

// Mock preferences
const mockPreferences: UserPreferences = {
  user_id: 'test-user-id',
  units_weight: 'lbs',
  units_distance: 'mi',
  units_volume: 'oz',
  time_format: '12h',
  persona_preset: 'auto',
  goals_json: {
    target_weight: 150,
    weekly_training_days: 4,
    sleep_hours: 8,
    hydration_liters: 2.5
  },
  coaching_style: 'direct',
  reminder_time: '08:00',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Default props
const defaultProps: SettingsSlideOverProps = {
  isOpen: true,
  onClose: jest.fn(),
  user: mockUser,
  preferences: mockPreferences,
  onSave: jest.fn(() => Promise.resolve()),
  onExport: jest.fn(() => Promise.resolve()),
  onDelete: jest.fn(() => Promise.resolve())
};

describe('SettingsSlideOver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SlideOver Behavior', () => {
    test('Should slide from right on avatar click', () => {
      const { container } = render(<SettingsSlideOver {...defaultProps} />);
      
      const slideOver = container.querySelector('[data-testid="settings-slideover"]');
      expect(slideOver).toHaveClass('translate-x-0');
    });

    test('Should close on X or outside click', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      // Click X button
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      
      // Click outside
      const backdrop = screen.getByTestId('slideover-backdrop');
      fireEvent.click(backdrop);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
    });

    test('Should trap focus when open', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const firstFocusable = screen.getAllByRole('button')[0];
      const lastFocusable = screen.getAllByRole('button')[screen.getAllByRole('button').length - 1];
      
      // Focus should be trapped within the slideover
      lastFocusable.focus();
      await userEvent.tab();
      
      expect(document.activeElement).toBe(firstFocusable);
    });

    test('Should prevent body scroll when open', () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      // Cleanup and close
      const { rerender } = render(<SettingsSlideOver {...defaultProps} isOpen={false} />);
      rerender(<SettingsSlideOver {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).not.toBe('hidden');
    });

    test('Should animate smoothly', () => {
      const { container } = render(<SettingsSlideOver {...defaultProps} />);
      
      const slideOver = container.querySelector('[data-testid="settings-slideover"]');
      expect(slideOver).toHaveClass('transition-transform', 'duration-300');
    });
  });

  describe('Profile Section', () => {
    test('Should display current user profile', () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument(); // Provider badge
    });

    test('Should allow name editing', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');
      
      expect(nameInput).toHaveValue('New Name');
    });

    test('Should show provider badges', () => {
      const googleProps = {
        ...defaultProps,
        user: { ...mockUser, provider: 'google' }
      };
      
      render(<SettingsSlideOver {...googleProps} />);
      
      expect(screen.getByText(/Google/i)).toBeInTheDocument();
    });

    test('Should have logout button', () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    });
  });

  describe('Units & Display', () => {
    test('Should update weight units', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const kgRadio = screen.getByLabelText(/kg/i);
      fireEvent.click(kgRadio);
      
      expect(kgRadio).toBeChecked();
    });

    test('Should update distance units', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const kmRadio = screen.getByLabelText(/km/i);
      fireEvent.click(kmRadio);
      
      expect(kmRadio).toBeChecked();
    });

    test('Should update volume units', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const mlRadio = screen.getByLabelText(/ml/i);
      fireEvent.click(mlRadio);
      
      expect(mlRadio).toBeChecked();
    });

    test('Should update time format', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const format24h = screen.getByLabelText(/24h/i);
      fireEvent.click(format24h);
      
      expect(format24h).toBeChecked();
    });
  });

  describe('Goals Section', () => {
    test('Should save goals', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const weightGoal = screen.getByLabelText(/Target weight/i);
      await user.clear(weightGoal);
      await user.type(weightGoal, '145');
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            goals_json: expect.objectContaining({
              target_weight: 145
            })
          })
        );
      });
    });

    test('Should set weekly training days target', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const trainingDays = screen.getByLabelText(/Weekly training days/i);
      await user.clear(trainingDays);
      await user.type(trainingDays, '5');
      
      expect(trainingDays).toHaveValue(5);
    });

    test('Should set sleep target', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const sleepHours = screen.getByLabelText(/Sleep target/i);
      await user.clear(sleepHours);
      await user.type(sleepHours, '7.5');
      
      expect(sleepHours).toHaveValue(7.5);
    });

    test('Should set hydration target', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const hydration = screen.getByLabelText(/Hydration target/i);
      await user.clear(hydration);
      await user.type(hydration, '3');
      
      expect(hydration).toHaveValue(3);
    });
  });

  describe('Preferences', () => {
    test('Should change persona preset', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const personaSelect = screen.getByLabelText(/Persona preset/i);
      fireEvent.change(personaSelect, { target: { value: 'tennis' } });
      
      expect(personaSelect).toHaveValue('tennis');
    });

    test('Should change coaching style', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const supportiveRadio = screen.getByLabelText(/Supportive/i);
      fireEvent.click(supportiveRadio);
      
      expect(supportiveRadio).toBeChecked();
    });

    test('Should set reminder time', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const reminderTime = screen.getByLabelText(/Daily reminder/i);
      await user.clear(reminderTime);
      await user.type(reminderTime, '09:30');
      
      expect(reminderTime).toHaveValue('09:30');
    });
  });

  describe('Data & Privacy', () => {
    test('Should export data as JSON', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /Export data/i });
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(defaultProps.onExport).toHaveBeenCalled();
      });
    });

    test('Should soft delete account with confirmation', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /Delete my data/i });
      fireEvent.click(deleteButton);
      
      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /Yes, delete/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(defaultProps.onDelete).toHaveBeenCalled();
      });
    });

    test('Should show privacy note', () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      expect(screen.getByText(/Your data is encrypted/i)).toBeInTheDocument();
    });
  });

  describe('Save/Cancel Behavior', () => {
    test('Should save preferences on Save button', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      // Make some changes
      const nameInput = screen.getByLabelText(/Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      
      const kgRadio = screen.getByLabelText(/kg/i);
      fireEvent.click(kgRadio);
      
      // Save
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            units_weight: 'kg'
          })
        );
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    test('Should discard changes on Cancel', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      // Make changes
      const nameInput = screen.getByLabelText(/Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Temporary Name');
      
      // Cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onSave).not.toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    test('Should validate required fields', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      // Clear required field
      const nameInput = screen.getByLabelText(/Name/i);
      await user.clear(nameInput);
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    test('Should validate numeric ranges', async () => {
      const user = userEvent.setup();
      render(<SettingsSlideOver {...defaultProps} />);
      
      const sleepHours = screen.getByLabelText(/Sleep target/i);
      await user.clear(sleepHours);
      await user.type(sleepHours, '25'); // Invalid - more than 24 hours
      
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Sleep hours must be between 0 and 24/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('Should have proper ARIA labels', () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      expect(screen.getByRole('dialog', { name: /Settings/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Close settings/i)).toBeInTheDocument();
    });

    test('Should support keyboard navigation', async () => {
      render(<SettingsSlideOver {...defaultProps} />);
      
      // Tab through elements
      await userEvent.tab();
      expect(document.activeElement).toHaveAttribute('role');
      
      // Escape key closes
      await userEvent.keyboard('{Escape}');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});