import { useState, useCallback, useRef } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { VideoPlayer } from './components/VideoPlayer';
import { TimelineControls } from './components/TimelineControls';
import { ParameterControls } from './components/ParameterControls';
import { ProgressDisplay } from './components/ProgressDisplay';
import { Header } from './components/Header';
import { ThemeToggle } from './components/ThemeToggle';
import { useVideo2Gif } from './hooks/useVideo2Gif';
import { useTheme } from './hooks/useTheme';
import { VideoFile, ConversionOptions, ConversionResult } from './types';
import { Toaster } from 'react-hot-toast';
import { Play, Cpu, Zap, Video, Film, Clock, Settings, Check, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionStage, setConversionStage] = useState<string>('');
  const [threadingMode, setThreadingMode] = useState<'single' | 'multi'>('multi');

  const { isDark, toggleTheme } = useTheme();
  const { convertVideo, cancelConversion, isSupported } = useVideo2Gif();

  const hidden = !!conversionResult || !!isConverting;
  
  const currentOptionsRef = useRef<ConversionOptions>({
    startTime: 0,
    duration: 3,
    fps: 10,
    scale: 480
  });

  const handleFileSelect = useCallback((file: File) => {
    const videoFile: VideoFile = {
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    };
    setVideoFile(videoFile);
    setConversionResult(null);
    setProgress(0);
  }, []);

  const handleFileRemove = useCallback(() => {
    if (videoFile?.url) {
      URL.revokeObjectURL(videoFile.url);
    }
    setVideoFile(null);
    setConversionResult(null);
    setProgress(0);
  }, [videoFile]);

  const handleOptionsChange = useCallback((options: Partial<ConversionOptions>) => {
    currentOptionsRef.current = { ...currentOptionsRef.current, ...options };
  }, []);

  const handleConvert = useCallback(async () => {
    if (!videoFile) return;

    setIsConverting(true);
    setProgress(0);
    setConversionStage('Initializing...');

    try {
      const result = await convertVideo(
        videoFile.file,
        currentOptionsRef.current,
        (progress) => {
          setProgress(progress);
          if (progress < 25) setConversionStage('Loading FFmpeg...');
          else if (progress < 50) setConversionStage('Analyzing video...');
          else if (progress < 75) setConversionStage('Converting to GIF...');
          else setConversionStage('Finalizing...');
        }
      );

      setConversionResult(result);
      setConversionStage('Complete!');
    } catch (error) {
      console.error('Conversion failed:', error);
      setConversionStage('Conversion failed');
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  }, [videoFile, convertVideo, threadingMode]);

  const handleCancel = useCallback(() => {
    cancelConversion();
    setIsConverting(false);
    setProgress(0);
    setConversionStage('Cancelled');
  }, [cancelConversion]);


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-bg-primary text-text-primary' : 'bg-light-bg-primary text-light-text-primary'}`}>
      {/* Background gradient */}
      <div className={`fixed inset-0 -z-10 ${isDark ? 'gradient-bg' : 'gradient-bg-light'}`} />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-success/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Browser support warning */}
          {!isSupported && (
            <div className="glass glass-card mb-6 border-accent-warning/50">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-warning/20 flex items-center justify-center">
                  <span className="text-accent-warning text-sm">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-warning">Limited Browser Support</h3>
                  <p className="text-sm text-text-secondary">
                    Your browser doesn't support multi-threading. Conversions may be slower.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Centered Upload Section when no video */}
          {!videoFile ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-2xl">
                <div className="glass glass-card card-hover p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-3">
                    <Video className="w-6 h-6" />
                    Get Started - Upload Your Video
                  </h2>
                  <p className="text-center text-text-secondary mb-6">
                    Convert your videos to GIFs with our powerful browser-based tool
                  </p>
                  <VideoUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    videoFile={videoFile}
                    disabled={isConverting}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Video & Controls */}
              <div className={`space-y-6 ${hidden ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Video Player */}
                <div className="glass glass-card card-hover">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Video Preview
                  </h2>
                  <VideoPlayer
                    videoFile={videoFile}
                    onOptionsChange={handleOptionsChange}
                    disabled={hidden}
                  />
                </div>

                {/* Timeline Controls */}
                <div className="glass glass-card card-hover">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline Selection
                  </h2>
                  <TimelineControls
                    videoFile={videoFile}
                    onOptionsChange={handleOptionsChange}
                    disabled={hidden}
                  />
                </div>
              </div>

              {/* Right Column - Parameters & Output */}
              <div className={`space-y-6`}>
                {/* Threading Mode Selection */}
                <div className={`glass glass-card card-hover ${hidden ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                    Performance Mode
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => setThreadingMode('single')}
                      variant={threadingMode === 'single' ? "default" : "outline"}
                      className="p-4 h-auto flex-col gap-2"
                      disabled={hidden}
                    >
                      <Zap className="!size-8" />
                      <div className="font-semibold">Single Thread</div>
                      <div className="text-xs opacity-70">Compatible with all browsers</div>
                    </Button>
                    <Button
                      onClick={() => setThreadingMode('multi')}
                      variant={threadingMode === 'multi' ? "default" : "outline"}
                      className="p-4 h-auto flex-col gap-2"
                      disabled={hidden}
                    >
                      <Cpu className="!size-8" />
                      <div className="font-semibold">Multi Thread</div>
                      <div className="text-xs opacity-70">Faster with supported browsers</div>
                    </Button>
                  </div>
                </div>

                {/* Parameter Controls */}
                <div className={`glass glass-card card-hover ${conversionResult ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Conversion Settings
                  </h2>
                  <ParameterControls
                    onOptionsChange={handleOptionsChange}
                    disabled={isConverting || !!conversionResult}
                  />
                </div>


                {/* Convert Button - Prominent CTA */}
                {videoFile && !isConverting && !conversionResult && (
                  <div className="glass glass-card card-hover">
                    <Button
                      onClick={handleConvert}
                      className="w-full flex items-center justify-center gap-3 py-4 text-lg font-semibold"
                      size="lg"
                    >
                      <Play className="w-6 h-6" />
                      Convert to GIF
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      Click to start converting your video to GIF
                    </p>
                  </div>
                )}

                {/* Progress Display */}
                {isConverting && (
                  <div className="glass glass-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Converting...
                    </h2>
                    <ProgressDisplay
                      progress={progress}
                      stage={conversionStage}
                      onCancel={handleCancel}
                    />
                  </div>
                )}

                {/* Output Display */}
                {conversionResult && (
                  <div className="glass glass-card card-hover">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Conversion Complete!
                    </h2>

                    <div className="space-y-6">
                      {/* Success Message */}
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-muted-foreground">Your video has been successfully converted to GIF</p>
                      </div>

                      {/* GIF Preview */}
                      <div className="max-w-md mx-auto">
                        <div className="rounded-lg overflow-hidden border bg-muted">
                          <img
                            src={conversionResult.url}
                            alt="Converted GIF"
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {conversionResult.width}×{conversionResult.height} • {(conversionResult.fileSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = conversionResult.url;
                            link.download = `${videoFile!.name.replace(/\.[^/.]+$/, '')}.gif`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Download GIF
                        </Button>
                        <Button
                          onClick={() => {
                            setConversionResult(null);
                            setProgress(0);
                            setConversionStage('');
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Convert Another
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t bg-background/50 backdrop-blur-sm mt-8">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <a
                  href="https://github.com/RevoLabs-IO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm font-medium">RevoLabs-IO</span>
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://www.npmjs.com/package/video2gif"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  NPM Package
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://github.com/RevoLabs-IO/video2gif/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Issues
                </a>
              </div>
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>
        </footer>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass',
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}

export default App;