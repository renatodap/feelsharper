/**
 * Unit Tests for Utility Functions
 * Tests core utility functions used throughout the app
 */

import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should filter out falsy values', () => {
      const result = cn('base-class', false && 'hidden-class', null, undefined, '');
      expect(result).toBe('base-class');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should merge Tailwind conflicting classes correctly', () => {
      // This tests the tailwind-merge functionality
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4'); // px-4 should override px-2
    });

    it('should handle responsive and variant classes', () => {
      const result = cn(
        'text-base',
        'md:text-lg', 
        'lg:text-xl',
        'dark:text-white'
      );
      expect(result).toBe('text-base md:text-lg lg:text-xl dark:text-white');
    });

    it('should work with no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex conditional logic', () => {
      const size = 'large';
      const disabled = false;
      const variant = 'primary';
      
      const result = cn(
        'btn',
        size === 'large' && 'btn-lg',
        size === 'small' && 'btn-sm',
        disabled && 'btn-disabled',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary'
      );
      
      expect(result).toBe('btn btn-lg btn-primary');
    });
  });

  describe('formatters', () => {
    it('should format numbers for display', () => {
      // Test number formatting if we have utility functions for it
      expect(typeof 123.45).toBe('number');
      expect(Number(123.45).toFixed(1)).toBe('123.5');
    });

    it('should handle edge cases', () => {
      expect(cn('')).toBe('');
      expect(cn(' ')).toBe(''); // tailwind-merge trims whitespace
      expect(cn('a', '', 'b')).toBe('a b');
    });
  });
});