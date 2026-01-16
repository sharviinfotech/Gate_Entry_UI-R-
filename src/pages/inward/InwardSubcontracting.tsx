import { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, FileSpreadsheet, Plus, Trash2, Loader2 } from 'lucide-react';
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
import service from "../../services/generalservice.js";
import Swal from "sweetalert2";
import { createPortal } from 'react-dom';


interface ItemRow {
  "GENO": string,
  "EBELN": number,
  "ITEM": number,
  "WTSNO": number,
  "CHQTY": number,
  "CHUOM": string,
  "VGBEL": string,
  "VGPOS": number,
  "EXTROW": number,
  "MATNR": number,
  "MAKTX": string,
  "GRWGT": number,
  "GRDAT": string,
  "GRTIM": string,
  "GRUSR": string,
  "TRWGT": number,
  "TRDAT": string,
  "TRTIM": string,
  "TRUSR": string,
  "WUNIT": string,
  "NTWGT": number,
  "STATUS": string,
  "INVNO": string,
  "INVDAT": string,
  "CVNO": number,
  "CVNO1": string,
  "CVNAME": string,
  "CVNAME1": string,
  "CVLOC": string,
  "TRNGRNO": string,
  "MBLNR": string,
  "MJAHR": number,
  "ZEILE": number,
  "EBELP": number,
  "VBELN": string,
  "POSNR": number,
  "WEPOS": string,
  "CHARG": string,
  "CHK": string,
  "ZQUANT": number,
  "ZMEINS": string,
  "ZPACKING": string,
  "BLQTY": number,
  "BLUNIT": string

}
const emptyItem: ItemRow = {
  "GENO": "",
  "EBELN": null,
  "ITEM": null,
  "WTSNO": null,
  "CHQTY": null,
  "CHUOM": "",
  "VGBEL": "",
  "VGPOS": null,
  "EXTROW": null,
  "MATNR": null,
  "MAKTX": "",
  "GRWGT": null,
  "GRDAT": "",
  "GRTIM": "",
  "GRUSR": "",
  "TRWGT": null,
  "TRDAT": "",
  "TRTIM": "",
  "TRUSR": "",
  "WUNIT": "",
  "NTWGT": null,
  "STATUS": "",
  "INVNO": "",
  "INVDAT": "",
  "CVNO": null,
  "CVNO1": "",
  "CVNAME": "",
  "CVNAME1": "",
  "CVLOC": "",
  "TRNGRNO": "",
  "MBLNR": "",
  "MJAHR": null,
  "ZEILE": null,
  "EBELP": null,
  "VBELN": "",
  "POSNR": null,
  "WEPOS": "",
  "CHARG": "",
  "CHK": "",
  "ZQUANT": null,
  "ZMEINS": "",
  "ZPACKING": "",
  "BLQTY": null,
  "BLUNIT": ""
};

// const emptyItem: ItemRow = {
//   materialCode: '',
//   materialDescription: '',
//   poQty: '',
//   balanceQty: '',
//   gateEntryQty: '',
//   unit: '',
//   packingCondition: '',
// };

const ITEMS_PER_PAGE = 10;

// Simulate PO data fetch
const fetchPOData = (poNumber: string) => {
  // Simulated PO data
  // const poItems: ItemRow[] = [
  //   { materialCode: 'MAT001', materialDescription: 'Steel Plate 10mm', poQty: '500', balanceQty: '300', gateEntryQty: '', unit: 'KG', packingCondition: '' },
  //   { materialCode: 'MAT002', materialDescription: 'Copper Wire 2.5mm', poQty: '1000', balanceQty: '750', gateEntryQty: '', unit: 'MTR', packingCondition: '' },
  //   { materialCode: 'MAT003', materialDescription: 'Aluminium Rod 8mm', poQty: '200', balanceQty: '150', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
  //   { materialCode: 'MAT005', materialDescription: 'Brass Fitting 1"', poQty: '100', balanceQty: '80', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
  //   { materialCode: 'MAT008', materialDescription: 'Stainless Steel Bolt M10', poQty: '500', balanceQty: '400', gateEntryQty: '', unit: 'NOS', packingCondition: '' },
  // ];

  // return {
  //   vendorNumber: 'V1001',
  //   vendorName: 'ABC Subcontractor Pvt. Ltd.',
  //   vendorAddress: 'Industrial Area, Phase 2',
  //   vendorCity: 'Pune',
  //   vendorContact: '+91 98765 43210',
  //   vendorGSTNo: '27AABCU9603R1ZM',
  //   items: poItems,
  // };
};

export default function InwardSubcontracting() {
  const { webUser } = useAuth();
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [userPlant, setPlant] = useState('');
  const [headerData, setHeaderData] = useState({
    WERKS: '',
    REFDOCTYP: 'Subcontracting',
    DTYPE: 'Inward Process',
    VHDAT_IN: new Date().toISOString().split('T')[0],
    VHTIM_IN: new Date().toTimeString().slice(0, 8),
    VHNO: '',
    VHCL_TYPE: '',
    DRNAM: '',
    DRNUM: '',
    TRANNAM: '',
    GR_LR_NUM: '',
    PONO: '',
    VENDOR: '',
    VNAME: '',
    INWARDED_BY: '',
    LEDAT: '',
    LETIM: '',
    TRADDR: '',
    REMARKS: '',

    "GENO": "",
    "USR_IN": "",
    "GRWGT": 0,
    "TRWGT": 0,
    "NTWGT": 0,
    "WUNIT": "",
    "GRUSR": "",
    "GRDAT": "",
    "GRTIM": "",
    "TRUSR": "",
    "TRDAT": "",
    "TRTIM": "",
    "INIWT": 0,
    "INIDT": "",
    "INITM": "00:00:00",
    "INIUR": "",
    "TOTWGT": 0,
    "RBSTAT": "",
    "WBOMP": "",
    "WBCOMP": "",
    "GEEXT": "",
    "LEUSR": "",
    "SGTXT": "",
    "GECAN": "",
    "LCDAT": "0000-00-00",
    "LCTIM": "00:00:00",
    "LCUSR": "",
    "SCTXT": "",
    "ERNAM": "",
    "LIFNR": "",
    "GATEPASS": "",
    "DESTINATION": "",
    "CAPACITY": "",
    "WBIND": "",
    "MIX": "",
    "MJAHR": 0,
    "AMOUNT": 0,
    "ZTRID": "",
    "ZTRIP": "",
    "SP_DES": "",
    "PAYMENTTERMS": "",
    "TOT_COSUME": "",
    "PEND_AMOUNT": "",
    "BLNO": "",
    "PURPOSE": "",
    "REUSE": ""
  });
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await service.vendorlist(); // API call
        setVendorList(res || []);
        console.log("res", res)
      } catch (err) {
        toast.error('Failed to load vendors');
      }
    };
    const loggedInDetails = localStorage.getItem('gate_entry_user');
    const SelectedPlant = localStorage.getItem('SelectedPlant');
    console.log("SelectedPlant", SelectedPlant)
    headerData.WERKS = SelectedPlant

    fetchVendors();
  }, []);

  useEffect(() => {
    setHeaderData(prev => ({ ...prev, INWARDED_BY: webUser }));
    setItems(Array(0).fill(null).map(() => ({ ...emptyItem })));
    handleAddRow()
  }, [webUser]);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPoMode, setIsPoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  // const handleFetchPO = () => {
  //   if (!headerData.WERKS) {
  //     toast.error('Please select Plant first');
  //     return;
  //   }


  //   setIsLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     const poData = fetchPOData(headerData.subcontractPONo);
  //     setHeaderData(prev => ({
  //       ...prev,
  //       vendorNumber: poData.vendorNumber,
  //       vendorName: poData.vendorName,
  //       vendorAddress: poData.vendorAddress,
  //       vendorCity: poData.vendorCity,
  //       vendorContact: poData.vendorContact,
  //       vendorGSTNo: poData.vendorGSTNo,
  //     }));
  //     setItems(poData.items);
  //     setIsPoMode(true);
  //     setIsLoading(false);
  //     setCurrentPage(1);
  //     toast.success('PO data fetched successfully');
  //   }, 800);
  // };

  const handleMaterialCodeChange = (pageIndex: number, code: string) => {
    const actualIndex = startIndex + pageIndex;
    const material = getMaterialByCode(code);
    setItems(prev => prev.map((item, i) =>
      i === actualIndex
        ? {
          ...item,
          materialCode: code,
          materialDescription: material?.description || '',
          unit: material?.unit || item.CHUOM
        }
        : item
    ));
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemRow,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );

    console.log("handleItemChange Items", items)
  };

  const handleAddRow = () => {
    setItems(prev => {
      const nextItemNo =
        prev.length > 0 ? prev[prev.length - 1].ITEM + 10 : 10;

      const newRow: ItemRow = {
        ...emptyItem,
        ITEM: nextItemNo,
        CHK: '',
      };

      const updated = [...prev, newRow];

      // move to last page after adding
      const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);
      setCurrentPage(newTotalPages);

      return updated;
    });
  };


  // const handleDeleteRow = (pageIndex: number) => {
  //   console.log("items enter",items)
  //   const actualIndex = startIndex + pageIndex;
  //   if (items.length > 1) {
  //     setItems(prev => prev.filter((_, i) => i !== actualIndex));
  //     const newTotalPages = Math.ceil((items.length - 1) / ITEMS_PER_PAGE);
  //     if (currentPage > newTotalPages && newTotalPages > 0) {
  //       setCurrentPage(newTotalPages);
  //     }
  //   }
  //   console.log("items last",items)
  // };

  const handleDeleteRow = (pageIndex: number) => {
    const actualIndex = startIndex + pageIndex;

    if (items.length > 1) {
      setItems(prev => {
        // 1. Filter out the deleted row
        const filtered = prev.filter((_, i) => i !== actualIndex);

        // 2. Re-index the ITEM numbers for all remaining rows
        const reIndexed = filtered.map((item, index) => ({
          ...item,
          ITEM: (index + 1) * 10 // This forces 10, 20, 30, etc.
        }));

        return reIndexed;
      });

      // 3. Update Pagination logic
      const newTotalItems = items.length - 1;
      const newTotalPages = Math.ceil(newTotalItems / ITEMS_PER_PAGE);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };
  const handleSave = async () => {
    // 1. Define the fields and their user-friendly labels
    const checkFields = [
      { value: headerData.WERKS, label: "Plant" },
      { value: headerData.VHNO, label: "Vehicle No" },
      { value: headerData.VHCL_TYPE, label: "Vehicle Type" },
      { value: headerData.VHDAT_IN, label: "Vehicle Date" },
      { value: headerData.VHTIM_IN, label: "Vehicle Time" },
      { value: headerData.DRNAM, label: "Driver Name" },
      { value: headerData.DRNUM, label: "Driver Contact" },
      { value: headerData.TRANNAM, label: "Transporter Name" },
    ];

    // 2. Filter out the fields that are empty
    const missingFields = checkFields
      .filter(field => !field.value || field.value.toString().trim() === "")
      .map(field => field.label);

    // 3. If any are missing, show a detailed alert
    if (missingFields.length > 0) {
      Swal.fire({
        title: "Missing Information",
        html: `
            <div style="text-align: left;">
              <p>The following fields are required to save changes:</p>
              <ul style="color: #d33; font-weight: 500;">
                ${missingFields.map(f => `<li>• ${f}</li>`).join('')}
              </ul>
            </div>
          `,
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }
    console.log("headerData", headerData)
    console.log("items", items)
    const selectedItems = items.filter(item => item.CHK === "X");

    if (selectedItems.length === 0) {
      Swal.fire({
        title: "Validation Error",
        text: "Please select at least one item to save.",
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }
    headerData.REFDOCTYP = "SUB"
    headerData.DTYPE = "IN"
    // 1. Get the string from storage
    const storedDetails = localStorage.getItem('gate_entry_user');

    // 2. Parse it back into an object if it exists
    if (storedDetails) {
      const loggedInDetails = JSON.parse(storedDetails);

      // 3. Now you can access the property safely
      headerData.ERNAM = loggedInDetails.USER;
    }
    const payload = {
      CREATE: "X",
      CHANGE: "",
      SEL: "",
      CEL: "",
      ICON: "",
      HEADER: [headerData],
      ITEM: items,
    };
    console.log("payload", payload)
    setIsLoading(true);
    try {

      const response = await service.GateEntryCreation(payload);
      console.log("response", response);

      // ✅ Ensure response is array
      if (!Array.isArray(response) || response.length === 0) {
        Swal.fire("Error", "Invalid response from server", "error");
        return;
      }

      // 🔴 Collect errors
      const errorMessages = response
        .filter(r => r.MSG_TYPE === "E")
        .map(r => `• ${r.MSG}`);

      // 🟡 Collect warnings
      const warningMessages = response
        .filter(r => r.MSG_TYPE === "I")
        .map(r => `• ${r.MSG}`);

      // 🟢 Success message
      const successMsg = response.find(r => r.MSG_TYPE === "S");

      // ❌ If errors exist → show all errors
      if (errorMessages.length > 0) {
        Swal.fire({
          title: "Error",
          html: errorMessages.join("<br>"),
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // ⚠️ If warnings exist
      if (warningMessages.length > 0) {
        Swal.fire({
          title: "Warning",
          html: warningMessages.join("<br>"),
          icon: "warning",
          confirmButtonColor: "#f0ad4e",
        });
      }

      // ✅ Success
      if (successMsg || response[0]?.CODE === "200") {
        Swal.fire({
          title: "Success",
          text: successMsg?.MSG || "Gate Entry updated successfully",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        // ✅ Reset state after success
        handleReset();
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save Gate Entry", "error");
    } finally {
      setIsLoading(false); // ✅ Spinner OFF always
    }
  };

  const handleReset = () => {
    setHeaderData({
      WERKS: '',
      REFDOCTYP: 'Subcontracting',
      DTYPE: 'Inward Process',
      "VHDAT_IN": new Date().toISOString().split('T')[0], //Vehicle IN Date    //System Generated
      "VHTIM_IN": new Date().toTimeString().slice(0, 8), //Vehicle IN time  
      VHNO: '',
      VHCL_TYPE: '',
      DRNAM: '',
      DRNUM: '',
      TRANNAM: '',
      GR_LR_NUM: '',
      PONO: '',
      VENDOR: '',
      VNAME: '',
      INWARDED_BY: '',
      LEDAT: '',
      LETIM: '',
      TRADDR: '',
      REMARKS: '',
      GENO: '',
      USR_IN: '',
      GRWGT: 0,
      TRWGT: 0,
      NTWGT: 0,
      WUNIT: '',
      GRUSR: '',
      GRDAT: '',
      GRTIM: '',
      TRUSR: '',
      TRDAT: '',
      TRTIM: '',
      INIWT: 0,
      INIDT: '',
      INITM: '00:00:00',
      INIUR: '',
      TOTWGT: 0,
      RBSTAT: '',
      WBOMP: '',
      WBCOMP: '',
      GEEXT: '',
      LEUSR: '',
      SGTXT: '',
      GECAN: '',
      LCDAT: '0000-00-00',
      LCTIM: '00:00:00',
      LCUSR: '',
      SCTXT: '',
      ERNAM: '',
      LIFNR: '',
      GATEPASS: '',
      DESTINATION: '',
      CAPACITY: '',
      WBIND: '',
      MIX: '',
      MJAHR: 0,
      AMOUNT: 0,
      ZTRID: '',
      ZTRIP: '',
      SP_DES: '',
      PAYMENTTERMS: '',
      TOT_COSUME: '',
      PEND_AMOUNT: '',
      BLNO: '',
      PURPOSE: '',
      REUSE: ''
    });
    setItems(Array(0).fill(null).map(() => ({ ...emptyItem })));
    handleAddRow()
    setCurrentPage(1);
    setIsPoMode(false);
  };

  const handleExport = () => {
    const filledItems = items.filter(item => item.MATNR || item.MAKTX);
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
    //   exportToExcel(filledItems, exportColumns, `Inward_Subcontract_${headerData.subcontractPONo || 'New'}`);
    //   toast.success('Exported to Excel successfully');
  };
  const FullScreenLoader = () => {
    // We create the element to be teleported
    const loaderContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-6 bg-white/10 rounded-lg border border-white/20">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-white/20 rounded-full animate-spin" />
          <p className="text-white font-medium text-lg tracking-wide">
            Please Wait Loading...
          </p>
        </div>
      </div>
    );

    // We render it into the body instead of the local component tree
    return createPortal(loaderContent, document.body);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inward Gate Entry - Subcontracting"
        subtitle="Create gate entry with PO reference or manual entry"
        breadcrumbs={[{ label: 'Inward', path: '/inward/subcontracting' }, { label: 'Subcontracting' }]}
      />

      {/* <FormSection title="Subcontract Reference">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <TextField
            label="Plant"
            value={headerData.WERKS}
            onChange={(value) => setHeaderData({ ...headerData, WERKS: value })}
            placeholder="Enter PO Number"
            required
          />
          <SelectField
            label="Plant"
            value={headerData.plant}
            onChange={(value) => setHeaderData({ ...headerData, plant: value })}
            options={[
              { value: '1000', label: '1000' },
              { value: '2000', label: '2000' },
              { value: '3000', label: '3000' },
            ]}
            required
          />
          <TextField
            label="PO Number"
            value={headerData.PONO}
            onChange={(value) => setHeaderData({ ...headerData, PONO: value })}
            placeholder="Enter PO Number"
            required
          />
          <TextField
            label="Vendor Number"
            value={headerData.VENDOR}
            onChange={(value) => setHeaderData({ ...headerData, VENDOR: value })}

          />
          <TextField
            label="Vendor Name"
            value={headerData.VNAME}
            onChange={(value) => setHeaderData({ ...headerData, VNAME: value })}
          />

        </div>
        {isPoMode && (
          <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent font-medium">PO Mode Active - Items fetched from PO: {headerData.subcontractPONo}</p>
          </div>
        )}
      </FormSection> */}

      <FormSection title="Header Information">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Plant"
            value={headerData.WERKS}
            onChange={(value) => setHeaderData({ ...headerData, WERKS: value })}
            placeholder="Enter PO Plant"
            required
          />
          <TextField
            label="Gate Entry No"
            value={headerData.GENO}
            placeholder="Auto-generated"
            readOnly
          />
          <TextField
            label="Ref Doc Type"
            value={headerData.REFDOCTYP}
            readOnly
            required
          />
          <TextField
            label="Gate Entry Type"
            value={headerData.DTYPE}
            readOnly
            required
          />
          <TextField
            label="Inward By"
            value={headerData.INWARDED_BY}
            onChange={(value) => setHeaderData({ ...headerData, INWARDED_BY: value })}
            placeholder="Enter user name"
            required
          />
          <TextField
            label="Vehicle Date"
            type="date"
            value={headerData.VHDAT_IN}
            onChange={(value) => setHeaderData({ ...headerData, VHDAT_IN: value })}
            required
          />
          <TextField
            label="Vehicle Time"
            type="time"
            value={headerData.VHTIM_IN}
            onChange={(value) => setHeaderData({ ...headerData, VHTIM_IN: value })}
            required
          />
        </div>
      </FormSection>

      <FormSection title="Vehicle & Transport Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Vehicle No"
            value={headerData.VHNO}
            onChange={(value) => setHeaderData({ ...headerData, VHNO: value })}
            placeholder="MH-12-AB-1234"
            required
          />
          <SelectField
            label="Vehicle Type"
            required
            value={headerData.VHCL_TYPE}
            onChange={(value) => setHeaderData({ ...headerData, VHCL_TYPE: value })}
            options={[
              { value: 'HIRE', label: 'Hire Vehicle' },
              { value: 'OWN', label: 'Own Vehicle' },

            ]}
          />
          <TextField
            label="Driver Name"
            required
            value={headerData.DRNAM}
            onChange={(value) => setHeaderData({ ...headerData, DRNAM: value })}
            placeholder="Enter driver name"
          />
          <TextField
            label="Driver Contact"
            required
            value={headerData.DRNUM}
            onChange={(value) => setHeaderData({ ...headerData, DRNUM: value })}
            placeholder="+91 98765 43210"
          />
          <TextField
            label="Transporter Name"
            required
            placeholder="Enter Transporter Name"
            value={headerData.TRANNAM}
            onChange={(value) => setHeaderData({ ...headerData, TRANNAM: value })}
          />
          {/* <SelectField
            label="Transporter Name"
            required
            value={headerData.TRANNAM}
            onChange={(value) => setHeaderData({ ...headerData, TRANNAM: value })}
            options={transporterOptions}
          /> */}
          <TextField
            label="GR/LR Number"
            value={headerData.GR_LR_NUM}
            onChange={(value) => setHeaderData({ ...headerData, GR_LR_NUM: value })}
            placeholder="Enter GR/LR number"
          />
          <div className="md:col-span-2">
            <TextField
              label="Remarks"
              value={headerData.REMARKS}
              onChange={(value) => {
                if (value.length <= 255) {
                  setHeaderData({ ...headerData, REMARKS: value });
                }
              }}
              placeholder="Enter remarks (max 255 characters)"
            />
          </div>
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
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="w-10 text-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every(i => i.CHK === 'X')}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItems(prev =>
                          prev.map(item => ({
                            ...item,
                            CHK: checked ? 'X' : ''
                          }))
                        );
                      }}
                    />
                  </th>

                  <th className="w-16 text-center">Item</th>
                  <th className="w-32">Material Code</th>
                  <th className="w-60">Material Description</th>
                  <th className="w-24 text-center">PO Qty</th>
                  <th className="w-24 text-center">PO Unit</th>
                  <th className="w-32">Vendor</th>
                  <th className="w-40">Vendor Name</th>
                  <th className="w-40">Packing Condition</th>
                  <th className="w-16 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((item, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;

                  return (
                    <tr key={actualIndex} className="border-b">
                      {/* Checkbox */}
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={item.CHK === 'X'}
                          onChange={(e) =>
                            handleItemChange(
                              actualIndex,
                              'CHK',
                              e.target.checked ? 'X' : ''
                            )
                          }
                        />

                      </td>

                      {/* Item Number */}
                      <td>
                        <Input
                          value={item.ITEM}
                          readOnly
                          className="h-8 text-center bg-muted/50"
                        />
                      </td>

                      {/* Material Code */}
                      <td>
                        <Input
                          value={item.MATNR}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'MATNR', Number(e.target.value))
                          }
                          className="h-8"
                        />
                      </td>

                      {/* Material Description */}
                      <td>
                        <Input
                          value={item.MAKTX}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'MAKTX', e.target.value)
                          }
                          className="h-8"
                        />
                      </td>

                      {/* PO Quantity */}
                      <td>
                        <Input
                          type="number"
                          value={item.CHQTY}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'CHQTY', Number(e.target.value))
                          }
                          className="h-8 text-center"
                        />
                      </td>

                      {/* PO Unit */}
                      <td>
                        <Input
                          value={item.CHUOM}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'CHUOM', e.target.value)
                          }
                          className="h-8 text-center"
                        />
                      </td>

                      {/* Vendor */}
                      <td>
                        <Input
                          value={item.CVNO}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'CVNO', e.target.value)
                          }
                          className="h-8"
                        />
                      </td>

                      {/* Vendor Name */}
                      <td>
                        <Input
                          value={item.CVNAME}
                          onChange={(e) =>
                            handleItemChange(actualIndex, 'CVNAME', e.target.value)
                          }
                          className="h-8"
                        />
                      </td>

                      {/* Packing Condition */}
                      <td>
                        <Select
                          value={item.ZPACKING}
                          onValueChange={(val) =>
                            handleItemChange(actualIndex, 'ZPACKING', val)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GOOD">Good</SelectItem>
                            <SelectItem value="BAD">BAD</SelectItem>
                            <SelectItem value="N/A">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Delete */}
                      <td className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRow(pageIndex)}
                          disabled={items.length <= 1}
                        >
                          🗑
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

        {!isPoMode && (
          <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-3 gap-2">
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
        )}

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
            disabled={isLoading} // Disable reset while saving
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <Button
            onClick={handleSave}
            disabled={isLoading} // Prevents double clicking
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                {/* Animated Loader Icon */}
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </>
            )}
          </Button>
        </div>
      </FormSection>
    </div>
  );
}
