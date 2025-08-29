/**
 * Sport-Specific Dashboard Preset Types
 * Following TDD Step 3: Interface Definitions
 */

import { UserPersonaType, DASHBOARD_WIDGETS } from '@/lib/ai-coach/types';

/**
 * Dashboard preset configuration for a specific sport/persona
 */
export interface DashboardPreset {
  id: string;
  name: string;
  persona: UserPersonaType;
  description: string;
  primaryWidgets: WidgetConfig[];
  secondaryWidgets: WidgetConfig[];
  layout: LayoutConfig;
  customizable: boolean;
  iconName?: string;
}

/**
 * Individual widget configuration
 */
export interface WidgetConfig {
  id: string;
  type: DASHBOARD_WIDGETS;
  size: WidgetSize;
  position: WidgetPosition;
  refreshInterval?: number; // in milliseconds
  dataSource: string;
  title?: string;
  customSettings?: Record<string, any>;
}

/**
 * Widget size options
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Widget position in grid
 */
export interface WidgetPosition {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
}

/**
 * Dashboard layout configuration
 */
export interface LayoutConfig {
  type: 'grid' | 'list' | 'masonry';
  columns: number;
  gap: number; // in pixels
  responsive: boolean;
  breakpoints?: ResponsiveBreakpoint[];
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveBreakpoint {
  maxWidth: number;
  columns: number;
  gap?: number;
}

/**
 * Widget component props
 */
export interface WidgetProps {
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onSettings?: () => void;
  onRemove?: () => void;
}

/**
 * Dashboard context for managing state
 */
export interface DashboardContextType {
  currentPreset: DashboardPreset | null;
  availablePresets: DashboardPreset[];
  widgets: WidgetConfig[];
  selectPreset: (presetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  addWidget: (widget: WidgetConfig) => void;
  removeWidget: (widgetId: string) => void;
  saveCustomLayout: () => void;
  resetToDefault: () => void;
}

/**
 * Widget data fetch result
 */
export interface WidgetDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Preset selector props
 */
export interface PresetSelectorProps {
  currentPersona: UserPersonaType;
  onSelect: (preset: DashboardPreset) => void;
  allowCustom?: boolean;
}

/**
 * Widget catalog item for adding new widgets
 */
export interface WidgetCatalogItem {
  type: DASHBOARD_WIDGETS;
  name: string;
  description: string;
  category: WidgetCategory;
  requiredData: string[];
  defaultSize: WidgetSize;
  isPremium?: boolean;
}

/**
 * Widget categories for organization
 */
export type WidgetCategory = 
  | 'performance'
  | 'nutrition'
  | 'recovery'
  | 'progress'
  | 'social'
  | 'analytics';

/**
 * Dashboard customization state
 */
export interface CustomizationState {
  isEditing: boolean;
  selectedWidget: string | null;
  draggedWidget: string | null;
  hoveredPosition: WidgetPosition | null;
  unsavedChanges: boolean;
}