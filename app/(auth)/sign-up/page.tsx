"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SimpleHeader from "@/components/navigation/SimpleHeader";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requiresInvite, setRequiresInvite] = useState(process.env.NEXT_PUBLIC_REQUIRE_INVITE_CODE === "1");
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/insights";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    
    // Validate passwords match
    if (pass !== confirmPass) {
      setErr("Passwords do not match");
      setLoading(false);
      return;
    }
    
    // Validate password strength
    if (pass.length < 6) {
      setErr("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    try {
      // Call our API route which handles invite codes
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password: pass,
          invite: inviteCode 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErr(data.error || 'Sign up failed');
      } else if (data.requiresEmailConfirmation) {
        setSuccess(true);
        setErr(null);
      } else if (data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      setErr("Sign up temporarily unavailable");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <SimpleHeader />
        <main className="mx-auto max-w-sm p-6 pt-20">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-navy/10">
              <svg className="h-8 w-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-3 text-text-primary">Check Your Email</h1>
            <p className="text-text-secondary mb-6">
              We've sent a confirmation link to {email}. 
              Please check your email and click the link to activate your account.
            </p>
            <p className="text-sm text-text-muted">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setSuccess(false)} 
                className="text-navy underline hover:no-underline"
              >
                try again
              </button>
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
        <h1 className="text-2xl font-semibold mb-6 text-text-primary">Create your FeelSharper account</h1>
        
        {/* Google Sign Up */}
        <div className="mb-6">
          <GoogleAuthButton mode="signup" redirectTo={redirect} />
        </div>
        
        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-bg text-text-secondary">Or sign up with email</span>
          </div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <input 
            type="email"
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Email address" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <input 
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Password (min. 6 characters)" 
            type="password" 
            value={pass} 
            onChange={(e)=>setPass(e.target.value)}
            minLength={6}
            required
          />
          <input 
            className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
            placeholder="Confirm password" 
            type="password" 
            value={confirmPass} 
            onChange={(e)=>setConfirmPass(e.target.value)}
            minLength={6}
            required
          />
          
          {/* Invite code field - only show if required */}
          {requiresInvite && (
            <div className="space-y-2">
              <input 
                className="w-full rounded-md border border-border bg-surface p-2 text-text-primary" 
                placeholder="Invite code (required for beta)" 
                type="text" 
                value={inviteCode} 
                onChange={(e)=>setInviteCode(e.target.value)}
                required
              />
              <p className="text-xs text-text-muted">
                • Beta access requires an invite code
              </p>
            </div>
          )}
          
          {/* Password requirements */}
          <div className="text-xs text-text-muted space-y-1">
            <p className={pass.length >= 6 ? "text-green-500" : ""}>
              • At least 6 characters
            </p>
            <p className={pass === confirmPass && pass.length > 0 ? "text-green-500" : ""}>
              • Passwords match
            </p>
          </div>
          
          <button 
            disabled={loading} 
            type="submit"
            className="w-full rounded-md bg-navy text-white py-2 hover:bg-navy-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
          
          {err && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{err}</p>
            </div>
          )}
        </form>
        
        <p className="mt-6 text-sm text-text-secondary text-center">
          Already have an account? <Link className="underline text-navy font-medium" href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link>
        </p>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
