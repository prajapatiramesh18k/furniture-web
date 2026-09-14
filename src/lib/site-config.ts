/**
 * Centralized business / contact / marketing config.
 * Use this instead of hard-coding phones, WhatsApp, or URLs across the app.
 */

export const SITE_URL = 'https://www.ananyahouseoffurniture.in';
export const SITE_NAME = 'Ananya House of Furniture';

/** Verified phones — primary number for CTAs / Ads / Call Now */
export const PHONES = {
  mumbaiPrimary: {
    display: '+91 93218 12823',
    tel: '+919321812823',
    e164: '919321812823',
  },
  mumbaiSecondary: {
    display: '+91 83187 27813',
    tel: '+918318727813',
    e164: '918318727813',
  },
  mumbaiTertiary: {
    display: '+91 77150 95021',
    tel: '+917715095021',
    e164: '917715095021',
  },
  /** Same as primary — used for WhatsApp */
  whatsappPrimary: {
    display: '+91 93218 12823',
    tel: '+919321812823',
    e164: '919321812823',
  },
} as const;

export const EMAIL = 'ananyahouseoffurniture@gmail.com';
export const EMAIL_CONTACT = 'contact@ananyahouseoffurniture.com';

export const HEAD_OFFICE = {
  label: 'Head Office / Factory',
  streetAddress: 'Diva-Shil Road, Khardipada',
  /** Labeling as Thane matches footer + postal reality (400612). Branch card also says Mumbai — REQUIRES BUSINESS VERIFICATION for GBP. */
  addressLocality: 'Thane',
  addressRegion: 'Maharashtra',
  postalCode: '400612',
  addressCountry: 'IN',
  mapLink: 'https://maps.app.goo.gl/3wAw79stEiGNyeWa9',
  fullAddress:
    'Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612',
} as const;

export const AHMEDABAD_BRANCH = {
  label: 'Ahmedabad (Bopal)',
  streetAddress: 'West Court 2nd Floor, TRP Mall, Bopal',
  addressLocality: 'Ahmedabad',
  addressRegion: 'Gujarat',
  postalCode: '380059',
  addressCountry: 'IN',
  mapLink: 'https://maps.google.com/?q=TRP+Mall+Bopal+Ahmedabad',
  fullAddress:
    'West Court 2nd Floor, TRP Mall, Bopal, Ahmedabad, Gujarat - 380059',
} as const;

export const PRIMARY_MARKETS = ['Mumbai', 'Navi Mumbai', 'Thane'] as const;
export const SECONDARY_MARKETS = ['Ahmedabad', 'Bopal'] as const;

export const ESTABLISHED_YEAR = 2012;
export const WARRANTY = '5-year warranty on manufacturing defects';

export const DEFAULT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || PHONES.whatsappPrimary.e164;

export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean === '/' ? '' : clean}`;
}
