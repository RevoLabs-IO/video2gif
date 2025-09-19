# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-19

### 🎉 Initial Release

Video2GIF is a modern, browser-based library for converting videos to GIFs using FFmpeg WASM. This release introduces the complete API and feature set for production use.

### ✨ Features

#### Core Functionality
- **Video to GIF Conversion**: Convert video files (File, Blob, ArrayBuffer) to GIF format entirely in the browser
- **FFmpeg WASM Integration**: Leverages FFmpeg WebAssembly for high-quality video processing
- **Progress Tracking**: Real-time conversion progress with customizable callbacks
- **Cancellable Conversions**: Support for cancelling ongoing conversions with proper cleanup

#### Performance & Optimization
- **Multi-threading Support**: Automatic hardware acceleration when available (SharedArrayBuffer support)
- **Memory Management**: Efficient streaming processing with configurable memory limits
- **Timeout Protection**: Configurable conversion timeouts to prevent hanging operations
- **Optimized Presets**: Pre-configured settings for common use cases (Small, Medium, Large, HD)

#### Developer Experience
- **TypeScript First**: Complete type safety with comprehensive type definitions
- **Modern API**: Clean, intuitive interface with sensible defaults
- **Comprehensive Error Handling**: Detailed error messages with recovery suggestions
- **Validation System**: Parameter validation with helpful warnings and suggestions

#### Browser Support
- **Cross-browser Compatibility**: Chrome 80+, Firefox 75+, Edge 80+, Safari 13.1+
- **Mobile Support**: Responsive design with touch-friendly controls
- **Progressive Enhancement**: Graceful degradation for older browsers

### 🔧 API

#### Main Functions
- `video2gif(videoFile, options, config?)`: Convert video to GIF blob
- `convertVideoToGifWithResult(videoFile, options, config?)`: Convert with detailed result metadata
- `createCancellableConversion()`: Create cancellable conversion instance

#### Utility Functions
- `validateOptions(videoFile, options)`: Validate conversion parameters
- `estimateFileSize(videoInfo, options)`: Estimate output file size
- `getCapabilities()`: Get browser capability information
- `supportsMultiThreading()`: Check multi-threading support

#### TypeScript Support
- Complete type definitions for all options and return values
- IntelliSense support in modern editors
- Strict type checking with helpful error messages

### 🎨 Presets

Pre-configured conversion settings for common scenarios:

- **SMALL**: 240p, 8fps - Thumbnails and previews
- **MEDIUM**: 480p, 10fps - Web sharing (default)
- **LARGE**: 640p, 12fps - Social media
- **HD**: 1280p, 15fps - High quality

### 📊 Performance Benchmarks

Typical conversion performance (may vary by hardware/browser):

| Video Size | Duration | Settings | Conversion Time | Output Size |
|------------|----------|----------|-----------------|-------------|
| 1080p 30s | 5s clip | 480p, 10fps | ~3s | ~2.5MB |
| 720p 60s | 10s clip | 640p, 12fps | ~5s | ~4.8MB |
| 4K 30s | 3s clip | 720p, 15fps | ~8s | ~3.2MB |

### 🛠️ Configuration Options

#### Video2GifOptions
- `startTime`: Start position in seconds (default: 0)
- `duration`: Clip duration in seconds (required)
- `fps`: Frames per second (1-30, default: 10)
- `scale`: Output width in pixels (height auto-calculated)
- `onProgress`: Progress callback function

#### FFmpegConfig
- `baseURL`: Custom FFmpeg WASM file location
- `multiThread`: Enable multi-threading (default: auto-detect)
- `timeout`: Conversion timeout in milliseconds (default: 5 minutes)
- `memoryLimit`: Memory limit in MB (default: 512MB)

### 🧪 Testing

- **31 test cases** covering all major functionality
- Unit tests for core conversion logic
- Integration tests for browser compatibility
- Type validation tests
- Error handling verification

### 📚 Documentation

- **Comprehensive README** with usage examples and API reference
- **Interactive Demo** available at https://video2gif-demo.vercel.app
- **TypeScript Examples** for all major use cases
- **Performance Guidelines** and optimization tips

### 🔒 Security

- No external dependencies except FFmpeg WASM
- Client-side processing (no server uploads)
- Memory-safe operations with configurable limits
- Input validation and sanitization

### 📦 Dependencies

- `@ffmpeg/ffmpeg`: ^0.12.10
- `@ffmpeg/util`: ^0.12.1

### 🤝 Acknowledgments

- **FFmpeg WASM Team** for making video processing possible in browsers
- **Vite** and **Vitest** for excellent development tooling
- **TypeScript** for type safety and developer experience

---

This is the first stable release of Video2GIF. Future updates will follow semantic versioning and include detailed changelogs for each release.