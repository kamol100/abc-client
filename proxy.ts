import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const loginRoute = "/admin";
const legacyLoginRoute = "/login";
const dashboardRoute = "/dashboard";
const publicRoutes = new Set(["/", loginRoute]);

export async function proxy(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (pathname === legacyLoginRoute) {
        const adminUrl = new URL(loginRoute, req.url);
        adminUrl.search = search;
        return NextResponse.redirect(adminUrl);
    }

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
    const isAuthenticated = Boolean((token as any)?.token);
    const isRootRoute = pathname === "/";
    const isLoginRoute = pathname === loginRoute;
    const isPublicRoute = publicRoutes.has(pathname);

    if (isRootRoute) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL(dashboardRoute, req.url));
        }
        return NextResponse.next();
    }

    if (isLoginRoute && isAuthenticated) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isPublicRoute && !isAuthenticated) {
        const loginUrl = new URL(loginRoute, req.url);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ],
};
