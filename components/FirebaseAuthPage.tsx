'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface FirebaseAuthPageProps {
    onAuthSuccess: () => void;
}

export function FirebaseAuthPage({ onAuthSuccess }: FirebaseAuthPageProps) {
    const { signIn, signUp, signInWithGoogle, error } = useFirebaseAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLocalError(null);
        setIsLoading(true);
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                onAuthSuccess();
            } else {
                setLocalError(result.error || 'Google sign in failed');
            }
        } catch (err: any) {
            setLocalError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    setLocalError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                const result = await signUp(email, password);
                if (!result.success) {
                    setLocalError(result.error || 'Sign up failed');
                    setIsLoading(false);
                    return;
                }
            } else {
                const result = await signIn(email, password);
                if (!result.success) {
                    setLocalError(result.error || 'Sign in failed');
                    setIsLoading(false);
                    return;
                }
            }

            // Brief delay to ensure auth state is updated
            setTimeout(() => {
                onAuthSuccess();
            }, 500);
        } catch (err: any) {
            setLocalError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: 'url(/images/advocate-header.jpg)',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 w-full px-4">
                <Card className="w-full max-w-md mx-auto p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-2">CaseTrack</h1>
                        <p className="text-muted-foreground">
                            {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Confirm Password
                                </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {(localError || error) && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                                {localError || error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            {isSignUp
                                ? 'Already have an account?'
                                : "Don't have an account?"}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setLocalError(null);
                                setEmail('');
                                setPassword('');
                                setConfirmPassword('');
                            }}
                            disabled={isLoading}
                        >
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
