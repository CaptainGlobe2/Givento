import React from 'react';
import Link from 'next/link';

export default function ExpoSection() {
  return (
    <section id="expos" className="py-11 border-b border-[#e8dcdc]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex justify-between items-end gap-3 flex-wrap mb-5.5">
          <div>
            <h2 className="font-display font-normal text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.1] text-[#231a1d]">
              Find us at expos
            </h2>
            <p className="font-body text-[#6a5b60] text-[0.95rem] mt-1.5 max-w-[60ch]">
              We set up stalls at local expos, so you can see and try everything in person.
            </p>
          </div>
          <a
            href="https://www.instagram.com/givento.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.88rem] font-bold text-[#7a1c3b] hover:underline"
          >
            Follow on Instagram →
          </a>
        </div>

        {/* 2 Expo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#e8dcdc] border-l-4 border-l-[#c5a059] rounded-[10px] p-5.5 bg-white">
            <h3 className="font-display text-[1.35rem] text-[#231a1d] mb-1.5">
              Next expo
            </h3>
            <p className="font-body text-[#6a5b60] text-[0.95rem] m-0">
              Dates and place coming soon. Follow @givento.in on Instagram to see them first.
            </p>
            <small className="block mt-2.5 text-[0.76rem] text-[#6a5b60]">
              Sample wording. Edit it when you know the dates.
            </small>
          </div>

          <div className="border border-[#e8dcdc] border-l-4 border-l-[#c5a059] rounded-[10px] p-5.5 bg-white">
            <h3 className="font-display text-[1.35rem] text-[#231a1d] mb-1.5">
              Adirai August Expo
            </h3>
            <p className="font-body text-[#6a5b60] text-[0.95rem] m-0">
              We were there with our jewellery and accessories. Thank you to everyone who stopped by.
            </p>
            <small className="block mt-2.5 text-[0.76rem] text-[#6a5b60]">
              Sample wording. Replace it with your own.
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
