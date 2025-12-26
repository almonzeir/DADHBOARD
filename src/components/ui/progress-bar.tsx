// src/components/ui/progress-bar.tsx

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger';
    animated?: boolean;
    className?: string;
}

const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

const variantStyles = {
    default: 'bg-primary',
    gradient: 'bg-gradient-to-r from-primary via-purple-500 to-pink-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
};

export function ProgressBar({
    value,
    max = 100,
    showLabel = false,
    label,
    size = 'md',
    variant = 'default',
    animated = true,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn("w-full", className)}>
            {(showLabel || label) && (
                <div className="flex items-center justify-between mb-2">
                    {label && <span className="text-sm font-medium text-foreground">{label}</span>}
                    {showLabel && (
                        <span className="text-sm font-medium text-muted-foreground">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}

            <div className={cn(
                "w-full rounded-full bg-muted overflow-hidden",
                sizeStyles[size]
            )}>
                <motion.div
                    className={cn(
                        "h-full rounded-full",
                        variantStyles[variant]
                    )}
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: animated ? 1 : 0,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                />
            </div>
        </div>
    );
}

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    showValue?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    className?: string;
}

const circleVariantColors = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-amber-500',
    danger: 'stroke-red-500',
};

export function CircularProgress({
    value,
    max = 100,
    size = 60,
    strokeWidth = 6,
    showValue = true,
    variant = 'default',
    className,
}: CircularProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={circleVariantColors[variant]}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                />
            </svg>
            {showValue && (
                <span className="absolute text-sm font-bold">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}
