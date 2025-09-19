import { Video } from 'lucide-react';
import { VideoUpload } from './VideoUpload';
import { VideoFile } from '../types';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  videoFile: VideoFile | null;
  disabled: boolean;
}

export function UploadSection({ onFileSelect, onFileRemove, videoFile, disabled }: UploadSectionProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl">
        <div className="p-8 glass glass-card card-hover">
          <h2 className="flex gap-3 justify-center items-center mb-3 text-2xl font-semibold text-center">
            <Video className="size-10" />
            Pick Your Video
          </h2>
          <p className="mb-6 text-center text-text-secondary">
            Convert your videos to GIFs with our powerful browser-based tool
          </p>
          <VideoUpload
            onFileSelect={onFileSelect}
            onFileRemove={onFileRemove}
            videoFile={videoFile}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}