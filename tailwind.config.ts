import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Feel Sharper Brand Colors
        'sharp-blue': '#1479FF', // Primary - Trust, focus, performance
        'energy-orange': '#FF6B35', // Secondary - Motivation, action
        'steel-gray': '#1F2A30', // Secondary - Strength, stability
        'success-green': '#1FCC79', // Tertiary - Positive progress
        'alert-red': '#FF3B30', // Tertiary - Warnings, critical data
        'clean-white': '#FFFFFF', // Clarity, space
        
        // Legacy mappings (for compatibility)
        'brand': {
          navy: '#1F2A30', // Map to steel-gray
          amber: '#FF6B35', // Map to energy-orange
          'amber-light': '#FFF4F0', // Light variant of energy-orange
          primary: '#1479FF', // Sharp Blue
        },
        // Neutral palette
        'neutral': {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // Semantic colors
        'success': '#1FCC79', // Feel Sharper Success Green
        'warning': '#FF6B35', // Energy Orange for warnings
        'error': '#FF3B30', // Feel Sharper Alert Red
        'info': '#1479FF', // Sharp Blue for info
        'amber-900': '#78350F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
