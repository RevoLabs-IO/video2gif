import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProgressDisplay } from './ProgressDisplay';

interface ConversionProgressModalProps {
  isOpen: boolean;
  onCancel: () => void;
  progress: number;
  stage: string;
}

export function ConversionProgressModal({
  isOpen,
  onCancel,
  progress,
  stage
}: ConversionProgressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogTitle>Converting...</DialogTitle>
        <ProgressDisplay
          progress={progress}
          stage={stage}
        />
      </DialogContent>
    </Dialog>
  );
}