"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

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
    const { error } = await supabase.auth.signUp({ email, password: pass });
    setLoading(false);
    if (error) setErr(error.message);
    else window.location.href = '/onboarding'; // New users go to onboarding first
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Get Started</h1>
            <p className="text-slate-600 dark:text-slate-400">Create your account to begin your transformation</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            {err && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{err}</p>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
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
  );
}
