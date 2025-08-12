"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

function SignInForm() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) setErr(error.message);
    else window.location.href = redirect;
  };

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-md border p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full rounded-md border p-2" placeholder="Password" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md bg-black text-white py-2 data-[theme=dark]:bg-white data-[theme=dark]:text-black">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <p className="text-red-600 text-sm">{err}</p>}
      </form>
      <p className="mt-4 text-sm">
        No account? <Link className="underline" href={`/sign-up?redirect=${encodeURIComponent(redirect)}`}>Create one</Link>
      </p>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm p-6">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
