// Simple Excel/CSV export utility
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; header: string }[],
  filename: string = 'export'
) {
  if (data.length === 0) {
    return;
  }

  // Create CSV content
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key] || '';
      // Escape values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Transporter options for dropdown
export const transporterOptions = [
  { value: 'SANJAY', label: 'SANJAY' },
  { value: 'VYSHNAVI', label: 'VYSHNAVI' },
  
];

// Packing condition options for dropdown
export const packingConditionOptions = [
  { value: 'GOOD', label: 'GOOD' },
  { value: 'BAD', label: 'BAD' },
  { value: 'N/A', label: 'N/A' },
];

// Generate 35 test items for scroll testing
export function generateTestItems(type: 'inward' | 'outward' | 'subcontract' = 'inward') {
  const materials = [
    { code: 'MAT001', desc: 'Steel Plate 10mm', unit: 'KG' },
    { code: 'MAT002', desc: 'Copper Wire 2.5mm', unit: 'MTR' },
    { code: 'MAT003', desc: 'Aluminium Rod 8mm', unit: 'NOS' },
    { code: 'MAT004', desc: 'Brass Fitting 1/2"', unit: 'NOS' },
    { code: 'MAT005', desc: 'Stainless Steel Sheet', unit: 'KG' },
    { code: 'MAT006', desc: 'PVC Pipe 4"', unit: 'MTR' },
    { code: 'MAT007', desc: 'Rubber Gasket Set', unit: 'SET' },
    { code: 'MAT008', desc: 'Bearing SKF 6205', unit: 'NOS' },
    { code: 'MAT009', desc: 'Motor 5HP 3Phase', unit: 'NOS' },
    { code: 'MAT010', desc: 'Control Panel Unit', unit: 'NOS' },
    { code: 'MAT011', desc: 'Hydraulic Cylinder', unit: 'NOS' },
    { code: 'MAT012', desc: 'Pneumatic Valve', unit: 'NOS' },
    { code: 'MAT013', desc: 'Electrical Cable 4mm', unit: 'MTR' },
    { code: 'MAT014', desc: 'Circuit Breaker 32A', unit: 'NOS' },
    { code: 'MAT015', desc: 'Transformer 10KVA', unit: 'NOS' },
    { code: 'MAT016', desc: 'Welding Rod 3.15mm', unit: 'KG' },
    { code: 'MAT017', desc: 'Paint Industrial Grey', unit: 'LTR' },
    { code: 'MAT018', desc: 'Lubricant Oil EP90', unit: 'LTR' },
    { code: 'MAT019', desc: 'Filter Cartridge HYD', unit: 'NOS' },
    { code: 'MAT020', desc: 'Coupling Flexible', unit: 'NOS' },
    { code: 'MAT021', desc: 'Gear Box 20:1 Ratio', unit: 'NOS' },
    { code: 'MAT022', desc: 'Chain Conveyor Link', unit: 'MTR' },
    { code: 'MAT023', desc: 'Sprocket 20T Steel', unit: 'NOS' },
    { code: 'MAT024', desc: 'V-Belt B Section', unit: 'NOS' },
    { code: 'MAT025', desc: 'Pulley Cast Iron 8"', unit: 'NOS' },
    { code: 'MAT026', desc: 'Bolt M16x50 SS', unit: 'NOS' },
    { code: 'MAT027', desc: 'Nut M16 SS', unit: 'NOS' },
    { code: 'MAT028', desc: 'Washer M16 SS', unit: 'NOS' },
    { code: 'MAT029', desc: 'Spring Compression', unit: 'NOS' },
    { code: 'MAT030', desc: 'Seal Kit Hydraulic', unit: 'SET' },
    { code: 'MAT031', desc: 'Pressure Gauge 0-10bar', unit: 'NOS' },
    { code: 'MAT032', desc: 'Temperature Sensor PT100', unit: 'NOS' },
    { code: 'MAT033', desc: 'Level Sensor Ultrasonic', unit: 'NOS' },
    { code: 'MAT034', desc: 'Flow Meter Digital', unit: 'NOS' },
    { code: 'MAT035', desc: 'PLC Controller Unit', unit: 'NOS' },
  ];

  return materials.map((mat, idx) => {
    const poQty = Math.floor(Math.random() * 500) + 50;
    const balanceQty = Math.floor(poQty * (Math.random() * 0.4 + 0.3)); // 30-70% balance
    
    if (type === 'inward') {
      return {
        materialCode: mat.code,
        materialDescription: mat.desc,
        poQty: poQty.toString(),
        poUnit: mat.unit,
        balanceQty: balanceQty.toString(),
        gateEntryQty: '',
        unit: mat.unit,
        packingCondition: '',
      };
    } else if (type === 'subcontract') {
      return {
        materialCode: `SC${String(idx + 1).padStart(3, '0')}`,
        materialDescription: `Machined ${mat.desc}`,
        poQty: poQty.toString(),
        poUnit: mat.unit,
        balanceQty: balanceQty.toString(),
        quantity: '',
        unit: mat.unit,
        packingCondition: '',
      };
    } else {
      return {
        materialCode: `FG${String(idx + 1).padStart(3, '0')}`,
        materialDescription: `Finished ${mat.desc}`,
        quantity: poQty.toString(),
        unit: mat.unit,
      };
    }
  });
}
