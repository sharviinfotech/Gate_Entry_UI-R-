import { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, FileDown, FileSpreadsheet,Loader2 } from 'lucide-react';
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

  const [headerData, setHeaderData] = useState({
    WERKS: '',
    DTYPE: 'IN',
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
    REFDOCTYP: 'PO',
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
    if (!headerData.PONO || !headerData.WERKS) {
      toast.error('Please enter PO Number and Plant');
      return;
    }
  

    const payload = {
      "PO_GET": {
        "GENO": " ", //Gate Entry Number
        "WERKS": headerData.WERKS, //Plant       "//Mandatory
        "VHDAT_IN": new Date().toISOString().split('T')[0], //Vehicle IN Date    //System Generated
        "VHTIM_IN": new Date().toTimeString().slice(0, 5), //Vehicle IN time        //System Generated
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
        "DTYPE": headerData.DTYPE || "IN",               //Mandatory, Hardcoded
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
   console.log('payload',payload)
   
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


        const itemResponse: ItemRow[] = response;
        console.log("itemResponse", itemResponse)
        setItems(itemResponse);

        // Simulate fetching gate entry data
        setTimeout(() => {
          setIsLoading(false);
          toast.success('Data Fetched successfully');
        }, 1000);
      }

        // ✅ Reset state after success
      }
      

    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    } finally {
      setIsLoading(false);
    }

    setIsLoading(true);
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
    const payload = {
      CREATE: "X",
      CHANGE: "",
      SEL: "",
      CEL: "",
      ICON: "",
      HEADER: [headerData],
      ITEM: items,
    };
 console.log("payload",payload)
 
    try {
      setIsLoading(true); // ✅ Spinner ON

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
      DTYPE: 'IN',
      "VHDAT_IN": new Date().toISOString().split('T')[0], //Vehicle IN Date    //System Generated
      "VHTIM_IN": new Date().toTimeString().slice(0, 5), //Vehicle IN time  
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
      REFDOCTYP: '',
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

  const columns = [
    {
  key: 'CHK',
  header: '',
  width: '50px',
  render: (_value: string, _row: ItemRow, index: number) => (
    <input
      type="checkbox"
      checked={items[index]?.CHK === 'X'}
      onChange={(e) =>
        handleItemChange(index, 'CHK', e.target.checked ? 'X' : '')
      }
    />
  ),
},
    {
      key: 'MATNR',
      header: 'Material Code',
      width: '120px',
    },
    {
      key: 'MAKTX',
      header: 'Material Description',
      width: '200px',
    },
    {
      key: 'CHQTY',
      header: 'PO Qty',
      width: '80px',
    },
    {
      key: 'CHUOM',
      header: 'PO Unit',
      width: '80px',
    },
    {
      key: 'ZQUANT',
      header: 'Gate Entry Qty',
      width: '120px',
      render: (value: number, row: ItemRow, index: number) => (
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const rawValue = e.target.value;
            const numericValue = rawValue === '' ? null : Number(rawValue);

            handleItemChange(index, 'ZQUANT', numericValue);
          }}
          className="h-8 w-full"
          min={0}
        />
      ),
    },
    {
      key: 'ZMEINS',
      header: 'Unit',
      width: '80px',
      render: (value: string, row: ItemRow) => value || row.CHUOM,
    },
    {
      key: 'ZPACKING',
      header: 'Packing Condition',
      width: '150px',
      render: (value: string, _row: ItemRow, index: number) => (
        <Select
          value={value}
          onValueChange={(v) =>
            handleItemChange(index, 'ZPACKING', v)
          }
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
      ),
    },
  ];

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
            value={headerData.WERKS}
            onChange={(value) => setHeaderData({ ...headerData, WERKS: value })}
            placeholder="Enter PO Number"
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
          <div className="pb-0.5">
            <Button onClick={handleFetchPO} disabled={isLoading} className="gap-2 w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Fetch PO Data
            </Button>
          </div>
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
          />
          <TextField
            label="Gate Entry Type"
            value={headerData.DTYPE}
            readOnly
          />
          <TextField
            label="Inward By"
            value={headerData.INWARDED_BY}
            onChange={(value) => setHeaderData({ ...headerData, INWARDED_BY: value })}
            placeholder="Enter user name"
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
            value={headerData.VHCL_TYPE}
            onChange={(value) => setHeaderData({ ...headerData, VHCL_TYPE: value })}
            options={[
              { value: 'HIRE', label: 'Hire Vehicle' },
              { value: 'OWN', label: 'Own Vehicle' },

            ]}
          />
          <TextField
            label="Driver Name"
            value={headerData.DRNAM}
            onChange={(value) => setHeaderData({ ...headerData, DRNAM: value })}
            placeholder="Enter driver name"
          />
          <TextField
            label="Driver Contact"
            value={headerData.DRNUM}
            onChange={(value) => setHeaderData({ ...headerData, DRNUM: value })}
            placeholder="+91 98765 43210"
          />
          <SelectField
            label="Transporter Name"
            value={headerData.TRANNAM}
            onChange={(value) => setHeaderData({ ...headerData, TRANNAM: value })}
            options={transporterOptions}
          />
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
            <DataGrid
              columns={columns}
              data={items}
              // editable={true}
              // onRowDelete={handleDeleteRow}
              minRows={1}
              maxHeight="350px"
              itemsPerPage={10}
            />
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