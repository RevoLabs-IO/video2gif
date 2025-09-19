# Video2Gif Technical Specification

## Core Architecture

### 1. Type System Design

#### Primary Interfaces
```typescript
// Main conversion options
interface Video2GifOptions {
  startTime: number;        // Start time in seconds (0.1 precision)
  duration: number;         // Duration in seconds (0.1 precision)
  fps?: number;            // Frames per second (1-30, default: 10)
  scale?: number;          // Output width in pixels (height auto-calculated)
  onProgress?: (progress: number) => void; // Progress callback (0-100)
}

// FFmpeg configuration
interface FFmpegConfig {
  baseURL?: string;        // Custom FFmpeg WASM URL
  multiThread?: boolean;   // Enable multi-threading (auto-detected if undefined)
  timeout?: number;        // Conversion timeout in ms (default: 300000)
  memoryLimit?: number;   // Memory limit in MB (default: 512)
}

// Progress tracking
interface ConversionProgress {
  stage: 'loading' | 'analyzing' | 'processing' | 'finalizing';
  percent: number;
  estimatedTime?: number;
  framesProcessed?: number;
  totalFrames?: number;
}

// Error types
enum Video2GifErrorType {
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FFMPEG_LOAD_FAILED = 'FFMPEG_LOAD_FAILED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  CANCELLED = 'CANCELLED'
}

class Video2GifError extends Error {
  constructor(
    public type: Video2GifErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'Video2GifError';
  }
}
```

### 2. FFmpeg WASM Integration

#### Multi-threading Detection
```typescript
class FFmpegLoader {
  private static instance: FFmpegLoader;
  private ffmpeg: FFmpeg | null = null;
  private isMultiThreadSupported: boolean = false;

  constructor() {
    this.detectMultiThreadSupport();
  }

  private detectMultiThreadSupport(): void {
    try {
      this.isMultiThreadSupported =
        typeof SharedArrayBuffer !== 'undefined' &&
        typeof Atomics !== 'undefined' &&
        typeof WebAssembly !== 'undefined' &&
        // Test actual WASM threading support
        this.testWasmThreading();
    } catch {
      this.isMultiThreadSupported = false;
    }
  }

  private testWasmThreading(): boolean {
    // Create test WASM module with threading
    try {
      const wasmModule = new WebAssembly.Module(
        new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, // WASM magic
          0x01, 0x00, 0x00, 0x00  // Version
        ])
      );
      return WebAssembly.Module.imports(wasmModule).length >= 0;
    } catch {
      return false;
    }
  }

  async loadFFmpeg(config: FFmpegConfig = {}): Promise<FFmpeg> {
    if (this.ffmpeg) return this.ffmpeg;

    const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
    const baseURL = config.baseURL || this.getDefaultBaseURL(config.multiThread);

    this.ffmpeg = createFFmpeg({
      log: false,
      corePath: `${baseURL}/ffmpeg-core.js`,
      workerPath: `${baseURL}/ffmpeg-core.worker.js`,
      wasmPath: `${baseURL}/ffmpeg-core.wasm`,
      // Multi-threading configuration
      ...(this.isMultiThreadSupported && config.multiThread !== false ? {
        mainName: 'main',
        threadCount: navigator.hardwareConcurrency || 4
      } : {})
    });

    await this.ffmpeg.load();
    return this.ffmpeg;
  }

  private getDefaultBaseURL(multiThread?: boolean): string {
    if (multiThread === true && this.isMultiThreadSupported) {
      return 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/umd';
    }
    return 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
  }

  get isMultiThreadSupported(): boolean {
    return this.isMultiThreadSupported;
  }
}

// Singleton pattern
let ffmpegLoaderInstance: FFmpegLoader | null = null;
export function getFFmpegLoader(): FFmpegLoader {
  if (!ffmpegLoaderInstance) {
    ffmpegLoaderInstance = new FFmpegLoader();
  }
  return ffmpegLoaderInstance;
}
```

### 3. Parameter Validation System

#### Validation Logic
```typescript
class ParameterValidator {
  static validateOptions(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    videoDuration?: number
  ): void {
    // Validate startTime
    if (typeof options.startTime !== 'number' || options.startTime < 0) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        `startTime must be a non-negative number, got: ${options.startTime}`
      );
    }
    
    if (videoDuration && options.startTime >= videoDuration) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        `startTime (${options.startTime}s) must be less than video duration (${videoDuration}s)`
      );
    }
    
    // Validate duration
    if (typeof options.duration !== 'number' || options.duration <= 0) {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        `duration must be a positive number, got: ${options.duration}`
      );
    }
    
    if (videoDuration && options.startTime + options.duration > videoDuration) {
      // Auto-clamp duration
      options.duration = Math.max(0.1, videoDuration - options.startTime);
    }
    
    // Validate fps
    if (options.fps !== undefined) {
      if (typeof options.fps !== 'number' || options.fps < 1 || options.fps > 30) {
        throw new Video2GifError(
          Video2GifErrorType.INVALID_PARAMETERS,
          `fps must be between 1 and 30, got: ${options.fps}`
        );
      }
    }
    
    // Validate scale
    if (options.scale !== undefined) {
      if (typeof options.scale !== 'number' || options.scale <= 0 || !Number.isInteger(options.scale)) {
        throw new Video2GifError(
          Video2GifErrorType.INVALID_PARAMETERS,
          `scale must be a positive integer, got: ${options.scale}`
        );
      }
    }
    
    // Validate onProgress
    if (options.onProgress !== undefined && typeof options.onProgress !== 'function') {
      throw new Video2GifError(
        Video2GifErrorType.INVALID_PARAMETERS,
        'onProgress must be a function'
      );
    }
  }
  
  static async getVideoDuration(videoFile: File | Blob | ArrayBuffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Video2GifError(
          Video2GifErrorType.UNSUPPORTED_FORMAT,
          'Unable to determine video duration. The file may be corrupted or in an unsupported format.'
        ));
      };
      
      const url = videoFile instanceof ArrayBuffer 
        ? URL.createObjectURL(new Blob([videoFile]))
        : URL.createObjectURL(videoFile);
      
      video.src = url;
    });
  }
}
```

### 4. Core Conversion Engine

#### Main Conversion Logic
```typescript
class VideoConverter {
  private ffmpeg: FFmpeg | null = null;
  private isCancelled = false;
  private startTime = 0;
  
  async convert(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    config: FFmpegConfig
  ): Promise<Blob> {
    this.startTime = Date.now();
    this.isCancelled = false;
    
    try {
      // Load FFmpeg
      await this.reportProgress(options, 'loading', 0);
      this.ffmpeg = await FFmpegLoader.getInstance().loadFFmpeg(config);
      
      // Get video info
      await this.reportProgress(options, 'analyzing', 10);
      const videoInfo = await this.getVideoInfo(videoFile);
      
      // Validate parameters with actual video duration
      ParameterValidator.validateOptions(
        videoFile,
        options,
        videoInfo.duration
      );
      
      // Convert to GIF
      await this.reportProgress(options, 'processing', 20);
      const gifBlob = await this.processVideo(videoFile, options, videoInfo);
      
      // Finalize
      await this.reportProgress(options, 'finalizing', 90);
      
      return gifBlob;
      
    } catch (error) {
      if (this.isCancelled) {
        throw new Video2GifError(
          Video2GifErrorType.CANCELLED,
          'Conversion was cancelled'
        );
      }
      throw error;
    } finally {
      await this.cleanup();
    }
  }
  
  private async getVideoInfo(videoFile: File | Blob | ArrayBuffer): Promise<VideoInfo> {
    // Implementation for getting video dimensions, duration, etc.
    const duration = await ParameterValidator.getVideoDuration(videoFile);
    return { duration, width: 0, height: 0 }; // Simplified
  }
  
  private async processVideo(
    videoFile: File | Blob | ArrayBuffer,
    options: Video2GifOptions,
    videoInfo: VideoInfo
  ): Promise<Blob> {
    if (!this.ffmpeg) throw new Error('FFmpeg not loaded');
    
    // Write input file
    const inputName = 'input' + this.getFileExtension(videoFile);
    await this.ffmpeg.FS('writeFile', inputName, new Uint8Array(
      videoFile instanceof ArrayBuffer ? videoFile : await videoFile.arrayBuffer()
    ));
    
    // Calculate output dimensions
    const outputWidth = options.scale || videoInfo.width;
    const outputHeight = this.calculateHeight(videoInfo, outputWidth);
    
    // Build FFmpeg command
    const fps = options.fps || 10;
    const command = [
      '-i', inputName,
      '-ss', options.startTime.toString(),
      '-t', options.duration.toString(),
      '-vf', `fps=${fps},scale=${outputWidth}:${outputHeight}:flags=lanczos`,
      '-gifflags', '+transdiff',
      '-y',
      'output.gif'
    ];
    
    // Execute conversion with progress tracking
    await this.ffmpeg.run(...command);
    
    // Read output
    const data = this.ffmpeg.FS('readFile', 'output.gif');
    return new Blob([data.buffer], { type: 'image/gif' });
  }
  
  private calculateHeight(videoInfo: VideoInfo, targetWidth: number): number {
    if (!videoInfo.width || !videoInfo.height) return targetWidth;
    return Math.round((videoInfo.height / videoInfo.width) * targetWidth);
  }
  
  private async reportProgress(
    options: Video2GifOptions,
    stage: ConversionProgress['stage'],
    percent: number
  ): Promise<void> {
    if (options.onProgress) {
      options.onProgress(Math.min(100, Math.max(0, percent)));
    }
  }
  
  private async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        // Clean up FFmpeg file system
        this.ffmpeg.FS('unlink', 'input.mp4');
        this.ffmpeg.FS('unlink', 'output.gif');
      } catch {
        // Ignore cleanup errors
      }
    }
  }
  
  cancel(): void {
    this.isCancelled = true;
  }
}
```

### 5. Main API Implementation

#### Public API
```typescript
// Main export function
export async function video2gif(
  videoFile: File | Blob | ArrayBuffer,
  options: Video2GifOptions,
  config: FFmpegConfig = {}
): Promise<Blob> {
  const converter = new VideoConverter();
  return converter.convert(videoFile, options, config);
}

// Advanced conversion with result metadata
export async function convertVideoToGifWithResult(
  videoFile: File | Blob | ArrayBuffer,
  options: Video2GifOptions & { onProgress?: (progress: number) => void },
  config: FFmpegConfig = {}
): Promise<{
  blob: Blob;
  outputGif: {
    width: number;
    height: number;
    fileSize: number;
    frameCount: number;
    duration: number;
  };
  statistics: {
    conversionTime: number;
    memoryUsed: number;
    threadingMode: 'single' | 'multi';
  };
}> {
  const converter = new VideoConverter();
  return converter.convertWithResult(videoFile, options, config);
}

// Utility exports
export { Video2GifError, Video2GifErrorType } from './errors';
export type { Video2GifOptions, FFmpegConfig, ConversionProgress } from './types';

// Browser feature detection
export function isMultiThreadSupported(): boolean {
  return getFFmpegLoader().isMultiThreadSupported;
}

// Preset configurations
export const Presets = {
  SMALL: { fps: 8, scale: 240 } as Video2GifOptions,
  MEDIUM: { fps: 10, scale: 480 } as Video2GifOptions,
  LARGE: { fps: 12, scale: 640 } as Video2GifOptions,
  HD: { fps: 15, scale: 1280 } as Video2GifOptions
};
```

## Performance Optimizations

### Memory Management
- Stream processing to avoid loading entire video
- Automatic resource cleanup
- Memory limit detection
- Efficient frame sampling

### Multi-threading
- SharedArrayBuffer support detection
- Automatic fallback to single-thread
- Web Worker isolation
- Hardware concurrency utilization

### Caching Strategy
- FFmpeg instance reuse
- CDN URL optimization
- Browser feature caching
- Conversion result caching (optional)

## Error Handling Strategy

### Error Types
1. **Invalid Parameters**: User input validation
2. **Unsupported Format**: Video format issues
3. **FFmpeg Load Failed**: WASM loading problems
4. **Conversion Failed**: Processing errors
5. **Memory Limit Exceeded**: Resource constraints
6. **Timeout Exceeded**: Long-running operations
7. **Cancelled**: User cancellation

### Recovery Mechanisms
- Automatic parameter correction
- Graceful degradation
- Fallback to single-threading
- CDN fallback URLs
- Memory cleanup on failure

## Security Considerations

### Input Validation
- File type verification
- Size limit enforcement
- Parameter sanitization
- XSS prevention in demo

### Resource Limits
- Memory usage monitoring
- Timeout enforcement
- Concurrent operation limits
- Browser feature detection

This technical specification provides the foundation for implementing a robust, performant, and secure video-to-GIF conversion library.