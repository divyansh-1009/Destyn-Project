// Simple test file for image compression functionality
// This can be run in the browser console to test the compression

import { ImageCompressor, compressImage } from './imageCompression';

// Test function that can be called from browser console
export async function testImageCompression() {
  console.log('Testing image compression...');
  
  // Create a simple test canvas to simulate an image
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  
  // Draw a simple test image
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = 'blue';
  ctx.fillRect(400, 0, 400, 300);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 300, 400, 300);
  ctx.fillStyle = 'yellow';
  ctx.fillRect(400, 300, 400, 300);
  
  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.9);
  });
  
  // Create a File object
  const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
  
  console.log('Original file size:', ImageCompressor.formatFileSize(file.size));
  
  try {
    // Test compression
    const compressed = await compressImage(file, {
      maxWidth: 400,
      maxHeight: 300,
      quality: 0.7,
      format: 'jpeg'
    });
    
    console.log('Compression successful!');
    console.log('Original size:', ImageCompressor.formatFileSize(compressed.originalSize));
    console.log('Compressed size:', ImageCompressor.formatFileSize(compressed.compressedSize));
    console.log('Compression ratio:', `${(compressed.compressionRatio * 100).toFixed(1)}%`);
    console.log('Data URL length:', compressed.dataUrl.length);
    
    return compressed;
  } catch (error) {
    console.error('Compression failed:', error);
    return null;
  }
}

// Test utility functions
export function testFormatFileSize() {
  const sizes = [1024, 1024 * 1024, 1024 * 1024 * 1024];
  sizes.forEach(size => {
    console.log(`${size} bytes = ${ImageCompressor.formatFileSize(size)}`);
  });
}

export function testNeedsCompression() {
  const smallFile = new File([''], 'small.jpg', { type: 'image/jpeg' });
  const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
  
  console.log('Small file needs compression:', ImageCompressor.needsCompression(smallFile));
  console.log('Large file needs compression:', ImageCompressor.needsCompression(largeFile));
}

// Export for global access in browser console
if (typeof window !== 'undefined') {
  (window as any).testImageCompression = testImageCompression;
  (window as any).testFormatFileSize = testFormatFileSize;
  (window as any).testNeedsCompression = testNeedsCompression;
} 