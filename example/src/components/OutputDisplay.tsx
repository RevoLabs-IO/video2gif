import { useState } from 'react';
import { Download, Copy, Check, ExternalLink, Image } from 'lucide-react';
import { ConversionResult } from '../types';
import { VideoFile } from '../types';
import { Button } from '@/components/ui/button';

interface OutputDisplayProps {
  result: ConversionResult;
  videoFile: VideoFile;
}

export function OutputDisplay({ result, videoFile }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `${videoFile.name.replace(/\.[^/.]+$/, '')}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressionRatio = () => {
    if (!videoFile.size) return 0;
    return ((videoFile.size - result.fileSize) / videoFile.size * 100);
  };

  return (
    <div className="space-y-6">
      {/* GIF Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary flex items-center gap-2">
            <Image className="w-4 h-4" />
            GIF Preview
          </h4>
          <span className="text-xs text-text-secondary">
            {result.width}×{result.height} • {result.frameCount} frames
          </span>
        </div>
        
        <div className="relative rounded-xl overflow-hidden bg-black">
          <img
            src={result.url}
            alt="Converted GIF"
            className="w-full h-auto max-h-64 object-contain"
          />
          
          {/* Overlay with download button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleDownload}
              className="glass-button flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download GIF
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="glass p-4 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-3">Conversion Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Original Size:</span>
            <span className="ml-2 text-text-primary">{formatFileSize(videoFile.size)}</span>
          </div>
          <div>
            <span className="text-text-secondary">GIF Size:</span>
            <span className="ml-2 text-text-primary">{formatFileSize(result.fileSize)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Compression:</span>
            <span className="ml-2 text-accent-success">
              {calculateCompressionRatio().toFixed(1)}% smaller
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Duration:</span>
            <span className="ml-2 text-text-primary">{result.duration.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-text-secondary">Frames:</span>
            <span className="ml-2 text-text-primary">{result.frameCount}</span>
          </div>
          <div>
            <span className="text-text-secondary">FPS:</span>
            <span className="ml-2 text-text-primary">{Math.round(result.frameCount / result.duration)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        <Button
          onClick={handleCopyUrl}
          variant="outline"
          className="flex items-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>

        <Button asChild variant="outline">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </a>
        </Button>
      </div>

      {/* Performance Info */}
      <div className="glass p-4 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-2">Performance</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Conversion Time:</span>
          <span className="text-text-primary">
            {(result.statistics.conversionTime / 1000).toFixed(1)}s
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-text-secondary">Threading Mode:</span>
          <span className={`${result.statistics.threadingMode === 'multi' ? 'text-accent-success' : 'text-text-secondary'}`}>
            {result.statistics.threadingMode === 'multi' ? 'Multi-threaded' : 'Single-threaded'}
          </span>
        </div>
      </div>
    </div>
  );
}