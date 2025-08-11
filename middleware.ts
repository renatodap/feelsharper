import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/coach",
  "/log",
  "/calendar",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  // Supabase sets 'sb' cookie family. Quick check for session presence.
  const hasSession = Boolean(req.cookies.get("sb-access-token")?.value);

  if (isProtected && !hasSession) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect", path);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|public).*)"],
};
