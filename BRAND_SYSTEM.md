# Feel Sharper Brand System

## 🎯 Brand Identity

### Brand Voice (3 Words)
**Direct • Grounded • Intentional**

- **Direct**: No fluff, clear actionable advice
- **Grounded**: Evidence-based, practical solutions  
- **Intentional**: Every choice matters, purposeful living

### Brand Purpose (2 Sentences)
Most men drift through life accepting mediocrity as inevitable. Feel Sharper rejects this—we believe peak performance isn't about hacks or shortcuts, it's about understanding your body's fundamentals and optimizing them systematically.

### Feel Sharper Manifesto
*Most men drift through life accepting mediocrity as inevitable. Feel Sharper rejects this. We believe peak performance isn't about hacks or shortcuts—it's about understanding your body's fundamentals and optimizing them systematically. Sleep better. Think clearer. Move with purpose. Every decision you make either moves you toward peak performance or away from it. We provide the evidence-based strategies to ensure you're always moving forward.*

---

## 🎨 Visual Identity

### Color Palette
```css
/* Primary Brand Colors */
--brand-navy: #0F172A        /* Primary dark, headers, text */
--brand-amber: #F59E0B       /* Primary accent, CTAs, highlights */
--brand-amber-light: #FEF3C7 /* Light accent, backgrounds */

/* Gray Scale */
--brand-gray-50: #F8FAFC     /* Lightest backgrounds */
--brand-gray-100: #F1F5F9    /* Card backgrounds */
--brand-gray-200: #E2E8F0    /* Borders, dividers */
--brand-gray-300: #CBD5E1    /* Subtle text */
--brand-gray-400: #94A3B8    /* Placeholder text */
--brand-gray-500: #64748B    /* Secondary text */
--brand-gray-600: #475569    /* Body text */
--brand-gray-700: #334155    /* Headings */
--brand-gray-800: #1E293B    /* Dark headings */
--brand-gray-900: #0F172A    /* Primary text */
```

### Typography Scale
```css
/* Font Families */
font-family: 'Inter', system-ui, sans-serif; /* Primary */
font-family: 'JetBrains Mono', monospace;    /* Code */

/* Typography Scale */
text-xs: 0.75rem     /* 12px - Labels, metadata */
text-sm: 0.875rem    /* 14px - Body text, captions */
text-base: 1rem      /* 16px - Default body */
text-lg: 1.125rem    /* 18px - Large body, intro text */
text-xl: 1.25rem     /* 20px - Card titles */
text-2xl: 1.5rem     /* 24px - Section headings */
text-3xl: 1.875rem   /* 30px - Page headings */
text-4xl: 2.25rem    /* 36px - Hero headings */
text-5xl: 3rem       /* 48px - Large hero */
text-6xl: 3.75rem    /* 60px - Massive hero */
```

### Spacing System
```css
/* Consistent spacing scale */
0.5: 0.125rem  /* 2px */
1: 0.25rem     /* 4px */
2: 0.5rem      /* 8px */
3: 0.75rem     /* 12px */
4: 1rem        /* 16px */
6: 1.5rem      /* 24px */
8: 2rem        /* 32px */
12: 3rem       /* 48px */
16: 4rem       /* 64px */
24: 6rem       /* 96px */
32: 8rem       /* 128px */
```

---

## 🗺️ Site Architecture

### Sitemap
```
/                    - Homepage (hero, features, recent posts, newsletter)
/blog               - Blog index (all posts, categories, search)
/blog/[slug]        - Individual blog posts
/about              - About page (anonymous but authoritative)
/newsletter         - Newsletter signup page
/category/[slug]    - Category pages (sleep, energy, focus, vitality)
```

### URL Structure Logic
- Clean, SEO-friendly URLs
- Category-based organization
- Date-independent post URLs for longevity
- Consistent slug formatting (kebab-case)

---

## 🧱 Component System

### Layout Hierarchy
```
Layout.tsx
├── Navbar.tsx
│   └── Logo.tsx
├── main (page content)
└── Footer.tsx
```

### Content Components
```
BlogCard.tsx        - Post preview cards (standard & featured)
AffiliateBox.tsx    - Product recommendations with disclosure
ComparisonTable.tsx - Side-by-side product/method comparisons
Callout.tsx         - Important notes, tips, warnings
```

### Design Patterns
- **Mobile-first responsive design**
- **Generous whitespace** for readability
- **Subtle hover effects** with smooth transitions
- **Consistent border radius** (rounded-lg: 8px, rounded-xl: 12px)
- **Layered shadows** for depth without heaviness

---

## 🧠 UX Philosophy

### Visitor Journey
1. **Discovery** → Clear value proposition on homepage
2. **Exploration** → Easy navigation to relevant content
3. **Engagement** → Scannable, actionable blog content
4. **Conversion** → Subtle newsletter signup opportunities
5. **Retention** → Consistent, valuable content delivery

### Emotional Goals
- **Confidence**: User feels capable of making changes
- **Clarity**: Information is easy to understand and act on
- **Trust**: Content feels authoritative and evidence-based
- **Motivation**: User feels inspired to take action
- **Progress**: User can track their optimization journey

---

## ✍️ Brand Copy Guidelines

### Tone & Voice
- **Be direct**: Get to the point quickly
- **Be specific**: Use numbers, timeframes, concrete examples
- **Be confident**: Avoid hedge words like "might" or "could"
- **Be practical**: Focus on actionable advice
- **Avoid hype**: No "miracle cures" or "life-changing secrets"

### Content Principles
1. **Evidence-first**: Always cite studies or data when possible
2. **Action-oriented**: Every piece should have clear next steps
3. **Scannable**: Use headers, bullets, and short paragraphs
4. **Honest**: Acknowledge limitations and individual variation
5. **Masculine but inclusive**: Strong without being aggressive

---

## 🔍 SEO Strategy

### Technical SEO
- Semantic HTML structure
- Proper heading hierarchy (H1 → H2 → H3)
- Alt text for all images
- Meta descriptions for all pages
- Canonical URLs
- XML sitemap
- JSON-LD structured data

### Content SEO
- Target long-tail keywords around optimization topics
- Internal linking between related posts
- Category-based content organization
- Regular publishing schedule
- Comprehensive, in-depth content

---

## 📱 Responsive Breakpoints

```css
/* Mobile-first breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Mobile-First Principles
- Touch-friendly button sizes (min 44px)
- Readable text without zooming (16px base)
- Easy thumb navigation
- Fast loading on slower connections
- Simplified navigation on small screens

---

## 🎭 Brand Personality

### What Feel Sharper IS:
- Evidence-based and scientific
- Direct and no-nonsense
- Sophisticated and modern
- Masculine but not exclusive
- Practical and actionable

### What Feel Sharper IS NOT:
- Hyped-up or sensational
- Overly technical or academic
- Feminine or soft
- Trendy or fad-focused
- Vague or theoretical

---

## 🚀 Performance Standards

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Strategies
- Next.js Image optimization
- Lazy loading for non-critical content
- Minimal JavaScript bundles
- Efficient CSS delivery
- CDN for static assets
