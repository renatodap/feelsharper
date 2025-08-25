# FeelSharper Brand Identity

## Core Philosophy
**"Premium performance through simplicity"**

### Brand Personality
- **Intelligent** but approachable
- **Premium** but not pretentious  
- **Modern** but timeless
- **Bold** but refined
- **Technical** but human

## Color Palette

### Primary Colors
```css
/* Deep Space Black - Our canvas */
--black-primary: #0A0A0B;    /* Almost black with slight blue */
--black-elevated: #0F0F10;   /* Raised surfaces */
--black-card: #141415;       /* Card backgrounds */

/* Electric Blue - Our signature */
--blue-primary: #0EA5E9;     /* Sky-500 - Vibrant but not harsh */
--blue-light: #38BDF8;       /* Sky-400 - Accents */
--blue-dark: #0284C7;        /* Sky-600 - Depth */
--blue-glow: rgba(14, 165, 233, 0.5);

/* Supporting Colors */
--white: #FFFFFF;
--gray-100: #F1F5F9;         /* Nearly white */
--gray-400: #94A3B8;         /* Muted text */
--gray-600: #475569;         /* Secondary text */
--gray-800: #1E293B;         /* Borders */

/* Semantic Colors */
--success: #10B981;          /* Emerald-500 */
--warning: #F59E0B;          /* Amber-500 */
--error: #EF4444;            /* Red-500 */
```

### Gradients
```css
/* Primary gradient - Subtle and sophisticated */
--gradient-primary: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);

/* Glow gradient - For special elements */
--gradient-glow: radial-gradient(circle at center, #0EA5E9 0%, transparent 70%);

/* Text gradient - For headlines */
--gradient-text: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%);
```

## Typography

### Font Stack
```css
/* Display - For hero headlines */
--font-display: 'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif;

/* Body - For everything else */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Mono - For data, numbers */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale
```css
/* Display */
--text-hero: clamp(3rem, 8vw, 6rem);      /* 48-96px */
--text-display: clamp(2.5rem, 6vw, 4rem); /* 40-64px */

/* Headings */
--text-h1: 3rem;        /* 48px */
--text-h2: 2.25rem;     /* 36px */
--text-h3: 1.875rem;    /* 30px */
--text-h4: 1.5rem;      /* 24px */

/* Body */
--text-lg: 1.125rem;    /* 18px */
--text-base: 1rem;      /* 16px */
--text-sm: 0.875rem;    /* 14px */
--text-xs: 0.75rem;     /* 12px */
```

### Font Weights
- **900**: Hero headlines only
- **700**: Headlines, buttons
- **600**: Subheadings, emphasis
- **400**: Body text
- **500**: UI elements

## Visual Language

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px - Subtle */
--radius-md: 0.5rem;    /* 8px - Default */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Buttons */
--radius-2xl: 1.5rem;   /* 24px - Large elements */
```

### Shadows
```css
/* Subtle depth */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.5);

/* Glow effects */
--shadow-glow: 0 0 40px rgba(14, 165, 233, 0.3);
--shadow-glow-sm: 0 0 20px rgba(14, 165, 233, 0.2);
```

### Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## Design Principles

### 1. **Depth Through Layering**
- Use elevation (lighter blacks) instead of borders
- Subtle shadows for depth
- Avoid heavy glass morphism

### 2. **Motion with Purpose**
- Smooth, fast transitions (200-300ms)
- Scale and opacity for emphasis
- No gratuitous animations

### 3. **Premium Through Restraint**
- Lots of negative space
- Minimal color usage (mostly monochrome)
- Blue only for important actions

### 4. **Clarity First**
- High contrast for readability
- Clear visual hierarchy
- Consistent spacing

### 5. **Modern but Timeless**
- Avoid trendy effects
- Classic layout principles
- Focus on typography and spacing

## Component Patterns

### Buttons
- **Primary**: Blue gradient, white text, no border
- **Secondary**: Dark gray bg, white text, subtle border
- **Ghost**: Transparent, gray text, hover reveals bg

### Cards
- Dark elevated background
- Subtle border (gray-800)
- Consistent padding (24px)
- Subtle shadow for depth

### Inputs
- Dark background
- Blue focus glow
- Generous padding
- Clear placeholder text

### Navigation
- Fixed or sticky
- Blur background on scroll
- Minimal height (64px)
- Logo + essential links only

## Voice & Tone

### Headlines
- **Bold statements** without hype
- **Direct benefits** not features
- **Conversational** not corporate

### Body Copy
- **Clear and concise**
- **Second person** (you, your)
- **Active voice**
- **No jargon**

### CTAs
- **Action-oriented** (Start Free, Try Now)
- **Specific** not generic
- **Urgent** but not pushy

## Examples

### Good ✅
- "Track workouts by talking"
- "Your AI fitness companion"
- "Start free. Upgrade anytime."

### Bad ❌
- "Revolutionary paradigm shift"
- "Leverage synergies"
- "Sign up now!!!"

---

This brand identity creates a premium, modern feel while staying approachable and human. The key is restraint - using color sparingly, focusing on typography and spacing, and letting the content breathe.