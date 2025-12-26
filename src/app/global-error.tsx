'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-gray-600 mb-6">
                        {error.message || 'A critical error occurred.'}
                    </p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    );
}
