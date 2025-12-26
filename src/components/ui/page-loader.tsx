// src/components/ui/page-loader.tsx

'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
    message?: string;
    className?: string;
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
                "flex flex-col items-center justify-center min-h-[400px] p-8",
                className
            )}
        >
            <div className="relative">
                {/* Outer ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Middle ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />

                {/* Icon container */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="h-7 w-7 text-primary" />
                    </motion.div>
                </div>
            </div>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-muted-foreground font-medium"
            >
                {message}
            </motion.p>

            {/* Loading dots */}
            <div className="flex gap-1 mt-3">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/40"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export function InlineLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
        </div>
    );
}
