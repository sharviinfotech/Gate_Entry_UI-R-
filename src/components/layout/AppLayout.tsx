import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppSidebar, SidebarTrigger, SidebarCollapseTrigger, UserRole } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCastMode = new URLSearchParams(location.search).get('cast') === '1';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleCollapse = () => setSidebarCollapsed(prev => !prev);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isCastMode) {
    return (
      <div className="min-h-screen bg-background w-full">
        <main className="min-h-screen p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background w-full">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        isCollapsed={sidebarCollapsed}
        onCollapse={toggleCollapse}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AppHeader 
          sidebarTrigger={<SidebarTrigger onClick={toggleSidebar} />}
          collapseTrigger={<SidebarCollapseTrigger isCollapsed={sidebarCollapsed} onClick={toggleCollapse} />}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
