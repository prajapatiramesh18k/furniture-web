import type { DepartmentConfig } from './types';

export const softwareConfig: DepartmentConfig = {
  id: 'software',
  name: 'IT / Software',
  short: 'Software',

  projectTypes: ['Website', 'E-commerce Website', 'Web Application', 'Mobile App', 'Maintenance', 'Other'],

  itemFields: [
    { key: 'name', label: 'Service', type: 'text', required: true, placeholder: 'e.g. Business website development' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. 10 pages, contact form, WhatsApp' },
    { key: 'billingType', label: 'Billing Type', type: 'select', options: ['Fixed Price', 'Hourly', 'Daily', 'Monthly', 'Per User', 'Per Project'] },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹)', type: 'number', min: 0 },
  ],

  units: [],
  calculationType: 'fixed',

  presets: [
    { name: 'Basic Website', fields: { description: '5 pages, mobile responsive', billingType: 'Fixed Price', quantity: 1, rate: 25000 } },
    { name: 'Business Website', fields: { description: '10 pages, contact form, WhatsApp, SEO basics', billingType: 'Fixed Price', quantity: 1, rate: 75000 } },
    { name: 'E-commerce Website', fields: { description: 'Product catalog, cart, payments', billingType: 'Fixed Price', quantity: 1, rate: 150000 } },
    { name: 'Custom Web Application', fields: { description: 'Scoped modules + admin panel', billingType: 'Per Project', quantity: 1, rate: 250000 } },
    { name: 'Monthly Maintenance', fields: { description: 'Updates + support', billingType: 'Monthly', quantity: 1, rate: 15000 } },
  ],

  workTypes: [
    {
      value: 'dev-support',
      label: 'Development + Support',
      terms: [
        '50% advance payment is required to start development.',
        'This quotation is valid for 30 days from the date of issue.',
        'Scope is limited to the services and descriptions mentioned in this quotation.',
        'Any additional features or changes beyond the approved scope will be charged separately.',
        'Free support is included for the period mentioned in What\u2019s Included.',
      ],
      inclusions: ['Development as per approved scope', 'Testing before launch', 'Deployment assistance', 'Basic documentation', 'Initial support period'],
    },
    {
      value: 'dev-only',
      label: 'Development Only',
      terms: [
        '50% advance payment is required to start development.',
        'This quotation is valid for 30 days from the date of issue.',
        'Scope is limited to development; support and maintenance are excluded.',
        'Changes beyond the approved scope will be charged separately.',
      ],
      inclusions: ['Development as per approved scope', 'Testing before delivery', 'Deployment assistance'],
    },
    {
      value: 'maintenance-only',
      label: 'Maintenance Only',
      terms: [
        'Maintenance is billed in advance for each cycle.',
        'This quotation is valid for 30 days from the date of issue.',
        'New feature development is excluded and quoted separately.',
      ],
      inclusions: ['Bug fixes', 'Minor updates', 'Uptime monitoring', 'Periodic reports'],
    },
  ],
  defaultWorkType: 'dev-support',

  defaultTerms: [
    '50% advance payment is required to start development.',
    'This quotation is valid for 30 days from the date of issue.',
    'Scope is limited to the services and descriptions mentioned in this quotation.',
    'Any additional features or changes beyond the approved scope will be charged separately.',
    'Free support is included for the period mentioned in What\u2019s Included.',
  ],
  defaultInclusions: [
    'Development as per approved scope',
    'Testing before launch',
    'Deployment assistance',
    'Basic documentation',
    'Initial support period',
  ],

  labels: { itemName: 'Service', rate: 'Rate (₹)', quantity: 'Qty', amount: 'Amount', itemsTitle: 'Add New Service' },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Service & Description' },
    { key: 'billingType', label: 'Billing', width: '13%' },
    { key: 'qty', label: 'Qty', width: '6%' },
    { key: 'rate', label: 'Rate (₹)', width: '13%' },
    { key: 'amount', label: 'Amount', width: '15%', align: 'right' },
  ],
};
