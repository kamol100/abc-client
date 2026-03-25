"use server";
import { signIn, signOut } from '@/auth/auth';
import { Login } from '@/components/schema/login';
import { AuthError } from 'next-auth';

/** Clears the session on the server (avoids client fetch to /api/auth/signout). */
export async function adminLogout() {
    await signOut({ redirect: false, redirectTo: '/admin' });
}

export async function authenticate(
    formData: Login,
) {
    try {
        const data = await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        message: "login.errors.invalid_credentials",
                        error: true
                    };
                default:
                    return {
                        message: "login.errors.something_went_wrong",
                        error: true
                    };
            }
        }
        throw error;
    }
}