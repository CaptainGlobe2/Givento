import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '../../../data/sampleData';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Craft Not Found | Givento.in',
    };
  }

  const priceFormatted = product.price
    ? `₹${product.price}`
    : product.priceFrom
    ? `From ₹${product.priceFrom}`
    : 'Price on Request';

  return {
    title: `${product.name} (${priceFormatted}) | Givento.in`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | Givento.in`,
      description: product.shortDescription,
      images: [product.images[0] || '/images/sunflower-bouquet.svg'],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `https://givento.in${img}`
    ),
    description: product.shortDescription,
    brand: {
      "@type": "Brand",
      name: "Givento.in",
    },
    offers: {
      "@type": "Offer",
      url: `https://givento.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price || product.priceFrom || 499,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Givento.in",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating ?? 4.9,
      reviewCount: product.reviewCount ?? 32,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient slug={slug} />
    </>
  );
}
