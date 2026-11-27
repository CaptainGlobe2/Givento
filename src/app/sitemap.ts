import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '../data/sampleData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://givento.in';

  const staticPages = [
    '',
    '/cart',
    '/category/all',
    '/login',
    '/track',
    '/wishlist',
    '/about',
    '/faq',
    '/delivery',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const productPages = PRODUCTS.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
