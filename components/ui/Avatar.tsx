import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ 
  src, 
  alt = '', 
  fallback = '?',
  size = 'md',
  className,
  ...props 
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden bg-surface-2 flex items-center justify-center',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-text-secondary font-medium">
          {fallback}
        </span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  return src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : null;
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-text-secondary font-medium">
      {children}
    </span>
  );
}