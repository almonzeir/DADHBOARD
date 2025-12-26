// src/components/ui/notification-center.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Check,
    CheckCheck,
    X,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    MapPin,
    TrendingUp,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'success',
        title: 'New Place Added',
        message: 'Gunung Baling has been successfully added to the attractions list.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        icon: <MapPin className="h-4 w-4" />,
    },
    {
        id: '2',
        type: 'info',
        title: 'Admin Request',
        message: 'A new admin registration request is awaiting your approval.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        icon: <Users className="h-4 w-4" />,
    },
    {
        id: '3',
        type: 'warning',
        title: 'Low Activity Alert',
        message: 'District Sik has shown decreased tourist activity this month.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
        icon: <TrendingUp className="h-4 w-4" />,
    },
    {
        id: '4',
        type: 'success',
        title: 'Report Generated',
        message: 'Your monthly analytics report has been generated successfully.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
        icon: <CheckCircle className="h-4 w-4" />,
    },
];

const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return {
                bg: 'bg-green-500/10',
                icon: 'text-green-500',
                border: 'border-green-500/20',
            };
        case 'warning':
            return {
                bg: 'bg-amber-500/10',
                icon: 'text-amber-500',
                border: 'border-amber-500/20',
            };
        case 'error':
            return {
                bg: 'bg-red-500/10',
                icon: 'text-red-500',
                border: 'border-red-500/20',
            };
        default:
            return {
                bg: 'bg-blue-500/10',
                icon: 'text-blue-500',
                border: 'border-blue-500/20',
            };
    }
};

const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="h-4 w-4" />;
        case 'warning':
            return <AlertTriangle className="h-4 w-4" />;
        case 'error':
            return <XCircle className="h-4 w-4" />;
        default:
            return <Info className="h-4 w-4" />;
    }
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl hover:bg-accent/80 transition-colors"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center"
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                                <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-destructive text-[10px] font-bold text-destructive-foreground">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[380px] p-0 rounded-2xl border shadow-xl"
                sideOffset={12}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-3 opacity-40" />
                            <p className="font-medium">No notifications</p>
                            <p className="text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            <AnimatePresence>
                                {notifications.map((notification, index) => {
                                    const styles = getTypeStyles(notification.type);
                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, height: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "group relative flex gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                                                notification.isRead
                                                    ? "hover:bg-accent/50"
                                                    : "bg-accent/30 hover:bg-accent/50"
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            {/* Unread Indicator */}
                                            {!notification.isRead && (
                                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}

                                            {/* Icon */}
                                            <div className={cn(
                                                "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                                                styles.bg
                                            )}>
                                                <span className={styles.icon}>
                                                    {notification.icon || getTypeIcon(notification.type)}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.isRead && "text-foreground"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {formatTimeAgo(notification.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive"
                            onClick={clearAll}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Clear all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
