import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/posts(.*)',
  '/api/upload(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Only run middleware for routes that require authentication
    '/dashboard(.*)',
    '/api/posts(.*)',
    '/api/upload(.*)',
    '/signin(.*)',
    '/signup(.*)',
    // '',
    // '',
  ],
};
