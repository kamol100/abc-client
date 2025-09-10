"use server";
import { signIn } from '@/auth/auth';
import { Login } from '@/components/schema/login';
import { AuthError } from 'next-auth';

// ...

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
                        message: "Invalid credentials.",
                        error: true
                    };
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}