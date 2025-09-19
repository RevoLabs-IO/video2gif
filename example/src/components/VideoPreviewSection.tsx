import { Film, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { ConversionOptions, VideoFile } from '../types';

interface VideoPreviewSectionProps {
  videoFile: VideoFile;
  onFileRemove: () => void;
  onOptionsChange: (options: Partial<ConversionOptions>) => void;
}

export function VideoPreviewSection({ videoFile, onFileRemove, onOptionsChange }: VideoPreviewSectionProps) {
  return (
    <div className="glass glass-card card-hover">
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex gap-2 items-center text-lg font-semibold">
          <Film className="w-5 h-5" />
          Video Preview
        </h2>
        <Button
          onClick={onFileRemove}
          variant="outline"
          size="sm"
          className="flex gap-2 items-center"
        >
          <Shuffle className="w-4 h-4" />
          Change Video
        </Button>
      </div>
      <VideoPlayer
        videoFile={videoFile}
        onOptionsChange={onOptionsChange}
      />
    </div>
  );
}