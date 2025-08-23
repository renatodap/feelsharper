'use client';

import { ButtonHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  shimmer?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    glow = false,
    shimmer = false,
    magnetic = false,
    ripple = true,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 1000);
      }
      
      onClick?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };

    const handleMouseLeave = () => {
      if (magnetic) {
        setMousePosition({ x: 0, y: 0 });
      }
    };

    const baseStyles = cn(
      'relative overflow-hidden font-semibold transition-all duration-300',
      'transform-gpu will-change-transform',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
    );

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
      xl: 'px-10 py-5 text-xl rounded-2xl'
    };

    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-blue-500 to-cyan-400',
        'text-white shadow-lg',
        'hover:shadow-2xl hover:scale-105',
        'active:scale-95'
      ),
      secondary: cn(
        'bg-black/50 backdrop-blur-xl',
        'border border-white/10',
        'text-white',
        'hover:bg-white/10 hover:border-white/20',
        'active:bg-white/5'
      ),
      ghost: cn(
        'bg-transparent',
        'text-white/80 hover:text-white',
        'hover:bg-white/5',
        'active:bg-white/10'
      ),
      gradient: cn(
        'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
        'text-white shadow-lg',
        'hover:shadow-2xl hover:scale-105',
        'background-size-200 hover:background-position-right',
        'active:scale-95'
      )
    };

    const glowStyles = glow ? cn(
      'before:absolute before:inset-0 before:rounded-inherit',
      'before:bg-gradient-to-r before:from-blue-500 before:to-cyan-400',
      'before:blur-xl before:opacity-50',
      'hover:before:opacity-75',
      'before:transition-opacity before:duration-300',
      'before:-z-10'
    ) : '';

    const shimmerStyles = shimmer ? cn(
      'after:absolute after:top-0 after:left-[-100%]',
      'after:w-full after:h-full',
      'after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent',
      'hover:after:left-[100%]',
      'after:transition-all after:duration-1000',
      'overflow-hidden'
    ) : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          glowStyles,
          shimmerStyles,
          className
        )}
        style={{
          transform: magnetic ? `translate(${mousePosition.x}px, ${mousePosition.y}px)` : undefined
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
          />
        ))}
        
        {/* Content */}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';

export default PremiumButton;