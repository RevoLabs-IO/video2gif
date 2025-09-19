import { useState, useEffect } from 'react';
import { Scissors, Clock, Play } from 'lucide-react';
import { VideoFile, ConversionOptions } from '../types';

interface TimelineControlsProps {
  videoFile: VideoFile;
  onOptionsChange: (options: Partial<ConversionOptions>) => void;
  disabled?: boolean;
}

export function TimelineControls({ videoFile, onOptionsChange, disabled }: TimelineControlsProps) {
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(3);
  const [maxDuration, setMaxDuration] = useState(30); // Default max, will be updated

  useEffect(() => {
    if (videoFile.duration) {
      setMaxDuration(Math.min(videoFile.duration, 30)); // Cap at 30 seconds
      setDuration(Math.min(videoFile.duration, 30)); // Default to full video duration (capped at 30s)
      setStartTime(0); // Start from beginning
    }
  }, [videoFile]);

  const handleStartTimeChange = (value: number) => {
    const newStartTime = Math.max(0, Math.min(value, maxDuration)); // Allow full range 0 to maxDuration
    setStartTime(newStartTime);
    onOptionsChange({ startTime: newStartTime });

    // Auto-adjust duration if it would exceed video bounds
    if (newStartTime + duration > maxDuration) {
      const newDuration = Math.max(0, maxDuration - newStartTime);
      setDuration(newDuration);
      onOptionsChange({ duration: newDuration });
    }
  };

  const handleDurationChange = (value: number) => {
    const newDuration = Math.max(0, Math.min(value, 30, maxDuration - startTime)); // Min 0s, max 30s or remaining
    setDuration(newDuration);
    onOptionsChange({ duration: newDuration });
  };


  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Start Time Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Scissors className="w-4 h-4" />
            Start Time
          </label>
          <span className="text-sm text-muted-foreground">{formatTime(startTime)}</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max={maxDuration} // Allow full range 0 to maxDuration
            step="1"
            value={Math.round(startTime)}
            onChange={(e) => handleStartTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            disabled={disabled}
          />

          {/* Time markers */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0:00</span>
            <span>{formatTime(maxDuration)}</span>
          </div>
        </div>
      </div>

      {/* Duration Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4" />
            Duration
          </label>
          <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max={Math.min(30, maxDuration - startTime)} // Min 0s, max 30s or remaining time
            step="1"
            value={Math.round(duration)}
            onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            disabled={disabled}
          />

          {/* Duration markers */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0s</span>
            <span>{Math.min(30, maxDuration - startTime)}s</span>
          </div>
        </div>
      </div>
    </div>
    {/* Timeline Preview - No Card Wrapper */}
    <div className="space-y-3 mt-6">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Play className="w-4 h-4" />
        Timeline Preview
      </label>
      <span className="text-xs text-muted-foreground">
        {formatTime(startTime)} - {formatTime(startTime + duration)}
      </span>
    </div>

    <div className="relative h-8 bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden">
      {/* Background timeline */}
      <div className="absolute inset-0 bg-black/10 dark:bg-white/10" />

      {/* Selected segment */}
      <div
        className="absolute h-full bg-accent-primary/30"
        style={{
          left: `${(startTime / maxDuration) * 100}%`,
          width: `${(duration / maxDuration) * 100}%`
        }}
      />

      {/* Start marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent-primary"
        style={{ left: `${(startTime / maxDuration) * 100}%` }}
      />

      {/* End marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent-secondary"
        style={{ left: `${((startTime + duration) / maxDuration) * 100}%` }}
      />
    </div>
  </div>
  </>
  
  );
}