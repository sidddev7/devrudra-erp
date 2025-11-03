import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/agents",
  "/policies",
  "/users",
  "/vehicle-classes",
  "/insurance-providers",
  "/expiring-policies",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // Check if the route is protected or an auth route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Simple check: if session cookie exists, consider authenticated
  // Actual verification happens server-side when data is fetched
  const isAuthenticated = !!sessionCookie;

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if trying to access auth routes while authenticated
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  // Handle root path
  if (pathname === "/") {
    if (isAuthenticated) {
      const url = new URL("/dashboard", request.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

