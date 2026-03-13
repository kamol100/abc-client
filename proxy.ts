import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const authSecret = process.env.NEXTAUTH_SECRET;
const loginRoute = "/login";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({ req, secret: authSecret });
    const isLoginRoute = pathname === loginRoute;
    const isAuthenticated = Boolean((token as any)?.token);
    console.log(isLoginRoute, isAuthenticated);
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
        "/",
        "/users",
        "/clients",
        "/client/invoices",
        "/client/tickets",
        "/clients/create",
        "/zones",
        "/networks",
        "/packages",
        "/resellers",
        "/resellers/create",
        "/vendors",
        "/payments",
        "/invoices",
        "/invoices/create",
        "/invoice-types",
        "/payment-types",
        "/expenses",
        "/expense-types",
        "/products",
        "/products/reports",
        "/product-categories",
        "/roles",
        "/permissions",
        "/sms-sent",
        "/communication-logs",
        "/sms-templates",
        "/funds",
        "/fund-transactions",
        "/staffs",
        "/staffs/create",
        "/users",
        "/companies",
        "/settings",
        '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    ],
};
