import type { DepartmentConfig } from './types';

export const electricalConfig: DepartmentConfig = {
  id: 'electrical',
  name: 'Electrical',
  short: 'Electrical',

  projectTypes: ['1 BHK Wiring', '2 BHK Wiring', '3 BHK Wiring', 'Office Electrical', 'Shop / Retail', 'Industrial', 'Repair & Maintenance', 'Other'],

  itemFields: [
    { key: 'name', label: 'Item Description', type: 'text', required: true, placeholder: 'e.g. Copper wiring — bedroom' },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Polycab' },
    { key: 'specification', label: 'Specification', type: 'text', placeholder: 'e.g. 2.5 sq mm' },
    { key: 'unit', label: 'Unit', type: 'select', options: ['Nos', 'Meter', 'Point', 'Set', 'Hour', 'Day'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['Nos', 'Meter', 'Point', 'Set', 'Hour', 'Day'],
  calculationType: 'quantity',

  presets: [
    { name: 'Copper Wire', fields: { brand: 'Polycab', specification: '2.5 sq mm', unit: 'Meter', quantity: 1, rate: 85 } },
    { name: 'MCB', fields: { brand: 'Legrand', specification: '32A SP', unit: 'Nos', quantity: 1, rate: 450 } },
    { name: 'LED Light', fields: { brand: 'Philips', specification: '12W recessed', unit: 'Nos', quantity: 1, rate: 650 } },
    { name: 'Modular Switch', fields: { brand: 'Legrand', specification: '16A', unit: 'Nos', quantity: 1, rate: 180 } },
    { name: 'Socket', fields: { brand: 'Legrand', specification: '16A with box', unit: 'Nos', quantity: 1, rate: 320 } },
    { name: 'Ceiling Fan', fields: { brand: 'Havells', specification: '1200mm', unit: 'Nos', quantity: 1, rate: 2800 } },
    { name: 'Distribution Board', fields: { brand: 'Havells', specification: '8-way', unit: 'Set', quantity: 1, rate: 4500 } },
    { name: 'PVC Conduit', fields: { brand: 'Precision', specification: '25mm', unit: 'Meter', quantity: 1, rate: 45 } },
    { name: 'Wiring Installation (per point)', fields: { specification: 'With labour', unit: 'Point', quantity: 1, rate: 350 } },
  ],

  packages: [
    {
      label: 'Basic Home Electrical',
      projectType: '1 BHK Wiring',
      items: [
        { name: 'Wiring points', fields: { unit: 'Point', quantity: 25, rate: 350 } },
        { name: 'MCB + Distribution Board', fields: { brand: 'Havells', specification: '8-way', unit: 'Set', quantity: 1, rate: 4500 } },
        { name: 'LED Lights', fields: { brand: 'Philips', specification: '12W', unit: 'Nos', quantity: 10, rate: 650 } },
        { name: 'Ceiling Fans', fields: { brand: 'Havells', specification: '1200mm', unit: 'Nos', quantity: 3, rate: 2800 } },
      ],
    },
    {
      label: 'Office Electrical',
      projectType: 'Office Electrical',
      items: [
        { name: 'Wiring points', fields: { unit: 'Point', quantity: 60, rate: 350 } },
        { name: 'LED Panel Lights', fields: { specification: '2x2 ft', unit: 'Nos', quantity: 20, rate: 1200 } },
        { name: 'Distribution Board', fields: { specification: '12-way', unit: 'Set', quantity: 2, rate: 6500 } },
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
        'All materials will be supplied by us as per the brands and specifications mentioned.',
        'Wiring and installation will be done as per standard electrical safety norms.',
        'Any additional points or changes requested after approval will be charged separately.',
        'Testing and commissioning is included before handover.',
      ],
      inclusions: [
        'Material supply as per approved brands',
        'Wiring and cabling work',
        'Switch / socket installation',
        'MCB and distribution board fitting',
        'Testing and commissioning',
        'Site cleaning after work',
      ],
    },
    {
      value: 'installation-only',
      label: 'Installation Only',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'All materials shall be provided by the client before work begins.',
        'Labour charges cover installation, fitting and testing only.',
        'Any rework or additional points will be charged separately.',
      ],
      inclusions: [
        'Skilled electrician labour',
        'Installation and fitting work',
        'Testing before handover',
        'Site cleaning after work',
      ],
    },
    {
      value: 'material-only',
      label: 'Material Supply Only',
      terms: [
        '100% advance payment is required for material supply orders.',
        'This quotation is valid for 15 days from the date of issue.',
        'Materials will be delivered as per the brands and quantities mentioned.',
        'Installation is not included unless mentioned separately.',
      ],
      inclusions: ['Branded material supply', 'Delivery to site', 'Basic quantity verification'],
    },
  ],
  defaultWorkType: 'material-installation',

  defaultTerms: [
    '50% advance payment is required upon approval of this quotation.',
    'This quotation is valid for 30 days from the date of issue.',
    'All materials will be supplied by us as per the brands and specifications mentioned.',
    'Wiring and installation will be done as per standard electrical safety norms.',
    'Any additional points or changes requested after approval will be charged separately.',
    'Testing and commissioning is included before handover.',
  ],
  defaultInclusions: [
    'Material supply as per approved brands',
    'Wiring and cabling work',
    'Switch / socket installation',
    'MCB and distribution board fitting',
    'Testing and commissioning',
    'Site cleaning after work',
  ],

  labels: { itemName: 'Item Description', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Item' },
    { key: 'brand', label: 'Brand', width: '13%' },
    { key: 'specification', label: 'Specification', width: '16%' },
    { key: 'unit', label: 'Unit', width: '8%' },
    { key: 'qty', label: 'Qty', width: '6%' },
    { key: 'rate', label: 'Rate (₹)', width: '11%' },
    { key: 'amount', label: 'Amount', width: '13%', align: 'right' },
  ],
};
