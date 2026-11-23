'use client';

import React, { useState } from 'react';
import { BasketProvider } from '../context/BasketContext';
import { WishlistProvider } from '../context/WishlistContext';
import ProfileDrawer from '../components/ProfileDrawer';
import BottomNav from '../components/BottomNav';
import WelcomeModal from '../components/WelcomeModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <BasketProvider>
      <WishlistProvider>
        {children}
        <ProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
        <BottomNav onOpenProfile={() => setIsProfileOpen(true)} />
        <WelcomeModal />
      </WishlistProvider>
    </BasketProvider>
  );
}
