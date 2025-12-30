import { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
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
  quantity: string;
  unit: string;
  packingCondition: string;
}

const emptyItem: ItemRow = { materialCode: '', materialDescription: '', quantity: '', unit: '', packingCondition: '' };
const ITEMS_PER_PAGE = 10;

export default function OutwardReturnable() {
  const { webUser } = useAuth();
  
  const [headerData, setHeaderData] = useState({
    gatePassNo: '',
    plant: '',
    refDocType: 'Returnable',
    gateEntryType: 'Outward',
    vehicleDate: new Date().toISOString().split('T')[0],
    vehicleTime: new Date().toTimeString().slice(0, 5),
    vehicleNo: '',
    driverName: '',
    transporterName: '',
    grLrNumber: '',
    remarks: '',
    expectedReturnDate: '',
    entryBy: '',
  });

  useEffect(() => {
    setHeaderData(prev => ({ ...prev, entryBy: webUser }));
  }, [webUser]);

  const [items, setItems] = useState<ItemRow[]>(Array(5).fill(null).map(() => ({ ...emptyItem })));
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

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
    setItems(prev => prev.map((item, i) => i === actualIndex ? { ...item, [field]: value } : item));
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
    toast.success('Returnable Gate Pass saved successfully!');
  };

  const handleReset = () => {
    setHeaderData({
      gatePassNo: '',
      plant: '',
      refDocType: 'Returnable',
      gateEntryType: 'Outward',
      vehicleDate: new Date().toISOString().split('T')[0],
      vehicleTime: new Date().toTimeString().slice(0, 5),
      vehicleNo: '',
      driverName: '',
      transporterName: '',
      grLrNumber: '',
      remarks: '',
      expectedReturnDate: '',
      entryBy: webUser,
    });
    setItems(Array(5).fill(null).map(() => ({ ...emptyItem })));
    setCurrentPage(1);
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
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'packingCondition', header: 'Packing Condition' },
    ];
    exportToExcel(filledItems, exportColumns, `Outward_Returnable_${headerData.gatePassNo || 'New'}`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outward Gate Pass - Returnable (RGP)"
        subtitle="Create returnable gate pass with expected return date"
        breadcrumbs={[{ label: 'Outward', path: '/outward/returnable' }, { label: 'Returnable' }]}
      />

      <FormSection title="Header Information">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField label="Gate Pass No" value={headerData.gatePassNo} placeholder="Auto-generated" readOnly />
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
          <TextField label="Ref Doc Type" value={headerData.refDocType} readOnly />
          <TextField label="Gate Entry Type" value={headerData.gateEntryType} readOnly />
          <TextField label="Entry By" value={headerData.entryBy} onChange={(value) => setHeaderData({ ...headerData, entryBy: value })} placeholder="Enter user name" />
          <TextField label="Vehicle Date" type="date" value={headerData.vehicleDate} onChange={(value) => setHeaderData({ ...headerData, vehicleDate: value })} required />
          <TextField label="Vehicle Time" type="time" value={headerData.vehicleTime} onChange={(value) => setHeaderData({ ...headerData, vehicleTime: value })} required />
          <TextField 
            label="Expected Return Date" 
            type="date" 
            value={headerData.expectedReturnDate} 
            onChange={(value) => setHeaderData({ ...headerData, expectedReturnDate: value })} 
            required 
          />
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

      <FormSection title="Item Details">
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
                  <th className="w-32">Quantity</th>
                  <th className="w-24">Unit</th>
                  <th className="w-40">Packing Condition</th>
                  <th className="w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;
                  return (
                    <tr key={actualIndex} className="group">
                      <td className="text-center font-medium text-muted-foreground">{actualIndex + 1}</td>
                      <td>
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
                      </td>
                      <td>
                        <Input value={item.materialDescription} readOnly className="h-8 bg-muted/50" placeholder="Auto-populated" />
                      </td>
                      <td>
                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(pageIndex, 'quantity', e.target.value)} className="h-8" placeholder="Qty" />
                      </td>
                      <td>
                        <Input value={item.unit} readOnly className="h-8 bg-muted/50" placeholder="Unit" />
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

        <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-3 gap-2">
          <Plus className="w-4 h-4" />
          Add Row
        </Button>

        {/* Save and Reset at end */}
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
