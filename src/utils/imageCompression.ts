// Client-side image compression utility
// This utility compresses images before upload to reduce file size and improve performance

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSize?: number; // in bytes
  format?: 'jpeg' | 'webp' | 'png';
}

export interface CompressedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dataUrl: string;
}

const defaultOptions: CompressionOptions = {
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.8,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  format: 'jpeg'
};

export class ImageCompressor {
  private options: CompressionOptions;

  constructor(options: CompressionOptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Compress a single image file
   */
  async compressImage(file: File): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            this.options.maxWidth!,
            this.options.maxHeight!
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to blob with specified quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create new file
              const compressedFile = new File([blob], file.name, {
                type: `image/${this.options.format}`,
                lastModified: Date.now(),
              });

              // Create data URL for preview
              const dataUrl = canvas.toDataURL(`image/${this.options.format}`, this.options.quality);

              const result: CompressedImage = {
                file: compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: (file.size - compressedFile.size) / file.size,
                dataUrl
              };

              resolve(result);
            },
            `image/${this.options.format}`,
            this.options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Load image from file
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress multiple images
   */
  async compressImages(files: File[]): Promise<CompressedImage[]> {
    const promises = files.map(file => this.compressImage(file));
    return Promise.all(promises);
  }

  /**
   * Calculate new dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if image is larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
        
        // If height is still too large, scale down further
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        height = maxHeight;
        width = height * aspectRatio;
        
        // If width is still too large, scale down further
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if image needs compression
   */
  static needsCompression(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
    return file.size > maxSize;
  }

  /**
   * Get compression info for display
   */
  static getCompressionInfo(original: number, compressed: number): {
    saved: string;
    ratio: string;
    originalFormatted: string;
    compressedFormatted: string;
  } {
    const saved = original - compressed;
    const ratio = ((original - compressed) / original * 100).toFixed(1);
    
    return {
      saved: this.formatFileSize(saved),
      ratio: `${ratio}%`,
      originalFormatted: this.formatFileSize(original),
      compressedFormatted: this.formatFileSize(compressed)
    };
  }
}

// Default compressor instance
export const defaultCompressor = new ImageCompressor();

// Utility functions for easy use
export const compressImage = (file: File, options?: CompressionOptions) => {
  const compressor = options ? new ImageCompressor(options) : defaultCompressor;
  return compressor.compressImage(file);
};

export const compressImages = (files: File[], options?: CompressionOptions) => {
  const compressor = options ? new ImageCompressor(options) : defaultCompressor;
  return compressor.compressImages(files);
}; 