import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'label';
  children: React.ReactNode;
}

/**
 * Typography component wrapper that provides variant-based text styling
 */
export function Typography({ variant = 'body1', className, children, ...props }: TypographyProps) {
  const variantClasses = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs text-gray-600',
    label: 'text-sm font-medium'
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Component className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export default Typography;