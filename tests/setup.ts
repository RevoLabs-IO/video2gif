/**
 * Test setup and global configuration
 */

import { vi, expect } from 'vitest';

// Mock browser APIs that might not be available in test environment
Object.defineProperty(window, 'SharedArrayBuffer', {
  writable: true,
  value: typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined
});

Object.defineProperty(window, 'Atomics', {
  writable: true,
  value: typeof Atomics !== 'undefined' ? Atomics : undefined
});

Object.defineProperty(window, 'WebAssembly', {
  writable: true,
  value: typeof WebAssembly !== 'undefined' ? WebAssembly : undefined
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true,
  value: 4
});

// Mock FFmpeg for testing
class MockFFmpeg {
  private files: Map<string, Uint8Array> = new Map();
  
  async load() {
    return Promise.resolve();
  }
  
  async writeFile(name: string, data: Uint8Array) {
    this.files.set(name, data);
  }
  
  async readFile(name: string): Promise<Uint8Array> {
    const data = this.files.get(name);
    if (!data) {
      throw new Error(`File not found: ${name}`);
    }
    return data;
  }
  
  async exec(command: string[]) {
    // Mock execution - just create a dummy output
    const outputFile = command[command.length - 1];
    if (outputFile) {
      this.files.set(outputFile, new Uint8Array([0x47, 0x49, 0x46])); // GIF header
    }
  }
}

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: MockFFmpeg
}));

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: async (url: string) => url
}));

// Mock global functions
global.fetch = vi.fn();

// Mock FileReader
class MockFileReader {
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;
  readyState = 0;
  result: string | ArrayBuffer | null = null;
  
  readAsDataURL(blob: Blob) {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.readyState = this.DONE;
      this.result = 'data:application/octet-stream;base64,SGVsbG8gV29ybGQ=';
      this.onloadend?.(new ProgressEvent('loadend'));
    }, 0);
  }
  
  readAsArrayBuffer(blob: Blob) {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.readyState = this.DONE;
      this.result = new ArrayBuffer(1024);
      this.onloadend?.(new ProgressEvent('loadend'));
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn((blob: Blob) => {
  return `blob:mock-url-${Math.random()}`;
});

global.URL.revokeObjectURL = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: vi.fn((...args) => originalConsole.log(...args)),
  warn: vi.fn((...args) => originalConsole.warn(...args)),
  error: vi.fn((...args) => originalConsole.error(...args))
};

// Helper function to create mock video files
export function createMockVideoFile(
  size: number = 1024 * 1024, // 1MB default
  type: string = 'video/mp4',
  name: string = 'test-video.mp4'
): File {
  const buffer = new ArrayBuffer(size);
  const blob = new Blob([buffer], { type });
  return new File([blob], name, { type });
}

// Helper function to create mock video element
export function createMockVideoElement(
  duration: number = 10,
  width: number = 1920,
  height: number = 1080
): HTMLVideoElement {
  const video = document.createElement('video');
  
  // Mock properties
  Object.defineProperty(video, 'duration', {
    value: duration,
    writable: true
  });
  
  Object.defineProperty(video, 'videoWidth', {
    value: width,
    writable: true
  });
  
  Object.defineProperty(video, 'videoHeight', {
    value: height,
    writable: true
  });
  
  // Mock methods
  video.load = vi.fn();
  video.play = vi.fn();
  video.pause = vi.fn();
  
  return video;
}

// Global test utilities
export const testUtils = {
  /**
   * Create a delay for async testing
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Create a mock progress callback
   */
  createProgressCallback: () => {
    const callback = vi.fn();
    return callback;
  },
  
  /**
   * Assert that a function throws a specific error type
   */
  async assertThrowsAsync(
    fn: () => Promise<any>,
    errorType: new (...args: any[]) => Error,
    message?: string
  ): Promise<void> {
    try {
      await fn();
      throw new Error('Expected function to throw, but it did not');
    } catch (error) {
      if (!(error instanceof errorType)) {
        throw new Error(
          `Expected error to be instance of ${errorType.name}, but got ${error?.constructor.name}`
        );
      }
      if (message && error instanceof Error && !error.message.includes(message)) {
        throw new Error(
          `Expected error message to include "${message}", but got "${error.message}"`
        );
      }
    }
  }
};

// Extend vitest matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(min: number, max: number): T;
    toBeValidVideoInfo(): T;
  }
}

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => 
        pass 
          ? `expected ${received} not to be within range ${min} - ${max}`
          : `expected ${received} to be within range ${min} - ${max}`
    };
  },
  
  toBeValidVideoInfo(received: any) {
    const pass = received && 
      typeof received.duration === 'number' &&
      typeof received.width === 'number' &&
      typeof received.height === 'number' &&
      received.duration > 0 &&
      received.width > 0 &&
      received.height > 0;
    
    return {
      pass,
      message: () =>
        pass
          ? `expected video info to be invalid`
          : `expected video info to be valid with duration, width, and height properties`
    };
  }
});