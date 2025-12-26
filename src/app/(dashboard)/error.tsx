'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="p-6 bg-slate-900 min-h-[400px] flex flex-col items-center justify-center text-white border border-red-900 rounded-xl m-4">
            <h2 className="text-xl font-bold text-red-500 mb-2">Dashboard Crashed</h2>
            <p className="text-slate-400 mb-4">{error.message || "Unknown error"}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
