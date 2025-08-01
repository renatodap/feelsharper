import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Feel Sharper Brand Colors
        'brand-navy': '#0F172A',
        'brand-amber': '#F59E0B',
        'brand-amber-light': '#FEF3C7',
        'brand-gray-50': '#F8FAFC',
        'brand-gray-100': '#F1F5F9',
        'brand-gray-200': '#E2E8F0',
        'brand-gray-300': '#CBD5E1',
        'brand-gray-400': '#94A3B8',
        'brand-gray-500': '#64748B',
        'brand-gray-600': '#475569',
        'brand-gray-700': '#334155',
        'brand-gray-800': '#1E293B',
        'brand-gray-900': '#0F172A',
        // Standard Tailwind colors for compatibility
        'amber-50': '#FFFBEB',
        'amber-100': '#FEF3C7',
        'amber-200': '#FDE68A',
        'amber-300': '#FCD34D',
        'amber-400': '#FBBF24',
        'amber-500': '#F59E0B',
        'amber-600': '#D97706',
        'amber-700': '#B45309',
        'amber-800': '#92400E',
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
  ],
}

export default config
