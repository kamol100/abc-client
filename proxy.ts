import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const authSecret = process.env.NEXTAUTH_SECRET;
const loginRoute = "/login";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // In production (HTTPS), the session cookie is __Secure-authjs.session-token;
    // getToken must be told to look for it via secureCookie: true.
    const isSecure =
        process.env.NODE_ENV === 'production' ||
        req.headers.get('x-forwarded-proto') === 'https';
    const token = await getToken({
        req,
        secret: authSecret,
        secureCookie: isSecure,
    });
    const isLoginRoute = pathname === loginRoute;
    const isAuthenticated = Boolean((token as any)?.token);
    if (!isLoginRoute && !isAuthenticated) {
        const loginUrl = new URL(loginRoute, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginRoute && isAuthenticated) {
        const dashboardUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ],
};
