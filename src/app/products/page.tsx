import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsPageClient from '@/components/ProductsPageClient';
import { products as staticProducts } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Furniture Products — Beds, Wardrobes, Kitchens & More',
  description:
    'Browse custom and modular furniture products from Ananya House of Furniture — beds, wardrobes, TV units, modular kitchens and more for Mumbai, Navi Mumbai & Thane.',
  alternates: { canonical: absoluteUrl('/products') },
  openGraph: {
    title: 'Furniture Products | Ananya House of Furniture',
    description:
      'Beds, wardrobes, TV units, modular kitchens and more — designed and built for Mumbai, Navi Mumbai & Thane homes.',
    url: absoluteUrl('/products'),
  },
};

export const revalidate = 60;

async function getProductsForPage() {
  // Static catalog is always in HTML for SEO/crawlers.
  // Optional DB merge is best-effort and time-boxed so builds never hang.
  if (!process.env.MONGODB_URI) {
    return staticProducts;
  }

  try {
    const load = async () => {
      const { default: dbConnect } = await import('@/lib/mongodb');
      const { default: Product } = await import('@/lib/models/Product');
      await dbConnect();
      const dbProducts = await Product.find().lean();
      return dbProducts.map((p) => {
        const doc = p as {
          _id: { toString(): string };
          slug?: string;
          name?: string;
          image?: string;
          images?: string[];
          price?: number;
          originalPrice?: number;
          rating?: number;
          category?: string;
          description?: string;
        };
        return {
          id: doc._id.toString(),
          slug:
            doc.slug ||
            (typeof doc.name === 'string'
              ? doc.name.toLowerCase().replace(/\s+/g, '-')
              : doc._id.toString()),
          name: doc.name || '',
          image: doc.image || '',
          images: doc.images,
          price: doc.price || 0,
          originalPrice: doc.originalPrice,
          rating: doc.rating,
          category: doc.category || '',
          description: doc.description,
        };
      });
    };

    const dbFormatted = await Promise.race([
      load(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('products db timeout')), 3000)
      ),
    ]);

    return [...staticProducts, ...dbFormatted];
  } catch {
    return staticProducts;
  }
}

export default async function ProductsPage() {
  const products = await getProductsForPage();

  return (
    <Suspense
      fallback={
        <div className="products-page">
          <div className="products-page-hero">
            <h1>
              Our <span>Products</span>
            </h1>
            <p>Discover handcrafted furniture that transforms your space into a home.</p>
          </div>
          <div className="products-page-grid">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="products-page-card">
                <div className="products-page-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="products-page-card-body">
                  <h2>{product.name}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ProductsPageClient initialProducts={products} />
    </Suspense>
  );
}
