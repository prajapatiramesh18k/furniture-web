/**
 * Furniture / Interior department — ALL pre-existing furniture data moved here verbatim.
 * Nothing was removed: materials, presets, 1/2/3 BHK packages, PVC/Plywood
 * variants, Material+Labour / Labour-Only work types, terms & inclusions.
 */
import type { DepartmentConfig } from './types';

const MATERIAL_LABOUR_TERMS = [
  '50% advance payment is required upon approval of this quotation. The remaining balance shall be paid before completion/handing over of the work.',
  'This quotation is valid for 30 days from the date of issue.',
  'Work will commence only after written or verbal approval of this quotation and receipt of the advance payment.',
  'All required materials will be purchased/procured by us as per the specifications, designs, and finishes mutually agreed upon before execution.',
  'Furniture will be manufactured/fabricated using the materials and specifications mentioned in this quotation.',
  'Materials, hardware, laminates, finishes, and fittings will be provided as specified in the quotation and as mutually agreed before execution.',
  'Any additional work, material, design changes, or modifications requested after approval of the quotation will be charged separately.',
  'Any changes in material, brand, finish, or specification requested by the client after approval may result in additional charges and/or changes to the completion timeline.',
];

const MATERIAL_LABOUR_INCLUSIONS = [
  'Material procurement/purchase as per approved specifications',
  'Furniture manufacturing/fabrication',
  'Soft-close hinges (Hettich / Ebco) on all applicable doors and drawers',
  'Premium-quality hardware, handles, channels, screws, and fittings',
  'High-quality laminate finish as per selected design',
  'Professional installation and on-site fitting',
  'Free site measurement and consultation',
  'Quality inspection before handover',
  'Site cleaning after installation',
];

const LABOUR_ONLY_TERMS = [
  '50% advance payment is required upon approval of this quotation. The remaining balance shall be paid before completion/handing over of the work.',
  'This quotation is valid for 30 days from the date of issue.',
  'Work will commence only after written or verbal approval of this quotation and receipt of the advance payment.',
  'All materials, hardware, laminates, fittings, accessories, and other required items shall be provided by the client unless specifically mentioned otherwise in the quotation.',
  'Labour charges cover fabrication/assembly, installation, and fitting work as specified in this quotation.',
  'The client is responsible for ensuring that all required materials are available at the site before the scheduled work begins.',
  'Any additional labour, rework, modifications, or changes requested after approval of the quotation will be charged separately.',
  'Delays caused by non-availability of materials, site access, or client-requested changes may affect the completion timeline.',
];

const LABOUR_ONLY_INCLUSIONS = [
  'Skilled labour for furniture fabrication/assembly',
  'Professional installation and on-site fitting',
  'Assembly and fixing of furniture components',
  'Installation of hinges, handles, channels, and other hardware supplied by the client',
  'Basic alignment and adjustment of doors and drawers',
  'On-site fitting and finishing adjustments',
  'Quality check before handover',
  'Site cleaning after installation',
];

export const furnitureConfig: DepartmentConfig = {
  id: 'furniture',
  name: 'Furniture',
  short: 'Furniture',

  projectTypes: [
    '1 BHK',
    '2 BHK',
    '3 BHK',
    '4 BHK / Villa',
    'Office',
    'Shop / Retail',
    'Restaurant',
    'Showroom',
    'Modular Kitchen',
    'Custom Furniture',
    'Other',
  ],

  itemFields: [
    { key: 'name', label: 'Item Description', type: 'text', required: true, placeholder: 'e.g. Modular kitchen — L-shaped' },
    { key: 'material', label: 'Material / Finish', type: 'select' },
    { key: 'height', label: 'Height (ft)', type: 'number', step: '0.01', min: 0 },
    { key: 'width', label: 'Width (ft)', type: 'number', step: '0.01', min: 0 },
    { key: 'quantity', label: 'Qty', type: 'number', min: 1 },
    { key: 'rate', label: 'Rate (₹/sqft)', type: 'number', min: 0 },
  ],

  units: [],
  calculationType: 'area',

  materials: [
    '',
    'BWR Plywood',
    'BWP Plywood',
    'Plywood',
    'PVC',
    'HDHMR',
    'MDF',
    'Particle Board',
    'Solid Wood (Teak)',
    'Solid Wood (Sheesham)',
    'Acrylic Finish',
    'PU Finish',
    'Laminate (Matte)',
    'Laminate (Glossy)',
    'Membrane',
    'Veneer (Natural)',
    'Veneer (Engineered)',
  ],

  presets: [
    { name: 'King Bed with Storage (6x6.5 ft)', fields: { material: 'Plywood', height: 6, width: 6.5, rate: 1800 } },
    { name: 'Queen Bed with Storage (5x6.5 ft)', fields: { material: 'BWR Plywood', height: 5, width: 6.5, rate: 1800 } },
    { name: 'Single Bed (3x6.5 ft)', fields: { material: 'BWR Plywood', height: 3, width: 6.5, rate: 1800 } },
    { name: '3-Door Wardrobe (7x7 ft)', fields: { material: 'BWR Plywood', height: 7, width: 7, rate: 1900 } },
    { name: '4-Door Sliding Wardrobe (8x7 ft)', fields: { material: 'BWR Plywood', height: 7, width: 8, rate: 2000 } },
    { name: 'Modular Kitchen — L-Shape', fields: { material: 'BWR Plywood', height: 3, width: 10, rate: 2200 } },
    { name: 'Modular Kitchen — U-Shape', fields: { material: 'BWR Plywood', height: 3, width: 12, rate: 2200 } },
    { name: 'Modular Kitchen — Parallel', fields: { material: 'BWR Plywood', height: 3, width: 8, rate: 2200 } },
    { name: 'TV Unit with Storage', fields: { material: 'HDHMR', height: 2, width: 6, rate: 1600 } },
    { name: 'Shoe Rack with Drawers', fields: { material: 'BWR Plywood', height: 4, width: 3, rate: 1700 } },
    { name: 'Dining Table (6-Seater)', fields: { material: 'Solid Wood (Sheesham)', height: 3, width: 6, rate: 3500 } },
    { name: 'Dining Table (4-Seater)', fields: { material: 'Solid Wood (Sheesham)', height: 3, width: 4, rate: 3500 } },
    { name: 'Crockery Unit', fields: { material: 'HDHMR', height: 7, width: 4, rate: 1800 } },
    { name: 'Bookshelf with Shutters', fields: { material: 'BWR Plywood', height: 7, width: 3, rate: 1700 } },
    { name: 'Study Desk with Hutch', fields: { material: 'BWR Plywood', height: 3, width: 4, rate: 1700 } },
    { name: 'Pooja Unit', fields: { material: 'BWR Plywood', height: 6, width: 3, rate: 2000 } },
    { name: 'Bar Cabinet', fields: { material: 'HDHMR', height: 4, width: 5, rate: 1900 } },
    { name: 'Sofa (3+1+1) with Frame', fields: { material: 'Solid Wood (Teak)', height: 3, width: 7, rate: 2800 } },
    { name: 'False Ceiling — POP', fields: { material: '', height: 0, width: 0, rate: 0 } },
    { name: 'Custom Loft / Overhead Storage', fields: { material: 'BWR Plywood', height: 2, width: 8, rate: 1500 } },
  ],

  packages: [
    {
      label: '1 BHK Starter',
      projectType: '1 BHK',
      items: [
        { name: 'Kitchen', fields: { material: 'BWR Plywood', height: 10, width: 8, rate: 900 } },
        { name: 'Kitchen Loft', fields: { material: 'BWR Plywood', height: 10, width: 2, rate: 900 } },
        { name: 'Wardrobe with Loft', fields: { material: 'BWR Plywood', height: 8, width: 7, rate: 900 } },
        { name: 'Bed with Storage', fields: { material: 'BWR Plywood', height: 6, width: 6, rate: 900 } },
        { name: 'TV Unit', fields: { material: 'HDHMR', height: 4, width: 6, rate: 900 } },
        { name: 'Shoe Rack', fields: { material: 'BWR Plywood', height: 4, width: 3, rate: 900 } },
        { name: 'Study Unit', fields: { material: 'BWR Plywood', height: 4, width: 2, rate: 900 } },
        { name: 'Pooja Unit', fields: { material: 'BWR Plywood', height: 4, width: 5, rate: 900 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'BWR Plywood', height: 3, width: 3, rate: 900 } },
        { name: 'Dining Table (4-Seater)', fields: { material: 'Solid Wood (Sheesham)', height: 4, width: 3, rate: 900 } },
        { name: 'Sofa Set (3-Seater)', fields: { material: 'BWR Plywood', height: 3, width: 6, rate: 900 } },
      ],
    },
    {
      label: '2 BHK Family',
      projectType: '2 BHK',
      items: [
        { name: 'Kitchen', fields: { material: 'BWR Plywood', height: 10, width: 8, rate: 850 } },
        { name: 'Kitchen Loft', fields: { material: 'BWR Plywood', height: 10, width: 2, rate: 850 } },
        { name: 'Master Wardrobe', fields: { material: 'BWR Plywood', height: 8, width: 7, rate: 850 } },
        { name: 'Master Wardrobe Loft', fields: { material: 'BWR Plywood', height: 8, width: 2, rate: 850 } },
        { name: 'Bedroom Wardrobe', fields: { material: 'BWR Plywood', height: 7, width: 7, rate: 850 } },
        { name: 'Bedroom Wardrobe Loft', fields: { material: 'Plywood', height: 7, width: 2, rate: 850 } },
        { name: 'King Bed with Storage', fields: { material: 'BWR Plywood', height: 6, width: 6.5, rate: 850 } },
        { name: 'Queen Bed with Storage', fields: { material: 'BWR Plywood', height: 6, width: 6, rate: 850 } },
        { name: 'TV Unit', fields: { material: 'HDHMR', height: 4, width: 7, rate: 850 } },
        { name: 'Shoe Rack', fields: { material: 'BWR Plywood', height: 5, width: 3, rate: 850 } },
        { name: 'Pooja Unit', fields: { material: 'BWR Plywood', height: 7, width: 4, rate: 850 } },
        { name: 'Crockery Unit', fields: { material: 'HDHMR', height: 5, width: 7, rate: 850 } },
        { name: 'Study Unit', fields: { material: 'BWR Plywood', height: 5, width: 2, rate: 850 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'BWR Plywood', height: 3, width: 3, rate: 850 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'BWR Plywood', height: 3, width: 3, rate: 850 } },
        { name: 'Dining Table (4-Seater)', fields: { material: 'Solid Wood (Sheesham)', height: 4, width: 3, rate: 850 } },
        { name: 'Sofa Set (3+1)', fields: { material: 'BWR Plywood', height: 3, width: 7.33, rate: 850 } },
        { name: 'Centre Table', fields: { material: 'BWR Plywood', height: 4, width: 2, rate: 850 } },
      ],
    },
    {
      label: '3 BHK Premium',
      projectType: '3 BHK',
      items: [
        { name: 'Modular Kitchen', fields: { material: 'PVC', height: 10, width: 8, rate: 850 } },
        { name: 'Kitchen Loft', fields: { material: 'PVC', height: 10, width: 2, rate: 850 } },
        { name: 'Master Wardrobe', fields: { material: 'PVC', height: 8, width: 7, rate: 850 } },
        { name: 'Master Wardrobe Loft', fields: { material: 'PVC', height: 8, width: 2, rate: 850 } },
        { name: 'Bedroom Wardrobe', fields: { material: 'PVC', height: 7, width: 7, rate: 850 } },
        { name: 'Bedroom Wardrobe', fields: { material: 'PVC', height: 7, width: 7, rate: 850 } },
        { name: 'Bedroom Wardrobe Loft', fields: { material: 'PVC', height: 7, width: 2, rate: 850 } },
        { name: 'Bedroom Wardrobe Loft', fields: { material: 'PVC', height: 7, width: 2, rate: 850 } },
        { name: 'King Bed with Storage', fields: { material: 'PVC', height: 6, width: 6.5, rate: 850 } },
        { name: 'Queen Bed with Storage', fields: { material: 'PVC', height: 6, width: 6.5, rate: 850 } },
        { name: 'Queen Bed with Storage', fields: { material: 'PVC', height: 6, width: 6.5, rate: 850 } },
        { name: 'TV Unit', fields: { material: 'HDHMR', height: 5, width: 7, rate: 850 } },
        { name: 'Shoe Rack', fields: { material: 'PVC', height: 5, width: 3, rate: 850 } },
        { name: 'Pooja Unit', fields: { material: 'PVC', height: 7, width: 5, rate: 850 } },
        { name: 'Crockery Unit', fields: { material: 'HDHMR', height: 5, width: 7, rate: 850 } },
        { name: 'Bar Cabinet', fields: { material: 'HDHMR', height: 3, width: 7, rate: 850 } },
        { name: 'Study Unit', fields: { material: 'PVC', height: 5, width: 2, rate: 850 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'PVC', height: 3, width: 3, rate: 850 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'PVC', height: 3, width: 3, rate: 850 } },
        { name: 'Bathroom Vanity with Mirror', fields: { material: 'PVC', height: 3, width: 3, rate: 850 } },
        { name: 'Dining Table (6-Seater)', fields: { material: 'Solid Wood (Sheesham)', height: 5, width: 3, rate: 850 } },
        { name: 'Sofa Set (3+1+1)', fields: { material: 'PVC', height: 3, width: 8.33, rate: 850 } },
        { name: 'Centre Table', fields: { material: 'PVC', height: 4, width: 2, rate: 850 } },
      ],
    },
    {
      label: 'Custom Single Item',
      projectType: 'Custom Furniture',
      items: [{ name: '', fields: { material: 'BWR Plywood', height: 0, width: 0, rate: 0 } }],
    },
  ],

  variants: [
    { key: 'pvc', label: 'PVC (₹850)', fields: { material: 'PVC', rate: 850 } },
    { key: 'plywood', label: 'Plywood (₹1000)', fields: { material: 'Plywood', rate: 1000 } },
  ],

  quickStart: [
    { label: '1 BHK PVC (₹850)', presetIndex: 0, variantKey: 'pvc' },
    { label: '1 BHK Plywood (₹1000)', presetIndex: 0, variantKey: 'plywood' },
    { label: '2 BHK PVC (₹850)', presetIndex: 1, variantKey: 'pvc' },
    { label: '2 BHK Plywood (₹1000)', presetIndex: 1, variantKey: 'plywood' },
    { label: '3 BHK PVC (₹850)', presetIndex: 2, variantKey: 'pvc' },
    { label: '3 BHK Plywood (₹1000)', presetIndex: 2, variantKey: 'plywood' },
    { label: 'Custom Single Item', presetIndex: 3, variantKey: null },
  ],

  workTypes: [
    {
      value: 'material-labour',
      label: 'Material + Labour (Full Furniture Work)',
      terms: MATERIAL_LABOUR_TERMS,
      inclusions: MATERIAL_LABOUR_INCLUSIONS,
    },
    {
      value: 'labour-only',
      label: 'Labour Only',
      terms: LABOUR_ONLY_TERMS,
      inclusions: LABOUR_ONLY_INCLUSIONS,
    },
  ],
  defaultWorkType: 'material-labour',

  defaultTerms: MATERIAL_LABOUR_TERMS,
  defaultInclusions: MATERIAL_LABOUR_INCLUSIONS,

  labels: {
    itemName: 'Item Description',
    rate: 'Rate (₹/sqft)',
    quantity: 'Qty',
    amount: 'Amount',
    itemsTitle: 'Add New Item',
  },

  tableColumns: [
    { key: 'index', label: '#', width: '4%' },
    { key: 'name', label: 'Item Description & Material' },
    { key: 'dims', label: 'H × W (ft)', width: '11%' },
    { key: 'qty', label: 'Qty', width: '6%' },
    { key: 'measure', label: 'Sqft', width: '8%' },
    { key: 'rate', label: 'Rate (₹/sqft)', width: '11%' },
    { key: 'amount', label: 'Amount', width: '14%', align: 'right' },
  ],
};
