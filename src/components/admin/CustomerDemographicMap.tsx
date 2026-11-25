'use client';

import React, { useMemo, useState } from 'react';
import indiaMap from '@svg-maps/india';
import { MapPin, Trophy } from 'lucide-react';
import { AdminOrder } from '../../lib/database';

// Exact centers derived from @svg-maps/india viewBox="0 0 612 696"
const STATE_CENTERS: Record<string, [number, number]> = {
  an: [521, 609],
  ap: [263, 500],
  ar: [550, 224],
  as: [516, 271],
  br: [369, 275],
  ch: [179, 160],
  ct: [296, 388],
  dn: [102, 405],
  dd: [54, 391],
  dl: [186, 210],
  ga: [122, 512],
  gj: [66, 355],
  hr: [164, 195],
  hp: [191, 133],
  jk: [173, 61],
  jh: [366, 327],
  ka: [171, 519],
  kl: [166, 615],
  ld: [99, 627],
  mp: [214, 319],
  mh: [180, 435],
  mn: [537, 301],
  ml: [484, 283],
  mz: [516, 337],
  nl: [546, 270],
  or: [340, 405],
  py: [250, 588],
  pb: [151, 152],
  rj: [119, 257],
  sk: [425, 235],
  tn: [211, 609],
  tg: [237, 457],
  tr: [493, 325],
  up: [265, 245],
  ut: [232, 175],
  wb: [412, 310],
};

const STATE_MATCHERS: Array<{ id: string; pattern: RegExp }> = [
  { id: 'tn', pattern: /\btamil\s*nadu\b|\btn\b|adirampattinam|adiram|thanjavur|chennai|madurai|trichy|tiruchirappalli|coimbatore|salem|erode|tirunelveli|vellore|thoothukudi|kanchipuram|nagercoil|karur|dindigul|hosur|pattukkottai|kumbakonam|nagapattinam/ },
  { id: 'py', pattern: /puducherry|pondicherry|karaikal/ },
  { id: 'kl', pattern: /\bkerala\b|\bkl\b|kochi|ernakulam|kozhikode|calicut|trivandrum|thiruvananthapuram|thrissur|kannur|kollam|malappuram|palakkad|alappuzha|kottayam/ },
  { id: 'ka', pattern: /\bkarnataka\b|\bka\b|bengaluru|bangalore|mysuru|mysore|mangaluru|mangalore|hubli|dharwad|belagavi|belgaum|udupi/ },
  { id: 'tg', pattern: /\btelangana\b|\btg\b|\bts\b|hyderabad|secunderabad|warangal|nizamabad|karimnagar/ },
  { id: 'ap', pattern: /\bandhra\b|\bap\b|visakhapatnam|vizag|vijayawada|tirupati|guntur|nellore|kakinada|rajahmundry/ },
  { id: 'mh', pattern: /\bmaharashtra\b|\bmh\b|mumbai|pune|nagpur|nashik|thane|navi\s*mumbai|aurangabad|solapur|kolhapur/ },
  { id: 'ga', pattern: /\bgoa\b|panaji|margao|vasco/ },
  { id: 'gj', pattern: /\bgujarat\b|\bgj\b|ahmedabad|surat|vadodara|rajkot|gandhinagar|bhavnagar|jamnagar/ },
  { id: 'rj', pattern: /\brajasthan\b|\brj\b|jaipur|udaipur|jodhpur|kota|ajmer|bikaner|bharatpur/ },
  { id: 'dl', pattern: /\bdelhi\b|\bnew\s*delhi\b|\bdl\b|\bncr\b/ },
  { id: 'hr', pattern: /\bharyana\b|\bhr\b|gurugram|gurgaon|faridabad|panipat|ambala|rohtak|hisar/ },
  { id: 'pb', pattern: /\bpunjab\b|\bpb\b|ludhiana|amritsar|jalandhar|patiala|bathinda|mohali/ },
  { id: 'ch', pattern: /\bchandigarh\b/ },
  { id: 'hp', pattern: /\bhimachal\b|\bhp\b|shimla|manali|dharamshala/ },
  { id: 'ut', pattern: /\buttarakhand\b|\buttaranchal\b|\buk\b|dehradun|haridwar|rishikesh|nainital|haldwani/ },
  { id: 'jk', pattern: /jammu|kashmir|srinagar|ladakh|\bjk\b/ },
  { id: 'up', pattern: /uttar\s*pradesh|\bup\b|noida|greater\s*noida|ghaziabad|lucknow|kanpur|agra|varanasi|prayagraj|allahabad|meerut/ },
  { id: 'mp', pattern: /madhya\s*pradesh|\bmp\b|bhopal|indore|gwalior|jabalpur|ujjain/ },
  { id: 'ct', pattern: /chhattisgarh|\bct\b|\bcg\b|raipur|bilaspur|bhilai/ },
  { id: 'br', pattern: /\bbihar\b|\bbr\b|patna|gaya|muzaffarpur|bhagalpur/ },
  { id: 'jh', pattern: /\bjharkhand\b|\bjh\b|ranchi|jamshedpur|dhanbad|bokaro/ },
  { id: 'wb', pattern: /west\s*bengal|\bwb\b|kolkata|calcutta|howrah|siliguri|durgapur|asansol|darjeeling/ },
  { id: 'or', pattern: /\bodisha\b|\borissa\b|\bor\b|\bod\b|bhubaneswar|cuttack|rourkela|puri/ },
  { id: 'as', pattern: /\bassam\b|\bas\b|guwahati|dibrugarh|silchar|jorhat/ },
  { id: 'sk', pattern: /\bsikkim\b|gangtok/ },
  { id: 'tr', pattern: /\btripura\b|agartala/ },
  { id: 'ml', pattern: /\bmeghalaya\b|shillong/ },
  { id: 'mn', pattern: /\bmanipur\b|imphal/ },
  { id: 'mz', pattern: /\bmizoram\b|aizawl/ },
  { id: 'nl', pattern: /\bnagaland\b|kohima|dimapur/ },
  { id: 'ar', pattern: /arunachal|itanagar/ },
  { id: 'an', pattern: /andaman|nicobar|port\s*blair/ },
  { id: 'ld', pattern: /lakshadweep|kavaratti/ },
];

function resolveStateFromPincode(pincode?: string): string | null {
  const clean = (pincode || '').replace(/\D/g, '');
  if (clean.length < 2) return null;
  const p2 = Number(clean.slice(0, 2));
  const p3 = clean.length >= 3 ? Number(clean.slice(0, 3)) : 0;

  if (p2 === 11) return 'dl';
  if (p2 === 12 || p2 === 13) return 'hr';
  if (p2 === 14 || p2 === 15) return 'pb';
  if (p2 === 16) return 'ch';
  if (p2 === 17) return 'hp';
  if (p2 === 18 || p2 === 19) return 'jk';
  if (p3 === 244 || (p3 >= 246 && p3 <= 249) || p3 === 262 || p3 === 263) return 'ut';
  if (p2 >= 20 && p2 <= 28) return 'up';
  if (p2 >= 30 && p2 <= 34) return 'rj';
  if (p2 >= 36 && p2 <= 39) return 'gj';
  if (p3 === 403) return 'ga';
  if (p2 >= 40 && p2 <= 44) return 'mh';
  if (p2 >= 45 && p2 <= 48) return 'mp';
  if (p2 === 49) return 'ct';
  if (p2 === 50) return 'tg';
  if (p2 >= 51 && p2 <= 53) return 'ap';
  if (p2 >= 56 && p2 <= 59) return 'ka';
  if (p3 === 605 || p3 === 609) return 'py';
  if (p2 >= 60 && p2 <= 64) return 'tn';
  if (p2 >= 67 && p2 <= 69) return 'kl';
  if (p2 >= 70 && p2 <= 74) return 'wb';
  if (p2 >= 75 && p2 <= 77) return 'or';
  if (p2 === 78) return 'as';
  if (p2 === 79) return 'ml';
  if (p2 >= 80 && p2 <= 85) return p2 >= 81 && p2 <= 83 ? 'jh' : 'br';
  return null;
}

function resolveOrderStateId(order: AdminOrder): string {
  const haystack = `${order.city || ''} ${order.state || ''} ${order.address || ''}`.toLowerCase();
  for (const m of STATE_MATCHERS) {
    if (m.pattern.test(haystack)) return m.id;
  }
  const byPin = resolveStateFromPincode(order.pincode);
  if (byPin) return byPin;
  return 'tn';
}

interface StateStat {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  cities: Record<string, number>;
}

export default function CustomerDemographicMap({ orders }: { orders: AdminOrder[] }) {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [rankMode, setRankMode] = useState<'state' | 'city'>('state');

  const { stateStatsMap, rankedStates, rankedCities, maxStateOrders, totalActiveOrders } =
    useMemo(() => {
      const stats: Record<string, StateStat> = {};
      indiaMap.locations.forEach((loc) => {
        stats[loc.id] = {
          id: loc.id,
          name: loc.name,
          orders: 0,
          revenue: 0,
          cities: {},
        };
      });

      const cityTotals: Record<
        string,
        { city: string; stateName: string; stateId: string; orders: number; revenue: number }
      > = {};

      let activeCount = 0;

      orders.forEach((order) => {
        if (order.status === 'Cancelled') return;
        activeCount += 1;
        const stId = resolveOrderStateId(order);
        const st = stats[stId];
        const cityName = (order.city || st?.name || 'Adirampattinam').trim();
        const rev = Number(order.total) || 0;

        if (st) {
          st.orders += 1;
          st.revenue += rev;
          st.cities[cityName] = (st.cities[cityName] || 0) + 1;
        }

        const cKey = `${cityName.toLowerCase()}__${stId}`;
        if (!cityTotals[cKey]) {
          cityTotals[cKey] = {
            city: cityName,
            stateName: st?.name || 'Tamil Nadu',
            stateId: stId,
            orders: 0,
            revenue: 0,
          };
        }
        cityTotals[cKey].orders += 1;
        cityTotals[cKey].revenue += rev;
      });

      const rStates = Object.values(stats)
        .filter((s) => s.orders > 0)
        .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue);

      const rCities = Object.values(cityTotals).sort(
        (a, b) => b.orders - a.orders || b.revenue - a.revenue
      );

      const maxOrders = Math.max(1, rStates[0]?.orders || 1);

      return {
        stateStatsMap: stats,
        rankedStates: rStates,
        rankedCities: rCities,
        maxStateOrders: maxOrders,
        totalActiveOrders: activeCount,
      };
    }, [orders]);

  const defaultStateId = rankedStates[0]?.id || 'tn';
  const focusedStateId = hoveredStateId || selectedStateId || defaultStateId;
  const focusedState = stateStatsMap[focusedStateId] || stateStatsMap['tn'];

  // Intensity tier color helper so states with MORE orders immediately stand out
  const getStateFill = (stateId: string, orderCount: number, isFocused: boolean) => {
    if (isFocused && orderCount > 0) return '#5A1230';
    if (orderCount <= 0) {
      return isFocused ? '#DCD4CA' : '#ECE6DE';
    }
    const ratio = orderCount / maxStateOrders;
    if (ratio >= 0.67) return '#7A1C3B'; // Highest order concentration
    if (ratio >= 0.34) return '#B04D6D'; // Medium-high order concentration
    return '#DC9AB0'; // Lower active tier
  };

  const topPlaceHeadline = rankedStates[0]
    ? `${rankedStates[0].name} leads with ${rankedStates[0].orders} ${rankedStates[0].orders === 1 ? 'order' : 'orders'
    }`
    : 'Studio Home: Adirampattinam, Tamil Nadu';

  const focusedTopCities = useMemo(() => {
    if (!focusedState) return [];
    return Object.entries(focusedState.cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [focusedState]);

  const maxCityOrders = Math.max(1, rankedCities[0]?.orders || 1);

  return (
    <section
      aria-label="Customer Demographic Map"
      className="lg:col-span-6 bg-white border border-[#EFE8E1] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
            Customer Demographic
          </h2>
          <p className="text-[11px] text-[#78716C] mt-0.5 flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-[#7A1C3B] shrink-0" />
            <span>{topPlaceHeadline}</span>
          </p>
        </div>

        {/* Heat Intensity Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#78716C] bg-[#FAF7F2] border border-[#EFE8E1] px-2.5 py-1 rounded-full">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ECE6DE]" title="0 orders" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC9AB0]" title="Low orders" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#B04D6D]" title="Moderate orders" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C3B]" title="Most orders" />
          <span className="text-[#7A1C3B] font-bold">More</span>
        </div>
      </div>

      {/* Main Split Inside Card: Exact India Choropleth SVG + Ranked Top Places */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Exact Geographic 36-State Map of India */}
        <div className="sm:col-span-7 relative rounded-2xl bg-[#FAF7F2]/80 border border-[#EFE8E1] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-45 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#D5CCC3 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />

          <svg
            viewBox={indiaMap.viewBox}
            className="relative z-10 w-full max-w-[270px] sm:max-w-[310px] h-auto select-none"
            role="img"
            aria-label="Exact India state-by-state order concentration map"
          >
            {indiaMap.locations.map((loc) => {
              const stat = stateStatsMap[loc.id];
              const orderCount = stat?.orders || 0;
              const isFocused = focusedStateId === loc.id;

              return (
                <path
                  key={loc.id}
                  d={loc.path}
                  fill={getStateFill(loc.id, orderCount, isFocused)}
                  stroke={isFocused ? '#1C1917' : '#FFFFFF'}
                  strokeWidth={isFocused ? '2' : '1.1'}
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredStateId(loc.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  onClick={() => setSelectedStateId(loc.id)}
                  className="cursor-pointer transition-colors duration-200"
                >
                  <title>{`${loc.name}: ${orderCount} order${orderCount === 1 ? '' : 's'}`}</title>
                </path>
              );
            })}

            {/* Exact Adirampattinam Studio Pin in coastal Tamil Nadu */}
            <g transform="translate(226, 622)" className="pointer-events-none">
              <circle
                r="13"
                fill="none"
                stroke="#7A1C3B"
                strokeWidth="2"
                opacity="0.6"
                className="animate-ping"
              />
              <circle r="4.5" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
            </g>

            {/* Proportional Hotspot Bubbles Showing Where More Orders Are */}
            {rankedStates.map((st, idx) => {
              const center = STATE_CENTERS[st.id];
              if (!center) return null;
              const [cx, cy] = center;
              const isTop = idx === 0;
              const ratio = st.orders / maxStateOrders;
              const radius = isTop ? 16 : Math.round(10 + ratio * 5);

              return (
                <g
                  key={`pin-${st.id}`}
                  transform={`translate(${cx}, ${cy})`}
                  onMouseEnter={() => setHoveredStateId(st.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  onClick={() => setSelectedStateId(st.id)}
                  className="cursor-pointer"
                >
                  <circle
                    r={radius}
                    fill={isTop ? '#1C1917' : '#7A1C3B'}
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                  />
                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isTop ? '13' : '11'}
                    fontWeight="bold"
                  >
                    {st.orders}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Inspected State Floating Readout Pill */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs border border-[#EFE8E1] shadow-2xs flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-[#1C1917] truncate">
                {focusedState?.name || 'Tamil Nadu'}
              </div>
              <div className="text-[10px] text-[#78716C] truncate">
                {focusedTopCities.length > 0
                  ? focusedTopCities.map(([c, n]) => `${c} (${n})`).join(', ')
                  : 'Tap states to inspect city breakdown'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-[#7A1C3B] tabular-nums">
                {focusedState?.orders || 0}{' '}
                {(focusedState?.orders || 0) === 1 ? 'order' : 'orders'}
              </div>
              <div className="font-mono text-[10px] text-[#78716C] tabular-nums">
                ₹{(focusedState?.revenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Exact Ranked Leaderboard ("Which Place Contains More Orders") */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-3 h-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              Most Orders By
            </span>
            <div className="inline-flex items-center bg-[#FAF7F2] border border-[#EFE8E1] p-0.5 rounded-full text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setRankMode('state')}
                className={`px-2.5 py-0.5 rounded-full active:scale-95 transition cursor-pointer ${rankMode === 'state' ? 'bg-[#1C1917] text-white' : 'text-[#6A5B60]'
                  }`}
              >
                State
              </button>
              <button
                type="button"
                onClick={() => setRankMode('city')}
                className={`px-2.5 py-0.5 rounded-full active:scale-95 transition cursor-pointer ${rankMode === 'city' ? 'bg-[#1C1917] text-white' : 'text-[#6A5B60]'
                  }`}
              >
                City
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {totalActiveOrders === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8E1] text-center space-y-1.5">
                <MapPin className="w-5 h-5 text-[#7A1C3B] mx-auto" />
                <div className="text-xs font-semibold text-[#1C1917]">
                  Awaiting Customer Orders
                </div>
                <p className="text-[11px] text-[#78716C] leading-relaxed">
                  Places with the most orders will light up automatically as orders arrive.
                </p>
              </div>
            ) : rankMode === 'state' ? (
              rankedStates.slice(0, 5).map((st, idx) => {
                const widthPct = Math.max(
                  10,
                  Math.round((st.orders / maxStateOrders) * 100)
                );
                const sharePct = Math.round((st.orders / totalActiveOrders) * 100);
                const isSelected = focusedStateId === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStateId(st.id)}
                    onMouseEnter={() => setHoveredStateId(st.id)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    className={`w-full text-left p-2.5 rounded-2xl border active:scale-[0.98] transition cursor-pointer space-y-1.5 ${isSelected
                      ? 'bg-[#F6E9EE]/70 border-[#7A1C3B]/40'
                      : 'bg-[#FAF7F2]/80 border-[#EFE8E1] hover:border-[#D9C8BC]'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#1C1917] truncate">
                        {idx + 1}. {st.name}
                      </span>
                      <span className="font-mono font-bold text-[#7A1C3B] tabular-nums shrink-0">
                        {st.orders} ({sharePct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white overflow-hidden border border-[#EFE8E1]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-[#7A1C3B]' : 'bg-[#1C1917]'
                          }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </button>
                );
              })
            ) : (
              rankedCities.slice(0, 5).map((cityRow, idx) => {
                const widthPct = Math.max(
                  10,
                  Math.round((cityRow.orders / maxCityOrders) * 100)
                );
                const sharePct = Math.round((cityRow.orders / totalActiveOrders) * 100);
                const isSelected = focusedStateId === cityRow.stateId;

                return (
                  <button
                    key={`${cityRow.city}-${cityRow.stateId}`}
                    type="button"
                    onClick={() => setSelectedStateId(cityRow.stateId)}
                    onMouseEnter={() => setHoveredStateId(cityRow.stateId)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    className={`w-full text-left p-2.5 rounded-2xl border active:scale-[0.98] transition cursor-pointer space-y-1.5 ${isSelected
                      ? 'bg-[#F6E9EE]/70 border-[#7A1C3B]/40'
                      : 'bg-[#FAF7F2]/80 border-[#EFE8E1] hover:border-[#D9C8BC]'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-[#1C1917] truncate block">
                          {idx + 1}. {cityRow.city}
                        </span>
                        <span className="text-[10px] text-[#8C827A] truncate block">
                          {cityRow.stateName}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#7A1C3B] tabular-nums shrink-0">
                        {cityRow.orders} ({sharePct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white overflow-hidden border border-[#EFE8E1]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-[#7A1C3B]' : 'bg-[#1C1917]'
                          }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-[#A8A29E] flex items-center justify-between pt-1">
            <span>Studio Hub: Adirampattinam, TN</span>
            <span>Map data © @svg-maps/india (CC BY 4.0)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
