import { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { exportToExcel, transporterOptions, packingConditionOptions } from '@/lib/exportToExcel';
import { materialMaster, getMaterialByCode } from '@/lib/materialMaster';
import { useAuth } from '@/contexts/AuthContext';

interface ItemRow {
  materialCode: string;
  materialDescription: string;
  poQty: string;
  balanceQty: string;
  gateEntryQty: string;
  unit: string;
  packingCondition: string;
}

const emptyItem: ItemRow = {
  materialCode: '',
  materialDescription: '',
  poQty: '',
  balanceQty: '',
  gateEntryQty: '',
  unit: '',
  packingCondition: '',
};

const ITEMS_PER_PAGE = 10;

// Simulate PO data fetch
const fetchPOData = (poNumber: string) => {
  // Simulated PO data
  const poItems: ItemRow[] = [
    { materialCode: 'MAT001', materialDescription: 'Steel Plate 10mm', poQty: '500', balanceQty: '300', gateEntryQty: '', unit: 'KG', packingCondition: '' },
    { materialCode: 'MAT002', materialDescription: 'Copper Wire 2.5mm', poQty: '1000', balanceQty: '750', gateEntryQty: '', unit: 'MTR', packingCondition: '' },
    { materialCode: 'MAT003', materialDescription: 'Aluminium Rod 8mm', poQty: '200', balanceQty: '150', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
    { materialCode: 'MAT005', materialDescription: 'Brass Fitting 1"', poQty: '100', balanceQty: '80', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
    { materialCode: 'MAT008', materialDescription: 'Stainless Steel Bolt M10', poQty: '500', balanceQty: '400', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
  ];
  
  return {
    vendorNumber: 'V1001',
    vendorName: 'ABC Subcontractor Pvt. Ltd.',
    vendorAddress: 'Industrial Area, Phase 2',
    vendorCity: 'Pune',
    vendorContact: '+91 98765 43210',
    vendorGSTNo: '27AABCU9603R1ZM',
    items: poItems,
  };
};

export default function InwardSubcontracting() {
  const { webUser } = useAuth();
  
  const [headerData, setHeaderData] = useState({
    gateEntryNo: '',
    plant: '',
    refDocType: 'Subcontracting',
    gateEntryType: 'Inward',
    vehicleDate: new Date().toISOString().split('T')[0],
    vehicleTime: new Date().toTimeString().slice(0, 5),
    vehicleNo: '',
    driverName: '',
    transporterName: '',
    grLrNumber: '',
    remarks: '',
    subcontractPONo: '',
    vendorNumber: '',
    vendorName: '',
    vendorAddress: '',
    vendorCity: '',
    vendorContact: '',
    vendorGSTNo: '',
    inwardedBy: '',
  });

  useEffect(() => {
    setHeaderData(prev => ({ ...prev, inwardedBy: webUser }));
  }, [webUser]);

  const [items, setItems] = useState<ItemRow[]>(Array(5).fill(null).map(() => ({ ...emptyItem })));
  const [currentPage, setCurrentPage] = useState(1);
  const [isPoMode, setIsPoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handleFetchPO = () => {
    if (!headerData.plant) {
      toast.error('Please select Plant first');
      return;
    }
    if (!headerData.subcontractPONo) {
      toast.error('Please enter Subcontract PO Number');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const poData = fetchPOData(headerData.subcontractPONo);
      setHeaderData(prev => ({
        ...prev,
        vendorNumber: poData.vendorNumber,
        vendorName: poData.vendorName,
        vendorAddress: poData.vendorAddress,
        vendorCity: poData.vendorCity,
        vendorContact: poData.vendorContact,
        vendorGSTNo: poData.vendorGSTNo,
      }));
      setItems(poData.items);
      setIsPoMode(true);
      setIsLoading(false);
      setCurrentPage(1);
      toast.success('PO data fetched successfully');
    }, 800);
  };

  const handleMaterialCodeChange = (pageIndex: number, code: string) => {
    const actualIndex = startIndex + pageIndex;
    const material = getMaterialByCode(code);
    setItems(prev => prev.map((item, i) => 
      i === actualIndex 
        ? { 
            ...item, 
            materialCode: code, 
            materialDescription: material?.description || '',
            unit: material?.unit || item.unit
          } 
        : item
    ));
  };

  const handleItemChange = (pageIndex: number, field: keyof ItemRow, value: string) => {
    const actualIndex = startIndex + pageIndex;
    setItems(prev => prev.map((item, i) => 
      i === actualIndex ? { ...item, [field]: value } : item
    ));
  };

  const handleAddRow = () => {
    setItems(prev => [...prev, { ...emptyItem }]);
    const newTotalPages = Math.ceil((items.length + 1) / ITEMS_PER_PAGE);
    setCurrentPage(newTotalPages);
  };

  const handleDeleteRow = (pageIndex: number) => {
    const actualIndex = startIndex + pageIndex;
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== actualIndex));
      const newTotalPages = Math.ceil((items.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleSave = () => {
    toast.success('Gate Entry saved successfully!');
  };

  const handleReset = () => {
    setHeaderData({
      gateEntryNo: '',
      plant: '',
      refDocType: 'Subcontracting',
      gateEntryType: 'Inward',
      vehicleDate: new Date().toISOString().split('T')[0],
      vehicleTime: new Date().toTimeString().slice(0, 5),
      vehicleNo: '',
      driverName: '',
      transporterName: '',
      grLrNumber: '',
      remarks: '',
      subcontractPONo: '',
      vendorNumber: '',
      vendorName: '',
      vendorAddress: '',
      vendorCity: '',
      vendorContact: '',
      vendorGSTNo: '',
      inwardedBy: webUser,
    });
    setItems(Array(5).fill(null).map(() => ({ ...emptyItem })));
    setCurrentPage(1);
    setIsPoMode(false);
  };

  const handleExport = () => {
    const filledItems = items.filter(item => item.materialCode || item.materialDescription);
    if (filledItems.length === 0) {
      toast.error('No items to export');
      return;
    }
    const exportColumns = [
      { key: 'materialCode', header: 'Material Code' },
      { key: 'materialDescription', header: 'Material Description' },
      { key: 'poQty', header: 'PO Qty' },
      { key: 'balanceQty', header: 'Balance Qty' },
      { key: 'gateEntryQty', header: 'Gate Entry Qty' },
      { key: 'unit', header: 'Unit' },
      { key: 'packingCondition', header: 'Packing Condition' },
    ];
    exportToExcel(filledItems, exportColumns, `Inward_Subcontract_${headerData.subcontractPONo || 'New'}`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inward Gate Entry - Subcontracting"
        subtitle="Create gate entry with PO reference or manual entry"
        breadcrumbs={[{ label: 'Inward', path: '/inward/subcontracting' }, { label: 'Subcontracting' }]}
      />

      <FormSection title="Subcontract Reference">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <SelectField
              label="Plant"
              value={headerData.plant}
              onChange={(value) => setHeaderData({ ...headerData, plant: value })}
              options={[
                { value: '1000', label: '1000 - Main Plant' },
                { value: '2000', label: '2000 - Warehouse' },
                { value: '3000', label: '3000 - Factory' },
              ]}
              required
            />
          </div>
          <div className="w-44">
            <TextField
              label="Subcontract PO Number"
              value={headerData.subcontractPONo}
              onChange={(value) => setHeaderData({ ...headerData, subcontractPONo: value })}
              placeholder="Enter PO Number"
            />
          </div>
          <div className="w-40">
            <TextField label="Vendor Number" value={headerData.vendorNumber} onChange={(value) => setHeaderData({ ...headerData, vendorNumber: value })} placeholder="Vendor number" disabled={isPoMode} />
          </div>
          <div className="w-44">
            <TextField label="Vendor Name" value={headerData.vendorName} onChange={(value) => setHeaderData({ ...headerData, vendorName: value })} placeholder="Vendor name" disabled={isPoMode} />
          </div>
          <Button onClick={handleFetchPO} disabled={isLoading} className="gap-2 h-10">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Fetch PO
          </Button>
        </div>
        {isPoMode && (
          <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent font-medium">PO Mode Active - Items fetched from PO: {headerData.subcontractPONo}</p>
          </div>
        )}
      </FormSection>

      <FormSection title="Header Information">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField label="Gate Entry No" value={headerData.gateEntryNo} placeholder="Auto-generated" readOnly />
          <TextField label="Ref Doc Type" value={headerData.refDocType} readOnly />
          <TextField label="Gate Entry Type" value={headerData.gateEntryType} readOnly />
          <TextField label="Inward By" value={headerData.inwardedBy} onChange={(value) => setHeaderData({ ...headerData, inwardedBy: value })} placeholder="Enter user name" />
          <TextField label="Vehicle Date" type="date" value={headerData.vehicleDate} onChange={(value) => setHeaderData({ ...headerData, vehicleDate: value })} required />
          <TextField label="Vehicle Time" type="time" value={headerData.vehicleTime} onChange={(value) => setHeaderData({ ...headerData, vehicleTime: value })} required />
        </div>
      </FormSection>

      <FormSection title="Vehicle & Transport Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField label="Vehicle No" value={headerData.vehicleNo} onChange={(value) => setHeaderData({ ...headerData, vehicleNo: value })} placeholder="MH-12-AB-1234" required />
          <TextField label="Driver Name" value={headerData.driverName} onChange={(value) => setHeaderData({ ...headerData, driverName: value })} placeholder="Enter driver name" />
          <SelectField
            label="Transporter Name"
            value={headerData.transporterName}
            onChange={(value) => setHeaderData({ ...headerData, transporterName: value })}
            options={transporterOptions}
          />
          <TextField
            label="GR/LR Number"
            value={headerData.grLrNumber}
            onChange={(value) => setHeaderData({ ...headerData, grLrNumber: value })}
            placeholder="Enter GR/LR number"
          />
          <TextField
            label="Remarks"
            value={headerData.remarks}
            onChange={(value) => setHeaderData({ ...headerData, remarks: value })}
            placeholder="Enter remarks"
          />
        </div>
      </FormSection>

      <FormSection title={isPoMode ? "Item Details (From PO)" : "Item Details (Manual Entry)"}>
        <div className="flex justify-end mb-3">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>
        <div className="data-grid">
          <div className="overflow-auto scrollbar-thin" style={{ maxHeight: '400px' }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th className="w-40">Material Code</th>
                  <th>Material Description</th>
                  {isPoMode && (
                    <>
                      <th className="w-24">PO Qty</th>
                      <th className="w-24">Balance Qty</th>
                    </>
                  )}
                  <th className="w-28">Gate Entry Qty</th>
                  <th className="w-20">Unit</th>
                  <th className="w-36">Packing Condition</th>
                  {!isPoMode && <th className="w-20 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;
                  return (
                    <tr key={actualIndex} className="group">
                      <td className="text-center font-medium text-muted-foreground">{actualIndex + 1}</td>
                      <td>
                        {isPoMode ? (
                          <Input value={item.materialCode} readOnly className="h-8 bg-muted/50" />
                        ) : (
                          <Select value={item.materialCode} onValueChange={(val) => handleMaterialCodeChange(pageIndex, val)}>
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue placeholder="Select Material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materialMaster.map(mat => (
                                <SelectItem key={mat.code} value={mat.code}>{mat.code}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td>
                        <Input
                          value={item.materialDescription}
                          readOnly
                          className="h-8 bg-muted/50"
                          placeholder="Auto-populated"
                        />
                      </td>
                      {isPoMode && (
                        <>
                          <td>
                            <Input value={item.poQty} readOnly className="h-8 bg-muted/50 text-center" />
                          </td>
                          <td>
                            <Input value={item.balanceQty} readOnly className="h-8 bg-muted/50 text-center" />
                          </td>
                        </>
                      )}
                      <td>
                        <Input
                          type="number"
                          value={item.gateEntryQty}
                          onChange={(e) => handleItemChange(pageIndex, 'gateEntryQty', e.target.value)}
                          className="h-8"
                          placeholder="Enter Qty"
                        />
                      </td>
                      <td>
                        <Input
                          value={item.unit}
                          readOnly
                          className="h-8 bg-muted/50 text-center"
                          placeholder="Unit"
                        />
                      </td>
                      <td>
                        <Select value={item.packingCondition} onValueChange={(val) => handleItemChange(pageIndex, 'packingCondition', val)}>
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {packingConditionOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      {!isPoMode && (
                        <td className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRow(pageIndex)}
                            disabled={items.length <= 1}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {items.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-2 border-t mt-3">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {!isPoMode && (
          <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-3 gap-2">
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
        )}

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Save className="w-4 h-4" />
            Save Entry
          </Button>
        </div>
      </FormSection>
    </div>
  );
}
