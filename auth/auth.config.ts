import type { NextAuthConfig } from 'next-auth';
export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async session({ session, token, user }: any) {
            //console.log(session, token, user, '555');
            return {
                ...session,
                token: token?.token
            };
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                // Merge the updated session fields into the token
                return { ...token, ...session };
            }
            if (user) {
                return { ...token, ...user };
            }

            return token;
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.AUTH_SECRET,
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;