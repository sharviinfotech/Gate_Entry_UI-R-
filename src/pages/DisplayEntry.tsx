import { useState } from 'react';
import { Search, Printer, FileDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField } from '@/components/shared/FormField';
import { DataGrid } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import service from "../services/generalservice.js"
import Swal from "sweetalert2";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { packingConditionOptions } from '@/lib/exportToExcel';

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

    const [headerData, setHeaderData] = useState({
    plant: '',
    gateEntryType: '',
    vehicleDate: '',
    vehicleTime: '',
    vehicleNo: '',
    vehicleType: '',
    driverName: '',
    driverContact: '',
    transporterName: '',
    grLrNumber: '',
    poNumber: '',
    vendorNumber: '',
    vendorName: '',
    inwardedBy: '',
    refDocType: '',
    vehicleOutDate: '',
    vehicleOutTime: '',
    TRADDR: '',
    REMARKS: ''
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
        "CHANGE": "",
        "DISPLAY": "X"
      }
      const response = await service.fetchGateEntryChange(payload);
      console.log("response", response)
      if (response[0]?.MSG_TYPE == "E") {

        Swal.fire({
          title: "error",
          text: response[0].MSG,
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
        setHeaderData({
          plant: '',
          gateEntryType: '',
          vehicleDate: '',
          vehicleTime: '',
          vehicleNo: '',
          vehicleType: '',
          driverName: '',
          driverContact: '',
          transporterName: '',
          grLrNumber: '',
          poNumber: '',
          vendorNumber: '',
          vendorName: '',
          inwardedBy: '',
          refDocType: '',
          vehicleOutDate: '',
          vehicleOutTime: '',
          TRADDR: '',
          REMARKS: ''
        });
        setItems([]);

      }else{
        const headerResponse = response.HEADER[0]
      const itemResponse = response.ITEM
      console.log("headerResponse", headerResponse, "itemResponse", itemResponse)

      // Simulate fetching gate entry data
      setTimeout(() => {
        setHeaderData({
          plant: headerResponse.WERKS,
          gateEntryType: 'Inward - PO Reference',
          vehicleDate: headerResponse.VHDAT_IN,
          vehicleTime: headerResponse.VHTIM_IN,
          vehicleNo: headerResponse.VHNO,
          vehicleType: headerResponse.VHCL_TYPE,
          driverName: headerResponse.DRNAM,
          driverContact: headerResponse.DRNUM,
          transporterName: headerResponse.TRANNAM,
          grLrNumber: headerResponse.GR_LR_NUM,
          poNumber: headerResponse.PONO,
          vendorNumber: headerResponse.VENDOR,
          vendorName: headerResponse.VNAME,
          inwardedBy: headerResponse.INWARDED_BY,
          refDocType: headerResponse.REFDOCTYP,
          vehicleOutDate: headerResponse.LEDAT,
          vehicleOutTime: headerResponse.LETIM,
          TRADDR: headerResponse.TRADDR,
          REMARKS: headerResponse.REMARKS
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

  return (
    <div className="space-y-6">
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
            <Button onClick={handleFetch} disabled={isLoading} className="gap-2 w-full">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
              <TextField label="Gate Entry No" value={gateEntryNo} readOnly />
              <TextField label="Gate Entry No" value={headerData.plant} readOnly />
              {/* <SelectField
                label="Plant"
                value={headerData.plant}
                onChange={(value) => setHeaderData({ ...headerData, plant: value })}
                options={[
                  { value: '1000', label: '1000 - Main Plant' },
                  { value: '2000', label: '2000 - Warehouse' },
                  { value: '3000', label: '3000 - Factory' },
                ]}
              /> */}
              <TextField label="Gate Entry Type" value={headerData.gateEntryType} readOnly />
              <TextField
                label="Vehicle Date"
                type="date"
                value={headerData.vehicleDate}
                onChange={(value) => setHeaderData({ ...headerData, vehicleDate: value })}
              />
              <TextField
                label="Vehicle Time"
                type="time"
                value={headerData.vehicleTime}
                onChange={(value) => setHeaderData({ ...headerData, vehicleTime: value })}
              />
              <TextField
                label="Vehicle Out Date"
                type="date"
                value={headerData.vehicleOutDate}
              />
              <TextField
                label="Vehicle Out Time"
                type="time"
                value={headerData.vehicleOutTime}
              />
              <TextField
                label="Ref Doc Type"
                value={headerData.refDocType}
                readOnly
              />
            </div>
          </FormSection>

          {/* Vehicle & Transport Details */}
          <FormSection title="Vehicle & Transport Details">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                label="Vehicle No"
                value={headerData.vehicleNo}
                onChange={(value) => setHeaderData({ ...headerData, vehicleNo: value })}
              />
              <TextField
                label="Vehicle Type"
                value={headerData.vehicleType}

              />
              {/* <SelectField
                label="Vehicle Type"
                value={headerData.vehicleType}
                onChange={(value) => setHeaderData({ ...headerData, vehicleType: value })}
                options={[
                  { value: 'truck', label: 'Truck' },
                  { value: 'tempo', label: 'Tempo' },
                  { value: 'container', label: 'Container' },
                  { value: 'trailer', label: 'Trailer' },
                ]}
              /> */}
              <TextField
                label="Driver Name"
                value={headerData.driverName}
                onChange={(value) => setHeaderData({ ...headerData, driverName: value })}
              />
              <TextField
                label="Driver Contact"
                value={headerData.driverContact}
                onChange={(value) => setHeaderData({ ...headerData, driverContact: value })}
              />
              <TextField
                label="Transporter Name"
                value={headerData.transporterName}
                onChange={(value) => setHeaderData({ ...headerData, transporterName: value })}
              />
              <TextField
                label="GR/LR Number"
                value={headerData.grLrNumber}
                onChange={(value) => setHeaderData({ ...headerData, grLrNumber: value })}
              />
              <TextField
                label="Address"
                value={headerData.TRADDR}
              />
              <TextField
                label="Remarks"
                value={headerData.REMARKS}
              />
            </div>
          </FormSection>

          {/* Vendor/Reference Details */}
          <FormSection title="Reference Details">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField label="PO Number" value={headerData.poNumber} readOnly />
              <TextField label="Vendor Number" value={headerData.vendorNumber} readOnly />
              <TextField label="Vendor Name" value={headerData.vendorName} readOnly />
              <TextField label="Inwarded By" value={headerData.inwardedBy} readOnly />
            </div>
          </FormSection>

          {/* Item Grid */}
          <FormSection title="Item Details">
           <DataGrid
              columns={columns}
              data={items}
              editable={true}
              minRows={1}
              maxHeight="350px"
              itemsPerPage={10}
            />
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
