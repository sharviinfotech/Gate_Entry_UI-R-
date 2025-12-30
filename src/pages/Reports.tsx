import { Search, Download, FileSpreadsheet, Package, Truck, Clock, XCircle, CheckCircle, Filter, ChevronDown, BarChart3, PieChart as PieChartIcon, RefreshCw, Calendar, X, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import service from "../services/generalservice.js";
import { Label } from '@/components/ui/label';
import { exportToExcel } from '@/lib/exportToExcel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, subDays, startOfMonth, startOfYear, startOfWeek, endOfWeek } from 'date-fns';


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';








// Reference Document Type mapping for full names
const REF_DOC_TYPE_NAMES: Record<string, string> = {
  'PO': 'Purchase Order',
  'SO': 'Sales Order',
  'SUB': 'Subcontracting',
  'STO': 'Stock Transfer Order',
  'RET': 'Returnable',
  'NRET': 'Non-Returnable',
};

const getRefDocTypeName = (code: string) => REF_DOC_TYPE_NAMES[code] || code;

// Quick date presets
const DATE_PRESETS = [
  { label: 'Today', getValue: () => ({ from: format(new Date(), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Yesterday', getValue: () => ({ from: format(subDays(new Date(), 1), 'yyyy-MM-dd'), to: format(subDays(new Date(), 1), 'yyyy-MM-dd') }) },
  { label: 'This Week', getValue: () => ({ from: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), to: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') }) },
  { label: 'Last 7 Days', getValue: () => ({ from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 30 Days', getValue: () => ({ from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This Month', getValue: () => ({ from: format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'This Year', getValue: () => ({ from: format(startOfYear(new Date()), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }) },
];

// Transform API data to component format
const transformApiData = (apiData: any[]) => {
  return apiData.map(item => ({
    gateEntryNo: item.GENO || '',
    plant: item.WERKS || '',
    type: item.DTYPE || '',
    vehicleDate: item.VHDAT_IN || '',
    vehicleTime: item.VHTIM_IN || '',
    vehicleOutDate: item.VHDAT_OUT || '',
    vehicleOutTime: item.VHTIM_OUT || '',
    vehicleNo: item.VHNO || '',
    driverName: item.DRNAM || '',
    driverNumber: item.DRNUM || '',
    transporterName: item.TRANNAM || '',
    transporterAddress: item.TRADDR || '',
    refDocType: item.REFDOCTYP || '',
    vehicleType: item.VHCL_TYPE || '',
    grLrNum: item.GR_LR_NUM || '',
    inwardedBy: item.INWARDED_BY || '',
    poNo: item.EBELN || '',
    invoiceNo: item.INVNO || '',
    itemNo: item.ITEM || '',
    materialCode: item.MATNR || '',
    materialDesc: item.MAKTX || '',
    quantity: parseFloat(item.CHQTY) || 0,
    unit: item.CHUOM || '',
    vendorNo: item.CVNO || '',
    vendorName: item.CVNAME || '',
    vendorNo1: item.CVNO1 || '',
    vendorName1: item.CVNAME1 || '',
    balanceQty: parseFloat(item.BLQTY) || 0,
    balanceUnit: item.BLUNIT || '',
    zQuantity: parseFloat(item.ZQUANT) || 0,
    zUnit: item.ZMEINS || '',
    packing: item.ZPACKING || '',
    purpose: item.PURPOSE || '',
    remarks: item.REMARKS || '',
    vehicleExit: item.GEEXT === 'X',
    cancelled: item.GECAN === 'X',
    lcDate: item.LCDAT || '',
    mblnr: item.MBLNR1 || '',
    blDate: item.BLDAT || '',
    salesOrg: '',
    webUser: item.INWARDED_BY || '',
  }));
};

interface FilterState {
  gateEntryNoFrom: string;
  gateEntryNoTo: string;
  entryDateFrom: string;
  entryDateTo: string;
  plant: string;
  plantTo: string;
  vehicleNo: string;
  invoiceNoFrom: string;
  invoiceNoTo: string;
  salesOrgFrom: string;
  salesOrgTo: string;
  processType: 'inward' | 'outward' | 'both';
  enteredBy: string;
  smartSearch: string;
}

const CHART_COLORS = {
  primary: 'hsl(213, 50%, 23%)',
  accent: 'hsl(166, 72%, 35%)',
  success: 'hsl(152, 69%, 40%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)',
  destructive: 'hsl(0, 72%, 51%)',
};

const PIE_COLORS = [CHART_COLORS.accent, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.success, CHART_COLORS.destructive];

interface DrillDownData {
  title: string;
  data: any[];
}

export default function Reports() {
  const [filters, setFilters] = useState<FilterState>({
    gateEntryNoFrom: '',
    gateEntryNoTo: '',
    entryDateFrom: '',
    entryDateTo: '',
    plant: '',
    plantTo: '',
    vehicleNo: '',
    invoiceNoFrom: '',
    invoiceNoTo: '',
    salesOrgFrom: '',
    salesOrgTo: '',
    processType: 'both',
    enteredBy: '',
    smartSearch: '',
  });
  const [results, setResults] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeView, setActiveView] = useState<'charts' | 'table'>('charts');
  const [drillDown, setDrillDown] = useState<DrillDownData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Apply date preset
  const applyDatePreset = (preset: typeof DATE_PRESETS[0]) => {
    const { from, to } = preset.getValue();
    setFilters(prev => ({ ...prev, entryDateFrom: from, entryDateTo: to }));
    toast.success(`Applied: ${preset.label}`);
  };

  // Calculate KPIs
  const kpis = useMemo(() => ({
    totalEntries: results.length,
    inwardEntries: results.filter(r => r.type === 'IN').length,
    outwardEntries: results.filter(r => r.type === 'OUT').length,
    vehiclesExited: results.filter(r => r.vehicleExit).length,
    vehiclesPending: results.filter(r => !r.vehicleExit && !r.cancelled).length,
    cancelledEntries: results.filter(r => r.cancelled).length,
    totalQuantity: results.reduce((sum, r) => sum + r.quantity, 0),
  }), [results]);

  // Chart data
  const typeChartData = useMemo(() => [
    { name: 'Inward', value: kpis.inwardEntries, fill: CHART_COLORS.accent },
    { name: 'Outward', value: kpis.outwardEntries, fill: CHART_COLORS.info },
  ], [kpis]);

  const statusChartData = useMemo(() => [
    { name: 'Completed', value: kpis.vehiclesExited, fill: CHART_COLORS.success },
    { name: 'Pending', value: kpis.vehiclesPending, fill: CHART_COLORS.warning },
    { name: 'Cancelled', value: kpis.cancelledEntries, fill: CHART_COLORS.destructive },
  ], [kpis]);

  const plantChartData = useMemo(() => {
    const plantCounts: Record<string, { inward: number; outward: number }> = {};
    results.forEach(r => {
      if (!plantCounts[r.plant]) plantCounts[r.plant] = { inward: 0, outward: 0 };
      if (r.type === 'IN') plantCounts[r.plant].inward++;
      else plantCounts[r.plant].outward++;
    });
    return Object.entries(plantCounts).map(([plant, counts]) => ({
      plant,
      Inward: counts.inward,
      Outward: counts.outward,
    }));
  }, [results]);

  const vendorChartData = useMemo(() => {
    const vendorCounts: Record<string, number> = {};
    results.forEach(r => {
      vendorCounts[r.vendorName] = (vendorCounts[r.vendorName] || 0) + 1;
    });
    return Object.entries(vendorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], idx) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value, fill: PIE_COLORS[idx % PIE_COLORS.length] }));
  }, [results]);

  const refDocTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    results.forEach(r => {
      typeCounts[r.refDocType] = (typeCounts[r.refDocType] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([code, count]) => ({
      code,
      name: getRefDocTypeName(code),
      count
    }));
  }, [results]);

  // Drill-down handlers
  const handleTypeDrillDown = (type: string) => {
    const typeCode = type === 'Inward' ? 'IN' : 'OUT';
    const filtered = results.filter(r => r.type === typeCode);
    setDrillDown({ title: `${type} Entries`, data: filtered });
  };

  const handleStatusDrillDown = (status: string) => {
    let filtered: any[] = [];
    if (status === 'Completed') {
      filtered = results.filter(r => r.vehicleExit && !r.cancelled);
    } else if (status === 'Pending') {
      filtered = results.filter(r => !r.vehicleExit && !r.cancelled);
    } else if (status === 'Cancelled') {
      filtered = results.filter(r => r.cancelled);
    }
    setDrillDown({ title: `${status} Entries`, data: filtered });
  };

  const handlePlantDrillDown = (plant: string, type?: 'Inward' | 'Outward') => {
    let filtered = results.filter(r => r.plant === plant);
    if (type) {
      filtered = filtered.filter(r => (type === 'Inward' ? r.type === 'IN' : r.type === 'OUT'));
    }
    setDrillDown({ title: `Plant ${plant}${type ? ` - ${type}` : ''}`, data: filtered });
  };

  const handleRefTypeDrillDown = (refType: string) => {
    const filtered = results.filter(r => r.refDocType === refType);
    setDrillDown({ title: `${getRefDocTypeName(refType)} Entries`, data: filtered });
  };

  const handleVendorDrillDown = (vendorName: string) => {
    const filtered = results.filter(r => r.vendorName.includes(vendorName.replace('...', '')));
    setDrillDown({ title: `Vendor: ${vendorName}`, data: filtered });
  };

  // Remove empty values from payload
  // Utility: remove empty values from payload
  const cleanPayload = (payload: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined
      )
    );
  };

  // Utility: format date to YYYY-MM-DD
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Prepare process type flags
      const processFlags = {
        R1: filters.processType === "inward" ? "X" : undefined,
        R2: filters.processType === "outward" ? "X" : undefined,
        R3: filters.processType === "both" ? "X" : undefined,
      };

      // Build and sanitize payload
      let payload = cleanPayload({
        GENO_FROM: filters.gateEntryNoFrom,
        GENO_TO: filters.gateEntryNoTo,
        DATE_FROM: formatDate(filters.entryDateFrom),
        DATE_TO: formatDate(filters.entryDateTo),
        WERKS_FROM: filters.plant,
        WERKS_TO: filters.plantTo,
        VEHICLE_NO: filters.vehicleNo,
        INVNO_FROM: filters.invoiceNoFrom,
        INVNO_TO: filters.invoiceNoTo,
        SALES_ORG_F: filters.salesOrgFrom,
        SALES_ORG_T: filters.salesOrgTo,
        ...processFlags,
      });

      // ❗ Mandatory checks
      if (!payload.DATE_FROM || !payload.DATE_TO) {
        toast.error("Please select From Date and To Date");
        setIsLoading(false);
        return;
      }

      if (!payload.R1 && !payload.R2 && !payload.R3) {
        toast.error("Please select Process Type");
        setIsLoading(false);
        return;
      }

      // Call API
      const response = await service.ReportanlaysisDataTable(payload);
      console.log("API Response:", response);

      if (response && Array.isArray(response)) {
        let transformedData = transformApiData(response);

        // Apply client-side smart search
        if (filters.smartSearch) {
          const searchTerm = filters.smartSearch.toLowerCase();
          transformedData = transformedData.filter((r) =>
            r.gateEntryNo.toLowerCase().includes(searchTerm) ||
            r.vehicleNo.toLowerCase().includes(searchTerm) ||
            r.driverName.toLowerCase().includes(searchTerm) ||
            r.transporterName.toLowerCase().includes(searchTerm) ||
            r.vendorName.toLowerCase().includes(searchTerm) ||
            r.materialDesc.toLowerCase().includes(searchTerm) ||
            r.poNo.toLowerCase().includes(searchTerm) ||
            r.invoiceNo.toLowerCase().includes(searchTerm) ||
            r.webUser.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by enteredBy
        if (filters.enteredBy) {
          transformedData = transformedData.filter((r) =>
            r.webUser.toLowerCase().includes(filters.enteredBy.toLowerCase())
          );
        }

        setResults(transformedData);
        setCurrentPage(1);
        toast.success(`Found ${transformedData.length} entries`);
      } else {
        setResults([]);
        toast.error("No data found");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(
        error?.message || "Failed to fetch data. Please try again."
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleExport = () => {
    const columns = [
      { key: 'gateEntryNo', header: 'Gate Entry No' },
      { key: 'plant', header: 'Plant' },
      { key: 'type', header: 'Type' },
      { key: 'vehicleDate', header: 'Vehicle Date' },
      { key: 'vehicleTime', header: 'Vehicle Time' },
      { key: 'vehicleOutDate', header: 'Vehicle Out Date' },
      { key: 'vehicleNo', header: 'Vehicle No' },
      { key: 'driverName', header: 'Driver Name' },
      { key: 'transporterName', header: 'Transporter' },
      { key: 'refDocType', header: 'Ref Doc Type' },
      { key: 'poNo', header: 'PO No' },
      { key: 'materialCode', header: 'Material Code' },
      { key: 'materialDesc', header: 'Material Description' },
      { key: 'vendorNo', header: 'Vendor No' },
      { key: 'vendorName', header: 'Vendor Name' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'salesOrg', header: 'Sales Org' },
      { key: 'invoiceNo', header: 'Invoice No' },
      { key: 'webUser', header: 'Web User' },
    ];
    exportToExcel(results, columns, 'Gate_Entry_Report');
    toast.success('Exported to Excel');
  };

  const handleReset = () => {
    setFilters({
      gateEntryNoFrom: '',
      gateEntryNoTo: '',
      entryDateFrom: '',
      entryDateTo: '',
      plant: '',
      plantTo: '',
      vehicleNo: '',
      invoiceNoFrom: '',
      invoiceNoTo: '',
      salesOrgFrom: '',
      salesOrgTo: '',
      processType: 'both',
      enteredBy: '',
      smartSearch: '',
    });
    setResults([]);
    setCurrentPage(1);
  };

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
      <PageHeader
        title="Report Analysis"
        subtitle="Advanced analytics and reporting dashboard"
        breadcrumbs={[{ label: 'Report Analysis' }]}
      />

      {/* Smart Filter Panel */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <div className="enterprise-card">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Filter className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Selection Criteria</h3>
                  <p className="text-sm text-muted-foreground">Click to {isFilterOpen ? 'collapse' : 'expand'} filters</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4 border-t border-border">
              {/* Filter Grid - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gate Entry Number Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gate Entry Number</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="From"
                      value={filters.gateEntryNoFrom}
                      onChange={(e) => setFilters({ ...filters, gateEntryNoFrom: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                      placeholder="To"
                      value={filters.gateEntryNoTo}
                      onChange={(e) => setFilters({ ...filters, gateEntryNoTo: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Entry Date Range with Quick Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Entry Date</Label>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Quick Select</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {DATE_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset(preset)}
                        className="h-6 text-xs px-2 hover:bg-accent hover:text-accent-foreground"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={filters.entryDateFrom}
                      onChange={(e) => setFilters({ ...filters, entryDateFrom: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                      type="date"
                      value={filters.entryDateTo}
                      onChange={(e) => setFilters({ ...filters, entryDateTo: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Plant Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Plant</Label>
                  <div className="flex items-center gap-2">
                    <Select value={filters.plant} onValueChange={(v) => setFilters({ ...filters, plant: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3601">3601</SelectItem>
                        <SelectItem value="3602">3602</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground text-sm">→</span>
                    <Select value={filters.plantTo} onValueChange={(v) => setFilters({ ...filters, plantTo: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3601">3601</SelectItem>
                        <SelectItem value="3602">3602</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vehicle No */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle No</Label>
                  <Input
                    placeholder="Enter Vehicle Number"
                    value={filters.vehicleNo}
                    onChange={(e) => setFilters({ ...filters, vehicleNo: e.target.value })}
                    className="h-9"
                  />
                </div>

                {/* Invoice Number Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Invoice Number</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="From"
                      value={filters.invoiceNoFrom}
                      onChange={(e) => setFilters({ ...filters, invoiceNoFrom: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                      placeholder="To"
                      value={filters.invoiceNoTo}
                      onChange={(e) => setFilters({ ...filters, invoiceNoTo: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Sales Organization Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sales Organization</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="From"
                      value={filters.salesOrgFrom}
                      onChange={(e) => setFilters({ ...filters, salesOrgFrom: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-muted-foreground text-sm">→</span>
                    <Input
                      placeholder="To"
                      value={filters.salesOrgTo}
                      onChange={(e) => setFilters({ ...filters, salesOrgTo: e.target.value })}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Entered By */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Entered By</Label>
                  <Input
                    placeholder="Enter User Name"
                    value={filters.enteredBy}
                    onChange={(e) => setFilters({ ...filters, enteredBy: e.target.value })}
                    className="h-9"
                  />
                </div>

                {/* Smart Search */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">Smart Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Gate Entry, Vehicle, Driver, Vendor, Material, PO, Invoice..."
                      value={filters.smartSearch}
                      onChange={(e) => setFilters({ ...filters, smartSearch: e.target.value })}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Process Type Radio */}
              <div className="pt-2">
                <Label className="text-sm font-medium mb-3 block">Process Type</Label>
                <RadioGroup
                  value={filters.processType}
                  onValueChange={(v) => setFilters({ ...filters, processType: v as 'inward' | 'outward' | 'both' })}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inward" id="inward" />
                    <Label htmlFor="inward" className="cursor-pointer font-normal">Inward Process</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outward" id="outward" />
                    <Label htmlFor="outward" className="cursor-pointer font-normal">Outward Process</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer font-normal">Both Process</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSearch} className="gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Execute
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-2" disabled={isLoading}>
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
                <Button variant="outline" onClick={handleExport} className="gap-2 ml-auto" disabled={results.length === 0}>
                  <Download className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: kpis.totalEntries, icon: FileSpreadsheet, color: 'bg-primary/10 text-primary' },
          { label: 'Inward', value: kpis.inwardEntries, icon: Package, color: 'bg-accent/10 text-accent' },
          { label: 'Outward', value: kpis.outwardEntries, icon: Truck, color: 'bg-info/10 text-info' },
          { label: 'Exited', value: kpis.vehiclesExited, icon: CheckCircle, color: 'bg-success/10 text-success' },
          { label: 'Pending', value: kpis.vehiclesPending, icon: Clock, color: 'bg-warning/10 text-warning' },
          { label: 'Cancelled', value: kpis.cancelledEntries, icon: XCircle, color: 'bg-destructive/10 text-destructive' },
          { label: 'Total Qty', value: kpis.totalQuantity.toLocaleString(), icon: BarChart3, color: 'bg-primary/10 text-primary' },
        ].map((item, idx) => (
          <div key={idx} className="enterprise-card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle & Content */}
      <Tabs
        value={activeView}
        onValueChange={(v) => {
          setActiveView(v as 'charts' | 'table');

          // 🔥 FIX: Data table click ayithe, data lekapothe API call
          if (v === 'table' && results.length === 0) {
            handleSearch();
          }
        }}
        className="space-y-4"
      >

        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Data Table
            </TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">{results.length} entries found</p>
        </div>

        <TabsContent value="charts" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                <p className="text-sm text-muted-foreground">Loading report data...</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="enterprise-card p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select your filters and click Execute to load report data
              </p>
            </div>
          ) : (
            <>
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inward vs Outward Pie Chart */}
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Entry Type Distribution</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Click segment to drill down</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        style={{ cursor: 'pointer' }}
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            onClick={() => handleTypeDrillDown(entry.name)}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        onClick={(e) => handleTypeDrillDown(e.value as string)}
                        wrapperStyle={{ cursor: 'pointer' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Pie Chart */}
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Status Distribution</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Click segment to drill down</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        style={{ cursor: 'pointer' }}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            onClick={() => handleStatusDrillDown(entry.name)}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        onClick={(e) => handleStatusDrillDown(e.value as string)}
                        wrapperStyle={{ cursor: 'pointer' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Plant-wise Bar Chart */}
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Plant-wise Entry Analysis</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Click bars to drill down</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={plantChartData}
                      barGap={8}
                      onClick={(state) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          const plant = state.activePayload[0].payload.plant;
                          handlePlantDrillDown(plant);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="plant" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Inward" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Outward" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Reference Document Type Bar Chart */}
                <div className="enterprise-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Reference Document Type</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Click to drill down</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={refDocTypeData}
                      layout="vertical"
                      barSize={24}
                      onClick={(state) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          handleRefTypeDrillDown(state.activePayload[0].payload.code);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Vendors Chart - Full Width */}
              <div className="enterprise-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Top 5 Vendors by Entry Count</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Click to drill down</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={vendorChartData}
                    layout="vertical"
                    barSize={28}
                    onClick={(state) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        handleVendorDrillDown(state.activePayload[0].payload.name);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={160} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Entries">
                      {vendorChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="table">
          {isLoading ? (
            <div className="enterprise-card p-12">
              <div className="flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                  <p className="text-sm text-muted-foreground">Loading data table...</p>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="enterprise-card p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select your filters and click Execute to load report data
              </p>
            </div>
          ) : (
            <div className="enterprise-card overflow-hidden">
              {/* Table Header with Export */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Data Table</h3>
                  <span className="text-sm text-muted-foreground">({results.length} records)</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export to Excel
                </Button>
              </div>
              <div className="data-grid overflow-x-auto max-h-[500px] data-grid-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap">Gate Entry No</th>
                      <th className="whitespace-nowrap">Plant</th>
                      <th className="whitespace-nowrap">Type</th>
                      <th className="whitespace-nowrap">Vehicle Date</th>
                      <th className="whitespace-nowrap">Vehicle No</th>
                      <th className="whitespace-nowrap">Driver</th>
                      <th className="whitespace-nowrap">Transporter</th>
                      <th className="whitespace-nowrap">Ref Type</th>
                      <th className="whitespace-nowrap">PO No</th>
                      <th className="whitespace-nowrap">Material</th>
                      <th className="whitespace-nowrap">Vendor</th>
                      <th className="whitespace-nowrap">Qty</th>
                      <th className="whitespace-nowrap">Entered By</th>
                      <th className="whitespace-nowrap">Exit</th>
                      <th className="whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((r) => (
                        <tr key={r.gateEntryNo} className="hover:bg-muted/50 cursor-pointer">
                          <td className="text-accent font-medium whitespace-nowrap">{r.gateEntryNo}</td>
                          <td>{r.plant}</td>
                          <td>
                            <span className={`badge-status ${r.type === 'IN' ? 'badge-success' : 'badge-info'}`}>
                              {r.type === 'IN' ? 'Inward' : 'Outward'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap">{r.vehicleDate}</td>
                          <td className="whitespace-nowrap">{r.vehicleNo}</td>
                          <td>{r.driverName}</td>
                          <td>{r.transporterName}</td>
                          <td title={getRefDocTypeName(r.refDocType)}>{getRefDocTypeName(r.refDocType)}</td>
                          <td>{r.poNo || '-'}</td>
                          <td className="max-w-[150px] truncate" title={r.materialDesc}>{r.materialDesc}</td>
                          <td className="max-w-[150px] truncate" title={r.vendorName}>{r.vendorName}</td>
                          <td>{r.quantity} {r.unit}</td>
                          <td className="whitespace-nowrap">{r.webUser}</td>
                          <td>
                            {r.vehicleExit ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Clock className="w-4 h-4 text-warning" />
                            )}
                          </td>
                          <td>
                            {r.cancelled ? (
                              <span className="badge-status bg-destructive/10 text-destructive">Cancelled</span>
                            ) : r.vehicleExit ? (
                              <span className="badge-status badge-success">Completed</span>
                            ) : (
                              <span className="badge-status badge-warning">Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {results.length > itemsPerPage && (
                <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, results.length)} of {results.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 px-2"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2"
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 mx-2">
                      {(() => {
                        const totalPages = Math.ceil(results.length / itemsPerPage);
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          if (currentPage > 3) pages.push('...');
                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            pages.push(i);
                          }
                          if (currentPage < totalPages - 2) pages.push('...');
                          pages.push(totalPages);
                        }

                        return pages.map((page, idx) =>
                          typeof page === 'string' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          )
                        );
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(results.length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(results.length / itemsPerPage)}
                      className="h-8 px-2"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.ceil(results.length / itemsPerPage))}
                      disabled={currentPage >= Math.ceil(results.length / itemsPerPage)}
                      className="h-8 px-2"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Drill-Down Dialog */}
      <Dialog open={!!drillDown} onOpenChange={() => setDrillDown(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">{drillDown?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (drillDown) {
                      const columns = [
                        { key: 'gateEntryNo', header: 'Gate Entry No' },
                        { key: 'plant', header: 'Plant' },
                        { key: 'type', header: 'Type' },
                        { key: 'vehicleDate', header: 'Vehicle Date' },
                        { key: 'vehicleNo', header: 'Vehicle No' },
                        { key: 'refDocType', header: 'Ref Doc Type' },
                        { key: 'vendorName', header: 'Vendor Name' },
                        { key: 'quantity', header: 'Quantity' },
                      ];
                      exportToExcel(drillDown.data, columns, drillDown.title.replace(/\s+/g, '_'));
                      toast.success('Exported to Excel');
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{drillDown?.data.length} entries</p>
          </DialogHeader>
          <div className="flex-1 overflow-auto data-grid-scroll">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium whitespace-nowrap">Gate Entry No</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Plant</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Type</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Vehicle Date</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Vehicle No</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Ref Type</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Vendor</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Qty</th>
                  <th className="p-3 text-left font-medium whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {drillDown?.data.map((r) => (
                  <tr key={r.gateEntryNo} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-3 text-accent font-medium whitespace-nowrap">{r.gateEntryNo}</td>
                    <td className="p-3">{r.plant}</td>
                    <td className="p-3">
                      <span className={`badge-status ${r.type === 'IN' ? 'badge-success' : 'badge-info'}`}>
                        {r.type === 'IN' ? 'Inward' : 'Outward'}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">{r.vehicleDate}</td>
                    <td className="p-3 whitespace-nowrap">{r.vehicleNo}</td>
                    <td className="p-3">{getRefDocTypeName(r.refDocType)}</td>
                    <td className="p-3 max-w-[200px] truncate" title={r.vendorName}>{r.vendorName}</td>
                    <td className="p-3">{r.quantity} {r.unit}</td>
                    <td className="p-3">
                      {r.cancelled ? (
                        <span className="badge-status bg-destructive/10 text-destructive">Cancelled</span>
                      ) : r.vehicleExit ? (
                        <span className="badge-status badge-success">Completed</span>
                      ) : (
                        <span className="badge-status badge-warning">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}