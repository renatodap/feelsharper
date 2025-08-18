"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SimpleHeader from "@/components/navigation/SimpleHeader";
import { useAuth } from "@/components/auth/AuthProvider";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <SimpleHeader />
        <main className="mx-auto max-w-sm p-6 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4 text-text-primary">Check your email</h1>
            <p className="text-text-secondary mb-6">
              We've sent a password reset link to {email}
            </p>
            <Link 
              href="/sign-in" 
              className="text-navy font-medium underline"
            >
              Back to sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <main className="mx-auto max-w-sm p-6 pt-20">
        <h1 className="text-2xl font-semibold mb-2 text-text-primary">Reset your password</h1>
        <p className="text-text-secondary mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email"
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button 
            type="submit"
            disabled={loading || !email} 
            className="w-full rounded-md bg-navy text-white py-2 hover:bg-navy-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
          
          {error && (
            <p className="text-error text-sm">{error}</p>
          )}
        </form>
        
        <p className="mt-6 text-sm text-text-secondary text-center">
          Remember your password? <Link className="underline text-navy font-medium" href="/sign-in">Sign in</Link>
        </p>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}