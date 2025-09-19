/**
 * Tests for type definitions and interfaces
 */

import { describe, it, expect } from 'vitest';
import {
  Video2GifOptions,
  Video2GifError,
  Video2GifErrorType,
  Presets,
  DEFAULTS,
  SUPPORTED_FORMATS
} from '../src/types.js';
import { Video2GifError as Video2GifErrorClass } from '../src/errors.js';

describe('Type Definitions', () => {
  it('should have valid preset configurations', () => {
    expect(Presets.SMALL).toBeDefined();
    expect(Presets.SMALL.fps).toBe(8);
    expect(Presets.SMALL.scale).toBe(240);
    
    expect(Presets.MEDIUM).toBeDefined();
    expect(Presets.MEDIUM.fps).toBe(10);
    expect(Presets.MEDIUM.scale).toBe(480);
    
    expect(Presets.LARGE).toBeDefined();
    expect(Presets.LARGE.fps).toBe(12);
    expect(Presets.LARGE.scale).toBe(640);
    
    expect(Presets.HD).toBeDefined();
    expect(Presets.HD.fps).toBe(15);
    expect(Presets.HD.scale).toBe(1280);
  });

  it('should have valid default values', () => {
    expect(DEFAULTS.FPS).toBe(10);
    expect(DEFAULTS.TIMEOUT).toBe(300000);
    expect(DEFAULTS.MEMORY_LIMIT).toBe(512);
    expect(DEFAULTS.DEFAULT_SINGLE_THREAD_URL).toContain('cdn.jsdelivr.net');
    expect(DEFAULTS.DEFAULT_MULTI_THREAD_URL).toContain('cdn.jsdelivr.net');
  });

  it('should have supported formats', () => {
    expect(SUPPORTED_FORMATS).toContain('mp4');
    expect(SUPPORTED_FORMATS).toContain('webm');
    expect(SUPPORTED_FORMATS).toContain('mov');
    expect(SUPPORTED_FORMATS).toContain('avi');
    expect(SUPPORTED_FORMATS.length).toBeGreaterThan(5);
  });

  it('should create valid Video2GifError', () => {
    const error = new Video2GifErrorClass(
      Video2GifErrorType.INVALID_PARAMETERS,
      'Test error message',
      { test: 'data' }
    );
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(Video2GifErrorClass);
    expect(error.type).toBe(Video2GifErrorType.INVALID_PARAMETERS);
    expect(error.message).toBe('Test error message');
    expect(error.details).toEqual({ test: 'data' });
    expect(error.name).toBe('Video2GifError');
  });

  it('should provide user-friendly error messages', () => {
    const invalidParamsError = new Video2GifErrorClass(
      Video2GifErrorType.INVALID_PARAMETERS,
      'Invalid parameters'
    );
    expect(invalidParamsError.getUserMessage()).toContain('parameters');
    
    const formatError = new Video2GifErrorClass(
      Video2GifErrorType.UNSUPPORTED_FORMAT,
      'Unsupported format'
    );
    expect(formatError.getUserMessage()).toContain('format');
    
    const ffmpegError = new Video2GifErrorClass(
      Video2GifErrorType.FFMPEG_LOAD_FAILED,
      'FFmpeg load failed'
    );
    expect(ffmpegError.getUserMessage()).toContain('processing library');
  });

  it('should serialize and deserialize errors', () => {
    const originalError = new Video2GifErrorClass(
      Video2GifErrorType.CONVERSION_FAILED,
      'Conversion failed',
      { stage: 'processing' }
    );
    
    const json = originalError.toJSON();
    expect(json.type).toBe(Video2GifErrorType.CONVERSION_FAILED);
    expect(json.message).toBe('Conversion failed');
    expect(json.details).toEqual({ stage: 'processing' });
    
    const restoredError = Video2GifErrorClass.fromJSON(json);
    expect(restoredError.type).toBe(originalError.type);
    expect(restoredError.message).toBe(originalError.message);
    expect(restoredError.details).toEqual(originalError.details);
  });
});

describe('Type Safety', () => {
  it('should enforce required options', () => {
    // This test ensures TypeScript compilation works correctly
    const validOptions: Video2GifOptions = {
      startTime: 0,
      duration: 5
    };
    
    expect(validOptions.startTime).toBe(0);
    expect(validOptions.duration).toBe(5);
    expect(validOptions.fps).toBeUndefined();
    expect(validOptions.scale).toBeUndefined();
    expect(validOptions.onProgress).toBeUndefined();
  });

  it('should accept optional parameters', () => {
    const fullOptions: Video2GifOptions = {
      startTime: 1.5,
      duration: 3.2,
      fps: 15,
      scale: 640,
      onProgress: (progress: number) => console.log(progress)
    };
    
    expect(fullOptions.startTime).toBe(1.5);
    expect(fullOptions.duration).toBe(3.2);
    expect(fullOptions.fps).toBe(15);
    expect(fullOptions.scale).toBe(640);
    expect(typeof fullOptions.onProgress).toBe('function');
  });
});