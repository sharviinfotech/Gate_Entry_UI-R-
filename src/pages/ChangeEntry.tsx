import { useState } from 'react';
import { Search, Save, RotateCcw, FileDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { packingConditionOptions } from '@/lib/exportToExcel';
import service from "../services/generalservice.js"
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



export default function ChangeEntry() {
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [headerData, setHeaderData] = useState({
    WERKS: '',
    DTYPE: '',
    VHDAT_IN: '',
    VHTIM_IN: '',
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

  const [items, setItems] = useState<ItemRow[]>([]);

  const handleFetch = async () => {
    if (!gateEntryNo) {
      toast.error('Please enter Gate Entry Number');
      return;
    }

    try {
      const payload = {
        "GET_ENTRY": gateEntryNo,
        "CHANGE": "X",
        "DISPLAY": ""
      }
      const response = await service.fetchGateEntryChange(payload);
      console.log("response", response)
     if (response.length > 0) {
     
             const sucessMessages = response
               .filter(r => r.MSG_TYPE === "S")
               .map(r => `• ${r.MSG}`);
             const errorMessages = response
               .filter(r => r.MSG_TYPE === "E")
               .map(r => `• ${r.MSG}`);
               const warnigMessages = response
               .filter(r => r.MSG_TYPE === "I")
               .map(r => `• ${r.MSG}`);
             if (sucessMessages.length > 0) {
               Swal.fire({
                 title: "success",
                 html: sucessMessages.join("<br>"),
                 icon: "success",
                 confirmButtonColor: "#3085d6",
               });
               
               return
             }
              if (warnigMessages.length > 0) {
               Swal.fire({
                 title: "success",
                 html: warnigMessages.join("<br>"),
                 icon: "success",
                 confirmButtonColor: "#3085d6",
               });
               
               return
             }
             if (errorMessages.length > 0) {
               Swal.fire({
                 title: "Error",
                 html: errorMessages.join("<br>"),
                 icon: "error",
                 confirmButtonColor: "#d33",
               });
              
     
            
               return
             }
           }else {
        const headerResponse = response.HEADER[0]
        const itemResponse = response.ITEM
        console.log("headerResponse", headerResponse, "itemResponse", itemResponse)

        // Simulate fetching gate entry data
        setTimeout(() => {
          setHeaderData({
            GENO: headerResponse.GENO,
            WERKS: headerResponse.WERKS,
            DTYPE: headerResponse.DTYPE,
            VHDAT_IN: headerResponse.VHDAT_IN,
            VHTIM_IN: headerResponse.VHTIM_IN,
            VHNO: headerResponse.VHNO,
            VHCL_TYPE: headerResponse.VHCL_TYPE,
            DRNAM: headerResponse.DRNAM,
            DRNUM: headerResponse.DRNUM,
            TRANNAM: headerResponse.TRANNAM,
            GR_LR_NUM: headerResponse.GR_LR_NUM,
            PONO: headerResponse.PONO,
            VENDOR: headerResponse.VENDOR,
            VNAME: headerResponse.VNAME,
            INWARDED_BY: headerResponse.INWARDED_BY,
            REFDOCTYP: headerResponse.REFDOCTYP,
            LEDAT: headerResponse.LEDAT,
            LETIM: headerResponse.LETIM,
            TRADDR: headerResponse.TRADDR,
            REMARKS: headerResponse.REMARKS,
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
          const itemResponse: ItemRow[] = response.ITEM;
          setItems(itemResponse);
          console.log("itemResponse", itemResponse)
          setIsLoaded(true);
          setIsLoading(false);
          toast.success('Data Fetched successfully');
        }, 1000);
      }


    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    } finally {
      setIsLoading(false);
    }


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

  const handleDeleteRow = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    toast.success('Gate Entry updated successfully!');
    const payload = {
      "CREATE": "",
      "CHANGE": "X",
      "SEL": "",
      "CEL": "",
      "ICON": "",
      HEADER: [headerData],
      ITEM: items, // 👈 FULL ORIGINAL STRUCTURE
    };
    console.log("payload", payload)
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
        text: successMsg?.MSG,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // ✅ Reset state after success
      handleReset();
    }

  };

  const handleReset = () => {
    setGateEntryNo('');
    setIsLoaded(false);
    setHeaderData({
      WERKS: '',
      DTYPE: '',
      VHDAT_IN: '',
      VHTIM_IN: '',
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
    setItems([]);
  };

  const columns = [
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
        title="Change Gate Entry"
        subtitle="Modify existing gate entry records"
        breadcrumbs={[{ label: 'Change' }]}
        actions={
          isLoaded && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          )
        }
      />

      {/* Gate Entry Reference Section */}
      <FormSection title="Gate Entry Reference">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Gate Entry Number"
            value={gateEntryNo}
            onChange={setGateEntryNo}
            placeholder="Enter Gate Entry No (e.g., GE-2024-001)"
            required
          />
          <div className="flex items-end">
            <Button onClick={handleFetch} disabled={isLoading} className="gap-2 w-full">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Fetch Entry
            </Button>
          </div>
        </div>
      </FormSection>

      {!isLoaded ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileDown className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Enter Gate Entry Number and click "Fetch Entry" to load data for modification</p>
        </div>
      ) : (
        <>
          {/* Header Information */}
          <FormSection title="Header Information">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* <TextField label="Gate Entry No" value={gateEntryNo}  /> */}
              <TextField label="Plant" value={headerData.WERKS} />
              {/* <SelectField
                label="WERKS"
                value={headerData.WERKS}
                onChange={(value) => setHeaderData({ ...headerData, WERKS: value })}
                options={[
                  { value: '1000', label: '1000 - Main WERKS' },
                  { value: '2000', label: '2000 - Warehouse' },
                  { value: '3000', label: '3000 - Factory' },
                ]}
              /> */}
              <TextField label="Gate Entry Type" value={headerData.DTYPE}
                onChange={(value) => setHeaderData({ ...headerData, DTYPE: value })} />
              <TextField
                label="Vehicle Date"
                type="date"
                value={headerData.VHDAT_IN}
                onChange={(value) => setHeaderData({ ...headerData, VHDAT_IN: value })}
              />
              <TextField
                label="Vehicle Time"
                type="time"
                value={headerData.VHTIM_IN}
                onChange={(value) => setHeaderData({ ...headerData, VHTIM_IN: value })}
              />
              <TextField
                label="Vehicle Out Date"
                type="date"
                value={headerData.LEDAT}
              />
              <TextField
                label="Vehicle Out Time"
                type="time"
                value={headerData.LETIM}
              />
              <TextField
                label="Ref Doc Type"
                value={headerData.REFDOCTYP}

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
              />
              <TextField
                label="Vehicle Type"
                value={headerData.VHCL_TYPE}

              />
              {/* <SelectField
                label="Vehicle Type"
                value={headerData.VHCL_TYPE}
                onChange={(value) => setHeaderData({ ...headerData, VHCL_TYPE: value })}
                options={[
                  { value: 'truck', label: 'Truck' },
                  { value: 'tempo', label: 'Tempo' },
                  { value: 'container', label: 'Container' },
                  { value: 'trailer', label: 'Trailer' },
                ]}
              /> */}
              <TextField
                label="Driver Name"
                value={headerData.DRNAM}
                onChange={(value) => setHeaderData({ ...headerData, DRNAM: value })}
              />
              <TextField
                label="Driver Contact"
                value={headerData.DRNUM}
                onChange={(value) => setHeaderData({ ...headerData, DRNUM: value })}
              />
              <TextField
                label="Transporter Name"
                value={headerData.TRANNAM}
                onChange={(value) => setHeaderData({ ...headerData, TRANNAM: value })}
              />
              <TextField
                label="GR/LR Number"
                value={headerData.GR_LR_NUM}
                onChange={(value) => setHeaderData({ ...headerData, GR_LR_NUM: value })}
              />
              <TextField
                label="Address"
                value={headerData.TRADDR}
                onChange={(value) => setHeaderData({ ...headerData, TRADDR: value })}
              />
              <TextField
                label="Remarks"
                value={headerData.REMARKS}
                onChange={(value) => setHeaderData({ ...headerData, REMARKS: value })}
              />
            </div>
          </FormSection>

          {/* Vendor/Reference Details */}
          <FormSection title="Reference Details">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField label="PO Number" value={headerData.PONO} />
              <TextField label="Vendor Number" value={headerData.VENDOR} />
              <TextField label="Vendor Name" value={headerData.VNAME} />
              <TextField label="Inwarded By" value={headerData.INWARDED_BY} />
            </div>
          </FormSection>

          {/* Item Grid */}
          <FormSection title="Item Details">
            <DataGrid
              columns={columns}
              data={items}
              editable={true}
              onRowDelete={handleDeleteRow}
              minRows={1}
              maxHeight="350px"
              itemsPerPage={10}
            />
          </FormSection>
        </>
      )}
    </div>
  );
}
