import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modern card component with subtle shadows and clean borders
 * Provides consistent container styling across the application
 */
const Card = memo(({ 
  children, 
  className,
  variant = 'default',
  padding = 'md',
  ...props 
}: CardProps) => {
  const variants = {
    default: 'bg-clean-white border border-neutral-200 shadow-sm',
    elevated: 'bg-clean-white shadow-lg border-0',
    bordered: 'bg-clean-white border border-sharp-blue shadow-sm'
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200 hover:shadow-md',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Card header component for titles and actions
 */
const CardHeader = memo(({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between mb-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * Card title component for main headings
 */
const CardTitle = memo(({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-sharp-blue',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * Card content area with proper spacing
 */
const CardContent = memo(({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * Card footer for actions and metadata
 */
const CardFooter = memo(({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between mt-6 pt-6 border-t border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
