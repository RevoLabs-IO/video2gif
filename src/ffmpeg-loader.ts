/**
 * FFmpeg WASM loader with multi-threading support
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import {
  FFmpegConfig,
  BrowserCapabilities
} from './types.js';
import { FFmpegLoadError } from './errors.js';

/**
 * FFmpeg instance manager with multi-threading support
 */
export class FFmpegLoader {
  private static instance: FFmpegLoader;
  private ffmpeg: FFmpeg | null = null;
  private isMultiThreadSupported: boolean = false;
  private capabilities: BrowserCapabilities | null = null;
  private loadingPromise: Promise<FFmpeg> | null = null;

  private constructor() {
    this.detectCapabilities();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): FFmpegLoader {
    if (!FFmpegLoader.instance) {
      FFmpegLoader.instance = new FFmpegLoader();
    }
    return FFmpegLoader.instance;
  }

  /**
   * Detect browser capabilities for multi-threading
   */
  private detectCapabilities(): void {
    try {
      const sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
      const atomics = typeof Atomics !== 'undefined';
      const webAssembly = typeof WebAssembly !== 'undefined';
      
      // Test WASM threading support
      const wasmThreading = this.testWasmThreading();
      
      this.isMultiThreadSupported = sharedArrayBuffer && atomics && webAssembly && wasmThreading;
      
      this.capabilities = {
        sharedArrayBuffer,
        atomics,
        webAssembly,
        wasmThreading,
        multiThreading: this.isMultiThreadSupported,
        hardwareConcurrency: navigator.hardwareConcurrency || 4
      };
      
      console.log('Browser capabilities detected:', this.capabilities);
    } catch (error) {
      console.warn('Failed to detect browser capabilities:', error);
      this.capabilities = {
        sharedArrayBuffer: false,
        atomics: false,
        webAssembly: false,
        wasmThreading: false,
        multiThreading: false,
        hardwareConcurrency: 1
      };
      this.isMultiThreadSupported = false;
    }
  }

  /**
   * Test WebAssembly threading support
   */
  private testWasmThreading(): boolean {
    try {
      // Check for SharedArrayBuffer and Atomics
      if (typeof SharedArrayBuffer === 'undefined' || typeof Atomics === 'undefined') {
        return false;
      }

      // Test if we can create a SharedArrayBuffer
      const sab = new SharedArrayBuffer(1024);
      if (!(sab instanceof SharedArrayBuffer)) {
        return false;
      }

      // Test Atomics operations
      const int32 = new Int32Array(sab);
      Atomics.store(int32, 0, 1);
      const result = Atomics.load(int32, 0);
      if (result !== 1) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn('WebAssembly threading test failed:', error);
      return false;
    }
  }

  /**
   * Load FFmpeg with appropriate configuration
   */
  async loadFFmpeg(config: FFmpegConfig = {}): Promise<FFmpeg> {
    // Return existing instance if available
    if (this.ffmpeg) {
      return this.ffmpeg;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading
    this.loadingPromise = this.doLoadFFmpeg(config);
    
    try {
      const ffmpeg = await this.loadingPromise;
      this.ffmpeg = ffmpeg;
      return ffmpeg;
    } catch (error) {
      this.loadingPromise = null;
      throw error;
    }
  }

  /**
   * Actually load FFmpeg (internal implementation)
   */
  private async doLoadFFmpeg(config: FFmpegConfig): Promise<FFmpeg> {
    try {
      // Import FFmpeg with proper typing
      const ffmpegModule = await import('@ffmpeg/ffmpeg');
      const FFmpegClass = ffmpegModule.FFmpeg;
      
      const baseURL = config.baseURL || this.getDefaultBaseURL(config.multiThread);
      const useMultiThread = this.shouldUseMultiThreading(config.multiThread);
      
      console.log(`Loading FFmpeg from: ${baseURL}`);
      console.log(`Multi-threading: ${useMultiThread ? 'enabled' : 'disabled'}`);
      
      // Create FFmpeg instance
      const ffmpeg = new FFmpegClass();
      
      // Configure FFmpeg based on threading mode
      const ffmpegConfig: any = {
        log: false,
        corePath: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        workerPath: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        wasmPath: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      };
      
      if (useMultiThread) {
        ffmpegConfig.mainName = 'main';
        ffmpegConfig.threadCount = this.capabilities?.hardwareConcurrency || 4;
      }
      
      // Load FFmpeg
      await ffmpeg.load(ffmpegConfig);
      
      console.log('FFmpeg loaded successfully');
      return ffmpeg;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new FFmpegLoadError(
        `Failed to load FFmpeg: ${errorMessage}`,
        config.baseURL,
        'Loading failed'
      );
    }
  }

  /**
   * Determine if multi-threading should be used
   */
  private shouldUseMultiThreading(requested?: boolean): boolean {
    // If explicitly requested, use that setting
    if (requested !== undefined) {
      return requested && this.isMultiThreadSupported;
    }
    
    // Otherwise, use auto-detection
    return this.isMultiThreadSupported;
  }

  /**
   * Get default base URL based on threading mode
   */
  private getDefaultBaseURL(multiThread?: boolean): string {
    const useMultiThread = this.shouldUseMultiThreading(multiThread);

    if (useMultiThread) {
      // Use local multi-thread FFmpeg files
      return '/node_modules/@ffmpeg/core-mt/dist/umd';
    }

    // Use local single-thread FFmpeg files
    return '/node_modules/@ffmpeg/core/dist/umd';
  }

  /**
   * Get browser capabilities
   */
  getCapabilities(): BrowserCapabilities {
    if (!this.capabilities) {
      this.detectCapabilities();
    }
    return this.capabilities!;
  }

  /**
   * Check if multi-threading is supported
   */
  isMultiThreadingSupported(): boolean {
    return this.isMultiThreadSupported;
  }

  /**
   * Get current FFmpeg instance
   */
  getFFmpeg(): FFmpeg | null {
    return this.ffmpeg;
  }

  /**
   * Reset FFmpeg instance (useful for cleanup)
   */
  reset(): void {
    this.ffmpeg = null;
    this.loadingPromise = null;
  }

  /**
   * Cleanup FFmpeg resources
   */
  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        // Clean up any remaining files in FFmpeg filesystem
        // Note: FFmpeg WASM API may vary, this is a simplified version
        console.log('Cleaning up FFmpeg resources...');
      } catch (error) {
        console.warn('FFmpeg cleanup error:', error);
      }
    }
    
    this.reset();
  }
}

/**
 * Utility functions for FFmpeg operations
 */
export class FFmpegUtils {
  /**
   * Convert File/Blob/ArrayBuffer to Uint8Array
   */
  static async fileToUint8Array(
    file: File | Blob | ArrayBuffer
  ): Promise<Uint8Array> {
    if (file instanceof ArrayBuffer) {
      return new Uint8Array(file);
    }
    
    return new Uint8Array(await file.arrayBuffer());
  }

  /**
   * Create a unique filename for FFmpeg operations
   */
  static createUniqueFilename(extension: string = 'mp4'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `video_${timestamp}_${random}.${extension}`;
  }

  /**
   * Build FFmpeg command for video to GIF conversion
   */
  static buildConversionCommand(
    inputFile: string,
    outputFile: string,
    startTime: number,
    duration: number,
    fps: number,
    width: number,
    height: number
  ): string[] {
    return [
      '-i', inputFile,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-vf', `fps=${fps},scale=${width}:${height}:flags=lanczos`,
      '-gifflags', '+transdiff',
      '-y',
      outputFile
    ];
  }

  /**
   * Calculate optimal settings based on input video
   */
  static calculateOptimalSettings(
    videoInfo: { width: number; height: number; duration: number },
    targetScale?: number,
    targetFps?: number
  ): { width: number; height: number; fps: number } {
    // Calculate output dimensions
    let width = targetScale || videoInfo.width;
    let height: number;
    
    if (targetScale) {
      // Maintain aspect ratio
      const aspectRatio = videoInfo.height / videoInfo.width;
      height = Math.round(width * aspectRatio);
    } else {
      width = videoInfo.width;
      height = videoInfo.height;
    }
    
    // Ensure dimensions are even (required for some codecs)
    width = width % 2 === 0 ? width : width - 1;
    height = height % 2 === 0 ? height : height - 1;
    
    // Calculate optimal FPS
    let fps = targetFps || 10;
    
    // Adjust FPS based on video duration (shorter videos can handle higher FPS)
    if (videoInfo.duration < 5 && !targetFps) {
      fps = 15; // Higher FPS for short videos
    } else if (videoInfo.duration > 30 && !targetFps) {
      fps = 8; // Lower FPS for long videos
    }
    
    return { width: Math.max(2, width), height: Math.max(2, height), fps };
  }
}

/**
 * Get browser capabilities (convenience function)
 */
export function getBrowserCapabilities(): BrowserCapabilities {
  return FFmpegLoader.getInstance().getCapabilities();
}

/**
 * Check if multi-threading is supported
 */
export function isMultiThreadSupported(): boolean {
  return FFmpegLoader.getInstance().isMultiThreadingSupported();
}