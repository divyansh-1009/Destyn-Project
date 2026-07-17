import { useState, useCallback } from 'react';
import { compressImage, compressImages, CompressionOptions, CompressedImage, ImageCompressor } from './imageCompression';

export interface UseImageCompressionOptions {
  compressionOptions?: CompressionOptions;
  showCompressionInfo?: boolean;
  onCompressionStart?: () => void;
  onCompressionComplete?: (results: CompressedImage[]) => void;
  onError?: (error: Error) => void;
}

export interface CompressionState {
  isCompressing: boolean;
  progress: number;
  totalFiles: number;
  processedFiles: number;
}

export const useImageCompression = (options: UseImageCompressionOptions = {}) => {
  const [state, setState] = useState<CompressionState>({
    isCompressing: false,
    progress: 0,
    totalFiles: 0,
    processedFiles: 0
  });

  const [compressionInfo, setCompressionInfo] = useState<{
    originalTotalSize: number;
    compressedTotalSize: number;
    totalSaved: string;
    averageRatio: string;
  } | null>(null);

  const compressSingleImage = useCallback(async (file: File): Promise<CompressedImage> => {
    try {
      setState(prev => ({
        ...prev,
        isCompressing: true,
        totalFiles: 1,
        processedFiles: 0
      }));

      const result = await compressImage(file, options.compressionOptions);
      
      setState(prev => ({
        ...prev,
        isCompressing: false,
        processedFiles: 1,
        progress: 100
      }));

      setCompressionInfo({
        originalTotalSize: result.originalSize,
        compressedTotalSize: result.compressedSize,
        totalSaved: ImageCompressor.formatFileSize(result.originalSize - result.compressedSize),
        averageRatio: `${(result.compressionRatio * 100).toFixed(1)}%`
      });

      options.onCompressionComplete?.([result]);
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, isCompressing: false }));
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const compressMultipleImages = useCallback(async (files: File[]): Promise<CompressedImage[]> => {
    try {
      setState({
        isCompressing: true,
        progress: 0,
        totalFiles: files.length,
        processedFiles: 0
      });

      options.onCompressionStart?.();

      const results: CompressedImage[] = [];
      let originalTotalSize = 0;
      let compressedTotalSize = 0;

      for (let i = 0; i < files.length; i++) {
        try {
          const result = await compressImage(files[i], options.compressionOptions);
          results.push(result);
          
          originalTotalSize += result.originalSize;
          compressedTotalSize += result.compressedSize;

          setState(prev => ({
            ...prev,
            processedFiles: i + 1,
            progress: ((i + 1) / files.length) * 100
          }));
        } catch (error) {
          console.error(`Failed to compress file ${files[i].name}:`, error);
          // Continue with other files even if one fails
        }
      }

      setState(prev => ({ ...prev, isCompressing: false }));

      if (results.length > 0) {
        const totalSaved = originalTotalSize - compressedTotalSize;
        const averageRatio = ((totalSaved / originalTotalSize) * 100).toFixed(1);

        setCompressionInfo({
          originalTotalSize,
          compressedTotalSize,
          totalSaved: ImageCompressor.formatFileSize(totalSaved),
          averageRatio: `${averageRatio}%`
        });
      }

      options.onCompressionComplete?.(results);
      return results;
    } catch (error) {
      setState(prev => ({ ...prev, isCompressing: false }));
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const resetState = useCallback(() => {
    setState({
      isCompressing: false,
      progress: 0,
      totalFiles: 0,
      processedFiles: 0
    });
    setCompressionInfo(null);
  }, []);

  return {
    compressSingleImage,
    compressMultipleImages,
    resetState,
    state,
    compressionInfo,
    isCompressing: state.isCompressing
  };
}; 