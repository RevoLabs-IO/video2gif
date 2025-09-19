import { useState, useCallback, useRef } from 'react';
import { convertVideoToGifWithResult, Video2GifOptions, ErrorUtils } from 'video2gif';
import { ConversionResult } from '../types';

export function useVideo2Gif() {
  const [isSupported, setIsSupported] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check browser support
  useState(() => {
    const checkSupport = async () => {
      try {
        // Test basic WebAssembly support
        if (typeof WebAssembly === 'undefined') {
          setIsSupported(false);
          return;
        }

        // Test SharedArrayBuffer support for multi-threading
        const hasMultiThread = typeof SharedArrayBuffer !== 'undefined' && 
                               typeof Atomics !== 'undefined';
        
        setIsSupported(hasMultiThread);
      } catch (error) {
        setIsSupported(false);
      }
    };
    checkSupport();
  });

  const convertVideo = useCallback(async (
    videoFile: File,
    options: Video2GifOptions,
    onProgress?: (progress: number) => void
  ): Promise<ConversionResult> => {
    abortControllerRef.current = new AbortController();

    try {
      const result = await convertVideoToGifWithResult(videoFile, {
        ...options,
        ...(onProgress && { onProgress })
      });

      return {
        blob: result.blob,
        url: URL.createObjectURL(result.blob),
        width: result.outputGif.width,
        height: result.outputGif.height,
        fileSize: result.outputGif.fileSize,
        frameCount: result.outputGif.frameCount,
        duration: result.outputGif.duration,
        statistics: result.statistics
      };
    } catch (error) {
      if (ErrorUtils.isVideo2GifError(error) && error.type === 'CANCELLED') {
        throw new Error('Conversion cancelled');
      }
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const cancelConversion = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    convertVideo,
    cancelConversion,
    isSupported
  };
}