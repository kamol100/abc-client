import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';
const BASE_URL = `${process.env.NEXTAPI_URL}/api/v1`;

async function getLogin(credentials: any): Promise<any> {
    try {
        const result = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            mode: "cors",
            credentials: "include",
            body: JSON.stringify(credentials),
        });
        const data = await result.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(6), host: z.string() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const data = await getLogin(parsedCredentials.data);
                    console.log(data);
                    if (!data?.success) {
                        return null;
                    }
                    return {
                        token: data?.token,
                        name: data?.user?.name,
                        email: data?.user?.email,
                    };
                }

                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 1209600,
    },
});
