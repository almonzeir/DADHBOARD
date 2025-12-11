// src/components/layout/sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Map,
  MapPin,
  UserCircle,
  Route,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { NAVIGATION_ITEMS, APP_NAME } from '@/lib/constants';
import { useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Users,
  Map,
  MapPin,
  UserCircle,
  Route,
  FileText,
  Settings,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = admin?.role
    ? NAVIGATION_ITEMS[admin.role as keyof typeof NAVIGATION_ITEMS] || []
    : [];

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-[70px]' : 'w-[260px]',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{APP_NAME}</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'gradient-bg text-white shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                {Icon && <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-white')} />}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            collapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}