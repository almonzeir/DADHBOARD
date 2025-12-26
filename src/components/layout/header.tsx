// src/components/layout/header.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Command, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { cn, getInitials, getRoleBadgeColor, getRoleDisplayName } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@/components/ui/notification-center';
import { CommandPalette } from '@/components/ui/command-palette';

export function Header() {
  const { admin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Open command palette on click
  const openCommandPalette = useCallback(() => {
    // Trigger the keyboard event to open command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-4 md:px-6">
        {/* Search - Opens Command Palette */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <button
            onClick={openCommandPalette}
            className="relative w-full group flex items-center"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-full pl-10 pr-16 bg-muted/50 border border-transparent h-10 rounded-xl flex items-center text-sm text-muted-foreground hover:bg-muted/80 hover:border-border transition-all cursor-pointer">
                Search anything...
              </div>
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-xl hover:bg-accent/80 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px] text-yellow-500 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-[18px] w-[18px] transition-transform hover:-rotate-12" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Notification Center */}
          <NotificationCenter />

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-2 hidden md:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3 h-10 rounded-xl hover:bg-accent/80 transition-colors">
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-lg">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-bold">
                    {admin ? getInitials(admin.full_name || '') : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold leading-none">
                    {admin?.full_name || 'Admin'}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {getRoleDisplayName(admin?.role || '')}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl">
              <DropdownMenuLabel className="p-3 bg-muted/50 rounded-lg mb-2">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-semibold">{admin?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{admin?.email}</p>
                  <Badge
                    variant="secondary"
                    className={cn(getRoleBadgeColor(admin?.role || ''), 'w-fit mt-1.5 text-[10px]')}
                  >
                    {getRoleDisplayName(admin?.role || '')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="py-2.5 px-3 cursor-pointer rounded-lg"
                onClick={() => router.push('/settings')}
              >
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={logout}
                className="py-2.5 px-3 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette - Mounted at top level */}
      <CommandPalette />
    </>
  );
}