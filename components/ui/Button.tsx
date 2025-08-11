'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Fixed Button component with proper functionality and high-contrast styling
 * Supports all interactive states, WCAG AA+ contrast, and consistent behavior
 * Fixed: Proper event handling, accessible focus states, and reliable styling
 */
export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children,
  href,
  target,
  rel,
  onClick,
  disabled,
  type = 'button',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  
  // Fixed: High-contrast colors for WCAG AA+ compliance
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 focus:ring-amber-500 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white focus:ring-slate-700 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 focus:ring-slate-300 border border-transparent hover:border-slate-200',
    outline: 'border-2 border-slate-300 hover:border-slate-400 active:border-slate-500 bg-transparent hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-slate-300'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg min-h-[32px]',
    md: 'px-4 py-2.5 text-base rounded-lg min-h-[40px]',
    lg: 'px-6 py-3 text-lg rounded-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl rounded-lg min-h-[56px]'
  };

  const buttonClasses = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );

  // Fixed: Proper event handling with preventDefault for better UX
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  // If href is provided, render as a link-styled button
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={buttonClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
