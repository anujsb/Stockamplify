import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(async function middleware(req) {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = [
    "/portfolio",
    "/stocks",
    "/ai-stock-analytics",
    "/search",
    "/dashboard",
  ];

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to sign-in
  if (isProtectedRoute && !session?.user?.id) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is signed in but inactive
  //if (session?.user && session.user.isActive === false) {
  //  const dashboardUrl = new URL("/dashboard", req.url);
  //  dashboardUrl.searchParams.set("inactive", "1");
  //  return NextResponse.redirect(dashboardUrl);
  //}

  // If user is authenticated and trying to access protected route, allow access
  // Temporarily skipping database check to avoid redirect loops
  if (isProtectedRoute && session?.user?.id) {
    // User is authenticated, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
