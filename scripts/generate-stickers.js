const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const strokeProps = 'stroke="#2D1527" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';

const stickers = {
  'sunflower-bouquet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow)">
        <!-- White sticker background contour -->
        <path d="M 60 40 Q 100 15 140 40 Q 175 75 160 115 L 115 185 Q 100 195 85 185 L 40 115 Q 25 75 60 40 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        
        <!-- Wrapper kraft paper -->
        <path d="M 70 95 L 100 180 L 130 95 Q 100 105 70 95 Z" fill="#E2BA86" ${strokeProps} />
        <path d="M 65 92 L 100 180" stroke="#C59B27" stroke-width="2" stroke-dasharray="3 3"/>
        <!-- Ribbon bow -->
        <path d="M 90 135 C 80 130 75 145 88 142 C 96 140 100 138 100 138 C 100 138 104 140 112 142 C 125 145 120 130 110 135 Z" fill="#7A1C30" ${strokeProps} />
        <circle cx="100" cy="137" r="4" fill="#D4AF37" ${strokeProps} />
        <path d="M 97 141 L 90 160" stroke="#7A1C30" stroke-width="3" stroke-linecap="round"/>
        <path d="M 103 141 L 110 160" stroke="#7A1C30" stroke-width="3" stroke-linecap="round"/>

        <!-- Leaves -->
        <path d="M 60 80 Q 45 70 52 55 Q 70 65 68 80 Z" fill="#86C5AE" ${strokeProps} />
        <path d="M 140 80 Q 155 70 148 55 Q 130 65 132 80 Z" fill="#86C5AE" ${strokeProps} />

        <!-- Petals -->
        <g fill="#F5B731" ${strokeProps}>
          <ellipse cx="100" cy="35" rx="10" ry="18" />
          <ellipse cx="100" cy="85" rx="10" ry="18" />
          <ellipse cx="75" cy="60" rx="18" ry="10" />
          <ellipse cx="125" cy="60" rx="18" ry="10" />
          <ellipse cx="82" cy="42" rx="11" ry="16" transform="rotate(-45 82 42)" />
          <ellipse cx="118" cy="42" rx="11" ry="16" transform="rotate(45 118 42)" />
          <ellipse cx="82" cy="78" rx="11" ry="16" transform="rotate(45 82 78)" />
          <ellipse cx="118" cy="78" rx="11" ry="16" transform="rotate(-45 118 78)" />
        </g>
        
        <!-- Sunflower center -->
        <circle cx="100" cy="60" r="18" fill="#5A2E16" ${strokeProps} />
        <circle cx="100" cy="60" r="13" fill="#6B3A1C" />
        <circle cx="95" cy="56" r="2" fill="#D4AF37" />
        <circle cx="104" cy="58" r="2" fill="#D4AF37" />
        <circle cx="98" cy="64" r="2" fill="#D4AF37" />

        <!-- Sparkles -->
        <path d="M 145 35 L 147 40 L 152 42 L 147 44 L 145 49 L 143 44 L 138 42 L 143 40 Z" fill="#D4AF37" />
        <path d="M 52 40 L 53 43 L 56 44 L 53 45 L 52 48 L 51 45 L 48 44 L 51 43 Z" fill="#D4AF37" />
      </g>
    </svg>`,

  'rose-7-bouquet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-2">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-2)">
        <path d="M 55 45 Q 100 20 145 45 Q 170 80 155 120 L 115 185 Q 100 195 85 185 L 45 120 Q 30 80 55 45 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <!-- Wrap -->
        <path d="M 60 90 L 100 185 L 140 90 Q 100 102 60 90 Z" fill="#FCE7EC" ${strokeProps} />
        <path d="M 68 85 L 100 185" stroke="#E88299" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M 132 85 L 100 185" stroke="#E88299" stroke-width="2" stroke-dasharray="3 3"/>
        
        <!-- Satin Ribbon -->
        <circle cx="100" cy="135" r="5" fill="#C59B27" ${strokeProps} />
        <path d="M 100 135 C 80 125 78 145 95 138 C 100 136 100 136 100 136 C 100 136 100 136 105 138 C 122 145 120 125 100 135 Z" fill="#7A1C30" ${strokeProps} />
        <path d="M 97 140 L 88 165" stroke="#7A1C30" stroke-width="3"/>
        <path d="M 103 140 L 112 165" stroke="#7A1C30" stroke-width="3"/>

        <!-- Leaves -->
        <path d="M 65 65 Q 50 60 55 45 Q 70 50 70 65 Z" fill="#7BBFA6" ${strokeProps}/>
        <path d="M 135 65 Q 150 60 145 45 Q 130 50 130 65 Z" fill="#7BBFA6" ${strokeProps}/>

        <!-- Roses -->
        <g fill="#A92642" ${strokeProps}>
          <!-- Rose 1 (Top Center) -->
          <circle cx="100" cy="42" r="14" fill="#921B34"/>
          <path d="M 95 38 Q 100 32 105 38 Q 108 46 100 47 Q 92 46 95 38 Z" fill="#D94363"/>
          
          <!-- Rose 2 (Left) -->
          <circle cx="75" cy="55" r="13" fill="#A92642"/>
          <path d="M 72 52 Q 76 47 80 52 Q 82 58 76 59 Q 70 58 72 52 Z" fill="#E85D7B"/>

          <!-- Rose 3 (Right) -->
          <circle cx="125" cy="55" r="13" fill="#A92642"/>
          <path d="M 122 52 Q 126 47 130 52 Q 132 58 126 59 Q 120 58 122 52 Z" fill="#E85D7B"/>

          <!-- Rose 4 (Mid Left) -->
          <circle cx="82" cy="78" r="12" fill="#7A1C30"/>
          <circle cx="118" cy="78" r="12" fill="#7A1C30"/>
          <circle cx="100" cy="70" r="14" fill="#A92642"/>
          <path d="M 97 67 Q 100 62 103 67 Q 105 73 100 74 Q 95 73 97 67 Z" fill="#FF7B97"/>
          
          <!-- Baby's breath small white dots -->
          <circle cx="68" cy="40" r="3" fill="#FFFFFF" stroke="#2D1527" stroke-width="1.5"/>
          <circle cx="132" cy="40" r="3" fill="#FFFFFF" stroke="#2D1527" stroke-width="1.5"/>
          <circle cx="100" cy="22" r="3" fill="#FFFFFF" stroke="#2D1527" stroke-width="1.5"/>
        </g>
      </g>
    </svg>`,

  'rose-17-bouquet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-3">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-3)">
        <path d="M 45 40 Q 100 15 155 40 Q 180 80 160 125 L 115 185 Q 100 195 85 185 L 40 125 Q 20 80 45 40 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <!-- Double paper wrap -->
        <path d="M 48 95 L 100 188 L 152 95 Q 100 110 48 95 Z" fill="#2D1527" ${strokeProps} />
        <path d="M 58 92 L 100 185 L 142 92 Q 100 104 58 92 Z" fill="#FFF2EC" ${strokeProps} />
        
        <!-- Gold ribbon -->
        <path d="M 90 138 C 75 130 75 150 95 142 L 105 142 C 125 150 125 130 110 138 Z" fill="#D4AF37" ${strokeProps} />
        <circle cx="100" cy="140" r="5" fill="#7A1C30" ${strokeProps}/>
        <path d="M 96 145 L 86 172" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
        <path d="M 104 145 L 114 172" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>

        <!-- Rose blooms array -->
        <g fill="#8B1E3F" ${strokeProps}>
          <circle cx="100" cy="35" r="12" fill="#7A1C30"/>
          <circle cx="80" cy="38" r="11" fill="#A92642"/>
          <circle cx="120" cy="38" r="11" fill="#A92642"/>
          <circle cx="62" cy="48" r="11" fill="#7A1C30"/>
          <circle cx="138" cy="48" r="11" fill="#7A1C30"/>
          <circle cx="100" cy="55" r="13" fill="#C93257"/>
          <circle cx="78" cy="60" r="12" fill="#A92642"/>
          <circle cx="122" cy="60" r="12" fill="#A92642"/>
          <circle cx="55" cy="68" r="10" fill="#7A1C30"/>
          <circle cx="145" cy="68" r="10" fill="#7A1C30"/>
          <circle cx="100" cy="78" r="13" fill="#8B1E3F"/>
          <circle cx="75" cy="80" r="11" fill="#A92642"/>
          <circle cx="125" cy="80" r="11" fill="#A92642"/>
          <!-- Gold foil sparkles -->
          <circle cx="100" cy="55" r="3" fill="#D4AF37" stroke="none"/>
          <circle cx="80" cy="38" r="2.5" fill="#D4AF37" stroke="none"/>
          <circle cx="120" cy="38" r="2.5" fill="#D4AF37" stroke="none"/>
        </g>
      </g>
    </svg>`,

  'kitkat-bouquet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-4">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-4)">
        <path d="M 50 40 L 150 40 L 155 110 L 115 185 L 85 185 L 45 110 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <!-- Brown Kraft cone -->
        <path d="M 55 90 L 100 185 L 145 90 Q 100 100 55 90 Z" fill="#E2BA86" ${strokeProps} />
        <path d="M 85 135 L 115 135 L 100 150 Z" fill="#7A1C30" ${strokeProps} />

        <!-- KitKat Sticks -->
        <!-- Center stick -->
        <rect x="88" y="25" width="24" height="60" rx="3" fill="#D71920" ${strokeProps} transform="rotate(-3 100 55)"/>
        <text x="91" y="55" font-family="sans-serif" font-weight="900" font-size="8" fill="#FFFFFF" transform="rotate(-90 91 55)">KitKat</text>
        
        <!-- Left stick -->
        <rect x="62" y="35" width="22" height="55" rx="3" fill="#D71920" ${strokeProps} transform="rotate(-18 73 62)"/>
        <text x="65" y="65" font-family="sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" transform="rotate(-108 65 65)">KitKat</text>

        <!-- Right stick -->
        <rect x="116" y="35" width="22" height="55" rx="3" fill="#D71920" ${strokeProps} transform="rotate(15 127 62)"/>
        <text x="119" y="65" font-family="sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" transform="rotate(-75 119 65)">KitKat</text>

        <!-- Red flower accents -->
        <circle cx="75" cy="85" r="9" fill="#A92642" ${strokeProps} />
        <circle cx="125" cy="85" r="9" fill="#A92642" ${strokeProps} />
        <circle cx="100" cy="90" r="10" fill="#E88299" ${strokeProps} />
      </g>
    </svg>`,

  'photo-bouquet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-5">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-5)">
        <path d="M 50 40 L 150 40 L 155 110 L 115 185 L 85 185 L 45 110 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <!-- Mint Wrap -->
        <path d="M 60 95 L 100 185 L 140 95 Q 100 105 60 95 Z" fill="#A7D7C5" ${strokeProps} />
        <!-- Jute bow -->
        <circle cx="100" cy="138" r="5" fill="#E2BA86" ${strokeProps}/>

        <!-- Polaroids on sticks -->
        <!-- Center polaroid -->
        <g transform="rotate(-4 100 55)">
          <line x1="100" y1="55" x2="100" y2="100" stroke="#8C6239" stroke-width="3"/>
          <rect x="80" y="25" width="40" height="48" rx="2" fill="#FFFFFF" ${strokeProps} />
          <rect x="84" y="29" width="32" height="30" fill="#E8F6F0"/>
          <!-- Little heart silhouette inside photo -->
          <path d="M 100 48 C 96 42 90 44 92 48 C 94 52 100 56 100 56 C 100 56 106 52 108 48 C 110 44 104 42 100 48 Z" fill="#E88299"/>
        </g>

        <!-- Left polaroid -->
        <g transform="rotate(-20 68 65)">
          <line x1="68" y1="65" x2="85" y2="100" stroke="#8C6239" stroke-width="3"/>
          <rect x="52" y="38" width="34" height="42" rx="2" fill="#FFFFFF" ${strokeProps} />
          <rect x="55" y="41" width="28" height="26" fill="#FDEBF0"/>
          <circle cx="69" cy="54" r="5" fill="#D4AF37"/>
        </g>

        <!-- Right polaroid -->
        <g transform="rotate(18 132 65)">
          <line x1="132" y1="65" x2="115" y2="100" stroke="#8C6239" stroke-width="3"/>
          <rect x="114" y="38" width="34" height="42" rx="2" fill="#FFFFFF" ${strokeProps} />
          <rect x="117" y="41" width="28" height="26" fill="#EBF6FC"/>
          <!-- Smile -->
          <circle cx="131" cy="54" r="5" fill="#76BBE3"/>
        </g>
      </g>
    </svg>`,

  'nikah-frame.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-6">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-6)">
        <!-- White sticker contour -->
        <rect x="35" y="25" width="130" height="150" rx="8" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <!-- Outer wooden gold frame -->
        <rect x="40" y="30" width="120" height="140" rx="6" fill="#C59B27" ${strokeProps} />
        <!-- Inner white passe-partout -->
        <rect x="50" y="40" width="100" height="120" rx="4" fill="#FFFDF8" ${strokeProps} />
        
        <!-- Islamic Arch header -->
        <path d="M 65 65 C 65 50 100 42 100 42 C 100 42 135 50 135 65 L 135 72 L 65 72 Z" fill="#FDEBF0" ${strokeProps} />
        
        <!-- Arabic Calligraphy stylized curve (Bismillah / Love) -->
        <path d="M 78 58 Q 88 52 100 52 Q 112 52 122 58 M 92 64 Q 100 60 108 64" stroke="#7A1C30" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="100" cy="46" r="2" fill="#D4AF37"/>

        <!-- Names & Date -->
        <text x="100" y="90" font-family="serif" font-weight="bold" font-size="10" fill="#2D1527" text-anchor="middle">Zayd &amp; Ayesha</text>
        <path d="M 80 96 L 120 96" stroke="#D4AF37" stroke-width="1.5"/>
        <circle cx="100" cy="96" r="2.5" fill="#7A1C30"/>
        <text x="100" y="108" font-family="sans-serif" font-size="6.5" fill="#5E3C57" text-anchor="middle">14 · NOVEMBER · 2026</text>
        
        <!-- Quranic verse excerpt -->
        <rect x="58" y="118" width="84" height="28" rx="3" fill="#FFF1EB" stroke="#D4AF37" stroke-width="1"/>
        <text x="100" y="128" font-family="serif" font-style="italic" font-size="5.5" fill="#7A1C30" text-anchor="middle">“And He created between you</text>
        <text x="100" y="137" font-family="serif" font-style="italic" font-size="5.5" fill="#7A1C30" text-anchor="middle">love and compassion...” (30:21)</text>

        <!-- Corner floral flourishes -->
        <circle cx="56" cy="46" r="3" fill="#7BBFA6"/>
        <circle cx="144" cy="46" r="3" fill="#7BBFA6"/>
        <circle cx="56" cy="154" r="3" fill="#7BBFA6"/>
        <circle cx="144" cy="154" r="3" fill="#7BBFA6"/>
      </g>
    </svg>`,

  'keepsake-frame.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-7">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-7)">
        <rect x="40" y="25" width="120" height="150" rx="8" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12"/>
        <rect x="45" y="30" width="110" height="140" rx="5" fill="#E2BA86" ${strokeProps}/>
        <rect x="55" y="40" width="90" height="120" rx="3" fill="#F4FAF7" ${strokeProps}/>
        
        <!-- Pressed green botanicals inside glass -->
        <path d="M 62 140 Q 75 100 70 60" stroke="#7BBFA6" stroke-width="2"/>
        <ellipse cx="65" cy="90" rx="6" ry="3" fill="#7BBFA6" transform="rotate(-30 65 90)"/>
        <ellipse cx="73" cy="105" rx="6" ry="3" fill="#7BBFA6" transform="rotate(30 73 105)"/>
        <ellipse cx="66" cy="75" rx="5" ry="2.5" fill="#86C5AE" transform="rotate(-25 66 75)"/>

        <!-- Mini photo clipped -->
        <rect x="85" y="55" width="50" height="60" rx="2" fill="#FFFFFF" ${strokeProps}/>
        <rect x="88" y="58" width="44" height="42" fill="#FFF2EC"/>
        <circle cx="110" cy="75" r="9" fill="#E88299"/>
        <text x="110" y="110" font-family="cursive" font-size="6" fill="#2D1527" text-anchor="middle">happy days ✨</text>
        
        <!-- Brass clip -->
        <rect x="105" y="51" width="10" height="8" rx="2" fill="#C59B27" ${strokeProps}/>
      </g>
    </svg>`,

  'gift-for-her.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-8">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-8)">
        <path d="M 35 70 L 165 70 L 160 170 L 40 170 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        
        <!-- Gift box base -->
        <rect x="42" y="90" width="116" height="75" rx="4" fill="#FDEBF0" ${strokeProps}/>
        <rect x="38" y="78" width="124" height="18" rx="4" fill="#F8B195" ${strokeProps}/>
        
        <!-- Ribbon bands -->
        <rect x="94" y="78" width="12" height="87" fill="#7A1C30"/>
        
        <!-- Big plush ribbon bow on top -->
        <path d="M 100 78 C 80 60 70 75 92 78 C 100 78 100 78 100 78 C 100 78 100 78 108 78 C 130 75 120 60 100 78 Z" fill="#7A1C30" ${strokeProps}/>
        <circle cx="100" cy="78" r="6" fill="#D4AF37" ${strokeProps}/>
        
        <!-- Items peeking out / illustrated in front -->
        <!-- Perfume bottle -->
        <rect x="52" y="105" width="24" height="34" rx="4" fill="#FFF2EC" ${strokeProps}/>
        <rect x="59" y="98" width="10" height="7" rx="1" fill="#D4AF37" ${strokeProps}/>
        <circle cx="64" cy="120" r="5" fill="#E88299"/>

        <!-- Gold necklace pendant -->
        <circle cx="100" cy="115" r="7" fill="#D4AF37" ${strokeProps}/>
        <path d="M 88 95 Q 100 110 112 95" stroke="#C59B27" stroke-width="2"/>

        <!-- Chocolate bar -->
        <rect x="122" y="108" width="26" height="32" rx="2" fill="#5A2E16" ${strokeProps}/>
        <rect x="122" y="118" width="26" height="12" fill="#D4AF37"/>

        <!-- Tag -->
        <path d="M 68 148 L 88 148 L 84 160 L 64 160 Z" fill="#FEF08A" ${strokeProps}/>
        <text x="76" y="156" font-family="cursive" font-size="6" fill="#2D1527" text-anchor="middle">for you ♥</text>
      </g>
    </svg>`,

  'chocolate-rose.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-9">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-9)">
        <!-- Heart box contour -->
        <path d="M 100 165 C 50 135 30 100 35 65 C 40 40 70 35 100 60 C 130 35 160 40 165 65 C 170 100 150 135 100 165 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <path d="M 100 160 C 52 132 35 98 40 68 C 44 45 70 40 100 63 C 130 40 156 45 160 68 C 165 98 148 132 100 160 Z" fill="#7A1C30" ${strokeProps}/>
        <path d="M 100 152 C 58 126 44 96 48 72 C 52 52 74 48 100 68 C 126 48 148 52 152 72 C 156 96 142 126 100 152 Z" fill="#581020"/>
        
        <!-- Chocolates in wrappers -->
        <circle cx="75" cy="85" r="11" fill="#D4AF37" ${strokeProps}/>
        <circle cx="125" cy="85" r="11" fill="#D4AF37" ${strokeProps}/>
        <circle cx="100" cy="120" r="12" fill="#D4AF37" ${strokeProps}/>
        <!-- Forever Roses inside -->
        <circle cx="100" cy="88" r="12" fill="#E88299" ${strokeProps}/>
        <circle cx="75" cy="115" r="11" fill="#C93257" ${strokeProps}/>
        <circle cx="125" cy="115" r="11" fill="#C93257" ${strokeProps}/>
      </g>
    </svg>`,

  'blind-date-book.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-10">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-10)" transform="rotate(-3 100 100)">
        <rect x="45" y="35" width="110" height="135" rx="6" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12"/>
        <!-- Kraft paper wrapped book -->
        <rect x="50" y="40" width="100" height="125" rx="4" fill="#D8A874" ${strokeProps}/>
        <!-- Book thickness / spine shadow -->
        <path d="M 50 40 L 58 40 L 58 165 L 50 165 Z" fill="#C08F5A"/>

        <!-- Jute twine tied crosswise -->
        <line x1="50" y1="95" x2="150" y2="95" stroke="#7A5229" stroke-width="3" stroke-dasharray="4 2"/>
        <line x1="105" y1="40" x2="105" y2="165" stroke="#7A5229" stroke-width="3" stroke-dasharray="4 2"/>
        
        <!-- Twine bow -->
        <circle cx="105" cy="95" r="5" fill="#E2BA86" ${strokeProps}/>

        <!-- Clue tag taped to book -->
        <rect x="68" y="112" width="65" height="42" rx="3" fill="#FFFDF8" ${strokeProps} transform="rotate(4 100 133)"/>
        <text x="100" y="125" font-family="sans-serif" font-weight="bold" font-size="6" fill="#7A1C30" text-anchor="middle">BLIND DATE CLUE</text>
        <text x="100" y="134" font-family="cursive" font-size="6.5" fill="#2D1527" text-anchor="middle">“enemies to lovers</text>
        <text x="100" y="143" font-family="cursive" font-size="6.5" fill="#2D1527" text-anchor="middle">&amp; rainy tea shop...”</text>

        <!-- Red Wax seal with question mark -->
        <circle cx="132" cy="62" r="13" fill="#7A1C30" ${strokeProps}/>
        <text x="132" y="68" font-family="serif" font-weight="bold" font-size="14" fill="#D4AF37" text-anchor="middle">?</text>
      </g>
    </svg>`,

  'resin-clock.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-11">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-11)">
        <circle cx="100" cy="100" r="70" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12"/>
        <circle cx="100" cy="100" r="65" fill="#E8D1B5" ${strokeProps}/>
        <!-- Wooden sand beach base -->
        <circle cx="100" cy="100" r="61" fill="#DFB88B"/>
        
        <!-- Layer 1: Aqua sea -->
        <path d="M 45 75 Q 80 120 155 75 A 61 61 0 0 1 155 125 Q 100 160 45 125 A 61 61 0 0 1 45 75 Z" fill="#3AAFA9"/>
        <!-- Layer 2: Deep ocean navy -->
        <path d="M 42 105 Q 100 145 158 105 A 61 61 0 0 1 100 161 A 61 61 0 0 1 42 105 Z" fill="#17252A"/>
        
        <!-- Seafoam white lace pattern -->
        <path d="M 45 75 Q 70 85 95 80 Q 120 75 155 75" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 2"/>
        <path d="M 45 105 Q 85 118 120 110 Q 140 106 158 105" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 2"/>

        <!-- Clock hands & center brass pin -->
        <circle cx="100" cy="100" r="4.5" fill="#D4AF37" ${strokeProps}/>
        <line x1="100" y1="100" x2="100" y2="65" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="100" x2="125" y2="100" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
        
        <!-- Hour markers -->
        <circle cx="100" cy="46" r="2.5" fill="#D4AF37"/>
        <circle cx="154" cy="100" r="2.5" fill="#D4AF37"/>
        <circle cx="100" cy="154" r="2.5" fill="#D4AF37"/>
        <circle cx="46" cy="100" r="2.5" fill="#D4AF37"/>
      </g>
    </svg>`,

  'resin-keychain.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-12">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-12)" transform="rotate(-5 100 100)">
        <!-- Keyring hardware -->
        <circle cx="70" cy="40" r="16" fill="none" stroke="#D4AF37" stroke-width="4.5"/>
        <path d="M 70 56 L 70 70 L 80 80" stroke="#D4AF37" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="80" cy="80" r="3" fill="#D4AF37"/>

        <!-- White sticker background for letter M -->
        <path d="M 68 85 L 85 85 L 102 118 L 118 85 L 135 85 L 135 155 L 118 155 L 118 115 L 105 140 L 98 140 L 85 115 L 85 155 L 68 155 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="14" stroke-linejoin="round"/>
        
        <!-- Resin Letter M body (translucent gloss look) -->
        <path d="M 70 90 L 85 90 L 102 120 L 118 90 L 133 90 L 133 150 L 118 150 L 118 112 L 105 136 L 98 136 L 85 112 L 85 150 L 70 150 Z" fill="#F4FAF7" ${strokeProps}/>
        
        <!-- Gold flakes inside resin -->
        <polygon points="76,96 79,93 81,97 78,99" fill="#D4AF37"/>
        <polygon points="122,96 125,93 128,97 125,100" fill="#D4AF37"/>
        <polygon points="100,126 103,122 106,127 102,129" fill="#D4AF37"/>
        <polygon points="74,136 78,133 79,139 73,140" fill="#D4AF37"/>
        <polygon points="124,134 128,131 129,137 125,138" fill="#D4AF37"/>
        <!-- Freshwater pearl dot -->
        <circle cx="101" cy="110" r="3.5" fill="#FFF9E6" stroke="#C59B27" stroke-width="1"/>

        <!-- Fluffy peach tassel hanging -->
        <path d="M 60 48 Q 50 65 48 95 Q 56 95 62 95 Q 60 65 60 48 Z" fill="#F6A98A" ${strokeProps}/>
        <circle cx="58" cy="56" r="3" fill="#D4AF37"/>
      </g>
    </svg>`,

  'starlight-chain.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-13">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-13)">
        <path d="M 40 40 Q 100 170 160 40" stroke="#FFFFFF" stroke-width="14" fill="none"/>
        <circle cx="100" cy="130" r="28" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10"/>

        <!-- Dainty snake chain loop -->
        <path d="M 40 40 Q 100 170 160 40" stroke="#D4AF37" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M 40 40 Q 100 170 160 40" stroke="#2D1527" stroke-width="1" stroke-dasharray="2 3" fill="none"/>

        <!-- Starlight Medallion Pendant -->
        <circle cx="100" cy="130" r="22" fill="#D4AF37" ${strokeProps}/>
        <circle cx="100" cy="130" r="18" fill="#C59B27"/>

        <!-- 8-Point North Star Embossing -->
        <path d="M 100 114 L 103 126 L 115 130 L 103 134 L 100 146 L 97 134 L 85 130 L 97 126 Z" fill="#FFFDF8" ${strokeProps}/>
        <circle cx="100" cy="130" r="2.5" fill="#76BBE3"/>
      </g>
    </svg>`,

  'charm-anklet.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-14">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-14)">
        <path d="M 30 75 Q 100 160 170 75" stroke="#FFFFFF" stroke-width="14" fill="none"/>
        <!-- Beaded chain -->
        <path d="M 30 75 Q 100 160 170 75" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" fill="none"/>
        
        <!-- Dangling charms -->
        <!-- Charm 1: Pearl droplet -->
        <circle cx="65" cy="100" r="5" fill="#FFF8F5" ${strokeProps}/>
        <line x1="65" y1="92" x2="65" y2="95" stroke="#D4AF37" stroke-width="2"/>
        
        <!-- Charm 2: Crescent moon -->
        <path d="M 100 120 C 95 125 95 135 102 138 C 96 138 92 130 96 124 Z" fill="#D4AF37" ${strokeProps}/>
        <line x1="99" y1="114" x2="99" y2="120" stroke="#D4AF37" stroke-width="2"/>

        <!-- Charm 3: Dewdrop -->
        <circle cx="135" cy="100" r="5" fill="#76BBE3" ${strokeProps}/>
        <line x1="135" y1="92" x2="135" y2="95" stroke="#D4AF37" stroke-width="2"/>
      </g>
    </svg>`,

  'hand-chain.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-15">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-15)">
        <!-- Finger ring at top -->
        <ellipse cx="100" cy="35" rx="14" ry="7" fill="none" stroke="#FFFFFF" stroke-width="12"/>
        <ellipse cx="100" cy="35" rx="14" ry="7" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <circle cx="100" cy="31" r="4" fill="#C93257" ${strokeProps}/>

        <!-- Central cascade chain -->
        <line x1="100" y1="42" x2="100" y2="95" stroke="#FFFFFF" stroke-width="12"/>
        <line x1="100" y1="42" x2="100" y2="95" stroke="#D4AF37" stroke-width="3" stroke-dasharray="3 3"/>

        <!-- Central floral medallion (Hathphool center) -->
        <circle cx="100" cy="100" r="16" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10"/>
        <circle cx="100" cy="100" r="14" fill="#D4AF37" ${strokeProps}/>
        <!-- Petals -->
        <circle cx="100" cy="92" r="3.5" fill="#FFF9E6" ${strokeProps}/>
        <circle cx="108" cy="100" r="3.5" fill="#FFF9E6" ${strokeProps}/>
        <circle cx="100" cy="108" r="3.5" fill="#FFF9E6" ${strokeProps}/>
        <circle cx="92" cy="100" r="3.5" fill="#FFF9E6" ${strokeProps}/>
        <circle cx="100" cy="100" r="4" fill="#7A1C30"/>

        <!-- Twin chains branching to wrist -->
        <path d="M 90 108 Q 65 130 50 155" stroke="#FFFFFF" stroke-width="10" fill="none"/>
        <path d="M 110 108 Q 135 130 150 155" stroke="#FFFFFF" stroke-width="10" fill="none"/>
        <path d="M 90 108 Q 65 130 50 155" stroke="#D4AF37" stroke-width="3" stroke-dasharray="3 3" fill="none"/>
        <path d="M 110 108 Q 135 130 150 155" stroke="#D4AF37" stroke-width="3" stroke-dasharray="3 3" fill="none"/>

        <!-- Wrist bangle -->
        <path d="M 40 155 Q 100 180 160 155" stroke="#FFFFFF" stroke-width="12" fill="none"/>
        <path d="M 40 155 Q 100 180 160 155" stroke="#D4AF37" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      </g>
    </svg>`,

  'henna-cone.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-16">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-16)" transform="rotate(-20 100 100)">
        <polygon points="90,20 120,20 105,175" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="14" stroke-linejoin="round"/>
        <!-- Henna cone foil body -->
        <polygon points="90,25 120,25 105,170" fill="#7BBFA6" ${strokeProps}/>
        
        <!-- Paisley foil wrap pattern -->
        <path d="M 93 45 Q 105 40 117 45" stroke="#2D1527" stroke-width="2"/>
        <path d="M 96 70 Q 105 65 114 70" stroke="#2D1527" stroke-width="2"/>
        <path d="M 98 100 Q 105 95 112 100" stroke="#2D1527" stroke-width="2"/>
        <circle cx="105" cy="55" r="3" fill="#C59B27"/>
        <circle cx="105" cy="85" r="3" fill="#C59B27"/>

        <!-- Gold seal tape on top -->
        <rect x="86" y="20" width="38" height="10" rx="2" fill="#D4AF37" ${strokeProps}/>
        <!-- Fine nozzle pin -->
        <circle cx="105" cy="172" r="2" fill="#7A1C30"/>
      </g>
    </svg>`,

  'crochet-clips.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-17">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-17)">
        <!-- Clip 1: Daisy (Left) -->
        <g transform="rotate(-10 65 90)">
          <!-- Metal alligator clip base -->
          <rect x="35" y="86" width="60" height="12" rx="6" fill="#C0C0C0" ${strokeProps}/>
          <!-- Knitted Daisy -->
          <g fill="#FFFFFF" ${strokeProps}>
            <circle cx="50" cy="74" r="8"/>
            <circle cx="62" cy="74" r="8"/>
            <circle cx="70" cy="84" r="8"/>
            <circle cx="66" cy="96" r="8"/>
            <circle cx="54" cy="98" r="8"/>
            <circle cx="44" cy="90" r="8"/>
            <circle cx="44" cy="78" r="8"/>
          </g>
          <circle cx="56" cy="86" r="9" fill="#F5B731" ${strokeProps}/>
        </g>

        <!-- Clip 2: Strawberry (Right) -->
        <g transform="rotate(12 135 110)">
          <rect x="105" y="106" width="60" height="12" rx="6" fill="#C0C0C0" ${strokeProps}/>
          <!-- Knitted Strawberry body -->
          <path d="M 125 90 C 145 90 150 115 135 130 C 120 115 125 90 125 90 Z" fill="#E84855" ${strokeProps}/>
          <!-- Green leafy top -->
          <ellipse cx="128" cy="88" rx="6" ry="3" fill="#7BBFA6" ${strokeProps}/>
          <ellipse cx="136" cy="86" rx="5" ry="3" fill="#7BBFA6" ${strokeProps}/>
          <ellipse cx="144" cy="88" rx="6" ry="3" fill="#7BBFA6" ${strokeProps}/>
          <!-- Yellow seeds -->
          <circle cx="132" cy="102" r="1.5" fill="#FEF08A"/>
          <circle cx="138" cy="110" r="1.5" fill="#FEF08A"/>
          <circle cx="134" cy="118" r="1.5" fill="#FEF08A"/>
        </g>
      </g>
    </svg>`,

  'hibiscus-clips.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-18">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-18)">
        <circle cx="100" cy="100" r="55" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12"/>
        <!-- 5 Petal Hibiscus Claw Clip -->
        <g fill="#F4A6B6" ${strokeProps}>
          <path d="M 100 95 C 90 55 120 50 112 85 Z"/>
          <path d="M 100 95 C 135 75 155 105 115 105 Z"/>
          <path d="M 100 105 C 120 145 90 150 95 115 Z"/>
          <path d="M 95 105 C 60 135 45 105 85 98 Z"/>
          <path d="M 95 95 C 65 65 85 45 100 85 Z"/>
        </g>
        <!-- Center pistil -->
        <circle cx="100" cy="100" r="9" fill="#FFF2EC" ${strokeProps}/>
        <path d="M 100 100 Q 115 88 122 80" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="122" cy="80" r="3" fill="#D4AF37"/>
        <!-- Plastic claw teeth visible under -->
        <path d="M 85 110 L 85 120 M 95 112 L 95 122 M 105 112 L 105 122 M 115 110 L 115 120" stroke="#2D1527" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </svg>`,

  'car-toy.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-19">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-19)">
        <!-- Beetle car outline -->
        <path d="M 35 130 C 35 115 45 100 65 95 C 75 70 105 60 135 70 C 155 75 165 95 170 110 L 175 130 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="14" stroke-linejoin="round"/>
        
        <!-- Roof luggage rack -->
        <rect x="85" y="55" width="40" height="8" rx="2" fill="#C59B27" ${strokeProps}/>
        <!-- Mini luggage suitcase on roof -->
        <rect x="90" y="42" width="30" height="14" rx="2" fill="#E2BA86" ${strokeProps}/>
        <line x1="105" y1="42" x2="105" y2="56" stroke="#7A1C30" stroke-width="2"/>

        <!-- Car body in pastel turquoise -->
        <path d="M 35 130 C 35 115 45 100 65 95 C 75 70 105 60 135 70 C 155 75 165 95 170 110 L 175 130 Q 105 138 35 130 Z" fill="#76BBE3" ${strokeProps}/>
        
        <!-- Windows -->
        <path d="M 75 92 C 82 76 100 72 102 92 Z" fill="#FFFDF8" ${strokeProps}/>
        <path d="M 108 92 C 110 72 128 76 135 92 Z" fill="#FFFDF8" ${strokeProps}/>
        
        <!-- Door line -->
        <line x1="105" y1="92" x2="105" y2="132" stroke="#2D1527" stroke-width="2.5"/>
        <rect x="108" y="105" width="6" height="3" rx="1" fill="#D4AF37"/>

        <!-- Wheel arches & wheels -->
        <!-- Front wheel -->
        <circle cx="65" cy="135" r="14" fill="#2D1527"/>
        <circle cx="65" cy="135" r="7" fill="#E8D1B5" ${strokeProps}/>
        <!-- Rear wheel -->
        <circle cx="145" cy="135" r="14" fill="#2D1527"/>
        <circle cx="145" cy="135" r="7" fill="#E8D1B5" ${strokeProps}/>

        <!-- Headlight and bumper -->
        <circle cx="172" cy="112" r="5" fill="#FEF08A" ${strokeProps}/>
        <rect x="30" y="128" width="10" height="6" rx="2" fill="#C0C0C0" ${strokeProps}/>
        <rect x="168" y="128" width="10" height="6" rx="2" fill="#C0C0C0" ${strokeProps}/>
      </g>
    </svg>`,

  'wedding-favours.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <defs>
        <filter id="sticker-shadow-20">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2D1527" flood-opacity="0.15"/>
        </filter>
      </defs>
      <g filter="url(#sticker-shadow-20)">
        <rect x="40" y="60" width="120" height="100" rx="8" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="12"/>
        <rect x="45" y="70" width="110" height="90" rx="6" fill="#FFFDF8" ${strokeProps}/>
        
        <!-- Hamper lid / ribbon -->
        <rect x="42" y="62" width="116" height="16" rx="4" fill="#C59B27" ${strokeProps}/>
        <rect x="94" y="62" width="12" height="98" fill="#7A1C30"/>
        
        <!-- Big gold bow -->
        <circle cx="100" cy="62" r="5" fill="#D4AF37" ${strokeProps}/>
        <path d="M 100 62 C 80 45 70 58 92 62 C 100 62 100 62 100 62 C 100 62 100 62 108 62 C 130 58 120 45 100 62 Z" fill="#D4AF37" ${strokeProps}/>

        <!-- Gift tag pinned -->
        <rect x="62" y="95" width="45" height="30" rx="2" fill="#FEF08A" ${strokeProps} transform="rotate(-6 85 110)"/>
        <text x="85" y="108" font-family="cursive" font-size="6.5" fill="#7A1C30" text-anchor="middle">Thank You ♥</text>
        <text x="85" y="118" font-family="sans-serif" font-size="5" fill="#2D1527" text-anchor="middle">Wedding Favours</text>
      </g>
    </svg>`,
};

for (const [filename, svgContent] of Object.entries(stickers)) {
  fs.writeFileSync(path.join(dir, filename), svgContent.trim());
}

console.log('Generated all 20 sticker SVG files in public/images/!');
