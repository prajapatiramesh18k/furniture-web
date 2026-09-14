import QuotationMakerPage from '@/app/quotation-maker/page';

export const metadata = {
  title: 'New Quotation',
  robots: { index: false, follow: false },
};

/** New Quotation rendered inside the admin portal shell (sidebar stays visible). */
export default function AdminNewQuotationPage() {
  return <QuotationMakerPage />;
}
