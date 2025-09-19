/**
 * Custom error classes for video2gif library
 */

import { Video2GifErrorType } from './types.js';

/**
 * Custom error class for video2gif operations
 */
export class Video2GifError extends Error {
  constructor(
    public type: Video2GifErrorType,
    message: string,
    public details?: any
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

  /**
   * Convert error to JSON for serialization
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      stack: this.stack
    };
  }

  /**
   * Create error from JSON
   */
  static fromJSON(json: any): Video2GifError {
    const error = new Video2GifError(json.type, json.message, json.details);
    error.stack = json.stack;
    return error;
  }
}

/**
 * Parameter validation error
 */
export class ValidationError extends Video2GifError {
  constructor(
    message: string,
    public parameter: string,
    public value: any,
    public expected?: string
  ) {
    super(Video2GifErrorType.INVALID_PARAMETERS, message, {
      parameter,
      value,
      expected
    });
    this.name = 'ValidationError';
  }
}

/**
 * Format validation error
 */
export class FormatError extends Video2GifError {
  constructor(
    message: string,
    public format: string,
    public supportedFormats?: string[]
  ) {
    super(Video2GifErrorType.UNSUPPORTED_FORMAT, message, {
      format,
      supportedFormats
    });
    this.name = 'FormatError';
  }
}

/**
 * FFmpeg loading error
 */
export class FFmpegLoadError extends Video2GifError {
  constructor(
    message: string,
    public url?: string,
    public reason?: string
  ) {
    super(Video2GifErrorType.FFMPEG_LOAD_FAILED, message, {
      url,
      reason
    });
    this.name = 'FFmpegLoadError';
  }
}

/**
 * Conversion error
 */
export class ConversionError extends Video2GifError {
  constructor(
    message: string,
    public stage?: string,
    public exitCode?: number,
    public command?: string[]
  ) {
    super(Video2GifErrorType.CONVERSION_FAILED, message, {
      stage,
      exitCode,
      command
    });
    this.name = 'ConversionError';
  }
}

/**
 * Memory limit exceeded error
 */
export class MemoryLimitError extends Video2GifError {
  constructor(
    message: string,
    public usedMemory: number,
    public limit: number
  ) {
    super(Video2GifErrorType.MEMORY_LIMIT_EXCEEDED, message, {
      usedMemory,
      limit
    });
    this.name = 'MemoryLimitError';
  }
}

/**
 * Timeout exceeded error
 */
export class TimeoutError extends Video2GifError {
  constructor(
    message: string,
    public elapsedTime: number,
    public timeout: number
  ) {
    super(Video2GifErrorType.TIMEOUT_EXCEEDED, message, {
      elapsedTime,
      timeout
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Operation cancelled error
 */
export class CancelledError extends Video2GifError {
  constructor(message: string = 'Operation was cancelled') {
    super(Video2GifErrorType.CANCELLED, message);
    this.name = 'CancelledError';
  }
}

/**
 * Error utility functions
 */
export class ErrorUtils {
  /**
   * Check if an error is a Video2GifError
   */
  static isVideo2GifError(error: any): error is Video2GifError {
    return error instanceof Video2GifError;
  }

  /**
   * Wrap an unknown error in a Video2GifError
   */
  static wrapError(error: unknown, context?: string): Video2GifError {
    if (this.isVideo2GifError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new Video2GifError(
        Video2GifErrorType.UNKNOWN,
        context ? `${context}: ${error.message}` : error.message,
        { originalError: error }
      );
    }

    if (typeof error === 'string') {
      return new Video2GifError(
        Video2GifErrorType.UNKNOWN,
        context ? `${context}: ${error}` : error
      );
    }

    return new Video2GifError(
      Video2GifErrorType.UNKNOWN,
      context ? `${context}: An unknown error occurred` : 'An unknown error occurred',
      { originalError: error }
    );
  }

  /**
   * Create a validation error for invalid parameters
   */
  static invalidParameter(
    parameter: string,
    value: any,
    expected?: string,
    customMessage?: string
  ): ValidationError {
    const message = customMessage || 
      `Invalid ${parameter}: expected ${expected || 'valid value'}, got ${JSON.stringify(value)}`;
    return new ValidationError(message, parameter, value, expected);
  }

  /**
   * Create a format error for unsupported formats
   */
  static unsupportedFormat(
    format: string,
    supportedFormats?: string[],
    customMessage?: string
  ): FormatError {
    const message = customMessage || 
      `Unsupported format: ${format}. Supported formats: ${supportedFormats?.join(', ') || 'various video formats'}`;
    return new FormatError(message, format, supportedFormats);
  }

  /**
   * Create a timeout error
   */
  static timeout(elapsedTime: number, timeout: number): TimeoutError {
    const message = `Operation timed out after ${elapsedTime}ms (limit: ${timeout}ms)`;
    return new TimeoutError(message, elapsedTime, timeout);
  }

  /**
   * Create a memory limit error
   */
  static memoryLimit(usedMemory: number, limit: number): MemoryLimitError {
    const message = `Memory limit exceeded: ${usedMemory}MB used (limit: ${limit}MB)`;
    return new MemoryLimitError(message, usedMemory, limit);
  }
}