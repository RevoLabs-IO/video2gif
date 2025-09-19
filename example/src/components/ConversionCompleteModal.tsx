import { Play, Video, Image, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConversionResult, VideoFile } from '../types';

interface ConversionCompleteModalProps {
  conversionResult: ConversionResult;
  videoFile: VideoFile;
  onDownload: () => void;
  onConvertAnother: () => void;
  onClose: () => void;
}

export function ConversionCompleteModal({
  conversionResult,
  onDownload,
  onConvertAnother,
  onClose
}: ConversionCompleteModalProps) {
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Conversion Complete!</DialogTitle>
        <div className="space-y-6">
          {/* GIF Preview */}
          <div className="mx-auto max-w-md">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={conversionResult.url}
                alt="Converted GIF"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-6 justify-center text-sm text-muted-foreground">
            <div className="flex gap-1 items-center">
              <Image className="w-4 h-4" />
              <span>{conversionResult.width}×{conversionResult.height}</span>
            </div>
            <div className="flex gap-1 items-center">
              <HardDrive className="w-4 h-4" />
              <span>{(conversionResult.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onDownload}
              className="flex gap-2 items-center"
            >
              <Play className="w-4 h-4" />
              Download GIF
            </Button>
            <Button
              onClick={onConvertAnother}
              variant="outline"
              className="flex gap-2 items-center"
            >
              <Video className="w-4 h-4" />
              Convert another
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}