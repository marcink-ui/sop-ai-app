'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

// Loading fallback
function LoginSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md animate-pulse">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700 mb-4" />
                    <div className="h-8 w-32 bg-slate-700 rounded mx-auto mb-2" />
                    <div className="h-4 w-40 bg-slate-700/50 rounded mx-auto" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                    <div className="space-y-6">
                        <div><div className="h-4 w-12 bg-slate-700 rounded mb-2" /><div className="h-12 bg-slate-700/50 rounded-lg" /></div>
                        <div><div className="h-4 w-16 bg-slate-700 rounded mb-2" /><div className="h-12 bg-slate-700/50 rounded-lg" /></div>
                        <div className="h-12 bg-slate-700 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
        </Suspense>
    );
}
