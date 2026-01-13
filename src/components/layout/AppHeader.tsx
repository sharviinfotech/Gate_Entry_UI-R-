import { Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { CastButton } from '@/components/shared/CastButton';
import { useEffect } from 'react';
export function AppHeader({ sidebarTrigger, collapseTrigger }: any) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  // 1. Pull everything from AuthContext
  // Note: Remove the local useState for selectedPlant/Role to fix the error
  const { 
    user, 
    signOut, 
    selectedPlant, 
    setSelectedPlant, 
    selectedRole, 
    setSelectedRole 
  } = useAuth();

  // 2. Derive available roles based on the global selectedPlant
  const availableRoles = useMemo(() => {
    if (!selectedPlant || !user?.PLANTS) return [];
    const plantObj = user.PLANTS.find((p) => String(p.PLANT) === String(selectedPlant));
    return plantObj?.ROLES || [];
  }, [selectedPlant, user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex items-center gap-4">
        {sidebarTrigger}
        {collapseTrigger}
        
        {/* Plant Dropdown */}
        <Select 
          value={selectedPlant}
          onValueChange={(val) => {
            navigate('/dashboard');
            
            setSelectedPlant(val);
            console.log("val",val)
            localStorage.setItem('SelectedPlant', val);
            // When plant changes, auto-select the first role of that new plant
            const newPlant = user?.PLANTS.find(p => String(p.PLANT) === val);
            if (newPlant && newPlant.ROLES.length > 0) {
              setSelectedRole(newPlant.ROLES[0].ROLE);
            } else {
              setSelectedRole("");
            }
          }}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Select Plant" />
          </SelectTrigger>
          <SelectContent>
            {user?.PLANTS?.map((p) => (
              <SelectItem key={p.PLANT} value={String(p.PLANT)}>
                Plant {p.PLANT}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Dropdown */}
        <Select 
          disabled={!selectedPlant} 
          onValueChange={setSelectedRole}
          value={selectedRole}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.length > 0 ? (
              availableRoles.map((r) => (
                r.ROLE && (
                  <SelectItem key={r.ROLE} value={String(r.ROLE)}>
                    {r.ROLE}
                  </SelectItem>
                )
              ))
            ) : (
              <div className="p-2 text-xs text-muted-foreground">No roles available</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        <CastButton />
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground h-9 w-9">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {user?.FIRST_NAME?.charAt(0) || 'U'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.FIRST_NAME} {user?.LAST_NAME}</p>
              <p className="text-xs text-muted-foreground">{user?.EMAIL}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}