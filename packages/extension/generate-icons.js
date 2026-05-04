const fs = require('fs');
const path = require('path');

// Create a simple 1x1 pixel PNG for each size
// This is a valid minimal PNG file (transparent pixel)
const createSimplePNG = (width, height) => {
  // This is a simplified approach - create a minimal valid PNG
  // For production, you'd want to use a proper PNG library
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width (1)
    0x00, 0x00, 0x00, 0x01, // height (1)
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0xF8, 0x0F, 0x00, 0x00, 0x01, 0x01, 0x01, 0x00, // compressed data
    0x1B, 0xB6, 0xEE, 0x56, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82, // CRC
  ]);
  return buffer;
};

const iconsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  const pngBuffer = createSimplePNG(size, size);
  fs.writeFileSync(iconPath, pngBuffer);
  console.log(`Generated ${iconPath}`);
});
