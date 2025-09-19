/**
 * Parameter validation system for video2gif library
 */

import {
  Video2GifOptions,
  Video2GifError,
  Video2GifErrorType,
  VideoInfo,
  SUPPORTED_FORMATS,
  SupportedFormat
} from './types';
import { ErrorUtils } from './errors';

/**
 * Parameter validation utilities
 */
export class ParameterValidator {
  /**
   * Validate all conversion options
   */
  static validateOptions(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    videoDuration?: number
  ): void {
    // Validate startTime
    this.validateStartTime(options.startTime, videoDuration);
    
    // Validate duration
    this.validateDuration(options.duration, options.startTime, videoDuration);
    
    // Validate fps if provided
    if (options.fps !== undefined) {
      this.validateFps(options.fps);
    }
    
    // Validate scale if provided
    if (options.scale !== undefined) {
      this.validateScale(options.scale);
    }
    
    // Validate onProgress if provided
    if (options.onProgress !== undefined) {
      this.validateOnProgress(options.onProgress);
    }
    
    // Validate video file
    this.validateVideoFile(videoFile);
  }

  /**
   * Validate start time parameter
   */
  private static validateStartTime(startTime: number, videoDuration?: number): void {
    if (typeof startTime !== 'number') {
      throw ErrorUtils.invalidParameter('startTime', startTime, 'number');
    }
    
    if (startTime < 0) {
      throw ErrorUtils.invalidParameter('startTime', startTime, 'non-negative number');
    }
    
    if (videoDuration && startTime >= videoDuration) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        `startTime (${startTime}s) must be less than video duration (${videoDuration}s)`
      );
    }
  }

  /**
   * Validate duration parameter
   */
  private static validateDuration(
    duration: number, 
    startTime: number, 
    videoDuration?: number
  ): void {
    if (typeof duration !== 'number') {
      throw ErrorUtils.invalidParameter('duration', duration, 'number');
    }
    
    if (duration <= 0) {
      throw ErrorUtils.invalidParameter('duration', duration, 'positive number');
    }
    
    // Auto-clamp duration if it exceeds video length
    if (videoDuration && startTime + duration > videoDuration) {
      const maxDuration = Math.max(0.1, videoDuration - startTime);
      // Silently clamp the duration instead of throwing an error
      // This provides a better user experience
      console.warn(`Duration clamped from ${duration}s to ${maxDuration}s to fit within video bounds`);
      // Note: We don't modify the original options object here
      // The clamping should be done by the caller
    }
  }

  /**
   * Validate frames per second parameter
   */
  private static validateFps(fps: number): void {
    if (typeof fps !== 'number') {
      throw ErrorUtils.invalidParameter('fps', fps, 'number');
    }
    
    if (fps < 1 || fps > 30) {
      throw ErrorUtils.invalidParameter('fps', fps, 'number between 1 and 30');
    }
  }

  /**
   * Validate scale parameter
   */
  private static validateScale(scale: number): void {
    if (typeof scale !== 'number') {
      throw ErrorUtils.invalidParameter('scale', scale, 'number');
    }
    
    if (scale <= 0) {
      throw ErrorUtils.invalidParameter('scale', scale, 'positive number');
    }
    
    if (!Number.isInteger(scale)) {
      throw ErrorUtils.invalidParameter('scale', scale, 'integer');
    }
  }

  /**
   * Validate onProgress callback
   */
  private static validateOnProgress(onProgress: (progress: number) => void): void { // eslint-disable-line no-unused-vars
    if (typeof onProgress !== 'function') {
      throw ErrorUtils.invalidParameter('onProgress', onProgress, 'function');
    }
  }

  /**
   * Validate video file
   */
  private static validateVideoFile(videoFile: File | Blob | ArrayBuffer): void {
    if (!videoFile) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        'Video file is required'
      );
    }
    
    // Check file size (reasonable limit: 1GB)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    let fileSize: number;
    
    if (videoFile instanceof File) {
      fileSize = videoFile.size;
    } else if (videoFile instanceof Blob) {
      fileSize = videoFile.size;
    } else {
      fileSize = videoFile.byteLength;
    }
    
    if (fileSize > maxSize) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        `File size (${this.formatFileSize(fileSize)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`
      );
    }
  }

  /**
   * Get video duration from file
   */
  static async getVideoDuration(videoFile: File | Blob | ArrayBuffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        URL.revokeObjectURL(video.src);
        video.remove();
      };
      
      video.onloadedmetadata = () => {
        cleanup();
        if (video.duration && isFinite(video.duration)) {
          resolve(video.duration);
        } else {
          reject(new Video2GifError(
            Video2GifErrorType.UNSUPPORTED_FORMAT,
            'Unable to determine video duration'
          ));
        }
      };
      
      video.onerror = () => {
        cleanup();
        reject(new Video2GifError(
          Video2GifErrorType.UNSUPPORTED_FORMAT,
          'Unable to determine video duration. The file may be corrupted or in an unsupported format.'
        ));
      };
      
      try {
        const url = videoFile instanceof ArrayBuffer 
          ? URL.createObjectURL(new Blob([videoFile]))
          : URL.createObjectURL(videoFile);
        
        video.src = url;
      } catch (error) {
        cleanup();
        reject(new Video2GifError(
          Video2GifErrorType.UNSUPPORTED_FORMAT,
          'Failed to create object URL for video file'
        ));
      }
    });
  }

  /**
   * Get video information from file
   */
  static async getVideoInfo(videoFile: File | Blob | ArrayBuffer): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        URL.revokeObjectURL(video.src);
        video.remove();
      };
      
      video.onloadedmetadata = () => {
        cleanup();
        
        const info: VideoInfo = {
          duration: video.duration || 0,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0
        };
        
        // Get file size if available
        if (videoFile instanceof File || videoFile instanceof Blob) {
          info.size = videoFile.size;
        } else {
          info.size = videoFile.byteLength;
        }
        
        resolve(info);
      };
      
      video.onerror = () => {
        cleanup();
        reject(new Video2GifError(
          Video2GifErrorType.UNSUPPORTED_FORMAT,
          'Unable to analyze video file. The file may be corrupted or in an unsupported format.'
        ));
      };
      
      try {
        const url = videoFile instanceof ArrayBuffer 
          ? URL.createObjectURL(new Blob([videoFile]))
          : URL.createObjectURL(videoFile);
        
        video.src = url;
      } catch (error) {
        cleanup();
        reject(new Video2GifError(
          Video2GifErrorType.UNSUPPORTED_FORMAT,
          'Failed to create object URL for video file'
        ));
      }
    });
  }

  /**
   * Validate video format based on file extension or MIME type
   */
  static validateVideoFormat(file: File | Blob): void {
    let format: string;
    
    if (file instanceof File) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      format = extension || '';
    } else {
      // For Blob, try to infer from MIME type
      const mimeType = file.type;
      format = mimeType.split('/').pop()?.toLowerCase() || '';
    }
    
    // Remove common video container suffixes
    format = format.replace(/^(x-)?/, '');
    
    if (!this.isSupportedFormat(format)) {
      throw ErrorUtils.unsupportedFormat(
        format,
        Array.from(SUPPORTED_FORMATS),
        `Unsupported video format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      );
    }
  }

  /**
   * Check if a format is supported
   */
  private static isSupportedFormat(format: string): format is SupportedFormat {
    return SUPPORTED_FORMATS.includes(format as SupportedFormat);
  }

  /**
   * Calculate output dimensions while maintaining aspect ratio
   */
  static calculateOutputDimensions(
    inputWidth: number,
    inputHeight: number,
    targetWidth?: number
  ): { width: number; height: number } {
    if (!targetWidth || targetWidth <= 0) {
      return { width: inputWidth, height: inputHeight };
    }
    
    if (inputWidth <= 0 || inputHeight <= 0) {
      throw new Error('Invalid input dimensions');
    }
    
    const aspectRatio = inputHeight / inputWidth;
    const outputHeight = Math.round(targetWidth * aspectRatio);
    
    // Ensure dimensions are even (required for some video codecs)
    const evenWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
    const evenHeight = outputHeight % 2 === 0 ? outputHeight : outputHeight - 1;
    
    return {
      width: Math.max(2, evenWidth),
      height: Math.max(2, evenHeight)
    };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Round to specified decimal places
   */
  static round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Batch validation for multiple parameters
 */
export function validateBatch(
  videoFile: File | Blob | ArrayBuffer,
  options: Video2GifOptions,
  videoInfo?: VideoInfo
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    ParameterValidator.validateOptions(videoFile, options, videoInfo?.duration);
  } catch (error) {
    if (error instanceof Video2GifError) {
      errors.push(error.message);
    } else if (error instanceof Error) {
      errors.push(error.message);
    } else {
      errors.push(String(error));
    }
  }
  
  // Add warnings for potentially problematic settings
  if (options.fps && options.fps > 20) {
    warnings.push('High FPS (>20) may result in large file sizes');
  }
  
  if (options.scale && options.scale > 1280) {
    warnings.push('High resolution (>1280px) may result in slow conversion');
  }
  
  if (options.duration && options.duration > 30) {
    warnings.push('Long duration (>30s) may result in slow conversion');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}