import { useState } from 'react';
import { Search, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField } from '@/components/shared/FormField';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import service from "../services/generalservice.js"
import Swal from "sweetalert2";
export default function CancelEntry() {
  const getTodayDate = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const getCurrentTime = () => new Date().toTimeString().slice(0, 8); // HH:mm:ss
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [headerData, setHeaderData] = useState({
    GENO: '',
    WERKS: '',
    VHDAT_IN: '',
    VHTIM_IN: '',
    VHNO: '',
    DRNAM: '',
    INWARDED_BY: '',
  });
  const [cancelDate] = useState(getTodayDate());
  const [cancelTime] = useState(getCurrentTime());
  const handleFetch = async () => {
    if (!gateEntryNo) {
      toast.error('Enter Gate Entry No');
      return;
    }

    try {
      const payload = {
        EXIT_GE: gateEntryNo,
        EXIT: "",
        CANCEL: "X"
      };

      const response = await service.fetch_Exit_Cancel(payload);
      if (response.length > 0) {

        const sucessMessages = response
          .filter(r => r.MSG_TYPE === "S")
          .map(r => `• ${r.MSG}`);
        const errorMessages = response
          .filter(r => r.MSG_TYPE === "E")
          .map(r => `• ${r.MSG}`);
        if (sucessMessages.length > 0) {
          Swal.fire({
            title: "success",
            html: sucessMessages.join("<br>"),
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
           setHeaderData({
            GENO: '',
            WERKS: '',
            VHDAT_IN: '',
            VHTIM_IN: '',
            VHNO: '',
            DRNAM: '',
            INWARDED_BY: '',
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
          setHeaderData({
            GENO: '',
            WERKS: '',
            VHDAT_IN: '',
            VHTIM_IN: '',
            VHNO: '',
            DRNAM: '',
            INWARDED_BY: '',
          });

          setCancelReason('');
          return
        }
      } else {
        // ✅ CASE 2: Valid header data
        setHeaderData({
          GENO: response.GENO,
          WERKS: response.WERKS,
          VHDAT_IN: response.VHDAT_IN,
          VHTIM_IN: response.VHTIM_IN,
          VHNO: response.VHNO,
          DRNAM: response.DRNAM,
          INWARDED_BY: response.INWARDED_BY,
        });

        setCancelReason(response.SCTXT || '');
      }




      setConfirmed(false);
      setIsLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    }
  };


  const handleCancel = async () => {
    if (!cancelReason || !confirmed) {
      toast.error('Complete all fields');
      return;
    }

    const payload = {
      EXIT_CANCEL: {
        GENO: headerData.GENO,
        WERKS: headerData.WERKS,
        VHDAT_IN: headerData.VHDAT_IN,
        VHTIM_IN: headerData.VHTIM_IN,
        VHNO: headerData.VHNO,
        DRNAM: headerData.DRNAM,

        // Cancel-specific fields
        LCDAT: cancelDate,
        LCTIM: cancelTime,
        SCTXT: cancelReason,

        // Exit fields (blank)
        LEDAT: "",
        LETIM: "",
        SGTXT: "",
        INWARDED_BY: headerData.INWARDED_BY,

        // Flags
        GECAN: "X",
        GEEXT: ""
      }
    };
    console.log('payload', payload)
    try {
      const response = await service.save_Exit_Cancel(payload);
      console.log("response", response)
      const errorMessages = response
        .filter(r => r.MSG_TYPE === "E")
        .map(r => `• ${r.MSG}`);
      const sucessMessages = response
        .filter(r => r.MSG_TYPE === "S")
        .map(r => `• ${r.MSG}`);
      if (errorMessages.length > 0) {
        Swal.fire({
          title: "Error",
          html: errorMessages.join("<br>"),
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return
      }
      if (sucessMessages.length > 0) {
        Swal.fire({
          title: "success",
          html: sucessMessages.join("<br>"),
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        return
      }
      setConfirmed(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
      toast.error('Cancel failed');
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Cancel Gate Entry" subtitle="Cancel existing gate entries" breadcrumbs={[{ label: 'Cancel' }]} />
      <FormSection title="Fetch Entry">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField label="Gate Entry Number" value={gateEntryNo} onChange={setGateEntryNo} placeholder="Enter Gate Entry No" required />
          <div className="flex items-end"><Button onClick={handleFetch} className="gap-2 w-full"><Search className="w-4 h-4" />Fetch</Button></div>
        </div>
      </FormSection>
      {isLoaded && (
        <>
          <FormSection title="Gate Entry Header">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Gate Entry Number"
                value={headerData.GENO}
                onChange={() => { }}
                disabled
              />
              <TextField
                label="Check-in Date"
                value={headerData.VHDAT_IN}
                onChange={() => { }}
                disabled
              />
              <TextField
                label="Vehicle Number"
                value={headerData.VHNO}
                onChange={() => { }}
                disabled
              />
              <TextField
                label="Plant"
                value={headerData.WERKS}
                onChange={() => { }}
                disabled
              />
              <TextField
                label="Check-in Time"
                value={headerData.VHTIM_IN}
                onChange={() => { }}
                disabled
              />
              <TextField
                label="Driver"
                value={headerData.DRNAM}
                onChange={() => { }}
                disabled
              />
            </div>
          </FormSection>


          <FormSection title="Cancel Details">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* <TextField label="Cancelled By" value="Admin User" readOnly /> */}
              <TextField
                label="Cancelled Date"
                value={cancelDate}
                readOnly
              />

              <TextField
                label="Cancelled Time"
                value={cancelTime}
                readOnly
              />
            </div>
            <div className="mb-4"><Label>Cancel Reason <span className="text-destructive">*</span></Label><Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter reason for cancellation" className="mt-1.5" /></div>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox id="confirm" checked={confirmed} onCheckedChange={(c) => setConfirmed(c as boolean)} />
              <Label htmlFor="confirm" className="cursor-pointer">I confirm this cancellation action</Label>
            </div>
            <Button onClick={handleCancel} disabled={!confirmed || !cancelReason} variant="destructive" className="gap-2"><XCircle className="w-4 h-4" />Cancel Entry</Button>
          </FormSection>
        </>
      )}
    </div>
  );
}
