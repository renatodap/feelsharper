/**
 * Utility to check color contrast for WCAG compliance
 */

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG standards
export function meetsWCAGStandard(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): boolean {
  if (level === 'AA') {
    return largeText ? ratio >= 3 : ratio >= 4.5;
  } else {
    return largeText ? ratio >= 4.5 : ratio >= 7;
  }
}

// Validate button contrast
export function validateButtonContrast(
  bgColor: string,
  textColor: string,
  buttonName?: string
): { valid: boolean; ratio: number; message: string } {
  const ratio = getContrastRatio(bgColor, textColor);
  const valid = meetsWCAGStandard(ratio, 'AA', false);
  
  const message = valid
    ? `✅ ${buttonName || 'Button'} has good contrast (${ratio.toFixed(2)}:1)`
    : `❌ ${buttonName || 'Button'} has poor contrast (${ratio.toFixed(2)}:1) - needs at least 4.5:1`;

  return { valid, ratio, message };
}

// Common problematic combinations to check
export const PROBLEMATIC_COMBINATIONS = [
  { bg: '#FFFFFF', text: '#FFFFFF', name: 'White on White' },
  { bg: '#FFFFFF', text: '#F5F5F5', name: 'Light Gray on White' },
  { bg: '#F0F0F0', text: '#FFFFFF', name: 'White on Light Gray' },
  { bg: '#FFE4B5', text: '#FFFFFF', name: 'White on Light Yellow' },
  { bg: '#E6F3FF', text: '#FFFFFF', name: 'White on Light Blue' },
];

// Feel Sharper brand colors
export const BRAND_COLORS = {
  navy: '#0B2A4A',
  black: '#0A0A0A',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  grayPrimary: '#C7CBD1',
  graySecondary: '#8B9096',
};

// Validate all brand color combinations
export function validateBrandContrast() {
  const results: any[] = [];
  
  // Check common button combinations
  const combinations = [
    { bg: BRAND_COLORS.white, text: BRAND_COLORS.navy, name: 'Navy on White' },
    { bg: BRAND_COLORS.navy, text: BRAND_COLORS.white, name: 'White on Navy' },
    { bg: BRAND_COLORS.success, text: BRAND_COLORS.white, name: 'White on Success' },
    { bg: BRAND_COLORS.warning, text: BRAND_COLORS.white, name: 'White on Warning' },
    { bg: BRAND_COLORS.error, text: BRAND_COLORS.white, name: 'White on Error' },
    { bg: BRAND_COLORS.black, text: BRAND_COLORS.white, name: 'White on Black' },
    { bg: BRAND_COLORS.white, text: BRAND_COLORS.grayPrimary, name: 'Gray on White' },
  ];

  combinations.forEach(combo => {
    results.push(validateButtonContrast(combo.bg, combo.text, combo.name));
  });

  return results;
}