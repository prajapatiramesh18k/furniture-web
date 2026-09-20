import type { DepartmentConfig } from './types';

const SHARED_TERMS = [
  '50% advance payment is required upon approval of this quotation.',
  'This quotation is valid for 30 days from the date of issue.',
  'Work will commence only after approval of this quotation and receipt of the advance payment.',
  'Any additional work requested after approval will be charged separately.',
];

const SHARED_INCLUSIONS = [
  'Service execution as quoted',
  'Skilled labour / professional service',
  'Quality check before handover',
  'Site cleaning after work (where applicable)',
];

export const generalConfig: DepartmentConfig = {
  id: 'general',
  name: 'General Services',
  short: 'General',

  projectTypes: ['Service Work', 'Repair & Maintenance', 'AMC', 'Custom Service', 'Other'],

  itemFields: [
    { key: 'name', label: 'Service / Item', type: 'text', required: true, placeholder: 'e.g. Deep cleaning — 2 BHK' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. Including balcony and kitchen' },
    { key: 'unit', label: 'Unit', type: 'select', options: ['Nos', 'Hour', 'Day', 'Visit', 'Set', 'sqft'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: ['Nos', 'Hour', 'Day', 'Visit', 'Set', 'sqft'],
  calculationType: 'quantity',

  presets: [
    { name: 'Service Visit', fields: { unit: 'Visit', quantity: 1, rate: 500 } },
    { name: 'Day Labour', fields: { unit: 'Day', quantity: 1, rate: 1200 } },
  ],

  workTypes: [
    { value: 'service', label: 'Service', terms: SHARED_TERMS, inclusions: SHARED_INCLUSIONS },
    { value: 'amc', label: 'Annual Maintenance (AMC)', terms: [...SHARED_TERMS, 'AMC covers scheduled visits during the contract period; spares are charged extra unless mentioned.'], inclusions: [...SHARED_INCLUSIONS, 'Scheduled AMC visits', 'Priority support during contract'] },
  ],
  defaultWorkType: 'service',

  defaultTerms: SHARED_TERMS,
  defaultInclusions: SHARED_INCLUSIONS,

  labels: { itemName: 'Service / Item', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Service / Item & Description' },
    { key: 'unit', label: 'Unit', width: '9%' },
    { key: 'qty', label: 'Qty', width: '7%' },
    { key: 'rate', label: 'Rate (₹)', width: '12%' },
    { key: 'amount', label: 'Amount', width: '15%', align: 'right' },
  ],
};

export const customConfig: DepartmentConfig = {
  id: 'custom',
  name: 'Custom',
  short: 'Custom',

  projectTypes: ['Custom Work', 'Other'],

  itemFields: [
    { key: 'name', label: 'Item', type: 'text', required: true, placeholder: 'e.g. Custom work item' },
    { key: 'description', label: 'Details', type: 'textarea', placeholder: 'Optional details' },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: [],
  calculationType: 'quantity',

  workTypes: [{ value: 'custom', label: 'Custom', terms: SHARED_TERMS, inclusions: SHARED_INCLUSIONS }],
  defaultWorkType: 'custom',

  defaultTerms: SHARED_TERMS,
  defaultInclusions: SHARED_INCLUSIONS,

  labels: { itemName: 'Item', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Item' },

  tableColumns: [
    { key: 'index', label: '#', width: '5%' },
    { key: 'name', label: 'Item & Details' },
    { key: 'qty', label: 'Qty', width: '8%' },
    { key: 'rate', label: 'Rate (₹)', width: '15%' },
    { key: 'amount', label: 'Amount', width: '17%', align: 'right' },
  ],
};
