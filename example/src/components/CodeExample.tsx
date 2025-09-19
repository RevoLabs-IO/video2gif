import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { VideoFile } from '../types';
import { ConversionResult } from '../types';
import { Button } from '@/components/ui/button';

interface CodeExampleProps {
  videoFile: VideoFile | null;
  conversionResult: ConversionResult | null;
}

export function CodeExample({ videoFile, conversionResult }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    if (!videoFile || !conversionResult) {
      return `// Basic usage
import { video2gif } from 'video2gif';

const gif = await video2gif(videoFile, {
  startTime: 0,
  duration: 3,
  fps: 10,
  scale: 480
});`;
    }

    return `// Convert "${videoFile.name}" to GIF
import { video2gif, convertVideoToGifWithResult } from 'video2gif';

// Basic conversion
const gif = await video2gif(videoFile, {
  startTime: 0,
  duration: ${conversionResult.duration.toFixed(1)},
  fps: ${Math.round(conversionResult.frameCount / conversionResult.duration)},
  scale: ${conversionResult.width}
});

// Advanced conversion with progress tracking
const result = await convertVideoToGifWithResult(videoFile, {
  startTime: 0,
  duration: ${conversionResult.duration.toFixed(1)},
  fps: ${Math.round(conversionResult.frameCount / conversionResult.duration)},
  scale: ${conversionResult.width},
  onProgress: (progress) => {
    console.log(\`\${progress}% complete\`);
  }
});

console.log('GIF created:', {
  width: result.outputGif.width,
  height: result.outputGif.height,
  fileSize: result.outputGif.fileSize,
  conversionTime: result.statistics.conversionTime + 'ms'
});`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const code = generateCode();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Code className="w-5 h-5" />
          Code Example
        </h3>
        
        <Button
          onClick={handleCopy}
          variant={copied ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <pre className="glass p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-text-primary font-mono">
            {code}
          </code>
        </pre>
        
        {/* Language badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs bg-surface-secondary text-text-secondary rounded">
            TypeScript
          </span>
        </div>
      </div>

      {/* Additional Examples */}
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary">More Examples</h4>
        
        <details className="glass rounded-lg">
          <summary className="cursor-pointer p-3 font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
            Using Presets
          </summary>
          <div className="p-3 border-t border-border-primary">
            <pre className="text-sm text-text-primary font-mono overflow-x-auto">
              <code>{`import { video2gif, Presets } from 'video2gif';

// Use predefined presets
const smallGif = await video2gif(videoFile, Presets.SMALL);   // 240p, 8fps
const mediumGif = await video2gif(videoFile, Presets.MEDIUM); // 480p, 10fps
const largeGif = await video2gif(videoFile, Presets.LARGE);   // 640p, 12fps
const hdGif = await video2gif(videoFile, Presets.HD);        // 1280p, 15fps`}</code>
            </pre>
          </div>
        </details>

        <details className="glass rounded-lg">
          <summary className="cursor-pointer p-3 font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
            Multi-threading Configuration
          </summary>
          <div className="p-3 border-t border-border-primary">
            <pre className="text-sm text-text-primary font-mono overflow-x-auto">
              <code>{`import { video2gif, isMultiThreadSupported } from 'video2gif';

// Check if multi-threading is supported
const supportsMultiThread = isMultiThreadSupported();

// Force multi-threading mode
const gif = await video2gif(videoFile, options, {
  multiThread: true
});

// Use custom FFmpeg WASM files
const gif = await video2gif(videoFile, options, {
  baseURL: 'https://your-cdn.com/ffmpeg/',
  multiThread: false
});`}</code>
            </pre>
          </div>
        </details>

        <details className="glass rounded-lg">
          <summary className="cursor-pointer p-3 font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
            Error Handling
          </summary>
          <div className="p-3 border-t border-border-primary">
            <pre className="text-sm text-text-primary font-mono overflow-x-auto">
              <code>{`import { video2gif, Video2GifError, Video2GifErrorType } from 'video2gif';

try {
  const gif = await video2gif(videoFile, options);
} catch (error) {
  if (error instanceof Video2GifError) {
    switch (error.type) {
      case Video2GifErrorType.INVALID_PARAMETERS:
        console.error('Invalid parameters:', error.message);
        break;
      case Video2GifErrorType.UNSUPPORTED_FORMAT:
        console.error('Unsupported video format');
        break;
      case Video2GifErrorType.TIMEOUT_EXCEEDED:
        console.error('Conversion timed out');
        break;
      default:
        console.error('Conversion failed:', error.message);
    }
  }
}`}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}