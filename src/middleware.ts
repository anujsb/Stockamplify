import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/userService';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  //'/dashboard(.*)',
  '/portfolio(.*)',
  '/stocks(.*)',
  '/ai-stock-analytics(.*)',
  '/search(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect specific routes
  if (isProtectedRoute(req)) {
    await auth.protect();

    const { userId } = await auth();
    if (userId) {
      try {
        const dbUser = await UserService.getUserByClerkId(userId);

        if (!dbUser && !dbUser.isActive) {
                const dashboardUrl = new URL('/dashboard', req.url);
                dashboardUrl.searchParams.set('inactive', '1');
                return NextResponse.redirect(dashboardUrl);
              }
            } catch (err) {
              // Fallback redirect
              const dashboardUrl = new URL('/dashboard', req.url);
              return NextResponse.redirect(dashboardUrl);
            }
          }

          return NextResponse.next();
}});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};




// import { NextResponse } from "next/server";

// export function middleware(req: Request) {
//   // No auth, just pass through
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };