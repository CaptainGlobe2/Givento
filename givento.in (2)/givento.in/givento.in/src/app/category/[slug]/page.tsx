import React, { Suspense } from 'react';
import { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';
import { CATEGORIES } from '../../../data/sampleData';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = CATEGORIES.map((c) => ({ slug: c.slug }));
  return [{ slug: 'all' }, ...slugs];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const isAll = slug === 'all' || !slug;
  const cat = CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === slug.toLowerCase() ||
      c.id.toLowerCase() === slug.toLowerCase() ||
      c.groupKey?.toLowerCase() === slug.toLowerCase()
  );

  const title = isAll
    ? 'All Handcrafted Collections | Givento.in'
    : `${cat?.name || slug.replace(/-/g, ' ')} | Givento.in`;

  const description = isAll
    ? 'Explore our full boutique catalog of everlasting bouquets, stainless steel jewellery, personalized frames, gift hampers and resin art.'
    : cat?.description || `Browse handcrafted ${cat?.name || slug} from Givento Studio in Adirampattinam.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://givento.in/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FCF9F6]">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#853648] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8C827A] font-medium">Loading handcrafted collection...</p>
          </div>
        </div>
      }
    >
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
