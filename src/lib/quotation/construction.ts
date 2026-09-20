import type { DepartmentConfig } from './types';

export const constructionConfig: DepartmentConfig = {
  id: 'construction',
  name: 'Construction',
  short: 'Construction',

  projectTypes: ['Residential Building', 'Commercial Building', 'Renovation', 'RCC Work', 'Masonry Work', 'Other'],

  itemFields: [
    { key: 'name', label: 'Work / Item', type: 'text', required: true, placeholder: 'e.g. RCC slab work' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. M20 grade with steel' },
    { key: 'unit', label: 'Unit', type: 'select', options: ['sqft', 'sqm', 'sqyd', 'meter', 'kg', 'ton', 'nos', 'day'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['sqft', 'sqm', 'sqyd', 'meter', 'kg', 'ton', 'nos', 'day'],
  calculationType: 'quantity',

  presets: [
    { name: 'RCC Work', fields: { description: 'M20 grade with steel', unit: 'sqft', quantity: 1, rate: 450 } },
    { name: 'Brick Masonry', fields: { description: '9 inch wall', unit: 'sqft', quantity: 1, rate: 180 } },
    { name: 'Plaster Work', fields: { description: 'Internal + external', unit: 'sqft', quantity: 1, rate: 60 } },
    { name: 'Steel Binding', fields: { unit: 'kg', quantity: 1, rate: 95 } },
  ],

  workTypes: [
    {
      value: 'material-labour',
      label: 'Material + Labour',
      terms: [
        'Stage-wise payments as per work completion and measurement.',
        'This quotation is valid for 30 days from the date of issue.',
        'Materials will be procured as per the specifications mutually agreed before execution.',
        'Any extra work beyond the approved scope will be charged separately on measurement basis.',
        'Water and electricity at site shall be arranged by the client unless agreed otherwise.',
      ],
      inclusions: [
        'Material procurement as per specifications',
        'Construction execution with skilled labour',
        'Basic tools and equipment',
        'Stage-wise quality checks',
        'Site cleaning after completion',
      ],
    },
    {
      value: 'labour-only',
      label: 'Labour Only',
      terms: [
        'Stage-wise payments as per work completion.',
        'This quotation is valid for 30 days from the date of issue.',
        'All construction materials shall be provided by the client.',
        'Labour charges cover execution as specified in this quotation.',
      ],
      inclusions: ['Skilled construction labour', 'Execution as per drawings', 'Basic tools handling', 'Site cleaning after work'],
    },
  ],
  defaultWorkType: 'material-labour',

  defaultTerms: [
    'Stage-wise payments as per work completion and measurement.',
    'This quotation is valid for 30 days from the date of issue.',
    'Materials will be procured as per the specifications mutually agreed before execution.',
    'Any extra work beyond the approved scope will be charged separately on measurement basis.',
    'Water and electricity at site shall be arranged by the client unless agreed otherwise.',
  ],
  defaultInclusions: [
    'Material procurement as per specifications',
    'Construction execution with skilled labour',
    'Basic tools and equipment',
    'Stage-wise quality checks',
    'Site cleaning after completion',
  ],

  labels: { itemName: 'Work / Item', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Work / Item & Description' },
    { key: 'unit', label: 'Unit', width: '9%' },
    { key: 'qty', label: 'Qty', width: '7%' },
    { key: 'rate', label: 'Rate (₹)', width: '12%' },
    { key: 'amount', label: 'Amount', width: '15%', align: 'right' },
  ],
};
