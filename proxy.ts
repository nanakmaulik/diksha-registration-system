import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sadhakAccess = request.cookies.get("sadhak_access")?.value;

  if (
    request.nextUrl.pathname.startsWith("/sadhak-dashboard") &&
    sadhakAccess !== "true"
  ) {
    return NextResponse.redirect(new URL("/sadhak-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sadhak-dashboard/:path*"],
};