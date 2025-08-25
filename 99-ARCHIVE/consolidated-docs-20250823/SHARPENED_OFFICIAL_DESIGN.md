# 🎯 SHARPENED OFFICIAL DESIGN SYSTEM

## 📍 BRAND GUIDE LOCATION
**OFFICIAL SOURCE**: `C:\Users\pradord\Documents\Projects\Sharpened\brand-guide.html`
**Last Updated**: 2025-08-22
**Status**: ACTIVE - This is the ONLY design reference

## 🎨 OFFICIAL FONT SYSTEM

### Typography (From Brand Guide)
```css
/* Primary Font Stack - SF Pro Display for headings */
--font-heading: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body Font - Inter for readability */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Code/Mono Font */
--font-mono: 'SF Mono', Monaco, 'Fira Code', monospace;
```

### Font Implementation
```html
<!-- Google Fonts for Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
--text-8xl: 6rem;      /* 96px */
--text-9xl: 8rem;      /* 128px */
```

## 🌈 COLOR SYSTEM

### Core Brand Colors
```css
/* Sharpened Base */
--sharpened-black: #000000;
--sharpened-void: #0A0A0A;
--sharpened-dark: #111111;
--sharpened-coal: #1A1A1A;
--sharpened-charcoal: #2A2A2A;
--sharpened-gray: #666666;
--sharpened-light-gray: #999999;
--sharpened-white: #FFFFFF;

/* FeelSharper Lightning Colors */
--feel-primary: #4169E1;    /* Royal Blue */
--feel-secondary: #00BFFF;  /* Deep Sky Blue */
--feel-accent: #87CEEB;     /* Sky Blue */
```

## ⚡ DESIGN ELEMENTS

### Lightning Logo
- Always use the lightning bolt SVG
- Primary color: --feel-primary (#4169E1)
- Subtle animations with pulse/glow effects
- Place strategically, not everywhere

### Sharp Angular Cuts
```css
/* Standard sharp container */
clip-path: polygon(
  0 0, 
  calc(100% - 30px) 0, 
  100% 30px, 
  100% 100%, 
  30px 100%, 
  0 calc(100% - 30px)
);
```

### Glass Morphism
```css
--glass-blur: 10px;
--glass-opacity: 0.1;
--glass-border: rgba(255, 255, 255, 0.1);
```

## 📱 5-PAGE MVP STRUCTURE (Phase 7)

### Page 1: AI Coach Dashboard (Habit Central)
**Route**: `/user/coach`
- Top insights with celebration animations
- Today's mission (identity reinforcement)
- Progress visualization (streaks, badges, bars)
- Social proof elements

### Page 2: Quick Log (Frictionless Tracking)
**Route**: `/user/log`
- Natural language input with auto-complete
- Voice input as primary method
- Common logs with habit signatures
- Smart defaults based on context

### Page 3: Personal Dashboard (Progress & Competence)
**Route**: `/user/dashboard`
- Habit heat maps showing consistency
- Personal records and trends
- Goal gradient visualization
- Gamified elements (XP, levels)

### Page 4: Coach Chat (Relatedness & Support)
**Route**: `/user/chat`
- Empathetic conversation UI
- Motivational interviewing techniques
- Lapse recovery support
- Identity-based goal setting

### Page 5: Profile & Community (Social Accountability)
**Route**: `/user/profile`
- Motivation style preferences
- Accountability partner setup
- Public commitment features
- Community challenges (opt-in)

## 🚫 DO NOT USE
- ❌ Russo One font (was temporary choice)
- ❌ Orbitron font (was temporary choice)
- ❌ Generic dashboard layouts
- ❌ Standard form inputs (use sharp cuts)
- ❌ Rounded corners (always angular)

## ✅ ALWAYS USE
- ✅ SF Pro Display or fallback to system fonts for headings
- ✅ Inter for body text
- ✅ Sharp angular clip-paths
- ✅ Dark backgrounds (#000000 or #0A0A0A)
- ✅ Lightning blue accent (#4169E1)
- ✅ Glass morphism for depth
- ✅ Subtle animations (not distracting)

## 🎯 KEY PRINCIPLES
1. **Sharp & Angular**: Every container has diagonal cuts
2. **Dark & Dramatic**: Black backgrounds with blue accents
3. **Lightning Theme**: Subtle lightning elements (not overwhelming)
4. **Performance First**: Animations that don't hurt UX
5. **Consistency**: Same design language across all pages

---
**Remember**: When in doubt, check `C:\Users\pradord\Documents\Projects\Sharpened\brand-guide.html`