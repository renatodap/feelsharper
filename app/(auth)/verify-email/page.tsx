"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SimpleHeader from "@/components/navigation/SimpleHeader";
import { useAuth } from "@/components/auth/AuthProvider";

function VerifyEmailContent() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const email = searchParams.get("email") || user?.email || "";

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    setError(null);
    
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setResent(true);
      }
    } catch (err) {
      setError("Failed to resend verification email");
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <main className="mx-auto max-w-md p-6 pt-20">
        <div className="text-center">
          {/* Email icon */}
          <div className="mx-auto w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold mb-4 text-text-primary">
            Check your email
          </h1>
          
          <p className="text-text-secondary mb-6 leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-medium text-text-primary">{email}</span>.
            <br />
            Click the link in the email to verify your account.
          </p>
          
          {resent && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600">
                Verification email sent successfully!
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={resending || !email}
              className="w-full rounded-md bg-navy text-white py-2 px-4 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            
            <div className="text-sm text-text-secondary space-y-2">
              <p>
                Wrong email? <button onClick={signOut} className="underline text-navy font-medium">Sign out</button> and try again
              </p>
              <p>
                Already verified? <Link href="/sign-in" className="underline text-navy font-medium">Sign in</Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-surface rounded-lg text-sm text-text-secondary">
            <p className="font-medium mb-2">Can't find the email?</p>
            <ul className="space-y-1 text-left">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Add noreply@feelsharper.com to your contacts</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}