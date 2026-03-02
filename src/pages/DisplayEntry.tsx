import { useState } from 'react';
import { Search, Printer, FileDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import service from "../services/generalservice.js"
import Swal from "sweetalert2";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { packingConditionOptions } from '@/lib/exportToExcel';
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



export default function DisplayEntry() {
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refDocType, setRefDocType] = useState<string>("");
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
  const number = gateEntryNo.trim();

if (!number) {
      toast.error('Please enter Gate Entry Number');
      return;
    }
if (number.length !== 10) {
      Swal.fire({
        title: "warning",
        text: "Gate Entry Number Should be 10 Digits Only",
        icon: "warning",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        "GET_ENTRY": gateEntryNo,
        "CHANGE": "",
        "DISPLAY": "X"
      }
      setIsLoading(true);
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
      } else {
        const headerResponse = response.HEADER[0]
        const itemResponse = response.ITEM
        console.log("headerResponse", headerResponse, "itemResponse", itemResponse)
        // Set the visibility state: true if it's a PO, false otherwise
        const docType = headerResponse.REFDOCTYP; // e.g., "PO", "SUB", or "WOREF"
        setRefDocType(docType);
        console.log("docType", docType)
        // Simulate fetching gate entry data
        setTimeout(() => {

          const itemResponse: ItemRow[] = response.ITEM;
          setItems(itemResponse);
          console.log("itemResponse", itemResponse)
          setIsLoaded(true);
          setIsLoading(false);
          toast.success('Data Fetched successfully');
           var localREFDOCTYP = '';
          if (headerResponse.REFDOCTYP === "PO") {
            localREFDOCTYP = "Purchase Order"
          }
          else if (headerResponse.REFDOCTYP === "SUB") {
            localREFDOCTYP = "Subcontracting"
          }
          else if (headerResponse.REFDOCTYP === "WOREF") {
            localREFDOCTYP = "Without Reference"
          }
          var localDTYPE = '';
          if (headerResponse.DTYPE === "IN") {
            localDTYPE = "Inward"
          }
          else if (headerResponse.DTYPE === "OUT") {
            localDTYPE = "Outward"}
          setHeaderData({
            GENO: headerResponse.GENO,
            WERKS: headerResponse.WERKS,
            DTYPE: localDTYPE,
            VHDAT_IN: headerResponse.VHDAT_IN,
            VHTIM_IN: headerResponse.VHTIM_IN,
            VHNO: headerResponse.VHNO,
            VHCL_TYPE: headerResponse.VHCL_TYPE,
            DRNAM: headerResponse.DRNAM,
            DRNUM: headerResponse.DRNUM,
            TRANNAM: headerResponse.TRANNAM,
            GR_LR_NUM: headerResponse.GR_LR_NUM,
            PONO: headerResponse.PONO,
            VENDOR: headerResponse.VENDOR || itemResponse[0].CVNO,
            VNAME: headerResponse.VNAME || itemResponse[0].CVNAME,
            INWARDED_BY: headerResponse.INWARDED_BY,
            REFDOCTYP:localREFDOCTYP,
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
            "ERNAM": headerResponse.ERNAM,
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
        }, 0);

      }


    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    } finally {
      setIsLoading(false);
    }


  };


  const handlePrint = () => {
    toast.success('Preparing print preview...');
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
      {isLoading && <FullScreenLoader />}
      <PageHeader
        title="Display Gate Entry"
        subtitle="View gate entry details (read-only)"
        breadcrumbs={[{ label: 'Display' }]}
        actions={
          isLoaded && (
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          )
        }
      />

      {/* Gate Entry Reference Section */}
      <FormSection title="Search Gate Entry">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Gate Entry Number"
            value={gateEntryNo}
            onChange={setGateEntryNo}
            placeholder="Enter Gate Entry No (e.g., GE-2024-001)"
            required
          />
          <div className="flex items-end">
            <Button onClick={handleFetch} disabled={isLoading} className="gap-2 w-full"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Display Entry
            </Button>
          </div>
        </div>
      </FormSection>

      {!isLoaded ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileDown className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Enter Gate Entry Number to view details</p>
        </div>
      ) : (
        <>
          {/* Header Information */}
          <FormSection title="Header Information">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* <TextField label="Gate Entry No" value={gateEntryNo}  /> */}
              <TextField label="Plant"
                required
                readOnly
                value={headerData.WERKS} />
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
                required
                readOnly
                onChange={(value) => setHeaderData({ ...headerData, DTYPE: value })} />
              <TextField
                required
                label="Ref Doc Type"
                readOnly
                value={headerData.REFDOCTYP}

              />
              <TextField
                label="Vehicle Date"
                type="date"
                value={headerData.VHDAT_IN}
                required
                readOnly
                onChange={(value) => setHeaderData({ ...headerData, VHDAT_IN: value })}
              />
              <TextField
                label="Vehicle Time"
                type="time"
                required
                readOnly
                value={headerData.VHTIM_IN}
                onChange={(value) => setHeaderData({ ...headerData, VHTIM_IN: value })}
              />
              <TextField
                label="Vehicle Out Date"
                type="date"
                readOnly
                value={headerData.LEDAT}
              />
              <TextField
                label="Vehicle Out Time"
                type="time"
                readOnly
                value={headerData.LETIM}
              />

            </div>
          </FormSection>

          {/* Vehicle & Transport Details */}
          <FormSection title="Vehicle & Transport Details">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                label="Vehicle No"
                required
                readOnly
                value={headerData.VHNO}
                onChange={(value) => setHeaderData({ ...headerData, VHNO: value })}
              />
              <TextField
                label="Vehicle Type"
                required
                readOnly
                value={headerData.VHCL_TYPE}
                onChange={(value) => setHeaderData({ ...headerData, VHCL_TYPE: value })}
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
                required
                readOnly
                value={headerData.DRNAM}
                onChange={(value) => setHeaderData({ ...headerData, DRNAM: value })}
              />
              <TextField
                label="Driver Contact"
                required
                readOnly
                value={headerData.DRNUM}
                onChange={(value) => setHeaderData({ ...headerData, DRNUM: value })}
              />
              <TextField
                label="Transporter Name"
                required
                readOnly
                placeholder="Enter Transporter Name"
                value={headerData.TRANNAM}
                onChange={(value) => setHeaderData({ ...headerData, TRANNAM: value })}
              />
              <TextField
                label="GR/LR Number"
                readOnly
                value={headerData.GR_LR_NUM}
                onChange={(value) => setHeaderData({ ...headerData, GR_LR_NUM: value })}
              />

              <TextField label="Inwarded By"
                required
                readOnly
                value={headerData.INWARDED_BY}
                onChange={(value) => setHeaderData({ ...headerData, INWARDED_BY: value })}
              />
              <TextField
                label="Remarks"
                value={headerData.REMARKS}
                readOnly
                onChange={(value) => setHeaderData({ ...headerData, REMARKS: value })}
              />
            </div>
          </FormSection>

          {/* Only show "Reference Details" if NOT in PO Mode */}
          {/* Only show "Reference Details" if type is exactly PO */}
          {refDocType === "PO" && (
            <FormSection title="Reference Details">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <TextField label="PO Number" readOnly value={headerData.PONO} />
                <TextField label="Vendor Number" readOnly value={headerData.VENDOR} />
                <TextField label="Vendor Name" readOnly value={headerData.VNAME} />
              </div>
            </FormSection>
          )}

          {/* Item Grid */}
          <FormSection title="Item Details"
          >
            {/* Add Row Button */}


            <div className="border rounded-md">
              <div className="overflow-auto scrollbar-thin" style={{ maxHeight: '400px' }}>
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      {/* <th className="p-2 border w-10">
                        <input
                          type="checkbox"
                          checked={items.length > 0 && items.every(i => i.CHK === 'X')}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setItems(prev => prev.map(item => ({ ...item, CHK: checked ? 'X' : '' })));
                          }}
                        />
                      </th> */}
                      <th className="w-16 text-center">Item</th>
                      <th className="p-2 border w-32">Material Code</th>
                      <th className="p-2 border w-60">Material Description</th>
                      {/* Logic for Qty/Unit Columns */}
                      {/* PO Qty & PO Unit → show for PO and SUB */}
                      {["PO"].includes(refDocType) && (
                        <>
                          <th className="p-2 border w-24">PO Qty</th>
                          <th className="p-2 border w-24">PO Unit</th>
                        </>
                      )}
                       {[ "SUB"].includes(refDocType) && (
                        <>
                          <th style={{ width : '150px'}}>Received Qty</th>
                          <th className="p-2 border w-24">UOM</th>
                        </>
                      )}

                      {/* Quantity → show for PO and others (NOT SUB-only logic) */}

                      {["PO"].includes(refDocType) && (
                        <>
                          <th className="p-2 border w-24">Quantity</th>

                        </>
                      )}
                      {["WOREF"].includes(refDocType) && (
                        <>
                          <th className="p-2 border w-24">Quantity</th>
                          <th className="p-2 border w-24">Unit</th>
                        </>
                      )}
                      {/* Logic for Vendor Columns: Show for SUB and WOREF */}
                      {["SUB", "WOREF"].includes(refDocType) && (
                        <>
                          <th className="p-2 border w-40">Vendor</th>
                          <th className="p-2 border w-40">Vendor Name</th>
                        </>
                      )}
                      <th className="p-2 border w-40">Packing Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        {/* Checkbox */}
                        {/* <td className="p-2 border text-center">
                          <input
                            type="checkbox"
                            checked={item.CHK === 'X'}
                            onChange={(e) => handleItemChange(index, 'CHK', e.target.checked ? 'X' : '')}
                          />
                        </td> */}

                        <td className='p-3 border'>{item.ITEM}</td>
                        <td className='p-3 border'>{item.MATNR}</td>

                        <td className='p-3 border'>{item.MAKTX}</td>

                        {/* PO Qty & PO Unit */}
                        {["PO", "SUB"].includes(refDocType) && (
                          <>
                            <td className='p-3 border'>{item.CHQTY}</td>
                            <td className='p-3 border'>{item.CHUOM}</td>

                          </>
                        )}



                        {/* Quantity & Unit */}
                        {["PO"].includes(refDocType) && (
                          <>
                            <td className='p-3 border'>{item.ZQUANT}</td>


                          </>
                        )}
                        {["WOREF"].includes(refDocType) && (
                          <>
                            <td className='p-3 border'>{item.ZQUANT}</td>
                            <td className='p-3 border'> {item.ZMEINS}</td>


                          </>
                        )}

                        {/* Vendor Inputs: Show for SUB and WOREF */}
                        {["SUB", "WOREF"].includes(refDocType) && (
                          <>
                            <td className='p-3 border'>{item.CVNO}</td>
                            <td className='p-3 border'>{item.CVNAME}</td>

                          </>
                        )}

                        {/* Packing Condition */}
                        <td className='p-3 border'>{item.ZPACKING}</td>




                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </FormSection>

          {/* Audit Information */}
          {/* <FormSection title="Audit Information">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField label="Created At" value={headerData.createdAt} readOnly />
              <TextField label="Created By" value={headerData.createdBy} readOnly />
            </div>
          </FormSection> */}
        </>
      )}
    </div>
  );
}
