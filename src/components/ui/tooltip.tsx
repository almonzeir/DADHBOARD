// src/components/ui/tooltip.tsx

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export function Tooltip({
    content,
    children,
    side = 'top',
    delay = 200,
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const animationVariants = {
        top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
        bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={animationVariants[side].initial}
                        animate={animationVariants[side].animate}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={cn(
                            "absolute z-50 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap",
                            "bg-popover text-popover-foreground border border-border/50 shadow-lg",
                            "backdrop-blur-xl",
                            positionStyles[side],
                            className
                        )}
                    >
                        {content}
                        {/* Arrow */}
                        <div className={cn(
                            "absolute w-2 h-2 bg-popover border-border/50 rotate-45",
                            side === 'top' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b",
                            side === 'bottom' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t",
                            side === 'left' && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t border-r",
                            side === 'right' && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b border-l",
                        )} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
