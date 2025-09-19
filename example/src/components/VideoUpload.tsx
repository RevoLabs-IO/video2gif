import React, { useState, useCallback } from 'react';
import { Upload, Video, FileText, X } from 'lucide-react';
import { VideoFile } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VideoUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  videoFile: VideoFile | null;
  disabled?: boolean;
}

export function VideoUpload({ onFileSelect, onFileRemove, videoFile, disabled }: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      onFileSelect(videoFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (videoFile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-3 items-center">
              <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary/20">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{videoFile.name}</h3>
                <p className="text-sm text-muted-foreground">{formatFileSize(videoFile.size)}</p>
              </div>
            </div>
            <Button
              onClick={onFileRemove}
              variant="outline"
              size="icon"
              disabled={disabled}
              aria-label="Remove video"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {videoFile.duration && (
            <div className="flex gap-4 items-center text-sm text-muted-foreground">
              <div className="flex gap-1 items-center">
                <span>Duration:</span>
                <span className="text-foreground">{videoFile.duration.toFixed(1)}s</span>
              </div>
              {videoFile.width && videoFile.height && (
                <div className="flex gap-1 items-center">
                  <span>Resolution:</span>
                  <span className="text-foreground">{videoFile.width}×{videoFile.height}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-slate-50 dark:bg-slate-900 shadow-none border-dashed transition-all duration-300 ${
        isDragOver ? 'ring-2 scale-105 ring-primary' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-20 h-20 rounded-full bg-primary/20">
            <Upload className="w-10 h-10 text-primary" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-foreground">
            Drop your video here
          </h3>

          <p className="mb-6 text-muted-foreground">
            or click to browse files
          </p>

          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id="video-upload"
          />

          <Button size="lg" asChild disabled={disabled}>
            <label htmlFor="video-upload" className="cursor-pointer">
              <FileText className="mr-2 w-4 h-4" />
              Choose Video File
            </label>
          </Button>

          <div className="mt-6 text-xs text-muted-foreground">
            <p>Supported formats: MP4, WebM, MOV, AVI, MKV, FLV, OGV, 3GP</p>
            <p>Max file size: 1GB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}