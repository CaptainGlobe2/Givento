'use client';

import React, { useState, useEffect } from 'react';
import { REALMS } from '../data/sampleData';
import { Realm } from '../types';
import { db } from '../lib/database';
import { ArrowUpRight } from 'lucide-react';

interface RealmsSectionProps {
  onSelectRealm?: (realmId: string) => void;
  activeRealmId?: string | null;
}

export default function RealmsSection({ onSelectRealm, activeRealmId }: RealmsSectionProps) {
  const [realmsList, setRealmsList] = useState<Realm[]>(REALMS);

  useEffect(() => {
    let active = true;
    db.getRealms().then((r) => {
      if (active && r && r.length > 0) {
        setRealmsList(r);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const getTagColorStyles = (color: Realm['tagColor']) => {
    switch (color) {
      case 'peach':
        return 'bg-[#FFF2EC] border-[#F6A98A]/60 text-[#2D1527]';
      case 'rose':
        return 'bg-[#FDEBF0] border-[#E88299]/60 text-[#2D1527]';
      case 'mint':
        return 'bg-[#E9F6F1] border-[#7BBFA6]/60 text-[#2D1527]';
      case 'sky':
        return 'bg-[#EBF6FC] border-[#76BBE3]/60 text-[#2D1527]';
      case 'gold':
        return 'bg-[#FEF9E7] border-[#D4AF37]/60 text-[#2D1527]';
      case 'lavender':
        return 'bg-[#F5EEFA] border-[#D8B4E2]/60 text-[#2D1527]';
      default:
        return 'bg-[#FCF4EE] border-[#2D1527]/30 text-[#2D1527]';
    }
  };

  const handleTagClick = (realmId: string) => {
    if (onSelectRealm) {
      onSelectRealm(realmId);
    }
    const target = document.getElementById('treasures');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="realms" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-block px-3 py-1 rounded-full bg-[#FEF08A] border border-[#2D1527] text-[#2D1527] font-handwriting text-base font-bold shadow-ink-sm -rotate-1">
          ✦ luggage tags from the scrapbook ✦
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl text-[#2D1527]">
          Explore the 10 Fantasy Realms
        </h2>
        <p className="font-body text-sm sm:text-base text-[#5E3C57]">
          Each category is a world of its own. Pick a tag below to jump straight to its handcrafted treasures.
        </p>
      </div>

      {/* Luggage Tags Cloud / Flex Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {realmsList.map((realm, index) => {
          const isSelected = activeRealmId === realm.id;
          const tiltClass =
            index % 4 === 0
              ? '-rotate-2'
              : index % 4 === 1
              ? 'rotate-2'
              : index % 4 === 2
              ? '-rotate-1'
              : 'rotate-1.5';

          return (
            <div
              key={realm.id}
              id={realm.id}
              onClick={() => handleTagClick(realm.id)}
              className={`luggage-tag cursor-pointer rounded-2xl p-5 ${getTagColorStyles(
                realm.tagColor
              )} ${tiltClass} ${
                isSelected ? 'ring-3 ring-[#7A1C30] !rotate-0 scale-102 shadow-ink-lg' : ''
              }`}
            >
              {/* Top Tag Punch Hole & String */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2D1527]/20">
                <div className="flex items-center gap-2">
                  {/* Punch hole */}
                  <div className="w-4 h-4 rounded-full bg-[#FFF7F4] border-2 border-[#2D1527] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2D1527]" />
                  </div>
                  {/* String loop visual */}
                  <span className="font-handwriting text-xs text-[#5E3C57]">
                    Tag #{index + 1}
                  </span>
                </div>
                
                {/* Plain Category Label (always visible so nobody has to decode fantasy name) */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border border-[#2D1527] text-xs font-bold font-body text-[#7A1C30] shadow-ink-sm">
                  {realm.plainName}
                </span>
              </div>

              {/* Tag Main Body */}
              <div className="pt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{realm.icon}</span>
                    <h3 className="font-heading text-xl text-[#2D1527] group-hover:text-[#7A1C30]">
                      {realm.fantasyName}
                    </h3>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white border border-[#2D1527] flex items-center justify-center text-[#2D1527]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <p className="font-body text-xs sm:text-sm text-[#5E3C57] line-clamp-2 leading-relaxed">
                  {realm.description}
                </p>

                {/* Highlight item tag in Caveat */}
                <div className="pt-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-white/80 border border-[#2D1527]/30 font-handwriting text-sm text-[#7A1C30] font-bold">
                    {realm.highlightItem}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
