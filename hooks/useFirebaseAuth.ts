'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    User
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export interface AuthUser {
    id: string;
    email: string;
}

export function useFirebaseAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = useCallback(
        async (email: string, password: string) => {
            try {
                setError(null);
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                });
                return { success: true };
            } catch (err: any) {
                const errorMessage = err.message || 'Sign up failed';
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        []
    );

    const signIn = useCallback(
        async (email: string, password: string) => {
            try {
                setError(null);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                });
                return { success: true };
            } catch (err: any) {
                const errorMessage = err.message || 'Sign in failed';
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        []
    );

    const signInWithGoogle = useCallback(async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;

            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
            });
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Google sign in failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            setUser(null);
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.message || 'Sign out failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    return {
        user,
        isLoading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
    };
}
