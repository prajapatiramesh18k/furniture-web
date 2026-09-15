import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/login',
          '/cart',
          '/checkout',
          '/wishlist',
          '/order-confirmation',
          '/forgot-password',
          '/reset-password',
          '/account',
          '/customer/',
          '/receipt',
          '/punch',
          '/quotation-maker',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
