import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileEdit,
  Eye,
  DoorOpen,
  XCircle,
  Printer,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import reslLogo from '@/assets/resl-logo.png';
import { useAuth } from '@/contexts/AuthContext'; // Import the Auth hook
import { useTheme } from '@/contexts/ThemeContext';
interface SubNavItem {
  label: string;
  path: string;
  activity: string; // Added activity key for permission check
}
export type UserRole = 'admin' | 'security' | 'stores' | 'finance' | 'viewer';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  activity?: string; // Added activity key for permission check
  subItems?: SubNavItem[];
}

// 1. Updated Navigation Structure with Activity IDs matching your API response
const navigationItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', activity: 'Dashboard' },
  { 
    label: 'Inward', 
    icon: ArrowDownToLine,
    subItems: [
      { label: 'With Reference PO', path: '/inward/po-reference', activity: 'InwardPOReference' },
      { label: 'Subcontracting', path: '/inward/subcontracting', activity: 'InwardSubcontracting' },
      { label: 'Without Reference', path: '/inward/without-reference', activity: 'InwardWithoutReference' },
    ]
  },
  { 
    label: 'Outward', 
    icon: ArrowUpFromLine,
    subItems: [
      { label: 'Billing Reference', path: '/outward/billing-reference', activity: 'OutwardBillingReference' },
      { label: 'Non-Returnable', path: '/outward/non-returnable', activity: 'OutwardNonReturnable' },
      { label: 'Returnable', path: '/outward/returnable', activity: 'OutwardReturnable' },
    ]
  },
  { label: 'Change', icon: FileEdit, path: '/change', activity: 'ChangeEntry' },
  { label: 'Display', icon: Eye, path: '/display', activity: 'Display' },
  { label: 'Exit', icon: DoorOpen, path: '/vehicle-exit', activity: 'VehicleExit' },
  { label: 'Cancel', icon: XCircle, path: '/cancel', activity: 'Cancel' },
  { label: 'Print', icon: Printer, path: '/print', activity: 'Print' },
  { label: 'Report Analysis', icon: BarChart3, path: '/reports', activity: 'Report' },
  { label: 'User & Role Management', icon: Settings, path: '/settings', activity: 'Settings' },
  { label: 'Help & Support', icon: HelpCircle, path: '/help', activity: 'Help' },
];

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

export function AppSidebar({ isOpen, onToggle, isCollapsed, onCollapse }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activities, signOut } = useAuth(); // 2. Get permissions from context
  const [openGroups, setOpenGroups] = useState<string[]>([]);
const { currentTheme } = useTheme();
  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  // 3. Permission Filtering Logic
  const filteredNavigation = useMemo(() => {
    return navigationItems.filter(item => {
      // If item has subItems, check if at least one subItem is allowed
      if (item.subItems) {
        const allowedSubs = item.subItems.filter(sub => activities.includes(sub.activity));
        // We temporarily override the subItems for this render instance
        if (allowedSubs.length > 0) {
          item.subItems = allowedSubs;
          return true;
        }
        return false;
      }
      
      // For single items, Dashboard is always allowed, others check activities array
      return item.activity === 'Dashboard' || (item.activity && activities.includes(item.activity));
    });
  }, [activities]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const isSubItemActive = (subItems: SubNavItem[]) => {
    return subItems.some(item => location.pathname === item.path);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isGroupOpen = openGroups.includes(item.label);
    const isActive = item.path ? location.pathname === item.path : isSubItemActive(item.subItems || []);

    if (isCollapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            {hasSubItems ? (
              <button
                onClick={() => {
                  onCollapse();
                  setOpenGroups(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all mx-auto
                  ${isActive ? 'bg-sidebar-accent/50 text-sidebar-primary-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'}`}
                >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            ) : (
              <NavLink
                to={item.path!}
                className={({ isActive }) => 
                  `flex items-center justify-center w-9 h-9 rounded-lg transition-all mx-auto
                  ${isActive ? 'bg-sidebar-accent/50 text-sidebar-primary-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'}`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
              </NavLink>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    if (hasSubItems) {
      return (
        <Collapsible key={item.label} open={isGroupOpen} onOpenChange={() => toggleGroup(item.label)}>
          <CollapsibleTrigger asChild>
            <button className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all
                ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30'}`}>
              <div className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isGroupOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-7 mt-0.5 space-y-0.5">
            {item.subItems!.map(subItem => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                  ${isActive ? 'bg-sidebar-accent/50 text-sidebar-primary-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30'}`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {subItem.label}
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        className={({ isActive }) => 
          `flex items-center gap-3 px-4 py-2 rounded-lg transition-all
          ${isActive ? 'bg-sidebar-accent/50 text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30'}`
        }
      >
        <Icon className="w-[18px] h-[18px]" />
        <span className="text-sm font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />}
        <aside style={{ background: currentTheme.gradient }}
          className={`fixed lg:sticky inset-y-0 left-0 top-0 z-50 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'} h-screen flex flex-col transform transition-all duration-300 text-white shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className={`h-16 flex items-center border-b border-sidebar-border/20 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl p-1.5 shadow-md">
                  <img src={reslLogo} alt="RESL Logo" className="h-9 w-auto" />
                </div>
                <div>
                  <h1 className="text-sidebar-foreground font-bold text-sm">RE Sustainability</h1>
                  <p className="text-sidebar-foreground/50 text-[10px]">Gate Entry System</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={isCollapsed ? onCollapse : onCollapse} className="h-7 w-7 text-sidebar-foreground/60">
              {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2 px-3">
            <div className="space-y-0.5">
              {/* 4. Render the filtered navigation items */}
              {filteredNavigation.map(renderNavItem)}
            </div>
          </nav>
          
          <div className="p-4 border-t border-sidebar-border/20">
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                {!isCollapsed && <span>Logout</span>}
             </Button>
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
}
export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}

export function SidebarCollapseTrigger({ isCollapsed, onClick }: { isCollapsed: boolean; onClick: () => void }) {
  return null;
}