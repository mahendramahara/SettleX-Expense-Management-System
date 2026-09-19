import React from 'react';
import { LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { FontSwitcher } from '../ui/FontSwitcher';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Navbar({ onOpenAuthModal, onNavigateHome }) {
  const { user, isAuthenticated, isGuest, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#080e1a]/85 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo size="md" onClick={onNavigateHome} />
          {isGuest && (
            <Badge variant="warning" size="sm" className="hidden sm:inline-flex gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Guest Demo Mode</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <FontSwitcher />
          <ThemeSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {user?.tier || 'Free'} Tier
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Sign Out"
                className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenAuthModal} className="ml-2">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
