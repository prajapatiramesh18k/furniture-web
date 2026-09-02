import { MetadataRoute } from "next";
import { products } from "@/lib/products-data";
import { services } from "@/lib/services-data";

const blogSlugs = [
  "complete-guide-buying-right-bed-bedroom",
  "furniture-care-101-tips-maintain-wooden-furniture",
  "5-simple-ways-make-small-space-look-bigger-furniture",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ananyahouseoffurniture.in";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/quotation-maker`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/submit-review`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...servicePages, ...blogPages];
}
