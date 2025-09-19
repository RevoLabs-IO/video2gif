/**
 * Tests for parameter validation system
 */

import { describe, it, expect, vi } from 'vitest';
import { ParameterValidator, validateBatch } from '../src/validator';
import { Video2GifError, Video2GifErrorType } from '../src/types';
import { ValidationError, FormatError } from '../src/errors';
import { createMockVideoFile, createMockVideoElement } from './setup';

describe('ParameterValidator', () => {
  describe('validateOptions', () => {
    it('should validate valid options', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 5,
        fps: 10,
        scale: 480
      };
      
      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).not.toThrow();
    });

    it('should throw error for negative startTime', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: -1,
        duration: 5
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for zero duration', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 0
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for invalid fps', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 5,
        fps: 35
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for invalid scale', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 5,
        scale: -100
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for non-integer scale', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 5,
        scale: 480.5
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for invalid onProgress', () => {
      const videoFile = createMockVideoFile();
      const options = {
        startTime: 0,
        duration: 5,
        onProgress: 'not a function' as any
      };

      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(ValidationError);
    });

    it('should throw error for missing video file', () => {
      const options = {
        startTime: 0,
        duration: 5
      };
      
      expect(() => {
        ParameterValidator.validateOptions(null as any, options);
      }).toThrow(Video2GifError);
    });

    it('should throw error for oversized video file', () => {
      // Create a 2GB file (exceeds 1GB limit)
      const videoFile = createMockVideoFile(2 * 1024 * 1024 * 1024);
      const options = {
        startTime: 0,
        duration: 5
      };
      
      expect(() => {
        ParameterValidator.validateOptions(videoFile, options);
      }).toThrow(Video2GifError);
    });
  });

  describe('getVideoDuration', () => {
    it('should get video duration from File', async () => {
      const mockVideo = createMockVideoElement(15.5, 1920, 1080);
      
      // Mock createObjectURL and video loading
      const mockCreateObjectURL = vi.fn(() => 'mock-video-url');
      global.URL.createObjectURL = mockCreateObjectURL;
      
      // Mock video element creation
      const originalCreateElement = document.createElement;
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'video') {
          return mockVideo;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const videoFile = createMockVideoFile();
      const durationPromise = ParameterValidator.getVideoDuration(videoFile);
      
      // Simulate video metadata loading
      setTimeout(() => {
        mockVideo.onloadedmetadata?.(new Event('loadedmetadata'));
      }, 10);
      
      const duration = await durationPromise;
      expect(duration).toBe(15.5);
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should handle video load errors', async () => {
      const mockVideo = createMockVideoElement();
      
      const originalCreateElement = document.createElement;
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'video') {
          return mockVideo;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const videoFile = createMockVideoFile();
      const durationPromise = ParameterValidator.getVideoDuration(videoFile);
      
      // Simulate video load error
      setTimeout(() => {
        mockVideo.onerror?.(new Event('error'));
      }, 10);
      
      await expect(durationPromise).rejects.toThrow(Video2GifError);
    });
  });

  describe('getVideoInfo', () => {
    it('should get complete video information', async () => {
      const mockVideo = createMockVideoElement(20, 1280, 720);
      
      const originalCreateElement = document.createElement;
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'video') {
          return mockVideo;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const videoFile = createMockVideoFile(1024 * 1024, 'video/mp4', 'test.mp4');
      const infoPromise = ParameterValidator.getVideoInfo(videoFile);
      
      // Simulate video metadata loading
      setTimeout(() => {
        mockVideo.onloadedmetadata?.(new Event('loadedmetadata'));
      }, 10);
      
      const info = await infoPromise;
      expect(info.duration).toBe(20);
      expect(info.width).toBe(1280);
      expect(info.height).toBe(720);
      expect(info.size).toBe(1024 * 1024);
    });
  });

  describe('validateVideoFormat', () => {
    it('should accept supported video formats', () => {
      const supportedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
      
      supportedFormats.forEach(format => {
        const videoFile = createMockVideoFile(1024 * 1024, `video/${format}`, `test.${format}`);
        expect(() => {
          ParameterValidator.validateVideoFormat(videoFile);
        }).not.toThrow();
      });
    });

    it('should reject unsupported video formats', () => {
      const unsupportedFile = createMockVideoFile(1024 * 1024, 'video/unsupported', 'test.unsupported');

      expect(() => {
        ParameterValidator.validateVideoFormat(unsupportedFile);
      }).toThrow(FormatError);
    });
  });

  describe('calculateOutputDimensions', () => {
    it('should maintain aspect ratio when scaling', () => {
      const inputWidth = 1920;
      const inputHeight = 1080;
      const targetWidth = 640;
      
      const result = ParameterValidator.calculateOutputDimensions(inputWidth, inputHeight, targetWidth);
      
      expect(result.width).toBe(640);
      expect(result.height).toBe(360); // 1080 * (640/1920)
    });

    it('should return original dimensions when no scale is specified', () => {
      const inputWidth = 1920;
      const inputHeight = 1080;
      
      const result = ParameterValidator.calculateOutputDimensions(inputWidth, inputHeight);
      
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });

    it('should ensure dimensions are even', () => {
      const inputWidth = 1000;
      const inputHeight = 667; // Odd height
      const targetWidth = 333; // Odd width
      
      const result = ParameterValidator.calculateOutputDimensions(inputWidth, inputHeight, targetWidth);
      
      expect(result.width % 2).toBe(0);
      expect(result.height % 2).toBe(0);
    });

    it('should handle edge cases with small dimensions', () => {
      const result = ParameterValidator.calculateOutputDimensions(100, 100, 1);
      
      expect(result.width).toBeGreaterThanOrEqual(2);
      expect(result.height).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Utility functions', () => {
    it('should clamp values correctly', () => {
      expect(ParameterValidator.clamp(5, 0, 10)).toBe(5);
      expect(ParameterValidator.clamp(-5, 0, 10)).toBe(0);
      expect(ParameterValidator.clamp(15, 0, 10)).toBe(10);
    });

    it('should round values correctly', () => {
      expect(ParameterValidator.round(3.14159, 2)).toBe(3.14);
      expect(ParameterValidator.round(3.14159, 0)).toBe(3);
      expect(ParameterValidator.round(3.14159, 4)).toBe(3.1416);
    });
  });
});

describe('validateBatch', () => {
  it('should validate multiple parameters at once', async () => {
    const videoFile = createMockVideoFile();
    const options = {
      startTime: 0,
      duration: 5,
      fps: 25, // High FPS to trigger warning
      scale: 1920 // High resolution to trigger warning
    };

    // Mock video info
    const videoInfo = {
      duration: 10,
      width: 1920,
      height: 1080,
      size: 1024 * 1024
    };

    const result = validateBatch(videoFile, options, videoInfo);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0); // Should have warnings for high FPS and resolution
  });

  it('should detect invalid parameters', async () => {
    const videoFile = createMockVideoFile();
    const options = {
      startTime: -1, // Invalid
      duration: 5,
      fps: 35 // Invalid
    };
    
    const result = validateBatch(videoFile, options);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should provide warnings for potentially problematic settings', async () => {
    const videoFile = createMockVideoFile();
    const options = {
      startTime: 0,
      duration: 5,
      fps: 25, // High FPS
      scale: 1920 // High resolution
    };
    
    const result = validateBatch(videoFile, options);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('FPS'))).toBe(true);
    expect(result.warnings.some(w => w.includes('resolution'))).toBe(true);
  });
});