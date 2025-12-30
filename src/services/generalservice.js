const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const backendNodejs = {
    // GET ALL

    getAllPlantsData: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/SAP_API/COOIS_Operation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    submitLogin: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/SAP_API/SubmitLogin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    SaveDataEntry: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/SAP_API/SaveDataEntry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    FetchGateEntry: async (data) => {
        const res = await fetch(
            `${BASE_URL}api/external/Gate_Entry/fetchPdfGateEntry`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("PDF fetch failed");

        const json = await res.json(); // parse JSON
        if (!json.pdfBase64) throw new Error("PDF data not found");

        // Convert base64 to blob
        const binary = atob(json.pdfBase64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new Blob([bytes], { type: "application/pdf" });
    },
    fetchGateEntryChange: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/GateEntryChange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    GateEntryCreation: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/GateEntryCreation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    ReportanlaysisDataTable: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/ReportanlaysisDataTable`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    AddUser: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/Adduser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    DisplayTable: async () => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/DisplayTable`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return res.json();
    },

    fetch_Exit_Cancel: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/fetch_Exit_Cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

     save_Exit_Cancel: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/save_Exit_Cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
      UserEdit: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/EditUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

};

export default backendNodejs;
