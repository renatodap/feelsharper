export const posthogConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  loaded: (posthog: any) => {
    if (process.env.NODE_ENV === 'development') posthog.debug();
  },
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  disable_session_recording: process.env.NODE_ENV === 'development',
};