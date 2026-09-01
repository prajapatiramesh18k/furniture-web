const DEFAULT_QUOTE_WHATSAPP = '919321812823';

export type QuoteWhatsAppData = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  branch?: string;
  projectType?: string;
  message: string;
};

const branchLabels: Record<string, string> = {
  mumbai: 'Mumbai (Head Office)',
  ahmedabad: 'Ahmedabad',
};

export function formatBranchLabel(branch?: string) {
  if (!branch) return '';
  return branchLabels[branch] || branch;
}

export function buildQuoteWhatsAppMessage(data: QuoteWhatsAppData) {
  const lines = [
    'Hello Ananya House of Furniture,',
    'I just submitted a Get Quote request on your website. Here are my details:',
    '',
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
  ];

  if (data.address?.trim()) {
    lines.push(`Address: ${data.address.trim()}`);
  }

  const branchLabel = formatBranchLabel(data.branch);
  if (branchLabel) {
    lines.push(`Preferred Branch: ${branchLabel}`);
  }

  if (data.projectType?.trim()) {
    lines.push(`Project Type: ${data.projectType.trim()}`);
  }

  lines.push('', `Message: ${data.message}`, '', 'Please share a quotation. Thank you!');

  return lines.join('\n');
}

export function openQuoteWhatsApp(data: QuoteWhatsAppData) {
  const phone =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    DEFAULT_QUOTE_WHATSAPP;
  const text = encodeURIComponent(buildQuoteWhatsAppMessage(data));
  const url = `https://wa.me/${phone}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
