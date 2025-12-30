import { useState } from 'react';
import { Search, Printer, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { TextField, SelectField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import service from "../services/generalservice.js"

export default function PrintEntry() {
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [printFormat, setPrintFormat] = useState('');
  const [copies, setCopies] = useState('1');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function base64ToBlob(base64, type = "application/pdf") {
    const binary = atob(base64); // decode base64
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  }
  // 🔍 FETCH PDF
  const handleFetch = async () => {
    if (!gateEntryNo) {
      toast.error('Enter Gate Entry No');
      return;
    }

    setIsLoading(true);
    setPdfUrl(null);
    setIsLoaded(false);
    try {
      const payload = {
        GENO: gateEntryNo
      }
      const pdfBlob = await service.FetchGateEntry(payload);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setIsLoaded(true);

      toast.success("PDF loaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // 🖨️ PRINT PDF
  const handlePrint = () => {
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => printWindow.print();
  };

  // ⬇️ DOWNLOAD PDF
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `GateEntry_${gateEntryNo}.pdf`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Gate Entry"
        subtitle="Generate and print documents"
        breadcrumbs={[{ label: 'Print' }]}
      />

      {/* FETCH SECTION */}
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
            <Button
              onClick={handleFetch}
              className="gap-2 w-full"
              disabled={isLoading}
            >
              <Search className="w-4 h-4" />
              {isLoading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
        </div>
      </FormSection>

      {isLoaded && (
        <FormSection title="Print Options">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Print Format"
              value={printFormat}
              onChange={setPrintFormat}
              options={[
                { value: 'standard', label: 'Standard Format' },
                { value: 'detailed', label: 'Detailed Format' },
                { value: 'summary', label: 'Summary Format' },
              ]}
              required
            />

            <TextField
              label="Number of Copies"
              type="number"
              value={copies}
              onChange={setCopies}
            />

            <TextField
              label="Printed By"
              value="Admin User"
              readOnly
            />
          </div> */}

          <div className="flex gap-4 mt-4">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>

            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
          {/* PDF PREVIEW */}
          {pdfUrl && (
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          )}
        </FormSection>
      )}


      {/* PRINT OPTIONS */}

    </div>
  );
}
