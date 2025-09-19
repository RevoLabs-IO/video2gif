import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConvertButtonSectionProps {
  onConvert: () => void;
}

export function ConvertButtonSection({ onConvert }: ConvertButtonSectionProps) {
  return (
    <div className="glass glass-card card-hover">
      <Button
        onClick={onConvert}
        className="flex gap-3 justify-center items-center py-4 w-full text-lg font-semibold"
        size="lg"
      >
        <Play className="w-6 h-6" />
        Convert to GIF
      </Button>
      <p className="mt-3 text-sm text-center text-muted-foreground">
        Click to start converting your video to GIF
      </p>
    </div>
  );
}