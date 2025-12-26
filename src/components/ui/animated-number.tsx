// src/components/ui/animated-number.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    formatFn?: (value: number) => string;
    className?: string;
}

export function AnimatedNumber({
    value,
    duration = 1000,
    formatFn = (v) => Math.round(v).toLocaleString(),
    className,
}: AnimatedNumberProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration,
    });

    const display = useTransform(spring, (current) => formatFn(current));
    const [displayValue, setDisplayValue] = useState(formatFn(0));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        return display.on('change', (latest) => {
            setDisplayValue(latest);
        });
    }, [display]);

    return (
        <motion.span className={cn("tabular-nums", className)}>
            {displayValue}
        </motion.span>
    );
}

interface AnimatedCounterProps {
    from: number;
    to: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export function AnimatedCounter({
    from,
    to,
    duration = 2000,
    className,
    prefix = '',
    suffix = '',
    decimals = 0,
}: AnimatedCounterProps) {
    const [count, setCount] = useState(from);
    const countRef = useRef<HTMLSpanElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!countRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    animateValue(from, to, duration);
                }
            },
            { threshold: 0.5 }
        );

        observerRef.current.observe(countRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [from, to, duration]);

    const animateValue = (start: number, end: number, dur: number) => {
        const startTime = performance.now();

        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / dur, 1);

            // Easing function (ease-out cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = start + (end - start) * easeProgress;
            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString();

    return (
        <span ref={countRef} className={cn("tabular-nums", className)}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}
