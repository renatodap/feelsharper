'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DashboardPreset, WidgetConfig, DashboardContextType } from '@/lib/dashboard/types';
import { getPresetByPersona, getDefaultPresets } from '@/lib/dashboard/presets';
import { UserPersonaType } from '@/lib/ai-coach/types';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: React.ReactNode;
  initialPersona?: UserPersonaType;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children, 
  initialPersona = UserPersonaType.ENDURANCE 
}) => {
  const [currentPreset, setCurrentPreset] = useState<DashboardPreset | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [customLayouts, setCustomLayouts] = useState<Record<string, WidgetConfig[]>>({});

  // Initialize with default preset based on persona
  useEffect(() => {
    const defaultPreset = getPresetByPersona(initialPersona);
    if (defaultPreset && !currentPreset) {
      setCurrentPreset(defaultPreset);
      setWidgets([...defaultPreset.primaryWidgets, ...defaultPreset.secondaryWidgets]);
    }
  }, [initialPersona, currentPreset]);

  // Load saved layouts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-custom-layouts');
    if (saved) {
      try {
        setCustomLayouts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom layouts:', e);
      }
    }
  }, []);

  const selectPreset = useCallback((presetId: string) => {
    const preset = getDefaultPresets().find(p => p.id === presetId);
    if (preset) {
      setCurrentPreset(preset);
      
      // Check if there's a custom layout for this preset
      const customLayout = customLayouts[presetId];
      if (customLayout) {
        setWidgets(customLayout);
      } else {
        setWidgets([...preset.primaryWidgets, ...preset.secondaryWidgets]);
      }
    }
  }, [customLayouts]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, ...updates }
        : widget
    ));
  }, []);

  const addWidget = useCallback((widget: WidgetConfig) => {
    setWidgets(prev => [...prev, widget]);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const saveCustomLayout = useCallback(() => {
    if (!currentPreset) return;
    
    const newLayouts = {
      ...customLayouts,
      [currentPreset.id]: widgets
    };
    
    setCustomLayouts(newLayouts);
    localStorage.setItem('dashboard-custom-layouts', JSON.stringify(newLayouts));
  }, [currentPreset, widgets, customLayouts]);

  const resetToDefault = useCallback(() => {
    if (!currentPreset) return;
    
    setWidgets([...currentPreset.primaryWidgets, ...currentPreset.secondaryWidgets]);
    
    // Remove custom layout for this preset
    const newLayouts = { ...customLayouts };
    delete newLayouts[currentPreset.id];
    setCustomLayouts(newLayouts);
    localStorage.setItem('dashboard-custom-layouts', JSON.stringify(newLayouts));
  }, [currentPreset, customLayouts]);

  const value: DashboardContextType = {
    currentPreset,
    availablePresets: getDefaultPresets(),
    widgets,
    selectPreset,
    updateWidget,
    addWidget,
    removeWidget,
    saveCustomLayout,
    resetToDefault
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};