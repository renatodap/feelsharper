'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to AI Coach Dashboard as the main landing
    router.push('/user/coach');
  }, [router]);

  return (
    <div className="min-h-screen bg-sharpened-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-feel-primary font-heading text-2xl">Loading...</div>
      </div>
    </div>
  );
}