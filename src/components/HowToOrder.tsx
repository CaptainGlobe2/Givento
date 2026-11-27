import React from 'react';

export default function HowToOrder() {
  const steps = [
    {
      step: '1',
      title: 'Fill your bag',
      desc: 'Add products or your own bouquet, and write a note for the person you are gifting.',
    },
    {
      step: '2',
      title: 'Checkout & Pay',
      desc: 'Enter delivery details and pay securely via Razorpay (UPI, Cards, or NetBanking).',
    },
    {
      step: '3',
      title: 'We craft & dispatch',
      desc: 'We verify stock, craft your personalised keepsake, and send live tracking updates.',
    },
  ];

  return (
    <section id="how" className="py-11 border-b border-[#e8dcdc]">
      <div className="max-w-[1180px] mx-auto px-4">
        {/* Section Heading */}
        <div className="flex justify-between items-end gap-3 flex-wrap mb-5.5">
          <div>
            <h2 className="font-display font-normal text-[clamp(1.7rem,3.4vw,2.3rem)] leading-[1.1] text-[#231a1d]">
              How to order
            </h2>
            <p className="font-body text-[#6a5b60] text-[0.95rem] mt-1.5 max-w-[60ch]">
              Sign in for saved details or check out swiftly with secure Razorpay online payment.
            </p>
          </div>
        </div>

        {/* 3 Numbered Steps Grid */}
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
          {steps.map((s) => (
            <li
              key={s.step}
              className="bg-[#faf6f4] rounded-[10px] p-5.5 border border-[#e8dcdc]"
            >
              <div className="w-[34px] h-[34px] rounded-full bg-[#7a1c3b] text-white font-extrabold text-[0.95rem] flex items-center justify-center mb-3">
                {s.step}
              </div>
              <b className="block font-body font-bold text-[1.02rem] text-[#231a1d] mb-1">
                {s.title}
              </b>
              <span className="font-body text-[#6a5b60] text-[0.92rem] leading-relaxed">
                {s.desc}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
