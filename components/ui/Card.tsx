import React from 'react';
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
export default function Card({ 
  children, 
  className,
  variant = 'default',
  padding = 'md',
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-neutral-0 border border-neutral-200 shadow-soft',
    elevated: 'bg-neutral-0 shadow-medium border-0',
    bordered: 'bg-neutral-0 border-2 border-neutral-300 shadow-none'
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
        'rounded-2xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header component for titles and actions
 */
export function CardHeader({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
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
}

/**
 * Card content area with proper spacing
 */
export function CardContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
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
}

/**
 * Card footer for actions and metadata
 */
export function CardFooter({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
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
}
