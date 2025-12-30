import { useState, useMemo, useEffect, useCallback } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileEdit,
  Eye,
  DoorOpen,
  XCircle,
  Printer,
  BarChart3,
  Clock,
  Package,
  Truck,
  Palette,
  Building2,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ModuleCard } from '@/components/shared/ModuleCard';
import { StatCard } from '@/components/shared/StatCard';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// Enhanced stats for Purchase & Plant
const stats = [
  { title: "Today's Inward", value: 24, icon: ArrowDownToLine, trend: { value: 12, isPositive: true }, color: 'accent' as const, path: '/inward/po-reference' },
  { title: "Today's Outward", value: 18, icon: ArrowUpFromLine, trend: { value: 8, isPositive: true }, color: 'info' as const, path: '/outward/billing-reference' },
  { title: 'Pending Exit', value: 7, icon: Clock, color: 'warning' as const, path: '/vehicle-exit' },
  { title: 'Total Vehicles', value: 156, icon: Truck, trend: { value: 5, isPositive: true }, color: 'primary' as const, path: '/reports' },
];

const modules = [
  {
    title: 'Inward Gate Entry',
    description: 'Record incoming materials with PO reference or manual entry',
    icon: ArrowDownToLine,
    path: '/inward/po-reference',
    color: 'accent' as const,
    shortcut: '1',
  },
  {
    title: 'Outward Gate Entry',
    description: 'Track outgoing materials with billing reference',
    icon: ArrowUpFromLine,
    path: '/outward/billing-reference',
    color: 'info' as const,
    shortcut: '2',
  },
  {
    title: 'Print Entry',
    description: 'Generate and print gate entry documents',
    icon: Printer,
    path: '/print',
    color: 'primary' as const,
    shortcut: '3',
  },
  {
    title: 'Reports',
    description: 'Generate comprehensive gate entry reports',
    icon: BarChart3,
    path: '/reports',
    color: 'info' as const,
    shortcut: '4',
  },
];

const recentEntries = [
  { id: 'GE-2024-001', type: 'Inward', vendor: 'ABC Suppliers', vehicle: 'MH-12-AB-1234', time: '10:30 AM', status: 'Active', plant: '3601', refType: 'PO' },
  { id: 'GE-2024-002', type: 'Outward', vendor: 'XYZ Trading', vehicle: 'MH-14-CD-5678', time: '11:15 AM', status: 'Exited', plant: '3601', refType: 'SO' },
  { id: 'GE-2024-003', type: 'Inward', vendor: 'PQR Industries', vehicle: 'MH-04-EF-9012', time: '12:00 PM', status: 'Active', plant: '3602', refType: 'PO' },
  { id: 'GE-2024-004', type: 'Inward', vendor: 'LMN Enterprises', vehicle: 'MH-20-GH-3456', time: '01:45 PM', status: 'Active', plant: '3601', refType: 'SUB' },
];

const welcomeThemes = [
  { name: 'Teal', gradient: 'from-accent via-accent/90 to-primary' },
  { name: 'Blue', gradient: 'from-blue-600 via-blue-500 to-indigo-600' },
  { name: 'Purple', gradient: 'from-purple-600 via-purple-500 to-pink-500' },
  { name: 'Green', gradient: 'from-emerald-600 via-emerald-500 to-teal-500' },
  { name: 'Orange', gradient: 'from-orange-500 via-orange-400 to-amber-500' },
  { name: 'Red', gradient: 'from-rose-600 via-rose-500 to-pink-500' },
];

// Chart colors
const CHART_COLORS = {
  primary: 'hsl(213, 50%, 23%)',
  accent: 'hsl(166, 72%, 35%)',
  success: 'hsl(152, 69%, 40%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)',
  destructive: 'hsl(0, 72%, 51%)',
};

// Plant-wise data
const plantData = [
  { plant: '3601', name: 'Main Plant', inward: 45, outward: 32, pending: 4 },
  { plant: '3602', name: 'Unit 2', inward: 28, outward: 22, pending: 3 },
  { plant: '3603', name: 'Unit 3', inward: 15, outward: 12, pending: 0 },
];

// Purchase Order status
const poStatusData = [
  { name: 'PO Received', value: 65, fill: CHART_COLORS.success },
  { name: 'Pending GRN', value: 20, fill: CHART_COLORS.warning },
  { name: 'Partial Delivery', value: 12, fill: CHART_COLORS.info },
  { name: 'Overdue', value: 3, fill: CHART_COLORS.destructive },
];

// Weekly trend data
const weeklyTrendData = [
  { day: 'Mon', inward: 28, outward: 22 },
  { day: 'Tue', inward: 35, outward: 28 },
  { day: 'Wed', inward: 42, outward: 35 },
  { day: 'Thu', inward: 38, outward: 30 },
  { day: 'Fri', inward: 45, outward: 38 },
  { day: 'Sat', inward: 20, outward: 15 },
  { day: 'Sun', inward: 8, outward: 5 },
];

// Top vendors data
const topVendorsData = [
  { name: 'Tata Motors Ltd.', entries: 28, value: '₹45.2L' },
  { name: 'Ramky Enviro', entries: 22, value: '₹32.8L' },
  { name: 'Bharat Forge', entries: 18, value: '₹28.5L' },
  { name: 'Samsung Electronics', entries: 15, value: '₹24.2L' },
  { name: 'Mahindra Ltd.', entries: 12, value: '₹18.6L' },
];

// Top users data
const topUsersData = [
  { name: 'WebUser', entries: 45, role: 'Admin' },
  { name: 'Rajesh Kumar', entries: 38, role: 'Security' },
  { name: 'Priya Sharma', entries: 32, role: 'Stores' },
  { name: 'Anil Verma', entries: 28, role: 'Finance' },
  { name: 'Sunita Patil', entries: 24, role: 'Viewer' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const userName = 'WebUser';
  
  const [themeIndex, setThemeIndex] = useState(0);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const currentTheme = welcomeThemes[themeIndex];

  const cycleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % welcomeThemes.length);
  };

  // Keyboard shortcuts for Quick Actions
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    const key = event.key;
    const module = modules.find(m => m.shortcut === key);
    if (module) {
      navigate(module.path);
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Calculate summary KPIs
  const summaryKpis = useMemo(() => ({
    totalPOs: 156,
    pendingGRN: 23,
    avgProcessTime: '2.5 hrs',
    complianceRate: 98.5,
  }), []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* User Welcome Banner with Themed Gradient */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentTheme.gradient} py-5 px-6 text-white animate-slide-up shadow-lg`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">{greeting}</p>
            <h1 className="text-xl font-bold">{userName}</h1>
            <p className="text-white/70 text-sm mt-1">Ready to manage today's gate operations.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase tracking-wide">Today</p>
              <p className="text-white font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
              <p className="text-white/80 text-sm">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Package className="w-6 h-6 text-white/80" />
            </div>
            <button 
              onClick={cycleTheme}
              className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
              title="Change theme color"
            >
              <Palette className="w-3 h-3" />
              {currentTheme.name}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Stats Grid - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ animationDelay: '0.1s' }}>
        {stats.map((stat, index) => (
          <div 
            key={stat.title} 
            className="animate-slide-up cursor-pointer transform hover:scale-[1.02] transition-all duration-200" 
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            onClick={() => navigate(stat.path)}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Actions with Keyboard Shortcuts - Collapsible */}
      <Collapsible defaultOpen className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="enterprise-card">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg group">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Press 1-4 for quick access</span>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-3 pt-2">
              {modules.map((module, index) => (
                <div 
                  key={module.title} 
                  className="relative group" 
                  onMouseEnter={() => setHoveredModule(module.title)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <div 
                    className={`absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md transition-all duration-200 ${hoveredModule === module.title ? 'scale-110 ring-2 ring-primary/50' : ''}`}
                  >
                    {module.shortcut}
                  </div>
                  <ModuleCard {...module} />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Purchase & Plant Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant-wise Summary */}
        <div className="enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Plant-wise Summary</h3>
            </div>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="space-y-3">
            {plantData.map((plant) => (
              <div 
                key={plant.plant} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate('/reports')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{plant.plant}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{plant.name}</p>
                    <p className="text-xs text-muted-foreground">Plant Code: {plant.plant}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-accent">{plant.inward}</p>
                    <p className="text-xs text-muted-foreground">In</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-info">{plant.outward}</p>
                    <p className="text-xs text-muted-foreground">Out</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-warning">{plant.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Order Status */}
        <div className="enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Purchase Order Status</h3>
            </div>
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={poStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {poStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Weekly Gate Entry Trend</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.accent }} />
                <span className="text-muted-foreground">Inward</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.info }} />
                <span className="text-muted-foreground">Outward</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="inward" 
                stroke={CHART_COLORS.accent} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.accent, strokeWidth: 2 }}
                name="Inward"
              />
              <Line 
                type="monotone" 
                dataKey="outward" 
                stroke={CHART_COLORS.info} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.info, strokeWidth: 2 }}
                name="Outward"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick KPIs for Purchase */}
        <div className="enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Purchase KPIs</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">Active POs</span>
              </div>
              <span className="font-bold text-accent">{summaryKpis.totalPOs}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">Pending GRN</span>
              </div>
              <span className="font-bold text-warning">{summaryKpis.pendingGRN}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-info" />
                <span className="text-sm text-foreground">Avg Process Time</span>
              </div>
              <span className="font-bold text-info">{summaryKpis.avgProcessTime}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-foreground">Compliance</span>
              </div>
              <span className="font-bold text-success">{summaryKpis.complianceRate}%</span>
            </div>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Top Vendors</h3>
            </div>
            <span className="text-xs text-muted-foreground">This Month</span>
          </div>
          <div className="space-y-3">
            {topVendorsData.map((vendor, idx) => (
              <div key={vendor.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground" title={vendor.name}>
                    {vendor.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{vendor.entries}</p>
                  <p className="text-xs text-muted-foreground">{vendor.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="enterprise-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Top 5 Users</h3>
            </div>
            <span className="text-xs text-muted-foreground">By Entries</span>
          </div>
          <div className="space-y-3">
            {topUsersData.map((user, idx) => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{user.entries}</p>
                  <p className="text-xs text-muted-foreground">entries</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Gate Entries</h3>
        <div className="enterprise-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Entry No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Plant</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Ref Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Vendor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Vehicle No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium text-accent">{entry.id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">{entry.plant}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge-status ${entry.type === 'Inward' ? 'bg-accent/10 text-accent' : 'bg-info/10 text-info'}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{entry.refType}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{entry.vendor}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{entry.vehicle}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{entry.time}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge-status ${entry.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
