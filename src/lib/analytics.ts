export type MarketingBranch = 'mumbai' | 'navi_mumbai' | 'thane' | 'ahmedabad' | 'unknown';

export type AnalyticsEventParams = {
  branch?: MarketingBranch | string;
  page?: string;
  cta?: string;
  cta_position?: string;
  project_type?: string;
  service?: string;
  location?: string;
  source?: string;
  value?: number;
};

function getPagePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Never send PII (name, phone, email, message) to analytics.
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

export function trackContactFormStart(params: AnalyticsEventParams = {}) {
  trackEvent('contact_form_start', params);
}

export function trackContactFormSubmit(params: AnalyticsEventParams = {}) {
  trackEvent('contact_form_submit', params);
}

export function trackQuoteRequest(params: AnalyticsEventParams = {}) {
  trackEvent('quote_request', params);
}

export function trackSiteVisitRequest(params: AnalyticsEventParams = {}) {
  trackEvent('site_visit_request', params);
}

export function track3dDesignRequest(params: AnalyticsEventParams = {}) {
  trackEvent('3d_design_request', params);
}

export function trackQuotationPdfDownload(params: AnalyticsEventParams = {}) {
  trackEvent('quotation_pdf_download', params);
}

export function handleTrackedPhoneClick(params: AnalyticsEventParams = {}) {
  trackPhoneClick(params);
}
