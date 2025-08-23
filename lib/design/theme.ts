export const theme = {
  colors: {
    // Primary brand colors - Electric blue gradient
    primary: {
      50: '#E8F4FF',
      100: '#BEE3FF',
      200: '#7CC7FF',
      300: '#3AABFF',
      400: '#0095FF',
      500: '#0080FF', // Main brand blue
      600: '#0066CC',
      700: '#004D99',
      800: '#003366',
      900: '#001A33',
    },
    
    // Dark mode optimized grays
    dark: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617', // Ultra dark background
    },
    
    // Glass morphism backgrounds
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      heavy: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.15)',
    },
    
    // Semantic colors
    success: {
      light: '#4ADE80',
      main: '#22C55E',
      dark: '#16A34A',
    },
    warning: {
      light: '#FDE047',
      main: '#FACC15',
      dark: '#EAB308',
    },
    error: {
      light: '#FCA5A5',
      main: '#EF4444',
      dark: '#DC2626',
    },
    
    // Gradient definitions
    gradients: {
      brand: 'linear-gradient(135deg, #667EEA 0%, #0080FF 50%, #00D4FF 100%)',
      electric: 'linear-gradient(135deg, #0080FF 0%, #00D4FF 100%)',
      dark: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      success: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
      glow: 'radial-gradient(circle at center, rgba(0,128,255,0.3) 0%, transparent 70%)',
    },
  },
  
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", Monaco, monospace',
      display: '"Outfit", "Inter", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
  },
  
  animation: {
    // Smooth transitions
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    
    // Easing functions
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    
    // Keyframes
    keyframes: {
      float: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `,
      glow: `
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `,
      shimmer: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `,
      fadeInUp: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 30px rgba(0, 128, 255, 0.3)',
    glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
  },
  
  blur: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
};

export default theme;