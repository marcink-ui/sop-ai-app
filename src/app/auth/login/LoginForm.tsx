'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [providers, setProviders] = useState<{ google: boolean; microsoft: boolean }>({
        google: false,
        microsoft: false,
    });

    // Fetch which providers are configured on the server
    useEffect(() => {
        fetch('/api/auth/providers')
            .then((r) => r.json())
            .then((data) => setProviders(data))
            .catch(() => { }); // Silently fail — hide OAuth buttons
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Clear any stale session before attempting new login
            await signOut().catch(() => { });

            const result = await signIn.email({
                email,
                password,
            });

            console.log('[LoginForm] signIn result:', JSON.stringify(result, null, 2));

            if (result.error) {
                console.error('[LoginForm] signIn error:', result.error);
                setError(result.error.message || result.error.code || 'Invalid email or password');
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err: unknown) {
            console.error('[LoginForm] signIn exception:', err);
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
        setSocialLoading(provider);
        setError('');
        try {
            await signIn.social({
                provider,
                callbackURL: callbackUrl,
            });
        } catch {
            setError(`Unable to sign in with ${provider === 'google' ? 'Google' : 'Microsoft'}. Please try again.`);
            setSocialLoading(null);
        }
    };

    const isAnyLoading = isLoading || socialLoading !== null;
    const hasAnyProvider = providers.google || providers.microsoft;

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-auto p-4">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)]" />
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4 ring-1 ring-white/10">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">VantageOS</h1>
                    <p className="text-slate-400 mt-2 text-sm">AI-Powered Business Transformation</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl ring-1 ring-white/5">
                    {/* Social Login Buttons — only shown when providers are configured */}
                    {hasAnyProvider && (
                        <div className="space-y-3 mb-6">
                            <button
                                type="button"
                                disabled={isAnyLoading}
                                onClick={() => handleSocialLogin('google')}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-slate-800 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                {socialLoading === 'google' ? (
                                    <svg className="animate-spin h-5 w-5 text-slate-600" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                disabled={isAnyLoading}
                                onClick={() => handleSocialLogin('microsoft')}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-500/50"
                            >
                                {socialLoading === 'microsoft' ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 21 21">
                                        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                                        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                                        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                                    </svg>
                                )}
                                Continue with Microsoft
                            </button>
                        </div>
                    )}

                    {/* Divider — only when providers exist */}
                    {hasAnyProvider && (
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-slate-800/80 px-3 text-slate-500 uppercase tracking-wider">or</span>
                            </div>
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 outline-none disabled:opacity-50"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 outline-none disabled:opacity-50"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isAnyLoading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in with email'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                Request access
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
                    <p className="text-slate-400 text-sm text-center mb-3">
                        <span className="text-slate-500">Demo:</span>{' '}
                        <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">demo@vantage.os</code>{' / '}
                        <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">demo123</code>
                    </p>
                    <button
                        type="button"
                        disabled={isAnyLoading}
                        onClick={() => {
                            setEmail('demo@vantage.os');
                            setPassword('demo123');
                        }}
                        className="w-full py-2 px-4 rounded-lg bg-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600/50 disabled:opacity-50"
                    >
                        Użyj danych demo
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    © {new Date().getFullYear()} VantageOS by sYhi. All rights reserved.
                </p>
            </div>
        </div>
    );
}
