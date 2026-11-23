import React from 'react';

// Flower generator with specific fill classes or inline colors
export function renderFlower(x: number, y: number, r: number, fill: string) {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180 - Math.PI / 2;
    const cx = (x + Math.cos(a) * r * 0.95).toFixed(1);
    const cy = (y + Math.sin(a) * r * 0.95).toFixed(1);
    petals.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={(r * 0.62).toFixed(1)}
        fill={fill}
      />
    );
  }
  return (
    <g>
      {petals}
      <circle cx={x} cy={y} r={(r * 0.42).toFixed(1)} fill="#f6d27a" />
    </g>
  );
}

export function CategoryArt({
  k,
  colors = ['#e0607e', '#7cc4a6', '#e0a93a'],
  className = 'w-full h-auto',
}: {
  k: string;
  colors?: [string, string, string];
  className?: string;
}) {
  const [c1, c2, c3] = colors;

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {k === 'bouquet' && (
        <>
          <path
            d="M60 70 L60 44 M50 68 L38 44 M70 68 L84 44"
            stroke="#3f8f6b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {renderFlower(60, 34, 15, c1)}
          {renderFlower(36, 42, 11, c3)}
          {renderFlower(84, 42, 11, c1)}
          <path d="M60 114 L28 62 Q60 50 92 62 Z" fill={c2} />
          <path d="M60 114 L42 68 Q60 62 78 68 Z" fill="#fff" opacity="0.28" />
          <ellipse cx="60" cy="86" rx="13" ry="6" fill="#f0c25a" />
          <circle cx="60" cy="86" r="4" fill="#c8922a" />
        </>
      )}

      {k === 'frame' && (
        <>
          <rect x="20" y="12" width="80" height="96" rx="3" fill={c3} />
          <rect x="29" y="21" width="62" height="78" fill="#fff" />
          <path
            d="M60 70 C42 56 46 40 55 40 C58 40 60 43 60 46 C60 43 62 40 65 40 C74 40 78 56 60 70Z"
            fill={c1}
          />
          <rect x="40" y="80" width="40" height="4" rx="2" fill="#d8c9cc" />
          <rect x="46" y="88" width="28" height="3" rx="1.5" fill="#e6dadd" />
        </>
      )}

      {k === 'hamper' && (
        <>
          <rect x="20" y="54" width="80" height="52" rx="4" fill={c1} />
          <rect x="14" y="40" width="92" height="18" rx="4" fill={c2} />
          <rect x="54" y="40" width="12" height="66" fill="#f0c25a" />
          <ellipse cx="46" cy="30" rx="14" ry="8" fill="#f0c25a" transform="rotate(-18 46 30)" />
          <ellipse cx="74" cy="30" rx="14" ry="8" fill="#f0c25a" transform="rotate(18 74 30)" />
          <circle cx="60" cy="35" r="6" fill="#c8922a" />
        </>
      )}

      {k === 'resin' && (
        <>
          <circle cx="60" cy="60" r="44" fill={c1} />
          <circle cx="60" cy="60" r="33" fill={c2} opacity="0.5" />
          {renderFlower(60, 62, 14, '#ffffff')}
          <ellipse cx="42" cy="38" rx="11" ry="6" fill="#fff" opacity="0.6" transform="rotate(-30 42 38)" />
          <circle cx="88" cy="80" r="2.6" fill="#fff" />
          <circle cx="34" cy="84" r="2.2" fill="#fff" />
        </>
      )}

      {k === 'keychain' && (
        <>
          <circle cx="60" cy="22" r="14" fill="none" stroke="#9a8a90" strokeWidth="4" />
          <path d="M60 36 L60 52" stroke="#9a8a90" strokeWidth="4" />
          <circle cx="60" cy="82" r="30" fill={c1} />
          <circle cx="60" cy="82" r="18" fill={c2} opacity="0.55" />
          <circle cx="60" cy="84" r="7" fill="#f6d27a" />
          <ellipse cx="46" cy="66" rx="8" ry="4.5" fill="#fff" opacity="0.65" transform="rotate(-35 46 66)" />
        </>
      )}

      {k === 'necklace' && (
        <>
          <path
            d="M20 16 Q60 108 100 16"
            fill="none"
            stroke="#c8922a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="34" cy="43" r="3" fill="#f0c25a" />
          <circle cx="86" cy="43" r="3" fill="#f0c25a" />
          <path
            d="M60 100 C40 84 44 66 54 66 C58 66 60 69 60 72 C60 69 62 66 66 66 C76 66 80 84 60 100Z"
            fill={c3}
          />
          <ellipse cx="53" cy="73" rx="3.5" ry="2.2" fill="#fff" opacity="0.7" transform="rotate(-35 53 73)" />
        </>
      )}

      {k === 'bracelet' && (
        <>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x = 60 + Math.cos(a) * 40;
            const y = 62 + Math.sin(a) * 31;
            const f = i % 3 === 0 ? c3 : i % 2 ? c1 : c2;
            return (
              <g key={i}>
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="8.5" fill={f} />
                <circle cx={(x - 2.5).toFixed(1)} cy={(y - 2.5).toFixed(1)} r="2" fill="#fff" opacity="0.7" />
              </g>
            );
          })}
        </>
      )}

      {k === 'handchain' && (
        <>
          <path
            d="M22 40 Q60 100 98 40"
            fill="none"
            stroke="#c8922a"
            strokeWidth="3.5"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="38" r="10" fill="none" stroke="#c8922a" strokeWidth="3.5" />
          <circle cx="102" cy="38" r="10" fill="none" stroke="#c8922a" strokeWidth="3.5" />
          <circle cx="60" cy="71" r="9" fill={c1} />
          <circle cx="40" cy="62" r="6" fill={c2} />
          <circle cx="80" cy="62" r="6" fill={c2} />
          <path d="M60 98 C48 90 50 82 60 85 C70 82 72 90 60 98Z" fill={c3} />
        </>
      )}

      {k === 'car' && (
        <>
          <path d="M60 38 L60 14" stroke="#9a8a90" strokeWidth="3" fill="none" />
          <circle cx="60" cy="12" r="6.5" fill={c3} />
          <path d="M10 88 Q12 68 36 64 L52 44 Q60 38 76 42 L92 64 Q112 68 112 88 Z" fill={c1} />
          <path d="M44 64 L56 48 L74 48 L86 64 Z" fill={c2} opacity="0.75" />
          <circle cx="34" cy="88" r="12" fill="#3a2a30" />
          <circle cx="92" cy="88" r="12" fill="#3a2a30" />
          <circle cx="34" cy="88" r="4.5" fill={c3} />
          <circle cx="92" cy="88" r="4.5" fill={c3} />
        </>
      )}

      {k !== 'bouquet' &&
        k !== 'frame' &&
        k !== 'hamper' &&
        k !== 'resin' &&
        k !== 'keychain' &&
        k !== 'necklace' &&
        k !== 'bracelet' &&
        k !== 'handchain' &&
        k !== 'car' && (
          <>
            <path d="M60 60 L16 34 L16 86 Z" fill={c1} />
            <path d="M60 60 L104 34 L104 86 Z" fill={c1} />
            <path d="M60 60 L30 50 L30 70 Z" fill={c2} opacity="0.7" />
            <path d="M60 60 L90 50 L90 70 Z" fill={c2} opacity="0.7" />
            <circle cx="60" cy="60" r="12" fill={c3} />
            <circle cx="56" cy="56" r="3" fill="#fff" opacity="0.7" />
          </>
        )}
    </svg>
  );
}

// Shape generator for bouquet items
export function BouquetShapeArt({
  shape,
  color,
  className = 'w-11 h-11',
}: {
  shape: string;
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      {shape === 'choc' && (
        <>
          <rect x="19" y="6" width="22" height="48" rx="3" fill={color} />
          <rect x="19" y="22" width="22" height="14" fill="#fff" opacity="0.9" />
          <rect x="19" y="6" width="22" height="6" rx="3" fill="#000" opacity="0.12" />
        </>
      )}

      {shape === 'photo' && (
        <>
          <rect x="11" y="6" width="38" height="48" rx="2" fill="#fff" stroke="rgba(0,0,0,.14)" />
          <rect x="16" y="11" width="28" height="28" fill={color} />
          <path
            d="M30 34 C22 28 23 22 27 22 C29 22 30 23 30 25 C30 23 31 22 33 22 C37 22 38 28 30 34Z"
            fill="#e0607e"
          />
        </>
      )}

      {shape === 'rose' && (
        <>
          <path d="M30 40 L30 57" stroke="#3f8f6b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {renderFlower(30, 28, 12, color)}
        </>
      )}

      {shape === 'bracelet' && (
        <>
          <circle cx="30" cy="30" r="19" fill="none" stroke={color} strokeWidth="8" />
          <circle cx="30" cy="11" r="4" fill="#fff" />
          <circle cx="49" cy="30" r="3" fill="#fff" opacity="0.8" />
        </>
      )}

      {shape === 'chain' && (
        <>
          <path d="M8 12 Q30 58 52 12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path
            d="M30 50 C22 44 23 37 27 37 C29 37 30 38 30 40 C30 38 31 37 33 37 C37 37 38 44 30 50Z"
            fill="#e0607e"
          />
        </>
      )}

      {shape === 'key' && (
        <>
          <circle cx="30" cy="11" r="8" fill="none" stroke="#9a8a90" strokeWidth="3.5" />
          <path d="M30 19 L30 27" stroke="#9a8a90" strokeWidth="3.5" />
          <circle cx="30" cy="41" r="15" fill={color} />
          <circle cx="30" cy="41" r="7" fill="#fff" opacity="0.7" />
        </>
      )}

      {shape === 'card' && (
        <>
          <rect x="9" y="14" width="42" height="32" rx="2" fill={color} stroke="rgba(0,0,0,.12)" />
          <path d="M9 16 L30 33 L51 16" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1.5" />
        </>
      )}

      {shape !== 'choc' &&
        shape !== 'photo' &&
        shape !== 'rose' &&
        shape !== 'bracelet' &&
        shape !== 'chain' &&
        shape !== 'key' &&
        shape !== 'card' &&
        renderFlower(30, 30, 13, color)}
    </svg>
  );
}

// Brand Logo Gift Box Icon with Ribbon
export function BrandLogoSvg({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="34"
      height="34"
      className={className}
      style={{ maxWidth: '34px', maxHeight: '34px', display: 'inline-block' }}
      aria-hidden="true"
    >
      <rect x="5" y="17" width="30" height="19" rx="2.5" fill="#c5a059" />
      <rect x="3" y="11" width="34" height="8" rx="2.5" fill="#7a1c3b" />
      <rect x="18" y="11" width="4" height="25" fill="#fbf3e4" />
      <path d="M20 11C14 2 8 6 20 11 32 6 26 2 20 11z" fill="#7a1c3b" />
    </svg>
  );
}

// Split Hero Layered Artwork (Hero Art)
export function HeroArtwork() {
  return (
    <div className="relative aspect-[5/4] bg-[radial-gradient(circle_at_28%_24%,#8d2b4c,#5a1230_70%)] rounded-[14px] overflow-hidden">
      {/* Soft golden spotlight circle */}
      <div className="absolute w-[62%] aspect-square left-[20%] top-[14%] rounded-full bg-[rgba(240,194,90,0.2)]" />

      {/* Layered Floating Artifacts */}
      {/* 1. Bouquet */}
      <span className="absolute w-[44%] left-[6%] top-[20%] drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)]">
        <CategoryArt k="bouquet" colors={['#e0a93a', '#7cc4a6', '#e0607e']} />
      </span>

      {/* 2. Frame */}
      <span className="absolute w-[26%] left-[58%] top-[8%] drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)]">
        <CategoryArt k="frame" colors={['#e0a93a', '#a8324f', '#e0607e']} />
      </span>

      {/* 3. Hamper */}
      <span className="absolute w-[32%] left-[56%] top-[50%] drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)]">
        <CategoryArt k="hamper" colors={['#e0607e', '#b79be0', '#e0a93a']} />
      </span>

      {/* 4. Necklace */}
      <span className="absolute w-[22%] left-[40%] top-[6%] drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)]">
        <CategoryArt k="necklace" colors={['#e0a93a', '#b79be0', '#e0607e']} />
      </span>
    </div>
  );
}
