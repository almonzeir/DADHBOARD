// src/components/ui/data-refresh-indicator.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataRefreshIndicatorProps {
    lastUpdated?: Date;
    onRefresh?: () => Promise<void>;
    isRefreshing?: boolean;
    autoRefreshInterval?: number; // in seconds
    className?: string;
}

export function DataRefreshIndicator({
    lastUpdated,
    onRefresh,
    isRefreshing = false,
    autoRefreshInterval,
    className,
}: DataRefreshIndicatorProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');

    // Update time ago every minute
    useEffect(() => {
        const updateTimeAgo = () => {
            if (!lastUpdated) {
                setTimeAgo('');
                return;
            }

            const now = new Date();
            const diff = now.getTime() - lastUpdated.getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);

            if (seconds < 10) {
                setTimeAgo('Just now');
            } else if (seconds < 60) {
                setTimeAgo(`${seconds}s ago`);
            } else if (minutes < 60) {
                setTimeAgo(`${minutes}m ago`);
            } else {
                setTimeAgo(`${hours}h ago`);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 10000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefreshInterval || !onRefresh) return;

        const interval = setInterval(() => {
            onRefresh();
        }, autoRefreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefreshInterval, onRefresh]);

    const handleRefresh = async () => {
        if (onRefresh) {
            await onRefresh();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Time ago badge */}
            {timeAgo && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                </motion.div>
            )}

            {/* Live indicator */}
            {autoRefreshInterval && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Live
                    </span>
                </div>
            )}

            {/* Refresh button */}
            {onRefresh && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <AnimatePresence mode="wait">
                        {showSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Check className="h-4 w-4 text-green-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="refresh"
                                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                            >
                                <RefreshCw className={cn(
                                    "h-4 w-4",
                                    isRefreshing && "text-primary"
                                )} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            )}
        </div>
    );
}
