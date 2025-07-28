import React from 'react';
import { CompressionState } from '@/lib/useImageCompression';
import { ImageCompressor } from '@/lib/imageCompression';

interface CompressionProgressProps {
  state: CompressionState;
  compressionInfo?: {
    originalTotalSize: number;
    compressedTotalSize: number;
    totalSaved: string;
    averageRatio: string;
  } | null;
  showCompressionInfo?: boolean;
}

export const CompressionProgress: React.FC<CompressionProgressProps> = ({
  state,
  compressionInfo,
  showCompressionInfo = true
}) => {
  if (!state.isCompressing && !compressionInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg max-w-sm">
      {state.isCompressing && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Compressing images...</span>
            <span className="text-xs text-gray-300">
              {state.processedFiles}/{state.totalFiles}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {compressionInfo && showCompressionInfo && (
        <div className="border-t border-gray-600 pt-3">
          <div className="text-xs text-gray-300 mb-2">Compression Results:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Original:</span>
              <span>{ImageCompressor.formatFileSize(compressionInfo.originalTotalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Compressed:</span>
              <span>{ImageCompressor.formatFileSize(compressionInfo.compressedTotalSize)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Saved:</span>
              <span>{compressionInfo.totalSaved}</span>
            </div>
            <div className="flex justify-between text-blue-400">
              <span>Reduction:</span>
              <span>{compressionInfo.averageRatio}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionProgress; 