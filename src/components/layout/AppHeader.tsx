import { Search, Sun, Moon, User, LogOut } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { CastButton } from '@/components/shared/CastButton';

interface AppHeaderProps {
  sidebarTrigger?: ReactNode;
  collapseTrigger?: ReactNode;
}

export function AppHeader({ sidebarTrigger, collapseTrigger }: AppHeaderProps) {
  const navigate = useNavigate();
  const { signOut, webUser } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {sidebarTrigger}
        {collapseTrigger}
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-background w-48 md:w-64 h-9 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="text-muted-foreground sm:hidden h-9 w-9">
          <Search className="w-4 h-4" />
        </Button>

        {/* Cast Button */}
        <CastButton />

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground h-9 w-9">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">{webUser.charAt(0).toUpperCase()}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium text-foreground">{webUser}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile} className="text-sm cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="text-sm cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive text-sm cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
