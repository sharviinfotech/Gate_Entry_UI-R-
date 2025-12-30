import { useState } from 'react';
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

// Role types
export type UserRole = 'admin' | 'security' | 'stores' | 'finance' | 'viewer';

interface SubNavItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subItems?: SubNavItem[];
}

// Navigation structure matching user's requirement - Dashboard at top
const navigationItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { 
    label: 'Inward', 
    icon: ArrowDownToLine,
    subItems: [
      { label: 'With Reference PO', path: '/inward/po-reference' },
      { label: 'Subcontracting', path: '/inward/subcontracting' },
      { label: 'Without Reference', path: '/inward/without-reference' },
    ]
  },
  { 
    label: 'Outward', 
    icon: ArrowUpFromLine,
    subItems: [
      { label: 'Billing Reference', path: '/outward/billing-reference' },
      { label: 'Non-Returnable', path: '/outward/non-returnable' },
      { label: 'Returnable', path: '/outward/returnable' },
    ]
  },
  { label: 'Change', icon: FileEdit, path: '/change' },
  { label: 'Display', icon: Eye, path: '/display' },
  { label: 'Exit', icon: DoorOpen, path: '/vehicle-exit' },
  { label: 'Cancel', icon: XCircle, path: '/cancel' },
  { label: 'Print', icon: Printer, path: '/print' },
  { label: 'Report Analysis', icon: BarChart3, path: '/reports' },
  { label: 'User & Role Management', icon: Settings, path: '/settings' },
  { label: 'Help & Support', icon: HelpCircle, path: '/help' },
];

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function AppSidebar({ isOpen, onToggle, isCollapsed, onCollapse }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
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
      if (hasSubItems) {
        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  onCollapse();
                  setOpenGroups(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 mx-auto
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.path!}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={({ isActive }) => 
                `flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 mx-auto
                ${isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    // Expanded state
    if (hasSubItems) {
      return (
        <Collapsible key={item.label} open={isGroupOpen} onOpenChange={() => toggleGroup(item.label)}>
          <CollapsibleTrigger asChild>
            <button
              className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-sidebar-primary' 
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isGroupOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-7 mt-0.5 space-y-0.5">
            {item.subItems!.map(subItem => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                  }`
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
        onClick={() => window.innerWidth < 1024 && onToggle()}
        className={({ isActive }) => 
          `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
          }`
        }
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        <span className="text-sm font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            onClick={onToggle}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:sticky inset-y-0 left-0 top-0 z-50
            ${isCollapsed ? 'w-[72px]' : 'w-[260px]'} h-screen bg-sidebar flex flex-col
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo Section */}
          <div className={`h-16 flex items-center flex-shrink-0 border-b border-sidebar-border/20 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-xl p-1.5 shadow-md">
                    <img 
                      src={reslLogo} 
                      alt="RESL Logo" 
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-sidebar-foreground font-bold text-sm leading-tight">RE Sustainability</h1>
                    <p className="text-sidebar-foreground/50 text-[10px]">Gate Entry System</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden lg:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7"
                    onClick={onCollapse}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
                    onClick={onToggle}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white rounded-lg p-1 shadow-md">
                  <img 
                    src={reslLogo} 
                    alt="RESL Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden lg:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7"
                  onClick={onCollapse}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <nav className={`flex-1 overflow-y-auto scrollbar-thin py-2 ${isCollapsed ? 'px-3' : 'px-3'}`}>
            <div className="space-y-0.5">
              {navigationItems.map(renderNavItem)}
            </div>
          </nav>

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