import React from 'react';
import Link from 'next/link';

export default function PromoBand() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4.5 sm:gap-7 flex-wrap bg-[#f8eed6] border-[1.5px] border-[#e6cf9b] rounded-[14px] p-6 sm:p-7">
        <div>
          <h2 className="font-display font-normal text-[1.6rem] text-[#231a1d] mb-1">
            Design your own bouquet
          </h2>
          <p className="font-body text-[#6a5b60] text-[0.95rem] m-0 max-w-[58ch]">
            Choose a wrapping sheet, add chocolates, photos, bracelets or chains, and watch the price update as you build.
          </p>
        </div>
        <Link
          href="#builder"
          className="btn-boutique flex-shrink-0"
        >
          Start building
        </Link>
      </div>
    </div>
  );
}
