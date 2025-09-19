import { useState, useCallback, useRef } from 'react';
import { AppHeader } from './components/AppHeader';
import { BrowserSupportWarning } from './components/BrowserSupportWarning';
import { UploadSection } from './components/UploadSection';
import { VideoPreviewSection } from './components/VideoPreviewSection';
import { TimelineControls } from './components/TimelineControls';
import { PerformanceModeSection } from './components/PerformanceModeSection';
import { ParameterControls } from './components/ParameterControls';
import { ConvertButtonSection } from './components/ConvertButtonSection';
import { ConversionProgressModal } from './components/ConversionProgressModal';
import { ConversionCompleteModal } from './components/ConversionCompleteModal';
import { AppFooter } from './components/AppFooter';
import { useVideo2Gif } from './hooks/useVideo2Gif';
import { useTheme } from './hooks/useTheme';
import { VideoFile, ConversionOptions, ConversionResult } from './types';
import { Toaster } from 'react-hot-toast';
import { Clock, Settings } from 'lucide-react';

function App() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionStage, setConversionStage] = useState<string>('');
  const [threadingMode, setThreadingMode] = useState<'single' | 'multi'>('single');

  const { isDark, toggleTheme } = useTheme();
  const { convertVideo, cancelConversion, isSupported } = useVideo2Gif();
  
  const currentOptionsRef = useRef<ConversionOptions>({
    startTime: 0,
    duration: 3,
    fps: 10,
    scale: 1280
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
      <div className="overflow-hidden fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent-primary/10" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse bg-accent-secondary/10 animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse bg-accent-success/10 animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />
        
        <main className="container px-4 py-8 mx-auto max-w-7xl">

          {/* Browser support warning */}
          {!isSupported && <BrowserSupportWarning />}

          {/* Centered Upload Section when no video */}
          {!videoFile ? (
            <UploadSection
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              videoFile={videoFile}
              disabled={isConverting}
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column - Video & Controls */}
              <div className="space-y-6">
                {/* Video Player */}
                <VideoPreviewSection
                  videoFile={videoFile}
                  onFileRemove={handleFileRemove}
                  onOptionsChange={handleOptionsChange}
                />

                {/* Timeline Controls */}
                <div className="glass glass-card card-hover">
                  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold">
                    <Clock className="w-5 h-5" />
                    Timeline Selection
                  </h2>
                  <TimelineControls
                    videoFile={videoFile}
                    onOptionsChange={handleOptionsChange}
                  />
                </div>
              </div>

              {/* Right Column - Parameters & Output */}
              <div className={`space-y-6`}>
                {/* Threading Mode Selection */}
                <PerformanceModeSection
                  threadingMode={threadingMode}
                  onThreadingModeChange={setThreadingMode}
                  isSupported={isSupported}
                />

                {/* Parameter Controls */}
                <div className={`glass glass-card card-hover ${conversionResult ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold">
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
                  <ConvertButtonSection onConvert={handleConvert} />
                )}

                {/* Progress Modal */}
                <ConversionProgressModal
                  isOpen={isConverting}
                  onCancel={handleCancel}
                  progress={progress}
                  stage={conversionStage}
                />

                {/* Output Modal */}
                {conversionResult && (
                  <ConversionCompleteModal
                    conversionResult={conversionResult}
                    videoFile={videoFile!}
                    onDownload={() => {
                      const link = document.createElement('a');
                      link.href = conversionResult.url;
                      link.download = `${videoFile!.name.replace(/\.[^/.]+$/, '')}.gif`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    onConvertAnother={() => {
                      handleFileRemove();
                      setConversionStage('');
                    }}
                    onClose={() => {
                      setConversionResult(null);
                      setProgress(0);
                      setConversionStage('');
                    }}
                  />
                )}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <AppFooter />
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