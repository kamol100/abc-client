// import NextAuth from 'next-auth';
// import { authConfig } from './auth/auth.config';

// export default NextAuth(authConfig).auth;


// export const config = {
//     // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
//     matcher: [
//         "/",
//         "/dashboard",
//         '/((?!api|_next/static|_next/image|.*\\.png$).*)'
//     ],
// };

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';


export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    // console.log(token, "md")
    // Define the routes that require authentication
    const protectedRoutes = ["/", "/dashboard"];

    const isProtectedRoute = protectedRoutes.includes(pathname);

    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    if (token && pathname === '/login') {
        const dashboardUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard",
        "/users",
        "/login",
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ],
};