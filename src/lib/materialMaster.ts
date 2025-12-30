// Material Master Data - simulating SAP material master
export interface Material {
  code: string;
  description: string;
  unit: string;
}

export const materialMaster: Material[] = [
  { code: 'MAT001', description: 'Steel Plate 10mm', unit: 'KG' },
  { code: 'MAT002', description: 'Copper Wire 2.5mm', unit: 'MTR' },
  { code: 'MAT003', description: 'Aluminium Rod 8mm', unit: 'NOS' },
  { code: 'MAT004', description: 'Iron Sheet 5mm', unit: 'KG' },
  { code: 'MAT005', description: 'Brass Fitting 1"', unit: 'NOS' },
  { code: 'MAT006', description: 'PVC Pipe 2"', unit: 'MTR' },
  { code: 'MAT007', description: 'Rubber Gasket', unit: 'NOS' },
  { code: 'MAT008', description: 'Stainless Steel Bolt M10', unit: 'NOS' },
  { code: 'MAT009', description: 'Welding Rod 3.15mm', unit: 'KG' },
  { code: 'MAT010', description: 'Electric Cable 4sq', unit: 'MTR' },
  { code: 'MAT011', description: 'Bearing 6205', unit: 'NOS' },
  { code: 'MAT012', description: 'Motor 5HP', unit: 'NOS' },
  { code: 'MAT013', description: 'Gear Box 1:10', unit: 'NOS' },
  { code: 'MAT014', description: 'Hydraulic Oil 68', unit: 'LTR' },
  { code: 'MAT015', description: 'Lubricant Grease', unit: 'KG' },
  { code: 'MAT016', description: 'Filter Element', unit: 'NOS' },
  { code: 'MAT017', description: 'O-Ring Set', unit: 'SET' },
  { code: 'MAT018', description: 'V-Belt A68', unit: 'NOS' },
  { code: 'MAT019', description: 'Chain Sprocket 40T', unit: 'NOS' },
  { code: 'MAT020', description: 'Coupling Flexible', unit: 'NOS' },
  { code: 'MAT021', description: 'MS Angle 50x50x6', unit: 'MTR' },
  { code: 'MAT022', description: 'MS Channel 100x50', unit: 'MTR' },
  { code: 'MAT023', description: 'MS Flat 50x10', unit: 'MTR' },
  { code: 'MAT024', description: 'MS Round Bar 25mm', unit: 'MTR' },
  { code: 'MAT025', description: 'SS Sheet 304 2mm', unit: 'KG' },
];

export const getMaterialByCode = (code: string): Material | undefined => {
  return materialMaster.find(m => m.code === code);
};
