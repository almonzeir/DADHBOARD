// src/components/ui/command-palette.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    LayoutDashboard,
    BarChart3,
    MapPin,
    Users,
    Settings,
    FileText,
    Map,
    ArrowRight,
    Hash,
    Clock,
    Star,
    Zap,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    href?: string;
    action?: () => void;
    category: string;
    keywords?: string[];
}

const quickActions: CommandItem[] = [
    {
        id: 'dashboard',
        title: 'Go to Dashboard',
        description: 'View executive summary',
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: '/',
        category: 'Navigation',
        keywords: ['home', 'overview', 'main'],
    },
    {
        id: 'analytics',
        title: 'Analytics',
        description: 'View detailed analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/analytics',
        category: 'Navigation',
        keywords: ['charts', 'data', 'insights', 'statistics'],
    },
    {
        id: 'places',
        title: 'Places',
        description: 'Manage tourist attractions',
        icon: <MapPin className="h-4 w-4" />,
        href: '/places',
        category: 'Navigation',
        keywords: ['attractions', 'locations', 'spots', 'tourism'],
    },
    {
        id: 'districts',
        title: 'Districts',
        description: 'View all districts',
        icon: <Map className="h-4 w-4" />,
        href: '/districts',
        category: 'Navigation',
        keywords: ['areas', 'regions', 'zones'],
    },
    {
        id: 'users',
        title: 'User Management',
        description: 'Manage admin users',
        icon: <Users className="h-4 w-4" />,
        href: '/admin-management',
        category: 'Navigation',
        keywords: ['admins', 'staff', 'team'],
    },
    {
        id: 'reports',
        title: 'Reports',
        description: 'Generate and export reports',
        icon: <FileText className="h-4 w-4" />,
        href: '/reports',
        category: 'Navigation',
        keywords: ['export', 'pdf', 'csv', 'download'],
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'Profile and preferences',
        icon: <Settings className="h-4 w-4" />,
        href: '/settings',
        category: 'Navigation',
        keywords: ['profile', 'account', 'preferences'],
    },
];

const recentSearches: CommandItem[] = [
    {
        id: 'recent-1',
        title: 'Monthly Report',
        icon: <Clock className="h-4 w-4 text-muted-foreground" />,
        href: '/reports',
        category: 'Recent',
    },
    {
        id: 'recent-2',
        title: 'Top Places',
        icon: <Star className="h-4 w-4 text-muted-foreground" />,
        href: '/places',
        category: 'Recent',
    },
];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!search) {
            return {
                navigation: quickActions,
                recent: recentSearches,
            };
        }

        const searchLower = search.toLowerCase();
        const filtered = quickActions.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(searchLower);
            const matchDescription = item.description?.toLowerCase().includes(searchLower);
            const matchKeywords = item.keywords?.some(k => k.includes(searchLower));
            return matchTitle || matchDescription || matchKeywords;
        });

        return {
            navigation: filtered,
            recent: [],
        };
    }, [search]);

    const allItems = [...filteredItems.recent, ...filteredItems.navigation];

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % allItems.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    const selected = allItems[selectedIndex];
                    if (selected) {
                        handleSelect(selected);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, allItems, selectedIndex]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleSelect = useCallback((item: CommandItem) => {
        setIsOpen(false);
        if (item.href) {
            router.push(item.href);
        } else if (item.action) {
            item.action();
        }
    }, [router]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-[101]"
                        >
                            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <Input
                                        type="text"
                                        placeholder="Search pages, actions, and more..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base placeholder:text-muted-foreground/60"
                                        autoFocus
                                    />
                                    <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground">
                                        ESC
                                    </kbd>
                                </div>

                                {/* Results */}
                                <div className="max-h-[60vh] overflow-y-auto p-2">
                                    {allItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                            <Zap className="h-12 w-12 mb-3 opacity-40" />
                                            <p className="font-medium">No results found</p>
                                            <p className="text-sm">Try searching for something else</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Recent Section */}
                                            {filteredItems.recent.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        Recent
                                                    </p>
                                                    {filteredItems.recent.map((item, index) => (
                                                        <CommandItemComponent
                                                            key={item.id}
                                                            item={item}
                                                            isSelected={selectedIndex === index}
                                                            onClick={() => handleSelect(item)}
                                                            onHover={() => setSelectedIndex(index)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Navigation Section */}
                                            {filteredItems.navigation.length > 0 && (
                                                <div>
                                                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        {search ? 'Results' : 'Quick Navigation'}
                                                    </p>
                                                    {filteredItems.navigation.map((item, index) => {
                                                        const actualIndex = index + filteredItems.recent.length;
                                                        return (
                                                            <CommandItemComponent
                                                                key={item.id}
                                                                item={item}
                                                                isSelected={selectedIndex === actualIndex}
                                                                onClick={() => handleSelect(item)}
                                                                onHover={() => setSelectedIndex(actualIndex)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑</kbd>
                                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↓</kbd>
                                            Navigate
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd>
                                            Select
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span>{allItems.length} results</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

interface CommandItemComponentProps {
    item: CommandItem;
    isSelected: boolean;
    onClick: () => void;
    onHover: () => void;
}

function CommandItemComponent({ item, isSelected, onClick, onHover }: CommandItemComponentProps) {
    return (
        <button
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent text-foreground"
            )}
            onClick={onClick}
            onMouseEnter={onHover}
        >
            <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
            )}>
                {item.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
            </div>
            {isSelected && (
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
            )}
        </button>
    );
}
