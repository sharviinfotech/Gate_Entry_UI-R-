import { useState } from 'react';
import { Search, DoorOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField } from '@/components/shared/FormField';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import service from "../services/generalservice.js"
import Swal from "sweetalert2";
import { useAuth } from '@/contexts/AuthContext';

import { createPortal } from 'react-dom';

export default function VehicleExit() {
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [exitConfirmed, setExitConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { webUser } = useAuth();

  // Gate Entry Header (read-only, fetched from system)
  const [headerData, setHeaderData] = useState({
    GENO: '',
    WERKS: '',
    VHDAT_IN: '',
    VHTIM_IN: '',
    VHNO: '',
    DRNAM: '',
    INWARDED_BY: '',
  });

  // Exit Details (editable)
  const [exitData, setExitData] = useState({
    LEDAT: new Date().toISOString().split('T')[0],
    LETIM: new Date().toTimeString().slice(0, 8),
    SGTXT: '',
  });

  const handleFetch = async () => {
   const number = gateEntryNo.trim();

if (!number) {
      toast.error('Enter Gate Entry No');
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
        EXIT_GE: gateEntryNo,
        EXIT: "X",
        CANCEL: ""
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

          return
        }

      } else {
        setHeaderData({
          GENO: response.GENO,
          WERKS: response.WERKS,
          VHDAT_IN: response.VHDAT_IN,
          VHTIM_IN: response.VHTIM_IN,
          VHNO: response.VHNO,
          DRNAM: response.DRNAM,
          INWARDED_BY: response.INWARDED_BY,
        });


        setExitData(prev => ({
          ...prev,
          SGTXT: response.SGTXT || ''
        }));
        console.log('Header data', headerData)
      }


      setExitConfirmed(false);
      setIsLoaded(true);   // ✅ keep true

    } catch (err) {
      console.error(err);
      toast.error("Failed to load Data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {

    console.log('Header data save', headerData)

    console.log("")
    if (!exitConfirmed) {
      toast.error('Please confirm Gate Entry Exit by enabling the checkbox');
      return;
    }
    setIsLoading(true);
    try {
      const storedDetails = localStorage.getItem('gate_entry_user');

      // 2. Parse it back into an object if it exists
      let LEUSR
      if (storedDetails) {
        const loggedInDetails = JSON.parse(storedDetails);

        // 3. Now you can access the property safely
        LEUSR = loggedInDetails.USER;
      }
      const payload = {
        "EXIT_CANCEL": {
          "GENO": headerData.GENO,
          "WERKS": headerData.WERKS,
          "VHDAT_IN": headerData.VHDAT_IN,
          "VHTIM_IN": headerData.VHTIM_IN,
          "VHNO": headerData.VHNO,
          "DRNAM": headerData.DRNAM,
          "LCDAT": "0000-00-00", //Cancel
          "LCTIM": "00:00:00",   //cancel
          "SCTXT": "",  //cancel
          "LEDAT": exitData.LEDAT, //exit
          "LETIM": exitData.LETIM,  //exit
          "SGTXT": exitData.SGTXT, //exit
          "INWARDED_BY": headerData.GENO, //exit
          "GECAN": "",   //Cancel check
          "LEUSR": LEUSR,
          "GEEXT": "X" //exit check
        }
      }
      console.log("payload", payload)
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
    }
    catch (error) {
      console.log("error")
    } finally {
      setIsLoading(false);
    }


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
      {isLoading && <FullScreenLoader />}
      <PageHeader
        title="Vehicle Exit"
        subtitle="Record vehicle departure"
        breadcrumbs={[{ label: 'Vehicle Exit' }]}
      />

      <FormSection title="Fetch Entry">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Gate Entry Number"
            value={gateEntryNo}
            onChange={setGateEntryNo}
            placeholder="Enter Gate Entry No"
            required
          />
          <div className="flex items-end">
            <Button onClick={handleFetch} disabled={isLoading} className="gap-2 w-full">
              <Search className="w-4 h-4" />
              Fetch
            </Button>
          </div>
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

          <FormSection title="Gate Entry Exit">
            <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/50 rounded-lg border">
              <Checkbox
                id="exitConfirm"
                checked={exitConfirmed}
                onCheckedChange={(checked) => setExitConfirmed(checked === true)}
              />
              <Label htmlFor="exitConfirm" className="font-medium cursor-pointer">
                Gate Entry Exit
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Check-out Date"
                type="date"
                value={exitData.LEDAT}
                onChange={(v) => setExitData({ ...exitData, LEDAT: v })}
                required
              />
              <TextField
                label="Check-out Time"
                type="time"
                value={exitData.LETIM}
                onChange={(v) => setExitData({ ...exitData, LETIM: v })}
                required
              />
              <TextField
                label="Inwarded By"
                value={headerData.INWARDED_BY}
                onChange={() => { }}
                disabled
              />
            </div>
            <div className="mt-4">
              <Label>Remarks</Label>
              <Textarea
                value={exitData.SGTXT}
                onChange={(e) => setExitData({ ...exitData, SGTXT: e.target.value })}
                placeholder="Enter remarks"
                className="mt-1.5"
              />
            </div>
            <Button onClick={handleSave} className="mt-4 bg-accent text-accent-foreground gap-2">
              <DoorOpen className="w-4 h-4" />
              Record Exit
            </Button>
          </FormSection>
        </>
      )}
    </div>
  );
}
