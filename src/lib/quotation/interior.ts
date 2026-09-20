import type { DepartmentConfig } from './types';

export const interiorConfig: DepartmentConfig = {
  id: 'interior',
  name: 'Interior',
  short: 'Interior',

  projectTypes: ['1 BHK Interior', '2 BHK Interior', '3 BHK Interior', 'Office Interior', 'Shop / Retail', 'False Ceiling', 'Painting + Interior', 'Other'],

  itemFields: [
    { key: 'name', label: 'Work Description', type: 'text', required: true, placeholder: 'e.g. False ceiling — living room' },
    { key: 'material', label: 'Material', type: 'select', options: ['', 'Gypsum', 'POP', 'Plywood', 'MDF', 'HDHMR', 'PVC', 'WPC', 'Glass', 'Metal'] },
    { key: 'finish', label: 'Finish', type: 'text', placeholder: 'e.g. Laminate matte / PU' },
    { key: 'area', label: 'Area', type: 'number', step: '0.01', min: 0 },
    { key: 'unit', label: 'Unit', type: 'select', options: ['sqft', 'sqm', 'running ft', 'nos'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['sqft', 'sqm', 'running ft', 'nos'],
  calculationType: 'area',

  materials: ['', 'Gypsum', 'POP', 'Plywood', 'MDF', 'HDHMR', 'PVC', 'WPC', 'Glass', 'Metal'],

  presets: [
    { name: 'False Ceiling', fields: { material: 'Gypsum', area: 100, unit: 'sqft', quantity: 1, rate: 95 } },
    { name: 'Wall Panelling', fields: { material: 'MDF', area: 50, unit: 'sqft', quantity: 1, rate: 220 } },
    { name: 'TV Back Panel', fields: { material: 'HDHMR', finish: 'Laminate', area: 40, unit: 'sqft', quantity: 1, rate: 350 } },
    { name: 'Partition Work', fields: { material: 'Gypsum', area: 80, unit: 'sqft', quantity: 1, rate: 180 } },
  ],

  workTypes: [
    {
      value: 'material-labour',
      label: 'Material + Labour',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'Materials will be procured as per the specifications and finishes mutually agreed before execution.',
        'Any design changes after approval will be charged separately.',
        'Work will commence only after approval and receipt of advance.',
      ],
      inclusions: [
        'Material procurement as per approved specifications',
        'Interior execution and finishing',
        'Hardware and fittings as specified',
        'Site measurement and consultation',
        'Quality inspection before handover',
        'Site cleaning after work',
      ],
    },
    {
      value: 'labour-only',
      label: 'Labour Only',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'All materials shall be provided by the client before work begins.',
        'Labour charges cover execution and finishing only.',
      ],
      inclusions: ['Skilled interior labour', 'Execution and finishing', 'Quality check before handover', 'Site cleaning after work'],
    },
  ],
  defaultWorkType: 'material-labour',

  defaultTerms: [
    '50% advance payment is required upon approval of this quotation.',
    'This quotation is valid for 30 days from the date of issue.',
    'Materials will be procured as per the specifications and finishes mutually agreed before execution.',
    'Any design changes after approval will be charged separately.',
    'Work will commence only after approval and receipt of advance.',
  ],
  defaultInclusions: [
    'Material procurement as per approved specifications',
    'Interior execution and finishing',
    'Hardware and fittings as specified',
    'Site measurement and consultation',
    'Quality inspection before handover',
    'Site cleaning after work',
  ],

  labels: { itemName: 'Work Description', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Work Description & Material' },
    { key: 'measure', label: 'Area', width: '10%' },
    { key: 'unit', label: 'Unit', width: '9%' },
    { key: 'qty', label: 'Qty', width: '6%' },
    { key: 'rate', label: 'Rate (₹)', width: '11%' },
    { key: 'amount', label: 'Amount', width: '14%', align: 'right' },
  ],
};
