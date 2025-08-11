import { useState, useEffect } from 'react';

interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    // For now, just log to console - you can implement a proper toast UI later
    console.log('Toast:', newToast);
    
    // Simple implementation: show alert for errors
    if (newToast.variant === 'destructive') {
      alert(`Error: ${newToast.title}\n${newToast.description || ''}`);
    }
  };

  return { toast, toasts };
}