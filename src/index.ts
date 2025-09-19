/**
 * Video2Gif - Convert videos to GIFs using FFmpeg WASM
 * 
 * A modern, efficient library for converting videos to GIFs in the browser.
 * Features include multi-threading support, progress tracking, and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * import { video2gif } from 'video2gif';
 * 
 * // Basic usage
 * const gif = await video2gif(videoFile, {
 *   startTime: 2.5,
 *   duration: 3
 * });
 * 
 * // Advanced usage with progress tracking
 * const gif = await video2gif(videoFile, {
 *   startTime: 0,
 *   duration: 5,
 *   fps: 15,
 *   scale: 480,
 *   onProgress: (progress) => console.log(`${progress}% complete`)
 * });
 * ```
 */

// Core function exports
export { convertVideoToGif } from './converter.js';
export { 
  convertVideoToGifWithResult, 
  createCancellableConversion 
} from './converter.js';

// Type exports
export type {
  Video2GifOptions,
  FFmpegConfig,
  ConversionProgress,
  ConversionResult,
  VideoInfo,
  BrowserCapabilities,
  SupportedFormat
} from './types.js';

// Error exports
export { 
  Video2GifError, 
  Video2GifErrorType 
} from './types.js';

export {
  ValidationError,
  FormatError,
  FFmpegLoadError,
  ConversionError,
  MemoryLimitError,
  TimeoutError,
  CancelledError,
  ErrorUtils
} from './errors.js';

// Utility exports
export { 
  FFmpegLoader, 
  FFmpegUtils, 
  getBrowserCapabilities, 
  isMultiThreadSupported 
} from './ffmpeg-loader.js';

export { 
  ParameterValidator,
  validateBatch,
  type ValidationResult
} from './validator.js';

// Preset exports
export { Presets, DEFAULTS, SUPPORTED_FORMATS } from './types.js';

/**
 * Main video2gif function - convert video to GIF
 * 
 * @param videoFile - Video file (File, Blob, or ArrayBuffer)
 * @param options - Conversion options (startTime, duration, fps, scale, etc.)
 * @param config - FFmpeg configuration (optional)
 * @returns Promise that resolves to GIF Blob
 * 
 * @example
 * ```typescript
 * const gif = await video2gif(videoFile, {
 *   startTime: 2.5,
 *   duration: 3,
 *   fps: 10,
 *   scale: 480
 * });
 * ```
 */
export async function video2gif(
  videoFile: File | Blob | ArrayBuffer,
  options: import('./types.js').Video2GifOptions,
  config?: import('./types.js').FFmpegConfig
): Promise<Blob> {
  const { convertVideoToGif } = await import('./converter.js');
  return convertVideoToGif(videoFile, options, config);
}

/**
 * Check if the current browser supports multi-threading
 * 
 * @returns true if multi-threading is supported
 */
export function supportsMultiThreading(): boolean {
  // eslint-disable-next-line no-undef
  const { isMultiThreadSupported } = require('./ffmpeg-loader.js');
  return isMultiThreadSupported();
}

/**
 * Get browser capabilities information
 * 
 * @returns Browser capabilities object
 */
export function getCapabilities(): import('./types.js').BrowserCapabilities {
  // eslint-disable-next-line no-undef
  const { getBrowserCapabilities } = require('./ffmpeg-loader.js');
  return getBrowserCapabilities();
}

/**
 * Get library version
 */
export function getVersion(): string {
  // This will be replaced by build process
  return (typeof globalThis !== 'undefined' && (globalThis as any).__APP_VERSION__) ? 
    (globalThis as any).__APP_VERSION__ : '1.0.0';
}

/**
 * Utility function to create a File from a URL
 * 
 * @param url - URL to fetch video from
 * @returns Promise that resolves to File object
 */
export async function fileFromURL(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const filename = url.split('/').pop() || 'video.mp4';
  
  return new File([blob], filename, { type: blob.type });
}

/**
 * Utility function to create a Blob from a base64 string
 * 
 * @param base64 - Base64 encoded video data
 * @param mimeType - MIME type of the video
 * @returns Blob object
 */
export function blobFromBase64(base64: string, mimeType: string = 'video/mp4'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Utility function to convert Blob to base64
 * 
 * @param blob - Blob to convert
 * @returns Promise that resolves to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Validate conversion options without performing conversion
 * 
 * @param videoFile - Video file to validate
 * @param options - Conversion options to validate
 * @returns Validation result
 */
export async function validateOptions(
  videoFile: File | Blob | ArrayBuffer,
  options: import('./types.js').Video2GifOptions
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  videoInfo?: import('./types.js').VideoInfo;
}> {
  try {
    const { ParameterValidator } = await import('./validator.js');
    const { validateBatch } = await import('./validator.js');
    
    const videoInfo = await ParameterValidator.getVideoInfo(videoFile);
    const validation = validateBatch(videoFile, options, videoInfo);
    
    return {
      ...validation,
      videoInfo
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: []
    };
  }
}

/**
 * Get estimated file size for conversion
 * 
 * @param videoInfo - Video information
 * @param options - Conversion options
 * @returns Estimated file size in bytes
 */
export function estimateFileSize(
  videoInfo: import('./types.js').VideoInfo,
  options: import('./types.js').Video2GifOptions
): number {
  // Import required modules synchronously
  // eslint-disable-next-line no-undef
  const { ParameterValidator } = require('./validator.js');
  // eslint-disable-next-line no-undef
  const { DEFAULTS } = require('./types.js');
  
  const { width, height } = ParameterValidator.calculateOutputDimensions(
    videoInfo.width,
    videoInfo.height,
    options.scale
  );
  
  const fps = options.fps || DEFAULTS.FPS;
  const totalFrames = Math.ceil(options.duration * fps);
  
  // Rough estimation: ~10KB per frame for 480p, scaled by resolution and FPS
  const baseSizePerFrame = 10240; // 10KB
  const resolutionFactor = (width * height) / (640 * 480); // Relative to 480p
  const fpsFactor = fps / 10; // Relative to default 10fps
  
  return Math.round(baseSizePerFrame * totalFrames * resolutionFactor * fpsFactor);
}

/**
 * Default export for convenience
 */
export default video2gif;

// Re-export everything for module usage
export * from './types.js';
export * from './errors.js';
export * from './validator.js';
export * from './ffmpeg-loader.js';
export * from './converter.js';