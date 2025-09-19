# 🎬 Video2GIF

[![npm version](https://badge.fury.io/js/video2gif.svg)](https://badge.fury.io/js/video2gif)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Demo](https://img.shields.io/badge/Demo-Live-blue)](https://video2gif-demo.vercel.app)

> Convert videos to GIFs using FFmpeg WASM with a modern, developer-friendly API

## ✨ Features

- 🚀 **Zero Dependencies** - Only FFmpeg WASM, no other runtime dependencies
- 🧵 **Multi-threading Support** - Automatic hardware acceleration when available
- 📱 **Browser Native** - Works entirely in the browser, no server required
- 🎯 **TypeScript First** - Complete type safety and IntelliSense support
- 📊 **Progress Tracking** - Real-time conversion progress with callbacks
- 🎨 **Modern API** - Clean, intuitive interface with sensible defaults
- ⚡ **Performance Optimized** - Memory-efficient streaming processing
- 🛡️ **Error Handling** - Comprehensive error messages with recovery suggestions
- 📱 **Mobile Friendly** - Responsive design with touch support
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation

## 🚀 Quick Start

### Try the Demo

Check out the [live demo](https://video2gif-demo.vercel.app) to see Video2GIF in action!

### Installation

```bash
npm install video2gif
# or
yarn add video2gif
# or
pnpm add video2gif
```

### Basic Usage

```typescript
import { video2gif } from 'video2gif';

// Convert video to GIF
const gif = await video2gif(videoFile, {
  startTime: 2.5,  // Start at 2.5 seconds
  duration: 3        // 3 seconds duration
});

// Use the GIF
const url = URL.createObjectURL(gif);
document.querySelector('img').src = url;
```

### Advanced Usage

```typescript
import { video2gif, Presets } from 'video2gif';

const gif = await video2gif(videoFile, {
  startTime: 0,
  duration: 5,
  fps: 15,           // Higher FPS for smoother animation
  scale: 640,        // 640px width, height auto-calculated
  onProgress: (progress) => {
    console.log(`${progress}% complete`);
    updateProgressBar(progress);
  }
}, {
  multiThread: true,  // Enable multi-threading (auto-detected if supported)
  timeout: 60000    // 1 minute timeout
});

// Get conversion metadata
const result = await convertVideoToGifWithResult(videoFile, {
  startTime: 0,
  duration: 10,
  ...Presets.MEDIUM  // Use preset configuration
});

console.log(`Original size: ${result.originalVideo.size} bytes`);
console.log(`GIF size: ${result.outputGif.fileSize} bytes`);
console.log(`Conversion time: ${result.statistics.conversionTime}ms`);
```

## 📖 API Reference

### `video2gif(videoFile, options, config?)`

Convert a video file to GIF.

**Parameters:**
- `videoFile: File | Blob | ArrayBuffer` - Video file to convert
- `options: Video2GifOptions` - Conversion options
- `config?: FFmpegConfig` - FFmpeg configuration (optional)

**Returns:** `Promise<Blob>` - GIF as a Blob

### Types

```typescript
interface Video2GifOptions {
  startTime: number;    // Start time in seconds (supports decimals)
  duration: number;     // Duration in seconds (supports decimals)
  fps?: number;        // Frames per second (1-30, default: 10)
  scale?: number;      // Output width in pixels (height auto-calculated)
  onProgress?: (progress: number) => void; // Progress callback (0-100)
}

interface FFmpegConfig {
  baseURL?: string;     // Custom FFmpeg WASM URL
  multiThread?: boolean; // Enable multi-threading (default: true if supported)
  timeout?: number;      // Conversion timeout in ms (default: 300000)
  memoryLimit?: number; // Memory limit in MB (default: 512)
}
```

### Presets

```typescript
import { Presets } from 'video2gif';

// Optimized configurations for common use cases
Presets.SMALL   // { fps: 8, scale: 240 }  - Thumbnails
Presets.MEDIUM  // { fps: 10, scale: 480 } - Web sharing  
Presets.LARGE   // { fps: 12, scale: 640 } - Social media
Presets.HD      // { fps: 15, scale: 1280 } - High quality
```

### Utility Functions

```typescript
// Check browser capabilities
const supportsMultiThread = supportsMultiThreading();
const capabilities = getCapabilities();

// Validate options before conversion
const validation = await validateOptions(videoFile, options);
if (!validation.valid) {
  console.log('Validation errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}

// Estimate file size
const estimatedSize = estimateFileSize(videoInfo, options);

// Convert from URL
const videoFile = await fileFromURL('https://example.com/video.mp4');

// Base64 utilities
const blob = blobFromBase64(base64String, 'video/mp4');
const base64 = await blobToBase64(blob);
```

## 🎯 Examples

### Progress Bar with Real-time Updates

```typescript
import { video2gif } from 'video2gif';

const progressBar = document.querySelector('.progress-bar');
const statusText = document.querySelector('.status');

const gif = await video2gif(videoFile, {
  startTime: 1,
  duration: 4,
  fps: 12,
  scale: 480,
  onProgress: (progress) => {
    progressBar.style.width = `${progress}%`;
    statusText.textContent = `Converting... ${Math.round(progress)}%`;
  }
});

statusText.textContent = 'Conversion complete!';
```

### Batch Processing

```typescript
import { createCancellableConversion } from 'video2gif';

const converter = createCancellableConversion();

// Start conversion
const conversionPromise = converter.convert(videoFile, {
  startTime: 0,
  duration: 10
});

// Cancel after 5 seconds if not complete
setTimeout(() => {
  converter.cancel();
}, 5000);

try {
  const gif = await conversionPromise;
  console.log('Conversion successful!');
} catch (error) {
  if (error.type === 'CANCELLED') {
    console.log('Conversion was cancelled');
  }
}
```

### Custom FFmpeg Configuration

```typescript
import { video2gif } from 'video2gif';

// Use custom FFmpeg WASM files (for self-hosting)
const gif = await video2gif(videoFile, {
  startTime: 0,
  duration: 5
}, {
  baseURL: 'https://your-cdn.com/ffmpeg/',
  multiThread: true,
  timeout: 120000, // 2 minutes
  memoryLimit: 1024 // 1GB
});
```

## 🌐 Browser Support

| Browser | Multi-threading | Notes |
|---------|----------------|-------|
| Chrome 80+ | ✅ Full support | All features available |
| Firefox 75+ | ✅ Full support | All features available |
| Edge 80+ | ✅ Full support | All features available |
| Safari 13.1+ | ⚠️ Limited | Single-threading only |
| Mobile browsers | ⚠️ Limited | Reduced multi-threading support |

## 🚀 Performance

### Benchmarks

| Video Size | Duration | Settings | Conversion Time | File Size |
|------------|----------|----------|-----------------|-----------|
| 1080p 30s | 5s clip | 480p, 10fps | ~3s | ~2.5MB |
| 720p 60s | 10s clip | 640p, 12fps | ~5s | ~4.8MB |
| 4K 30s | 3s clip | 720p, 15fps | ~8s | ~3.2MB |

*Results may vary based on hardware and browser capabilities*

### Optimization Tips

1. **Use appropriate FPS**: 8-12 FPS is usually sufficient for most GIFs
2. **Choose right resolution**: 480p-640p works well for web sharing
3. **Keep clips short**: Under 10 seconds for best performance
4. **Enable multi-threading**: Automatically enabled when supported
5. **Use presets**: Optimized settings for common use cases

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/RevoLabs-IO/video2gif.git
cd video2gif

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build library
npm run build

# Build demo
npm run example:build
```

### Project Structure

```
video2gif/
├── src/                    # Core library source
│   ├── index.ts           # Main API export
│   ├── converter.ts       # Core conversion logic
│   ├── validator.ts       # Parameter validation
│   ├── ffmpeg-loader.ts   # FFmpeg WASM management
│   ├── types.ts           # TypeScript definitions
│   └── errors.ts          # Custom error classes
├── example/               # Interactive demo
│   ├── index.html         # Demo page
│   ├── app.tsx           # React application
│   └── components/       # UI components
├── tests/                # Test suite
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── fixtures/        # Test video files
└── dist/                # Build output
```

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes and releases.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg WASM](https://github.com/ffmpegwasm/ffmpeg.wasm) - For making video processing possible in the browser
- [Vite](https://vitejs.dev/) - For the amazing build tool
- [Vitest](https://vitest.dev/) - For the fast testing framework

Made with ❤️ by the Video2Gif team