'use client';

import { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SharpenedLogoProps extends SVGAttributes<SVGElement> {
  variant?: 'sharpened' | 'feel' | 'study' | 'train' | 'work' | 'mind';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glow?: boolean;
}

const SharpenedLogo: React.FC<SharpenedLogoProps> = ({
  variant = 'feel',
  size = 'md',
  animated = true,
  glow = true,
  className,
  ...props
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variantColors = {
    sharpened: 'from-white to-gray-300',
    feel: 'from-blue-400 to-cyan-400',
    study: 'from-purple-400 to-pink-400',
    train: 'from-green-400 to-emerald-400',
    work: 'from-orange-400 to-yellow-400',
    mind: 'from-pink-400 to-rose-400'
  };

  const letterMap = {
    sharpened: 'S',
    feel: 'F',
    study: 'S',
    train: 'T',
    work: 'W',
    mind: 'M'
  };

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center',
      sizeMap[size],
      animated && 'animate-float',
      className
    )}>
      {/* Glow effect */}
      {glow && (
        <div 
          className={cn(
            'absolute inset-0 rounded-2xl blur-xl opacity-50',
            `bg-gradient-to-br ${variantColors[variant]}`,
            animated && 'animate-glow'
          )}
        />
      )}
      
      {/* Lightning bolt SVG */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          'relative z-10 w-full h-full',
          animated && 'hover:scale-110 transition-transform duration-300'
        )}
        {...props}
      >
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={cn(
              variant === 'feel' ? 'stop-color-[#3B82F6]' :
              variant === 'study' ? 'stop-color-[#8B5CF6]' :
              variant === 'train' ? 'stop-color-[#10B981]' :
              variant === 'work' ? 'stop-color-[#F59E0B]' :
              variant === 'mind' ? 'stop-color-[#EC4899]' :
              'stop-color-[#FFFFFF]'
            )} />
            <stop offset="100%" className={cn(
              variant === 'feel' ? 'stop-color-[#06B6D4]' :
              variant === 'study' ? 'stop-color-[#EC4899]' :
              variant === 'train' ? 'stop-color-[#84CC16]' :
              variant === 'work' ? 'stop-color-[#EAB308]' :
              variant === 'mind' ? 'stop-color-[#F43F5E]' :
              'stop-color-[#E5E5E5]'
            )} />
          </linearGradient>
          
          <filter id="lightning-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Letter (F for FeelSharper) */}
        {variant !== 'sharpened' && (
          <text
            x="15"
            y="55"
            fontSize="32"
            fontWeight="900"
            fill={`url(#gradient-${variant})`}
            className="font-black"
          >
            {letterMap[variant]}
          </text>
        )}
        
        {/* Lightning bolt path */}
        <path
          d={variant !== 'sharpened' ? 
            "M 55 10 L 40 45 L 50 45 L 45 90 L 70 40 L 58 40 Z" :
            "M 50 5 L 30 45 L 45 45 L 40 95 L 75 35 L 55 35 Z"
          }
          fill={`url(#gradient-${variant})`}
          filter="url(#lightning-glow)"
          className={cn(
            animated && 'hover:filter hover:drop-shadow-lg',
            'transition-all duration-300'
          )}
        />
        
        {/* Electric sparks animation */}
        {animated && (
          <>
            <circle r="1" fill="white" opacity="0">
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                repeatCount="indefinite"
              />
              <animateMotion
                path="M 55 10 L 40 45 L 50 45 L 45 90"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="0.5" fill="white" opacity="0">
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                begin="0.5s"
                repeatCount="indefinite"
              />
              <animateMotion
                path="M 55 10 L 40 45 L 50 45 L 45 90"
                dur="2s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};

export default SharpenedLogo;