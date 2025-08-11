'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border border-slate-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
          'placeholder:text-slate-400',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
