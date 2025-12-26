// src/components/layout/mobile-nav.tsx

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    MapPin,
    BarChart3,
    FileText,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
    { href: '/', icon: LayoutDashboard, label: 'Home' },
    { href: '/places', icon: MapPin, label: 'Places' },
    { href: '/reports', icon: FileText, label: 'Reports' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-16 h-full"
                        >
                            <motion.div
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors",
                                    isActive && "bg-primary/10"
                                )}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavIndicator"
                                        className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
