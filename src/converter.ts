/**
 * Core video-to-GIF conversion logic
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  Video2GifOptions,
  FFmpegConfig,
  VideoInfo,
  ConversionProgress,
  ConversionResult,
  DEFAULTS,
  Video2GifError,
  Video2GifErrorType
} from './types';
import { FFmpegLoader, FFmpegUtils } from './ffmpeg-loader';
import { ParameterValidator } from './validator';
import {
  ConversionError,
  TimeoutError,
  CancelledError,
  ErrorUtils
} from './errors';

/**
 * Video converter with progress tracking and error handling
 */
export class VideoConverter {
  private ffmpeg: FFmpeg | null = null;
  private isCancelled = false;
  private startTime = 0;
  private timeoutId: number | null = null;

  /**
   * Convert video to GIF
   */
  async convert(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    config: FFmpegConfig = {}
  ): Promise<Blob> {
    this.startTime = Date.now();
    this.isCancelled = false;
    
    try {
      // Set up timeout
      const timeout = config.timeout || DEFAULTS.TIMEOUT;
      this.setupTimeout(timeout);
      
      // Load FFmpeg
      await this.reportProgress(options, 'loading', 0);
      this.ffmpeg = await FFmpegLoader.getInstance().loadFFmpeg(config);
      
      // Get video info
      await this.reportProgress(options, 'analyzing', 10);
      const videoInfo = await this.getVideoInfo(videoFile);
      
      // Validate parameters with actual video info
      ParameterValidator.validateOptions(videoFile, options, videoInfo.duration);
      
      // Convert to GIF
      await this.reportProgress(options, 'processing', 20);
      const gifBlob = await this.processVideo(videoFile, options, videoInfo, config);
      
      // Finalize
      await this.reportProgress(options, 'finalizing', 90);
      
      // Clear timeout on success
      this.clearTimeout();
      
      return gifBlob;
      
    } catch (error) {
      this.clearTimeout();
      
      if (this.isCancelled) {
        throw new CancelledError();
      }
      
      throw ErrorUtils.wrapError(error, 'Video conversion failed');
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Set up timeout for conversion
   */
  private setupTimeout(timeout: number): void {
    this.timeoutId = window.setTimeout(() => {
      this.cancel();
      throw new TimeoutError(
        `Conversion timed out after ${timeout}ms`,
        Date.now() - this.startTime,
        timeout
      );
    }, timeout);
  }

  /**
   * Clear timeout
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get video information
   */
  private async getVideoInfo(videoFile: File | Blob | ArrayBuffer): Promise<VideoInfo> {
    try {
      return await ParameterValidator.getVideoInfo(videoFile);
    } catch (error) {
      throw new Video2GifError(
        Video2GifErrorType.UNSUPPORTED_FORMAT,
        'Failed to analyze video file',
        { error }
      );
    }
  }

  /**
   * Process video conversion
   */
  private async processVideo(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    videoInfo: VideoInfo,
    _config: FFmpegConfig // eslint-disable-line no-unused-vars
  ): Promise<Blob> {
    if (!this.ffmpeg) {
      throw new ConversionError('FFmpeg not loaded');
    }

    try {
      // Convert input to Uint8Array
      const inputData = await FFmpegUtils.fileToUint8Array(videoFile);
      
      // Create unique filenames
      const inputFilename = FFmpegUtils.createUniqueFilename('mp4');
      const outputFilename = FFmpegUtils.createUniqueFilename('gif');
      
      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFilename, inputData);
      
      // Calculate output dimensions
      const fps = options.fps || DEFAULTS.FPS;
      const { width, height } = this.calculateOutputDimensions(videoInfo, options.scale);
      
      // Build and execute conversion command
      const command = FFmpegUtils.buildConversionCommand(
        inputFilename,
        outputFilename,
        options.startTime,
        options.duration,
        fps,
        width,
        height
      );
      
      console.log('Executing FFmpeg command:', command);
      
      // Execute with progress tracking
      await this.executeWithProgress(command, options, videoInfo, fps);
      
      // Read output file
      const outputData = await this.ffmpeg.readFile(outputFilename);
      let gifBlob: Blob;

      // Convert to Blob - handle different return types
      if (outputData instanceof Uint8Array) {
        // Create a new Uint8Array to ensure we have a regular ArrayBuffer
        const regularUint8Array = new Uint8Array(outputData);
        gifBlob = new Blob([regularUint8Array], { type: 'image/gif' });
      } else if (typeof outputData === 'string') {
        // If it's a string, we need to convert it properly
        throw new ConversionError('Unexpected string output from FFmpeg');
      } else {
        // Try to handle as buffer-like object
        const buffer = (outputData as any).buffer || outputData;
        gifBlob = new Blob([buffer], { type: 'image/gif' });
      }
      
      // Validate output
      if (gifBlob.size === 0) {
        throw new ConversionError('Generated GIF is empty');
      }
      
      return gifBlob;
      
    } catch (error) {
      if (this.isCancelled) {
        throw new CancelledError();
      }
      
      if (error instanceof Video2GifError) {
        throw error;
      }
      
      throw new ConversionError(
        `Video conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'processing'
      );
    }
  }

  /**
   * Calculate output dimensions
   */
  private calculateOutputDimensions(
    videoInfo: VideoInfo,
    targetScale?: number
  ): { width: number; height: number } {
    return ParameterValidator.calculateOutputDimensions(
      videoInfo.width,
      videoInfo.height,
      targetScale
    );
  }

  /**
   * Execute FFmpeg command with progress tracking
   */
  private async executeWithProgress(
    command: string[],
    options: Video2GifOptions,
    videoInfo: VideoInfo,
    targetFps: number
  ): Promise<void> {
    if (!this.ffmpeg) {
      throw new ConversionError('FFmpeg not available');
    }

    // Calculate total frames for progress tracking
    const duration = options.duration;
    const totalFrames = Math.ceil(duration * targetFps);
    
    const startTime = Date.now();
    
    // Set up progress tracking
    const updateProgress = (currentFrame: number) => {
      const progress = Math.min(100, (currentFrame / totalFrames) * 80); // 80% of total progress
      const elapsedTime = Date.now() - startTime;
      const estimatedTotalTime = (elapsedTime / currentFrame) * totalFrames;
      const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);
      
      this.reportProgress(options, 'processing', 20 + progress, {
        framesProcessed: currentFrame,
        totalFrames,
        estimatedTime: Math.ceil(remainingTime / 1000)
      });
    };

    try {
      // Execute FFmpeg command
      await this.ffmpeg.exec(command);
      
      // Simulate progress for commands that don't provide frame-by-frame updates
      for (let i = 0; i <= totalFrames; i += Math.max(1, Math.floor(totalFrames / 10))) {
        if (this.isCancelled) break;
        updateProgress(i);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      if (this.isCancelled) {
        throw new CancelledError();
      }
      
      throw new ConversionError(
        `FFmpeg execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'processing',
        undefined,
        command
      );
    }
  }

  /**
   * Report progress to callback
   */
  private async reportProgress(
    options: Video2GifOptions,
    stage: ConversionProgress['stage'],
    percent: number,
    additionalInfo?: Partial<ConversionProgress>
  ): Promise<void> {
    // Extract the onProgress callback from options if it exists
    const onProgress = options.onProgress;
    
    // Check if onProgress is a function before calling it
    if (onProgress && typeof onProgress === 'function') {
      const progress: ConversionProgress = {
        stage,
        percent: Math.min(100, Math.max(0, percent)),
        ...additionalInfo
      };
      
      // Call progress callback asynchronously to avoid blocking
      setTimeout(() => {
        if (onProgress && typeof onProgress === 'function' && !this.isCancelled) {
          onProgress(progress.percent);
        }
      }, 0);
    }
  }

  /**
   * Cancel ongoing conversion
   */
  cancel(): void {
    this.isCancelled = true;
    this.clearTimeout();
    console.log('Conversion cancelled');
  }

  /**
   * Check if conversion is cancelled
   */
  isConversionCancelled(): boolean {
    return this.isCancelled;
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    this.clearTimeout();
    
    // Clean up FFmpeg filesystem
    if (this.ffmpeg) {
      try {
        // Note: FFmpeg WASM API may vary for cleanup
        // This is a placeholder for filesystem cleanup
        console.log('Cleaning up FFmpeg resources...');
      } catch (error) {
        console.warn('FFmpeg cleanup error:', error);
      }
    }
    
    // Reset FFmpeg instance
    FFmpegLoader.getInstance().cleanup();
  }
}

/**
 * Convert video to GIF with comprehensive options
 */
export async function convertVideoToGif(
  videoFile: File | Blob | ArrayBuffer,
  options: Video2GifOptions,
  config: FFmpegConfig = {}
): Promise<Blob> {
  const converter = new VideoConverter();
  return converter.convert(videoFile, options, config);
}

/**
 * Convert video to GIF with result metadata
 */
export async function convertVideoToGifWithResult(
  videoFile: File | Blob | ArrayBuffer,
  options: Video2GifOptions,
  config: FFmpegConfig = {}
): Promise<ConversionResult> {
  const startTime = Date.now();
  const converter = new VideoConverter();
  
  try {
    // Get video info first
    const videoInfo = await ParameterValidator.getVideoInfo(videoFile);
    
    // Convert video
    const gifBlob = await converter.convert(videoFile, options, config);
    
    // Calculate conversion statistics
    const conversionTime = Date.now() - startTime;
    const threadingMode = FFmpegLoader.getInstance().isMultiThreadingSupported() ? 'multi' : 'single';
    
    // Get output dimensions
    const { width, height } = ParameterValidator.calculateOutputDimensions(
      videoInfo.width,
      videoInfo.height,
      options.scale
    );
    
    return {
      blob: gifBlob,
      originalVideo: videoInfo,
      outputGif: {
        width,
        height,
        fileSize: gifBlob.size,
        frameCount: Math.ceil(options.duration * (options.fps || DEFAULTS.FPS)),
        duration: options.duration
      },
      statistics: {
        conversionTime,
        memoryUsed: 0, // Would need more sophisticated tracking
        threadingMode
      }
    };
    
  } catch (error) {
    throw ErrorUtils.wrapError(error, 'Conversion with result failed');
  }
}

/**
 * Create a cancellable conversion
 */
export function createCancellableConversion() {
  const converter = new VideoConverter();
  
  return {
    convert: (
      videoFile: File | Blob | ArrayBuffer,
      options: Video2GifOptions,
      config?: FFmpegConfig
    ) => converter.convert(videoFile, options, config),
    cancel: () => converter.cancel(),
    isCancelled: () => converter.isConversionCancelled()
  };
}