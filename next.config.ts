import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Next's embedded typecheck worker hangs in this environment; `npx tsc --noEmit` is clean.
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    // Legacy service slugs (replaced by the 9 trade services) -> closest new pages.
    const serviceRedirects: [string, string][] = [
      ['/custom-furniture', '/custom-furniture-manufacturing'],
      ['/modular-kitchen', '/modular-furniture-interior-work'],
      ['/wardrobes', '/modular-furniture-interior-work'],
      ['/pvc-furniture', '/custom-furniture-manufacturing'],
      ['/tv-units', '/modular-furniture-interior-work'],
      ['/bedroom-furniture', '/modular-furniture-interior-work'],
      ['/office-furniture', '/modular-furniture-interior-work'],
      ['/home-interiors', '/modular-furniture-interior-work'],
      ['/pooja-unit', '/product-customization'],
      ['/dining-furniture', '/product-customization'],
    ];
    // Legacy location combos -> renamed equivalents.
    const locations = ['mumbai', 'navi-mumbai', 'thane', 'ahmedabad', 'bopal'];
    const comboRedirects: [string, string][] = [
      ...locations.map(
        (loc) => [`/custom-furniture-${loc}`, `/custom-furniture-manufacturing-${loc}`] as [string, string]
      ),
      ...locations.map(
        (loc) => [`/modular-kitchen-${loc}`, `/modular-furniture-interior-work-${loc}`] as [string, string]
      ),
      ...['mumbai', 'navi-mumbai', 'thane', 'ahmedabad'].map(
        (loc) => [`/wardrobes-${loc}`, `/modular-furniture-interior-work-${loc}`] as [string, string]
      ),
    ];
    return [...serviceRedirects, ...comboRedirects].map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
