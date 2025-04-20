import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimiter = {
  // Store IP addresses and their request timestamps
  requests: new Map(),
  
  // Clean old entries every 10 minutes
  cleanup: () => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimiter.requests.entries()) {
      // Remove timestamps older than the window
      const recent = timestamps.filter(time => now - time < 60 * 1000); // 1 minute window
      if (recent.length === 0) {
        rateLimiter.requests.delete(ip);
      } else {
        rateLimiter.requests.set(ip, recent);
      }
    }
  },
  
  // Add a request timestamp for an IP
  addRequest: (ip) => {
    const timestamps = rateLimiter.requests.get(ip) || [];
    timestamps.push(Date.now());
    rateLimiter.requests.set(ip, timestamps);
  },
  
  // Check if an IP has exceeded the rate limit
  isRateLimited: (ip, limit = 20) => {
    const timestamps = rateLimiter.requests.get(ip) || [];
    const now = Date.now();
    const recentRequests = timestamps.filter(time => now - time < 60 * 1000); // 1 minute window
    return recentRequests.length >= limit;
  }
};

// Start cleanup timer (every 10 minutes)
setInterval(rateLimiter.cleanup, 10 * 60 * 1000);

// Routes that should be rate limited
const API_ROUTES = ['/api/gmb', '/api/competitors', '/api/seo', '/api/ai-insights', '/api/ai-chat'];

export function middleware(request) {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;
  
  // Only apply rate limiting to API routes
  if (API_ROUTES.some(route => path.startsWith(route))) {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Add this request to the rate limiter
    rateLimiter.addRequest(ip);
    
    // Check if rate limited
    if (rateLimiter.isRateLimited(ip)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.'
      }), { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60' // Try again after 60 seconds
        }
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 