'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
