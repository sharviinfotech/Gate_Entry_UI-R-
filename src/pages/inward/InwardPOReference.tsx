import { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { exportToExcel, transporterOptions, generateTestItems, packingConditionOptions } from '@/lib/exportToExcel';
import { useAuth } from '@/contexts/AuthContext';
import service from "../../services/generalservice.js";
import Swal from "sweetalert2";
import { createPortal } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';

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

export default function InwardPOReference() {
  const { webUser } = useAuth();
  const [userPlant, setPlant] = useState('');
  const [headerData, setHeaderData] = useState({
    WERKS: '',

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
    REFDOCTYP: 'Purchase Order',
    DTYPE: 'Inward Process',
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
    "REUSE": "",
    CVNO: "",
    CVNAME: ''
  });

  useEffect(() => {
    const loggedInDetails = localStorage.getItem('gate_entry_user');

    const SelectedPlant = localStorage.getItem('SelectedPlant');
    console.log("SelectedPlant", SelectedPlant)
    headerData.WERKS = SelectedPlant
    setHeaderData(prev => ({ ...prev, INWARDED_BY: webUser }));
  }, [webUser]);

  const [items, setItems] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteRow = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFetchPO = async () => {
    const requiredFields = [];
    if (!headerData.PONO) requiredFields.push("PO Number");
    if (!headerData.WERKS) requiredFields.push("Plant");

    // 2. If any fields are missing, show the specific names
    if (requiredFields.length > 0) {
      Swal.fire({
        title: "Missing Required Fields",
        // This will say "Please enter PO Number" or "Please enter Plant" 
        // or "Please enter PO Number and Plant"
        text: `Please enter: ${requiredFields.join(" and ")}.`,
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }


    const payload = {
      "PO_GET": {
        "GENO": " ", //Gate Entry Number
        "WERKS": headerData.WERKS, //Plant       "//Mandatory
        "VHDAT_IN": new Date().toISOString().split('T')[0], //Vehicle IN Date    //System Generated
        "VHTIM_IN": new Date().toTimeString().slice(0, 8), //Vehicle IN time        //System Generated
        "USR_IN": "",
        "VHNO": "", //Vehicle Number          //Mandatory
        "GRWGT": "",
        "TRWGT": "",
        "NTWGT": "",
        "WUNIT": "",
        "GRUSR": "",
        "GRDAT": "",
        "GRTIM": "",
        "TRUSR": "",
        "TRDAT": "",
        "TRTIM": "",
        "INIWT": "",
        "INIDT": "",
        "INITM": "",
        "INIUR": "",
        "TOTWGT": "",
        "RBSTAT": "",
        "WBOMP": "",
        "WBCOMP": "",
        "DRNAM": "", //Driver Name
        "DRNUM": "", //Driver Number
        "TRANNAM": headerData.TRANNAM, //Transporter Name    //Mandatory
        "GEEXT": "",
        "LEDAT": "", //Out Date
        "LETIM": "", //Out Time
        "LEUSR": "",
        "SGTXT": "",
        "GECAN": "",
        "LCDAT": "",
        "LCTIM": "",
        "LCUSR": "",
        "SCTXT": "",
        "ERNAM": "",
        "LIFNR": "",
        "TRADDR": "", //Address
        "DTYPE": "IN",               //Mandatory, Hardcoded
        "GATEPASS": "", //GatePass Number
        "REFDOCTYP": "PO", //REF Doc Type      //In with reference PO, 'PO' is hardcoded, Mandatory
        "DESTINATION": "",
        "CAPACITY": "",
        "GR_LR_NUM": "", //GR/LR Num
        "WBIND": "",
        "MIX": "",
        "MJAHR": "", //Mat.Doc.Year
        "PONO": headerData.PONO, //PO Number        //Mandatory
        "VENDOR": "", //Vendor
        "VNAME": "",
        "AMOUNT": "", //Amount
        "VHCL_TYPE": "", //Vehicle Type
        "REMARKS": "", //Remarks
        "ZTRID": "",
        "ZTRIP": "", //Trip ID
        "SP_DES": "", //SP Destination
        "PAYMENTTERMS": "", //Payment Terms
        "TOT_COSUME": "",
        "PEND_AMOUNT": "",
        "BLNO": "", //Billing Doc
        "INWARDED_BY": "", //Inwarded by
        "PURPOSE": "", //Purpose
        "REUSE": ""
      }
    }
    console.log('payload', payload)
    setIsLoading(true);
    try {

      const response = await service.fetchGateEntryChange(payload);
      console.log("response", response)

      // 🔴 Collect errors
      const errorMessages = response
        .filter(r => r.MSG_TYPE === "E")
        .map(r => `• ${r.MSG}`);

      // 🟡 Collect warnings
      const warningMessages = response
        .filter(r => r.MSG_TYPE === "I")
        .map(r => `• ${r.MSG}`);

      const successWarningMessages = response
        .filter(r => r.MSG_TYPE === "S")
        .map(r => `• ${r.MSG}`);



      // ❌ If errors exist → show all errors
      if (errorMessages.length > 0) {
        Swal.fire({
          title: "Error",
          html: errorMessages.join("<br>"),
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setIsLoading(false);
        return
      }

      // ⚠️ If warnings exist
      if (warningMessages.length > 0) {
        Swal.fire({
          title: "Warning",
          html: warningMessages.join("<br>"),
          icon: "warning",
          confirmButtonColor: "#f0ad4e",
        });
        setIsLoading(false);
        return
      }
      if (successWarningMessages.length > 0) {
        Swal.fire({
          title: "Warning",
          html: successWarningMessages.join("<br>"),
          icon: "warning",
          confirmButtonColor: "#f0ad4e",
        });

        setIsLoading(false);
        return
      }

      // ✅ Success
      if (response) {
        // Swal.fire({
        //   title: "Success",
        //   text: successMsg?.MSG,
        //   icon: "success",
        //   confirmButtonColor: "#3085d6",
        // });
        if (response) {


          // const itemResponse: ItemRow[] = response;
          // console.log("itemResponse", itemResponse)
          // setItems(itemResponse);

          const itemResponse: ItemRow[] = response.map((item: ItemRow) => ({
  ...item,
  ZQUANT: item.ZQUANT && item.ZQUANT > 0 ? item.ZQUANT : null
}));

setItems(itemResponse);

          setHeaderData(prev => ({
            ...prev,
            // Use String() if CVNO might be a number but VENDOR expects a string
            VENDOR: itemResponse?.[0]?.CVNO ? String(itemResponse[0].CVNO) : '',
            VNAME: itemResponse?.[0]?.CVNAME || '',
          }));
          // Simulate fetching gate entry data
          setTimeout(() => {
            setIsLoading(false);
            toast.success('Data Fetched successfully');
          }, 0);
        }

        // ✅ Reset state after success
      }


    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    } finally {
      setIsLoading(false);
    }


    // Simulate SAP fetch with 35 items

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
  };

  const handleSave = async () => {
    // 1. Define the fields and their user-friendly labels
    const checkFields = [
      { value: headerData.PONO, label: "PO Number" },
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

    headerData.REFDOCTYP = "PO"
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
      REFDOCTYP: 'Purchase Order',
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
      REUSE: '',
      CVNO: '',
      CVNAME: ''
    });

    setItems([]);
  };

  // const handleExport = () => {
  //   if (items.length === 0) {
  //     toast.error('No items to export');
  //     return;
  //   }
  //   const exportColumns = [
  //     { key: 'vendorCode', header: 'Vendor Code' },
  //     { key: 'vendorName', header: 'Vendor Name' },
  //     { key: 'materialCode', header: 'Material Code' },
  //     { key: 'materialDescription', header: 'Material Description' },
  //     { key: 'poQty', header: 'PO Qty' },
  //     { key: 'poUnit', header: 'PO Unit' },
  //     { key: 'balanceQty', header: 'Balance Qty' },
  //     { key: 'gateEntryQty', header: 'Gate Entry Qty' },
  //     { key: 'unit', header: 'Unit' },
  //     { key: 'packingCondition', header: 'Packing Condition' },
  //   ];
  //   exportToExcel(items, exportColumns, `Inward_PO_${headerData.PONO}`);
  //   toast.success('Exported to Excel successfully');
  // };

  // const columns = [
  //   {
  //     key: 'CHK',
  //     // Custom Header: Includes a "Select All" checkbox and the label "Items"
  //     header: (
  //       <div className="flex items-center gap-4">
  //         <input
  //           type="checkbox"
  //           className="w-4 h-4 cursor-pointer"
  //           checked={items.length > 0 && items.every(i => i.CHK === 'X')}
  //           onChange={(e) => {
  //             const checked = e.target.checked;
  //             // setItems logic here to select/deselect all
  //             setItems(prev => prev.map(item => ({ ...item, CHK: checked ? 'X' : '' })));
  //           }}
  //         />
  //         <span>Items</span>
  //       </div>
  //     ),
  //     width: '140px',
  //     render: (_value: string, row: ItemRow, index: number) => (
  //       <div className="flex items-center gap-4">
  //         {/* Row Checkbox */}
  //         <input
  //           type="checkbox"
  //           checked={items[index]?.CHK === 'X'}
  //           onChange={(e) =>
  //             handleItemChange(index, 'CHK', e.target.checked ? 'X' : '')
  //           }
  //           className="w-4 h-4 cursor-pointer"
  //         />

  //         {/* Formatted Item Number in a styled box like your screenshot */}
  //         <div className="flex items-center justify-center h-8 px-2 border rounded bg-muted/30 min-w-[60px] text-sm text-muted-foreground">
  //           {row.ITEM ? row.ITEM.toString().padStart(5, '0') : (index + 1).toString().padStart(5, '0')}
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'MATNR',
  //     header: 'Material Code',
  //     width: '120px',
  //   },
  //   {
  //     key: 'MAKTX',
  //     header: 'Material Description',
  //     width: '200px',
  //   },
  //   {
  //     key: 'CHQTY',
  //     header: 'PO Qty',
  //     width: '80px',
  //   },
  //   {
  //     key: 'CHUOM',
  //     header: 'PO Unit',
  //     width: '80px',
  //   },
  //   {
  //     key: 'ZQUANT',
  //     header: 'Gate Entry Qty',
  //     width: '120px',
  //     render: (value: number, row: ItemRow, index: number) => (
  //       <Input
  //         type="number"
  //         value={value ?? ''}
  //         onChange={(e) => {
  //           const rawValue = e.target.value;
  //           const numericValue = rawValue === '' ? null : Number(rawValue);

  //           handleItemChange(index, 'ZQUANT', numericValue);
  //         }}
  //         className="h-8 w-full"
  //         min={0}
  //       />
  //     ),
  //   },

  //   {
  //     key: 'ZPACKING',
  //     header: 'Packing Condition',
  //     width: '150px',
  //     render: (value: string, _row: ItemRow, index: number) => (
  //       <Select
  //         value={value}
  //         onValueChange={(v) =>
  //           handleItemChange(index, 'ZPACKING', v)
  //         }
  //       >
  //         <SelectTrigger className="h-8 w-full">
  //           <SelectValue placeholder="Select" />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {packingConditionOptions.map((opt) => (
  //             <SelectItem key={opt.value} value={opt.value}>
  //               {opt.label}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     ),
  //   },
  // ];


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
        title="Inward Gate Entry - PO Reference"
        subtitle="Create gate entry by fetching data from Purchase Order"
        breadcrumbs={[{ label: 'Inward', path: '/inward/po-reference' }, { label: 'With PO Reference' }]}
      />

      {/* PO Reference Section */}
      <FormSection title="PO Reference">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <TextField
            label="Plant"
            readOnly
            value={headerData.WERKS}
            onChange={(value) => setHeaderData({ ...headerData, WERKS: value })}
            placeholder="Enter Plant"
            required
          />
          {/* <SelectField
            label="Plant"
            value={headerData.plant}
            onChange={(value) => setHeaderData({ ...headerData, plant: value })}
            options={[
              { value: '1000', label: '1000' },
              { value: '2000', label: '2000' },
              { value: '3000', label: '3000' },
            ]}
            required
          /> */}
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
            readOnly
          />
          <TextField
            label="Vendor Name"
            value={headerData.VNAME}
            readOnly
          />
          <>
            {/* Full Screen Spinner */}
            {isLoading && <FullScreenLoader />}

            <div className="pb-0.5">
              <Button
                onClick={handleFetchPO}
                disabled={isLoading}
                className="..."
              >
                {isLoading ? "Processing..." : "Fetch PO Data"}
              </Button>
            </div>
          </>
        </div>
      </FormSection>

      {/* Header Information */}
      <FormSection title="Header Information">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          />

        </div>
      </FormSection>

      {/* Vehicle & Transport Details */}
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

      {/* Item Grid */}
      <FormSection title="Item Details">
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No items loaded. Enter PO Number and click "Fetch PO Data" to load items.</p>
          </div>
        ) : (
          <>
            {/* <div className="flex justify-end mb-3">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export to Excel
              </Button>
            </div> */}
            {/* <DataGrid
              columns={columns}
              data={items}
              // editable={true}
              // onRowDelete={handleDeleteRow}
              minRows={1}
              maxHeight="350px"
              itemsPerPage={10}
            /> */}

            <div className="data-grid border rounded-md">
              <div className="overflow-auto scrollbar-thin" style={{ maxHeight: '400px' }}>
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      {/* Combined Checkbox and Items Label */}
                      <th className="p-2 border w-[140px] text-left">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={items.length > 0 && items.every(i => i.CHK === 'X')}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setItems(prev => prev.map(item => ({ ...item, CHK: checked ? 'X' : '' })));
                            }}
                          />
                          <span>Items</span>
                        </div>
                      </th>

                      <th className="p-2 border w-32 text-left">Material Code</th>
                      <th className="p-2 border w-60 text-left">Material Description</th>
                      <th className="p-2 border w-24 text-left">PO Qty</th>
                      <th className="p-2 border w-24 text-left">PO Unit</th>
                      <th className="p-2 border w-32 text-left">Gate Entry Qty</th>
                      <th className="p-2 border w-40 text-left">Packing Condition</th>
                      <th className="p-2 border w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        {/* Item Column: Checkbox + Styled Item No */}
                        <td className="p-2 border">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={item.CHK === 'X'}
                              onChange={(e) => handleItemChange(index, 'CHK', e.target.checked ? 'X' : '')}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <div className="flex items-center justify-center h-8 px-2 border rounded bg-muted/30 min-w-[60px] text-xs font-medium text-muted-foreground">
                              {String(item.ITEM).padStart(5, '0')}
                            </div>
                          </div>
                        </td>

                        {/* Material Details (Read-only or Input based on your need) */}
                        <td className="p-2 border">{item.MATNR}</td>
                        <td className="p-2 border">{item.MAKTX}</td>
                        <td className="p-2 border text-right">{item.CHQTY}</td>
                        <td className="p-2 border">{item.CHUOM}</td>

                        {/* Editable Gate Entry Quantity */}
                        {/* <td className="p-2 border">
                          <Input
                            type="number"
                            value={item.ZQUANT ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              handleItemChange(index, 'ZQUANT', val);
                            }}
                            className="h-8 text-right"
                          />
                        </td> */}
                        <td className="p-2 border">
                          <Input
                            type="number"
                            min="1"
                            max={item.CHQTY}
                            value={item.ZQUANT ?? ""}
                            onKeyDown={(e) => {
                              // Prevent invalid keys
                              if (e.key === "-" || e.key === "+" || e.key === "e") {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;

                              // Allow empty while deleting
                              if (value === "") {
                                handleItemChange(index, "ZQUANT", null);
                                return;
                              }

                              const num = Number(value);

                              if (num > item.CHQTY) {
                                Swal.fire(
                                  "Invalid Quantity",
                                  `Gate Entry Qty cannot exceed PO Qty (${item.CHQTY})`,
                                  "warning"
                                );
                                return; // stop here
                              }
                              if (num >= 1 && num <= item.CHQTY) {
                                handleItemChange(index, "ZQUANT", num);
                              }
                            }}
                            className="h-8 text-right"
                          />
                        </td>

                        {/* Packing Condition Select */}
                        <td className="p-2 border">
                          <Select
                            value={item.ZPACKING}
                            onValueChange={(v) => handleItemChange(index, 'ZPACKING', v)}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {packingConditionOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Delete Action */}
                        <td className="p-2 border text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleReset} className="gap-2" disabled={isLoading}>
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>

          </>
        )}
      </FormSection>
    </div>
  );


}