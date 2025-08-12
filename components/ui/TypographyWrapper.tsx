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

  const combinedClassName = cn(variantClasses[variant], className);

  switch (variant) {
    case 'h1':
      return <h1 className={combinedClassName} {...props}>{children}</h1>;
    case 'h2':
      return <h2 className={combinedClassName} {...props}>{children}</h2>;
    case 'h3':
      return <h3 className={combinedClassName} {...props}>{children}</h3>;
    case 'h4':
      return <h4 className={combinedClassName} {...props}>{children}</h4>;
    case 'h5':
      return <h5 className={combinedClassName} {...props}>{children}</h5>;
    case 'h6':
      return <h6 className={combinedClassName} {...props}>{children}</h6>;
    case 'caption':
      return <span className={combinedClassName} {...props}>{children}</span>;
    case 'label':
      return <label className={combinedClassName} {...props}>{children}</label>;
    case 'body1':
    case 'body2':
    default:
      return <p className={combinedClassName} {...props}>{children}</p>;
  }
}

export default Typography;