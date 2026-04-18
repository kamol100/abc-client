import type { NextAuthConfig } from 'next-auth';
import { isPublicPathname } from "@/lib/auth/public-routes";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/admin',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Client portal routes are handled by middleware — never intercept here
            if (pathname.startsWith('/client/')) return true;

            const isOnAdminDashboard = pathname.startsWith('/dashboard');
            const isPublicRoute = isPublicPathname(pathname);

            if (isOnAdminDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to /admin (signIn page)
            } else if (isLoggedIn && !isPublicRoute) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async session({ session, token }: any) {
            return {
                ...session,
                token: token?.token,
                user: {
                    ...session?.user,
                    name: token?.name,
                    email: token?.email,
                    reseller_id: token?.reseller_id,
                    logo: token?.logo,
                    favicon: token?.favicon,
                },
            };
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                return {
                    ...token,
                    token: (session as any)?.token ?? token?.token,
                    name: (session as any)?.user?.name ?? token?.name,
                    email: (session as any)?.user?.email ?? token?.email,
                    reseller_id: (session as any)?.user?.reseller_id ?? token?.reseller_id,
                    logo: (session as any)?.user?.logo ?? token?.logo,
                    favicon: (session as any)?.user?.favicon ?? token?.favicon,
                };
            }
            if (user) {
                return {
                    ...token,
                    token: (user as any)?.token,
                    name: (user as any)?.name,
                    email: (user as any)?.email,
                    reseller_id: (user as any)?.reseller_id,
                    logo: (user as any)?.logo,
                    favicon: (user as any)?.favicon,
                };
            }

            return token;
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: authSecret,
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;