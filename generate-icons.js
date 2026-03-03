/**
 * Script để generate PWA icons từ một icon gốc
 * Tham khảo từ TOMI project
 * 
 * Usage: node generate-icons.js <path-to-source-icon>
 * 
 * Requirements: 
 * - Cần cài đặt sharp: npm install --save-dev sharp
 * - Icon gốc nên là 512x512px hoặc lớn hơn
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Check if sharp is available
  let sharp;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
  } catch (e) {
    console.error('❌ Cần cài đặt sharp: npm install --save-dev sharp');
    process.exit(1);
  }

  const sourceIcon = process.argv[2] || './icon-512-maskable.svg';

  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ File không tồn tại: ${sourceIcon}`);
    console.log('\n💡 Sử dụng: node generate-icons.js <path-to-source-icon>');
    console.log('💡 Ví dụ: node generate-icons.js ./icon-512-maskable.svg');
    process.exit(1);
  }

  // Các kích thước cần tạo (theo chuẩn PWA)
  const sizes = [
    { name: 'icon-72.png', size: 72 },
    { name: 'icon-96.png', size: 96 },
    { name: 'icon-128.png', size: 128 },
    { name: 'icon-144.png', size: 144 },
    { name: 'icon-152.png', size: 152 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-384.png', size: 384 },
    { name: 'icon-512.png', size: 512 },
  ];

  // Icons cho root folder
  const rootIcons = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  console.log('🔄 Đang tạo PWA icons...\n');
  console.log(`📁 Source: ${sourceIcon}\n`);

  // Generate all sizes
  for (const { name, size } of [...sizes, ...rootIcons]) {
    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(name);
      console.log(`✅ Đã tạo: ${name} (${size}x${size}px)`);
    } catch (error) {
      console.error(`❌ Lỗi khi tạo ${name}:`, error.message);
    }
  }

  console.log('\n✨ Hoàn thành! Tất cả icons đã được tạo.');
  console.log('\n📝 Lưu ý:');
  console.log('   - Tất cả file PNG đã được tạo trong thư mục hiện tại');
  console.log('   - Các file có nền trong suốt');
  console.log('   - Sẵn sàng cho PWA!');
}

main().catch(console.error);
