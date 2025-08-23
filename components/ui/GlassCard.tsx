'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'heavy' | 'color';
  hover?: boolean;
  glow?: boolean;
  float?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = 'light', 
    hover = true,
    glow = false,
    float = false,
    gradient = false,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'relative rounded-2xl p-6',
      'transition-all duration-500 ease-out',
      'backdrop-filter backdrop-blur-xl backdrop-saturate-150'
    );

    const variantStyles = {
      light: cn(
        'bg-white/[0.02]',
        'border border-white/[0.05]',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
      ),
      heavy: cn(
        'bg-white/[0.05]',
        'border border-white/[0.08]',
        'shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]',
        'backdrop-blur-2xl'
      ),
      color: cn(
        'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
        'border border-blue-500/20',
        'shadow-[0_8px_32px_0_rgba(59,130,246,0.15)]'
      )
    };

    const hoverStyles = hover ? cn(
      'hover:translate-y-[-4px]',
      'hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)]',
      'hover:border-white/[0.1]',
      'hover:bg-white/[0.03]',
      'cursor-pointer'
    ) : '';

    const glowStyles = glow ? cn(
      'before:absolute before:inset-0 before:rounded-2xl',
      'before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-500/20',
      'before:blur-2xl before:opacity-0',
      'hover:before:opacity-100',
      'before:transition-opacity before:duration-500',
      'before:-z-10'
    ) : '';

    const floatStyles = float ? 'animate-float' : '';

    const gradientStyles = gradient ? cn(
      'after:absolute after:inset-0 after:rounded-2xl',
      'after:bg-gradient-to-br after:from-blue-500/5 after:via-transparent after:to-purple-500/5',
      'after:pointer-events-none'
    ) : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles,
          glowStyles,
          floatStyles,
          gradientStyles,
          className
        )}
        {...props}
      >
        {/* Inner glow border */}
        <div className="absolute inset-[0] rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Bottom reflection */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;