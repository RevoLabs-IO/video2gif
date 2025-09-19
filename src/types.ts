/**
 * Core type definitions for video2gif library
 */

/**
 * Main conversion options interface
 */
export interface Video2GifOptions {
  /**
   * Start time in seconds (supports decimals, e.g., 1.5)
   * Must be non-negative and less than video duration
   */
  startTime: number;

  /**
   * Duration in seconds (supports decimals)
   * Must be positive. Auto-clamped if exceeds remaining video length
   */
  duration: number;

  /**
   * Frames per second (1-30, default: 10)
   * Higher values = smoother but larger files
   */
  fps?: number;

  /**
   * Output width in pixels (e.g., 480, 640, 1280)
   * Height automatically calculated to maintain aspect ratio
   * If not specified, uses original video dimensions
   */
  scale?: number;

  /**
   * Progress callback function (0-100)
   * Called periodically during conversion with progress percentage
   */
  onProgress?: (progress: number) => void; // eslint-disable-line no-unused-vars
}

/**
 * FFmpeg configuration options
 */
export interface FFmpegConfig {
  /**
   * Custom URL for FFmpeg WASM files
   * Default: CDN URLs based on threading mode
   */
  baseURL?: string;

  /**
   * Enable multi-threading (default: true if supported)
   * Auto-detected based on browser capabilities
   */
  multiThread?: boolean;

  /**
   * Conversion timeout in milliseconds (default: 300000 = 5 minutes)
   */
  timeout?: number;

  /**
   * Memory limit in MB (default: 512)
   */
  memoryLimit?: number;
}

/**
 * Conversion progress information
 */
export interface ConversionProgress {
  /**
   * Current conversion stage
   */
  stage: 'loading' | 'analyzing' | 'processing' | 'finalizing';

  /**
   * Progress percentage (0-100)
   */
  percent: number;

  /**
   * Estimated time remaining in seconds (optional)
   */
  estimatedTime?: number;

  /**
   * Number of frames processed so far (optional)
   */
  framesProcessed?: number;

  /**
   * Total number of frames to process (optional)
   */
  totalFrames?: number;
}

/**
 * Video information extracted during analysis
 */
export interface VideoInfo {
  /**
   * Video duration in seconds
   */
  duration: number;

  /**
   * Video width in pixels
   */
  width: number;

  /**
   * Video height in pixels
   */
  height: number;

  /**
   * Video codec information
   */
  codec?: string;

  /**
   * Frame rate (fps)
   */
  frameRate?: number;

  /**
   * Bit rate in bits per second
   */
  bitRate?: number;

  /**
   * File size in bytes
   */
  size?: number;
}

/**
 * Error types for video2gif operations
 */
/* eslint-disable no-unused-vars */
export enum Video2GifErrorType {
  /** Invalid input parameters */
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',

  /** Unsupported video format */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',

  /** FFmpeg WASM failed to load */
  FFMPEG_LOAD_FAILED = 'FFMPEG_LOAD_FAILED',

  /** Video conversion failed */
  CONVERSION_FAILED = 'CONVERSION_FAILED',

  /** Memory limit exceeded */
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',

  /** Operation timed out */
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',

  /** Operation was cancelled */
  CANCELLED = 'CANCELLED',

  /** Unknown error */
  UNKNOWN = 'UNKNOWN'
}
/* eslint-enable no-unused-vars */

/**
 * Custom error class for video2gif operations
 */
export class Video2GifError extends Error {
  constructor(
    public type: Video2GifErrorType, // eslint-disable-line no-unused-vars
    message: string,
    public details?: any // eslint-disable-line no-unused-vars
  ) {
    super(message);
    this.name = 'Video2GifError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Video2GifError);
    }
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case Video2GifErrorType.INVALID_PARAMETERS:
        return 'Invalid parameters provided. Please check your input values.';
      case Video2GifErrorType.UNSUPPORTED_FORMAT:
        return 'This video format is not supported. Please try a different file.';
      case Video2GifErrorType.FFMPEG_LOAD_FAILED:
        return 'Failed to load video processing library. Please check your internet connection.';
      case Video2GifErrorType.CONVERSION_FAILED:
        return 'Video conversion failed. The file may be corrupted or too large.';
      case Video2GifErrorType.MEMORY_LIMIT_EXCEEDED:
        return 'The video is too large to process. Try a smaller file or shorter duration.';
      case Video2GifErrorType.TIMEOUT_EXCEEDED:
        return 'Conversion took too long. Try a shorter video or lower quality settings.';
      case Video2GifErrorType.CANCELLED:
        return 'Conversion was cancelled.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

/**
 * Preset configurations for common use cases
 */
export const Presets = {
  /**
   * Small size, low quality - good for thumbnails
   */
  SMALL: { fps: 8, scale: 240 } as Video2GifOptions,
  
  /**
   * Medium size, standard quality - good for web sharing
   */
  MEDIUM: { fps: 10, scale: 480 } as Video2GifOptions,
  
  /**
   * Large size, good quality - good for social media
   */
  LARGE: { fps: 12, scale: 640 } as Video2GifOptions,
  
  /**
   * HD size, high quality - best visual fidelity
   */
  HD: { fps: 15, scale: 1280 } as Video2GifOptions
} as const;

/**
 * Default configuration values
 */
export const DEFAULTS = {
  /** Default frames per second */
  FPS: 10,
  
  /** Default conversion timeout (5 minutes) */
  TIMEOUT: 300000,
  
  /** Default memory limit (512 MB) */
  MEMORY_LIMIT: 512,
  
  /** Default single-thread CDN URL */
  DEFAULT_SINGLE_THREAD_URL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd',
  
  /** Default multi-thread CDN URL */
  DEFAULT_MULTI_THREAD_URL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/umd'
} as const;

/**
 * Supported video formats
 */
export const SUPPORTED_FORMATS = [
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'flv',
  'ogv',
  '3gp'
] as const;

/**
 * Type for supported video formats
 */
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

/**
 * Browser capability detection results
 */
export interface BrowserCapabilities {
  /** Whether SharedArrayBuffer is available */
  sharedArrayBuffer: boolean;
  
  /** Whether Atomics is available */
  atomics: boolean;
  
  /** Whether WebAssembly is available */
  webAssembly: boolean;
  
  /** Whether WebAssembly threading is supported */
  wasmThreading: boolean;
  
  /** Whether multi-threading is fully supported */
  multiThreading: boolean;
  
  /** Hardware concurrency (number of CPU cores) */
  hardwareConcurrency: number;
}

/**
 * Conversion result with metadata
 */
export interface ConversionResult {
  /** The converted GIF as a Blob */
  blob: Blob;
  
  /** Original video information */
  originalVideo: VideoInfo;
  
  /** Output GIF information */
  outputGif: {
    width: number;
    height: number;
    fileSize: number;
    frameCount: number;
    duration: number;
  };
  
  /** Conversion statistics */
  statistics: {
    conversionTime: number;
    memoryUsed: number;
    threadingMode: 'single' | 'multi';
  };
}