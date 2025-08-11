"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=/onboarding`,
      }
    });
    setLoading(false);
    if (error) setErr(error.message);
    else {
      // Show success message for email confirmation
      setErr(null);
      alert('Check your email for the confirmation link!');
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setErr(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=/onboarding`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      setErr(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Get Started</h1>
            <p className="text-slate-600 dark:text-slate-400">Create your account to begin your transformation</p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={signUpWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Connecting..." : "Sign up with Google"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or sign up with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input 
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input 
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Create a password (min 6 characters)" 
                value={pass} 
                onChange={(e)=>setPass(e.target.value)} 
              />
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating account..." : "Create account with Email"}
            </button>

            {err && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>
              </div>
            )}
          </form>

          <div className="mt-6 space-y-4">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
            
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors" 
                  href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
