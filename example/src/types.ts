export interface VideoFile {
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ConversionOptions {
  startTime: number;
  duration: number;
  fps: number;
  scale: number;
}

export interface ConversionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  frameCount: number;
  duration: number;
  statistics: {
    conversionTime: number;
    memoryUsed: number;
    threadingMode: 'single' | 'multi';
  };
}

export interface Theme {
  isDark: boolean;
  toggle: () => void;
}

export interface ProgressState {
  progress: number;
  stage: string;
  isConverting: boolean;
}