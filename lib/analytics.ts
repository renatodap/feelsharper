import posthog from "posthog-js";

/**
 * MVP Analytics Events
 * Tracks only essential user interactions for MVP
 */
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Guard: if no PostHog key, fallback to console.info for QA
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === "undefined") {
    console.info("event", event, properties || {});
    return;
  }

  // Track event with PostHog if available
  if (posthog && posthog.capture) {
    posthog.capture(event, properties);
  } else {
    console.info("event", event, properties || {});
  }
};

/**
 * MVP Event Constants
 * Only the specified events for MVP tracking
 */
export const ANALYTICS_EVENTS = {
  LOG_PARSE_START: "log_parse_start",
  LOG_PARSE_CONFIRM: "log_parse_confirm", 
  LOG_MANUAL_SUBMIT: "log_manual_submit",
  INSIGHT_EXPAND: "insight_expand",
  INSIGHT_SNOOZE: "insight_snooze",
  COACH_QA_SUBMIT: "coach_qa_submit",
  DASHBOARD_PRESET_OVERRIDE: "dashboard_preset_override",
} as const;

/**
 * Track log parsing started
 */
export const trackLogParseStart = (properties?: { source?: string }) => {
  trackEvent(ANALYTICS_EVENTS.LOG_PARSE_START, properties);
};

/**
 * Track log parsing confirmed
 */
export const trackLogParseConfirm = (properties?: { itemCount?: number }) => {
  trackEvent(ANALYTICS_EVENTS.LOG_PARSE_CONFIRM, properties);
};

/**
 * Track manual log submission
 */
export const trackLogManualSubmit = (properties?: { type?: string }) => {
  trackEvent(ANALYTICS_EVENTS.LOG_MANUAL_SUBMIT, properties);
};

/**
 * Track insight expansion
 */
export const trackInsightExpand = (properties?: { insightId?: string; type?: string }) => {
  trackEvent(ANALYTICS_EVENTS.INSIGHT_EXPAND, properties);
};

/**
 * Track insight snooze
 */
export const trackInsightSnooze = (properties?: { insightId?: string; duration?: string }) => {
  trackEvent(ANALYTICS_EVENTS.INSIGHT_SNOOZE, properties);
};

/**
 * Track coach Q&A submission
 */
export const trackCoachQASubmit = (properties?: { questionLength?: number }) => {
  trackEvent(ANALYTICS_EVENTS.COACH_QA_SUBMIT, properties);
};

/**
 * Track dashboard preset override
 */
export const trackDashboardPresetOverride = (properties?: { fromPreset?: string; toPreset?: string }) => {
  trackEvent(ANALYTICS_EVENTS.DASHBOARD_PRESET_OVERRIDE, properties);
};