import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "jobpilot_refresh";
const LOGIN_URL = "/login";

export function middleware(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has(AUTH_COOKIE);
  if (!hasRefreshCookie) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_URL;
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
