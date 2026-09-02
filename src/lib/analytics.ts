export type MarketingBranch = 'mumbai' | 'navi_mumbai' | 'thane' | 'ahmedabad' | 'unknown';

export type AnalyticsEventParams = {
  branch?: MarketingBranch | string;
  page?: string;
  cta?: string;
  project_type?: string;
  source?: string;
  value?: number;
};

function getPagePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    page: params.page || getPagePath(),
    ...params,
  });
}

export function trackWhatsAppClick(params: AnalyticsEventParams = {}) {
  trackEvent('whatsapp_click', params);
}

export function trackPhoneClick(params: AnalyticsEventParams = {}) {
  trackEvent('phone_click', params);
}

/** GA4 recommended event for form submissions */
export function trackGenerateLead(params: AnalyticsEventParams = {}) {
  trackEvent('generate_lead', {
    value: 1,
    ...params,
  });
}

export function trackQuotationPdfDownload(params: AnalyticsEventParams = {}) {
  trackEvent('quotation_pdf_download', params);
}

export function handleTrackedPhoneClick(params: AnalyticsEventParams = {}) {
  trackPhoneClick(params);
}
