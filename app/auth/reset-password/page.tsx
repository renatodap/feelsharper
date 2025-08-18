"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SimpleHeader from "@/components/navigation/SimpleHeader";
import { createClient } from "@/lib/supabase/client";

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check for auth code in URL params
    const code = searchParams.get("code");
    if (code) {
      // Exchange code for session
      supabase.auth.exchangeCodeForSession(code);
    }
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to sign-in after a delay
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    } catch (err) {
      setError("Failed to update password");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <SimpleHeader />
        <main className="mx-auto max-w-sm p-6 pt-20">
          <div className="text-center">
            <div className="mb-4 text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-text-primary">Password updated!</h1>
            <p className="text-text-secondary mb-4">
              Your password has been successfully updated.
            </p>
            <p className="text-text-secondary text-sm">
              Redirecting to sign in...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <main className="mx-auto max-w-sm p-6 pt-20">
        <h1 className="text-2xl font-semibold mb-2 text-text-primary">Set new password</h1>
        <p className="text-text-secondary mb-6">
          Enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password"
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="New password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          
          <input 
            type="password"
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Confirm new password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          
          <button 
            type="submit"
            disabled={loading || !password || !confirmPassword} 
            className="w-full rounded-md bg-navy text-white py-2 hover:bg-navy-600 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
          
          {error && (
            <p className="text-error text-sm">{error}</p>
          )}
        </form>
      </main>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  );
}