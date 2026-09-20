import type { DepartmentConfig } from './types';

export const paintingConfig: DepartmentConfig = {
  id: 'painting',
  name: 'Painting',
  short: 'Painting',

  projectTypes: ['1 BHK Painting', '2 BHK Painting', '3 BHK Painting', 'Office Painting', 'Exterior Painting', 'Touch-up / Repair', 'Other'],

  itemFields: [
    { key: 'name', label: 'Work Description', type: 'text', required: true, placeholder: 'e.g. Interior walls — living room' },
    { key: 'paintType', label: 'Paint Type', type: 'select', options: ['', 'Plastic Emulsion', 'Premium Emulsion', 'Texture', 'Enamel', 'Waterproofing', 'Primer + Putty'] },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Asian Paints' },
    { key: 'area', label: 'Area', type: 'number', step: '0.01', min: 0 },
    { key: 'unit', label: 'Unit', type: 'select', options: ['sqft', 'sqm'] },
    { key: 'quantity', label: 'Coats / Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['sqft', 'sqm'],
  calculationType: 'area',

  presets: [
    { name: 'Interior Walls', fields: { paintType: 'Premium Emulsion', brand: 'Asian Paints', area: 100, unit: 'sqft', quantity: 2, rate: 28 } },
    { name: 'Ceiling', fields: { paintType: 'Plastic Emulsion', brand: 'Asian Paints', area: 100, unit: 'sqft', quantity: 2, rate: 24 } },
    { name: 'Exterior Walls', fields: { paintType: 'Waterproofing', brand: 'Asian Paints', area: 100, unit: 'sqft', quantity: 2, rate: 38 } },
    { name: 'Enamel — Doors / Grills', fields: { paintType: 'Enamel', unit: 'sqft', quantity: 1, rate: 45 } },
    { name: 'Putty + Primer', fields: { paintType: 'Primer + Putty', area: 100, unit: 'sqft', quantity: 1, rate: 18 } },
  ],

  workTypes: [
    {
      value: 'material-labour',
      label: 'Material + Labour',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'Paints will be used as per the brands and types mentioned in this quotation.',
        'Furniture masking and floor protection is included; deep stain removal may cost extra.',
        'Any additional rooms or coats requested after approval will be charged separately.',
      ],
      inclusions: [
        'Paint material as per approved brand',
        'Surface preparation, putty and primer',
        'Painting with coats as quoted',
        'Furniture masking and floor protection',
        'Touch-up inspection before handover',
        'Site cleaning after work',
      ],
    },
    {
      value: 'labour-only',
      label: 'Labour Only',
      terms: [
        '50% advance payment is required upon approval of this quotation.',
        'This quotation is valid for 30 days from the date of issue.',
        'All paints and materials shall be provided by the client.',
        'Labour charges cover application and finishing only.',
      ],
      inclusions: ['Skilled painter labour', 'Application and finishing', 'Basic masking', 'Site cleaning after work'],
    },
  ],
  defaultWorkType: 'material-labour',

  defaultTerms: [
    '50% advance payment is required upon approval of this quotation.',
    'This quotation is valid for 30 days from the date of issue.',
    'Paints will be used as per the brands and types mentioned in this quotation.',
    'Furniture masking and floor protection is included; deep stain removal may cost extra.',
    'Any additional rooms or coats requested after approval will be charged separately.',
  ],
  defaultInclusions: [
    'Paint material as per approved brand',
    'Surface preparation, putty and primer',
    'Painting with coats as quoted',
    'Furniture masking and floor protection',
    'Touch-up inspection before handover',
    'Site cleaning after work',
  ],

  labels: { itemName: 'Work Description', rate: 'Rate (₹)', quantity: 'Coats / Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Work & Paint' },
    { key: 'measure', label: 'Area', width: '9%' },
    { key: 'unit', label: 'Unit', width: '8%' },
    { key: 'qty', label: 'Coats', width: '7%' },
    { key: 'rate', label: 'Rate (₹)', width: '11%' },
    { key: 'amount', label: 'Amount', width: '14%', align: 'right' },
  ],
};
