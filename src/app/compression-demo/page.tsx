"use client";

import { useState, useRef } from 'react';
import { useImageCompression } from '@/lib/useImageCompression';
import { ImageCompressor } from '@/lib/imageCompression';
import CompressionProgress from '@/components/CompressionProgress';

export default function CompressionDemo() {
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    compressMultipleImages,
    state: compressionState,
    compressionInfo,
    isCompressing
  } = useImageCompression({
    compressionOptions: {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
      format: 'jpeg'
    },
    onError: (error) => {
      console.error('Compression error:', error);
      alert('Failed to compress image. Please try again.');
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Filter for image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please select image files only.');
      return;
    }

    setOriginalFiles(imageFiles);

    try {
      const results = await compressMultipleImages(imageFiles);
      setCompressedFiles(results);
    } catch (error) {
      console.error('Error compressing images:', error);
      alert('Failed to compress images. Please try again.');
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-8">
      {/* Compression Progress Overlay */}
      <CompressionProgress 
        state={compressionState}
        compressionInfo={compressionInfo}
        showCompressionInfo={false}
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Compression Demo</h1>
          <p className="text-lg text-gray-300 mb-8">
            Test the client-side image compression functionality. Upload images to see the compression results.
          </p>
          
          <button
            onClick={triggerFileInput}
            disabled={isCompressing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isCompressing ? 'Compressing...' : 'Select Images'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {originalFiles.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Files */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-red-400">Original Images</h2>
              <div className="space-y-4">
                {originalFiles.map((file, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {ImageCompressor.formatFileSize(file.size)}
                      </span>
                    </div>
                    <div className="w-full h-32 bg-gray-700 rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compressed Files */}
            <div className="bg-black bg-opacity-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-400">Compressed Images</h2>
              <div className="space-y-4">
                {compressedFiles.map((result, index) => {
                  const info = ImageCompressor.getCompressionInfo(
                    result.originalSize,
                    result.compressedSize
                  );
                  
                  return (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm truncate">{result.file.name}</span>
                        <span className="text-xs text-green-400">
                          {info.compressedFormatted}
                        </span>
                      </div>
                      <div className="w-full h-32 bg-gray-700 rounded overflow-hidden mb-2">
                        <img
                          src={result.dataUrl}
                          alt={result.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Original:</span>
                          <span>{info.originalFormatted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Compressed:</span>
                          <span className="text-green-400">{info.compressedFormatted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Saved:</span>
                          <span className="text-green-400">{info.saved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reduction:</span>
                          <span className="text-blue-400">{info.ratio}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Compression Settings */}
        <div className="mt-8 bg-black bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Compression Settings</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Max Width:</span>
              <span className="ml-2">1000px</span>
            </div>
            <div>
              <span className="text-gray-400">Max Height:</span>
              <span className="ml-2">1000px</span>
            </div>
            <div>
              <span className="text-gray-400">Quality:</span>
              <span className="ml-2">80%</span>
            </div>
            <div>
              <span className="text-gray-400">Format:</span>
              <span className="ml-2">JPEG</span>
            </div>
            <div>
              <span className="text-gray-400">Max File Size:</span>
              <span className="ml-2">5MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 