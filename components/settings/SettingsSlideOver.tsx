/**
 * Settings SlideOver Component
 * TDD Step 5: Feature Implementation
 * 
 * Slide-over settings panel accessible from avatar click.
 * NO MOCKS IN PRODUCTION CODE as per TDD requirements.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, User, LogOut, Download, Trash2, Check } from 'lucide-react';
import type { SettingsSlideOverProps, UserPreferences } from '@/lib/types/mvp';

export default function SettingsSlideOver({
  isOpen,
  onClose,
  user,
  preferences: initialPreferences,
  onSave,
  onExport,
  onDelete
}: SettingsSlideOverProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slideOverRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setPreferences(initialPreferences);
    setIsDirty(false);
  }, [initialPreferences]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      slideOverRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handlePreferenceChange = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleGoalChange = (goalKey: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      goals_json: {
        ...prev.goals_json,
        [goalKey]: value
      }
    }));
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate goals
    if (preferences.goals_json?.sleep_hours) {
      const hours = Number(preferences.goals_json.sleep_hours);
      if (hours < 0 || hours > 24) {
        newErrors.sleep = 'Sleep hours must be between 0 and 24';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(preferences);
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreferences(initialPreferences);
    setIsDirty(false);
    setErrors({});
    onClose();
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        data-testid="slideover-backdrop"
      />

      {/* Slide-over panel */}
      <div
        ref={slideOverRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#1A1A1B] border-l border-white/10 shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Settings"
        tabIndex={-1}
        data-testid="settings-slideover"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Profile Section */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={user.name || ''}
                    onChange={(e) => console.log('Name change not implemented')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400">
                    {user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {user.provider === 'google' ? 'Google' : 'Email'}
                  </span>
                </div>
              </div>
            </section>

            {/* Units & Display */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Units & Display</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Weight</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="weight"
                        value="lbs"
                        checked={preferences.units_weight === 'lbs'}
                        onChange={(e) => handlePreferenceChange({ units_weight: 'lbs' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">lbs</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="weight"
                        value="kg"
                        checked={preferences.units_weight === 'kg'}
                        onChange={(e) => handlePreferenceChange({ units_weight: 'kg' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">kg</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Distance</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="distance"
                        value="mi"
                        checked={preferences.units_distance === 'mi'}
                        onChange={(e) => handlePreferenceChange({ units_distance: 'mi' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">mi</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="distance"
                        value="km"
                        checked={preferences.units_distance === 'km'}
                        onChange={(e) => handlePreferenceChange({ units_distance: 'km' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">km</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Volume</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="volume"
                        value="oz"
                        checked={preferences.units_volume === 'oz'}
                        onChange={(e) => handlePreferenceChange({ units_volume: 'oz' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">oz</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="volume"
                        value="ml"
                        checked={preferences.units_volume === 'ml'}
                        onChange={(e) => handlePreferenceChange({ units_volume: 'ml' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">ml</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Time Format</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeFormat"
                        value="12h"
                        checked={preferences.time_format === '12h'}
                        onChange={(e) => handlePreferenceChange({ time_format: '12h' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">12h</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeFormat"
                        value="24h"
                        checked={preferences.time_format === '24h'}
                        onChange={(e) => handlePreferenceChange({ time_format: '24h' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">24h</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Goals */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Goals</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="targetWeight" className="block text-sm text-gray-300 mb-1">
                    Target weight ({preferences.units_weight})
                  </label>
                  <input
                    id="targetWeight"
                    type="number"
                    value={preferences.goals_json?.target_weight || ''}
                    onChange={(e) => handleGoalChange('target_weight', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>

                <div>
                  <label htmlFor="trainingDays" className="block text-sm text-gray-300 mb-1">
                    Weekly training days
                  </label>
                  <input
                    id="trainingDays"
                    type="number"
                    min="0"
                    max="7"
                    value={preferences.goals_json?.weekly_training_days || ''}
                    onChange={(e) => handleGoalChange('weekly_training_days', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>

                <div>
                  <label htmlFor="sleepHours" className="block text-sm text-gray-300 mb-1">
                    Sleep target (hours/night)
                  </label>
                  <input
                    id="sleepHours"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={preferences.goals_json?.sleep_hours || ''}
                    onChange={(e) => handleGoalChange('sleep_hours', Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none ${
                      errors.sleep ? 'border-red-500' : 'border-white/10 focus:border-[#4169E1]'
                    }`}
                  />
                  {errors.sleep && (
                    <p className="text-xs text-red-400 mt-1">{errors.sleep}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="hydration" className="block text-sm text-gray-300 mb-1">
                    Hydration target (L/day)
                  </label>
                  <input
                    id="hydration"
                    type="number"
                    min="0"
                    step="0.5"
                    value={preferences.goals_json?.hydration_liters || ''}
                    onChange={(e) => handleGoalChange('hydration_liters', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="persona" className="block text-sm text-gray-300 mb-1">
                    Persona preset
                  </label>
                  <select
                    id="persona"
                    value={preferences.persona_preset}
                    onChange={(e) => handlePreferenceChange({ persona_preset: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="tennis">Tennis</option>
                    <option value="weight">Weight Management</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Coaching style</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="coaching"
                        value="direct"
                        checked={preferences.coaching_style === 'direct'}
                        onChange={(e) => handlePreferenceChange({ coaching_style: 'direct' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">Direct</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="coaching"
                        value="supportive"
                        checked={preferences.coaching_style === 'supportive'}
                        onChange={(e) => handlePreferenceChange({ coaching_style: 'supportive' })}
                        className="text-[#4169E1]"
                      />
                      <span className="text-sm text-white">Supportive</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="reminder" className="block text-sm text-gray-300 mb-1">
                    Daily reminder
                  </label>
                  <input
                    id="reminder"
                    type="time"
                    value={preferences.reminder_time || ''}
                    onChange={(e) => handlePreferenceChange({ reminder_time: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
              </div>
            </section>

            {/* Data & Privacy */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <button
                  onClick={onExport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export data (JSON)
                </button>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete my data
                  </button>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400 mb-3">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Your data is encrypted and stored securely. We never share your personal information.
                </p>
              </div>
            </section>

            {/* Logout */}
            <section>
              <button
                onClick={() => console.log('Logout not implemented')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="flex-1 px-4 py-2 bg-[#4169E1] hover:bg-[#4169E1]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}