import type { DepartmentConfig } from './types';

export const plumbingConfig: DepartmentConfig = {
  id: 'plumbing',
  name: 'Plumbing',
  short: 'Plumbing',

  projectTypes: ['Bathroom Plumbing', 'Kitchen Plumbing', 'Full House Plumbing', 'Office Plumbing', 'Repair & Maintenance', 'Other'],

  itemFields: [
    { key: 'name', label: 'Item Description', type: 'text', required: true, placeholder: 'e.g. CPVC pipe line — bathroom' },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Supreme' },
    { key: 'material', label: 'Material', type: 'select', options: ['', 'PVC', 'CPVC', 'UPVC', 'PPR', 'GI', 'Brass', 'SS'] },
    { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. 25mm / 1 inch' },
    { key: 'unit', label: 'Unit', type: 'select', options: ['Nos', 'Meter', 'Set', 'Kg'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['Nos', 'Meter', 'Set', 'Kg'],
  calculationType: 'quantity',

  materials: ['', 'PVC', 'CPVC', 'UPVC', 'PPR', 'GI', 'Brass', 'SS'],

  presets: [
    { name: 'CPVC Pipe', fields: { brand: 'Supreme', material: 'CPVC', size: '25mm', unit: 'Meter', quantity: 1, rate: 120 } },
    { name: 'UPVC Pipe', fields: { brand: 'Supreme', material: 'UPVC', size: '110mm', unit: 'Meter', quantity: 1, rate: 350 } },
    { name: 'PPR Pipe', fields: { brand: 'SFMC', material: 'PPR', size: '32mm', unit: 'Meter', quantity: 1, rate: 180 } },
    { name: 'GI Pipe', fields: { material: 'GI', size: '1 inch', unit: 'Meter', quantity: 1, rate: 280 } },
    { name: 'Brass Valve', fields: { material: 'Brass', size: '25mm', unit: 'Nos', quantity: 1, rate: 650 } },
    { name: 'Wall Tap', fields: { brand: 'Jaquar', size: '15mm', unit: 'Nos', quantity: 1, rate: 950 } },
    { name: 'Wash Basin', fields: { brand: 'Cera', unit: 'Nos', quantity: 1, rate: 3200 } },
    { name: 'Western Toilet', fields: { brand: 'Cera', unit: 'Nos', quantity: 1, rate: 8500 } },
    { name: 'Installation (per bathroom)', fields: { unit: 'Set', quantity: 1, rate: 4500 } },
  ],

  packages: [
    {
      label: 'Bathroom Plumbing',
      projectType: 'Bathroom Plumbing',
      items: [
        { name: 'CPVC hot/cold lines', fields: { material: 'CPVC', size: '25mm', unit: 'Meter', quantity: 30, rate: 120 } },
        { name: 'UPVC drainage', fields: { material: 'UPVC', size: '110mm', unit: 'Meter', quantity: 12, rate: 350 } },
        { name: 'Fittings + valves', fields: { unit: 'Set', quantity: 1, rate: 2500 } },
        { name: 'Installation', fields: { unit: 'Set', quantity: 1, rate: 4500 } },
      ],
    },
  ],

  workTypes: [
    {
      value: 'material-installation',
      label: 'Material + Installation',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'All pipes and fittings will be supplied as per the brands and sizes mentioned.',
        'Pressure testing will be done before tiling / closing walls.',
        'Any additional work requested after approval will be charged separately.',
      ],
      inclusions: [
        'Pipe and fitting supply',
        'Pipe installation work',
        'Fittings installation',
        'Pressure testing',
        'Leak inspection before handover',
        'Basic finishing and site cleaning',
      ],
    },
    {
      value: 'installation-only',
      label: 'Installation Only',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'All materials shall be provided by the client before work begins.',
        'Labour charges cover installation and testing only.',
      ],
      inclusions: ['Skilled plumbing labour', 'Pipe and fitting installation', 'Testing before handover', 'Site cleaning after work'],
    },
  ],
  defaultWorkType: 'material-installation',

  defaultTerms: [
    '50% advance payment is required upon approval of this quotation.',
    'This quotation is valid for 30 days from the date of issue.',
    'All pipes and fittings will be supplied as per the brands and sizes mentioned.',
    'Pressure testing will be done before tiling / closing walls.',
    'Any additional work requested after approval will be charged separately.',
  ],
  defaultInclusions: [
    'Pipe and fitting supply',
    'Pipe installation work',
    'Fittings installation',
    'Pressure testing',
    'Leak inspection before handover',
    'Basic finishing and site cleaning',
  ],

  labels: { itemName: 'Item Description', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Item' },
    { key: 'brand', label: 'Brand', width: '11%' },
    { key: 'specification', label: 'Material / Size', width: '15%' },
    { key: 'unit', label: 'Unit', width: '7%' },
    { key: 'qty', label: 'Qty', width: '6%' },
    { key: 'rate', label: 'Rate (₹)', width: '11%' },
    { key: 'amount', label: 'Amount', width: '13%', align: 'right' },
  ],
};
