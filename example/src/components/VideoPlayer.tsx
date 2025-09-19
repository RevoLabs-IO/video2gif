import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Monitor, Clock, FileText, HardDrive } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoPlayerProps {
  videoFile: VideoFile;
  onOptionsChange: (options: any) => void;
  disabled?: boolean;
}

export function VideoPlayer({ videoFile, onOptionsChange, disabled }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Capture actual video dimensions
      if (video.videoWidth && video.videoHeight) {
        setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
      }
      onOptionsChange({ duration: Math.min(3, video.duration) });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoFile, onOptionsChange]);

  // Auto-play video when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoFile.url) {
      video.muted = true; // Mute for autoplay
      video.play().catch(() => {
        // Autoplay failed, user interaction required
        setIsPlaying(false);
      });
    }
  }, [videoFile.url]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || disabled) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || disabled) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || disabled) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoFile.url}
          className="w-full h-auto max-h-96 object-contain"
          onClick={togglePlay}
          autoPlay
          muted
          playsInline
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`p-2 rounded-full transition-colors ${
                disabled ? 'bg-white/10 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'
              }`}
              disabled={disabled}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                disabled={disabled}
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume Control */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${
                disabled ? 'bg-white/10 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'
              }`}
              disabled={disabled}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Resolution:</span>
            <span className="text-foreground">
              {videoDimensions ? `${videoDimensions.width}×${videoDimensions.height}` : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground">
              {duration ? `${duration.toFixed(1)}s` : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Format:</span>
            <span className="text-foreground">{videoFile.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Size:</span>
            <span className="text-foreground">
              {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
        </div>
    </div>
  );
}