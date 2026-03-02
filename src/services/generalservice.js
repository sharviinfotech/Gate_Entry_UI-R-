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
    Login_Submit_Authentication: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/Login_Submit_Authentication`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    UserRoleCreation: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UserRoleCreation`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    UserRoleEdit: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UserRoleEdit`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    UserRoleDisplay: async () => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UserRoleDisplay`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return res.json();
    },
    UserPlant: async () => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UserPlant`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return res.json();
    },
    UserRole: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UserRole`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
       vendorlist: async () => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/VendorList`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return res.json();
    },
   VendorName: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/FetchVendorName`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    DashboardReports: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/DashboardReports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

  MaterialCode: async (data) => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/Inward/Materialcode`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

  UOMGet: async () => {
        const res = await fetch(`${BASE_URL}api/external/Gate_Entry/UOMGet`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return res.json();
    },

};

export default backendNodejs;
