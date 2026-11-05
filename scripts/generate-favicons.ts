import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Create the Master SVG string for Valutora Favicon & Icon Emblem
// Canvas: 512 x 512
// Colors:
//   Metallic Gold: #F5B82E (with rich gradient #FFE382 -> #F5B82E -> #C48206)
//   Electric Aqua Blue: #00CFFF (with gradient #E0FAFF -> #00CFFF -> #0084FF)
//   Deep Navy/Black: #05090F (with radial depth #0C1524 -> #05090F)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="vBg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#0E1726"/>
      <stop offset="65%" stop-color="#070B14"/>
      <stop offset="100%" stop-color="#04070D"/>
    </radialGradient>

    <!-- Outer Bevel Stroke -->
    <linearGradient id="vBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5B82E" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#00CFFF" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#F5B82E" stop-opacity="0.05"/>
    </linearGradient>

    <!-- Metallic Gold Gradient Primary (Left Arm & Base) -->
    <linearGradient id="goldPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2A3"/>
      <stop offset="25%" stop-color="#F8C448"/>
      <stop offset="70%" stop-color="#E59F12"/>
      <stop offset="100%" stop-color="#B27405"/>
    </linearGradient>

    <!-- Metallic Gold Highlight Gradient -->
    <linearGradient id="goldFacet" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F5B82E"/>
      <stop offset="50%" stop-color="#FFF5B8"/>
      <stop offset="100%" stop-color="#E0950E"/>
    </linearGradient>

    <!-- Electric Aqua Liquid-Glass Gradient -->
    <linearGradient id="aquaGlass" x1="15%" y1="85%" x2="85%" y2="15%">
      <stop offset="0%" stop-color="#0072B2"/>
      <stop offset="35%" stop-color="#00CFFF"/>
      <stop offset="75%" stop-color="#73EEFF"/>
      <stop offset="100%" stop-color="#E6FCFF"/>
    </linearGradient>

    <!-- Aqua Glass Secondary Translucent Reflection -->
    <linearGradient id="aquaSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#00CFFF" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#006699" stop-opacity="0"/>
    </linearGradient>

    <!-- Subtle Ambient Glow underneath Emblem -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Black/Navy Rounded Base Tile -->
  <rect width="512" height="512" rx="112" fill="url(#vBg)"/>
  <rect x="3" y="3" width="506" height="506" rx="109" fill="none" stroke="url(#vBorder)" stroke-width="4"/>

  <!-- Subtle Corner Glass Ambient Lighting -->
  <ellipse cx="256" cy="270" rx="170" ry="140" fill="#00CFFF" opacity="0.07" filter="blur(30px)"/>
  <ellipse cx="256" cy="380" rx="130" ry="80" fill="#F5B82E" opacity="0.09" filter="blur(26px)"/>

  <!-- CENTRAL EMBLEM: Bold V + Ascending Growth Arrow + Liquid Glass Accent -->
  <g id="valutora-emblem">

    <!-- 1. LEFT ARM (Metallic Gold Solid Anchor) -->
    <!-- Starts at (114, 146), tapers and angles down to the bottom apex (256, 404) -->
    <path d="M 116 148 
             L 182 148 
             L 256 316 
             L 256 384 
             L 226 404 
             L 102 188 
             Z" 
          fill="url(#goldPrimary)"/>

    <!-- Left Arm Inner Bevel Highlight -->
    <path d="M 116 148 
             L 150 148 
             L 242 352 
             L 226 404 
             L 102 188 
             Z" 
          fill="url(#goldFacet)" 
          opacity="0.45"/>

    <!-- 2. RIGHT ASCENDING GROWTH STEM & ARROWHEAD (Gold & Ascending Thrust) -->
    <!-- The outer spine sweeps upward to the arrow apex at (412, 102) -->
    <path d="M 226 404 
             L 256 384 
             L 334 212 
             L 374 232 
             L 412 102 
             L 294 154 
             L 326 172 
             L 256 322 
             L 226 404 
             Z" 
          fill="url(#goldPrimary)"/>

    <!-- Arrowhead Top Gold Facet with Specular Shine -->
    <polygon points="412,102 374,232 346,188 412,102" fill="url(#goldFacet)"/>

    <!-- 3. LIQUID-GLASS AQUA ACCENT (Electric Aqua Dynamic Core Blade) -->
    <!-- Nestled between the left gold anchor and the ascending growth arrow -->
    <!-- Giving high-contrast, recognizable vibrancy even down to 16x16 -->
    <path d="M 256 364 
             L 278 316 
             L 324 214 
             L 300 202 
             L 256 298 
             L 214 204 
             L 194 216 
             L 242 322 
             Z" 
          fill="url(#aquaGlass)"/>

    <!-- Aqua Prism Top Light Glint -->
    <polygon points="324,214 300,202 278,252 304,260" fill="url(#aquaSheen)"/>

    <!-- Bottom Vertex Glass Shard (Reflective Jewel at the point of origin) -->
    <polygon points="256,364 240,326 256,298 272,326" fill="#A5F3FC" opacity="0.9"/>
  </g>
</svg>`;

async function generate() {
  console.log('Generating Valutora Favicons and Web App Icons...');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write favicon.svg
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Created favicon.svg');

  // 2. Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  const pngBuffers: { [size: number]: Buffer } = {};

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    const buf = await sharp(Buffer.from(svgContent))
      .resize(size, size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(outPath, buf);
    pngBuffers[size] = buf;
    console.log(`Created ${name} (${size}x${size}, ${buf.length} bytes)`);
  }

  // 3. Create favicon.ico containing 16x16, 32x32, and 48x48 PNG images
  // Standard Windows ICO header format with embedded PNGs:
  // Header: 6 bytes
  //   0-1: Reserved (0)
  //   2-3: Type (1 = ICO)
  //   4-5: Number of images (3)
  // Directory entries: 16 bytes per image
  //   0: Width (16, 32, 48)
  //   1: Height (16, 32, 48)
  //   2: Color count (0 for >= 8bpp)
  //   3: Reserved (0)
  //   4-5: Color planes (1)
  //   6-7: Bits per pixel (32)
  //   8-11: Image size in bytes
  //   12-15: Image offset from beginning of file
  const icoSizes = [16, 32, 48];
  const headerLen = 6;
  const dirEntryLen = 16;
  let offset = headerLen + dirEntryLen * icoSizes.length;

  const icoHeader = Buffer.alloc(headerLen);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // 1 = ICO
  icoHeader.writeUInt16LE(icoSizes.length, 4); // Count

  const dirEntries: Buffer[] = [];
  const imageDatas: Buffer[] = [];

  for (const s of icoSizes) {
    const pngBuf = pngBuffers[s];
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // Width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // Height
    entry.writeUInt8(0, 2); // Color count
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(pngBuf.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset
    dirEntries.push(entry);
    imageDatas.push(pngBuf);
    offset += pngBuf.length;
  }

  const icoBuffer = Buffer.concat([icoHeader, ...dirEntries, ...imageDatas]);
  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Created favicon.ico (${icoBuffer.length} bytes, 3 sub-images: 16x16, 32x32, 48x48)`);

  // 4. Create site.webmanifest
  const manifest = {
    name: 'Valutora',
    short_name: 'Valutora',
    description: 'Save smarter. Stay in control.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05090F',
    theme_color: '#05090F',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Created site.webmanifest');

  console.log('Favicon generation completed successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
