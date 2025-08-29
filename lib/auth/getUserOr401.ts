import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserOr401(req: NextRequest) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user || error) {
    return { 
      user: null as any, 
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
    };
  }
  
  return { user, supabase };
}