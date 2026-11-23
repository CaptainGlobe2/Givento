'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import CircularCategories from '../components/CircularCategories';
import NewArrivalsSection from '../components/NewArrivalsSection';
import FeaturedCollections from '../components/FeaturedCollections';
import HowToOrder from '../components/HowToOrder';
import ExpoSection from '../components/ExpoSection';
import Footer from '../components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectGroup = (groupKey: string) => {
    router.push(`/category/${groupKey}`);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-[#231a1d] font-body selection:bg-[#f6e9ee] selection:text-[#7a1c3b] pb-20 md:pb-0">
      {/* 1. Header with Rounded Pill Search Bar & Hamburger Menu */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedGroup=""
        onSelectGroup={handleSelectGroup}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Top Banner / Rotating Slideshow Carousel */}
        <HeroCarousel />

        {/* 3. Circular Categories (Matching Reference: Horizontal Scrolling Row Directly Above New Arrivals) */}
        <CircularCategories
          selectedGroup=""
          onSelectGroup={handleSelectGroup}
        />

        {/* 4. New Arrivals (Matching Reference: Filter Pills, Portrait Cards with Quick '+' Add, Title & Price) */}
        <NewArrivalsSection />

        {/* 5. Featured Collections (4 Arch-Topped Cards Linking to Jewellery Categories) */}
        <FeaturedCollections />

        {/* 5. How to Order (3 Simple Steps) */}
        <HowToOrder />

        {/* 6. Find Us at Expos & Studio Info */}
        <ExpoSection />
      </main>

      {/* 7. Boutique Footer */}
      <Footer />
    </div>
  );
}
