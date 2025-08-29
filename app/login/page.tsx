'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the canonical signin page
    router.replace('/signin');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center">
      <div className="text-white">Redirecting to sign in...</div>
    </div>
  );
}