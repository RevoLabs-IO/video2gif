import { Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceModeSectionProps {
  threadingMode: 'single' | 'multi';
  onThreadingModeChange: (mode: 'single' | 'multi') => void;
  isSupported: boolean;
  disabled?: boolean;
}

export function PerformanceModeSection({
  threadingMode,
  onThreadingModeChange,
  isSupported,
  disabled = false
}: PerformanceModeSectionProps) {
  return (
    <div className="glass glass-card card-hover">
      <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold">
        <Cpu className="w-5 h-5" />
        Performance Mode
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={() => onThreadingModeChange('single')}
          variant={threadingMode === 'single' ? "default" : "outline"}
          className="flex-col gap-2 p-4 h-auto"
          disabled={disabled}
        >
          <Zap className="!size-8" />
          <div className="font-semibold">Single Thread</div>
          <div className="text-xs opacity-70">Compatible with all browsers</div>
        </Button>
        <Button
          onClick={() => onThreadingModeChange('multi')}
          variant={threadingMode === 'multi' ? "default" : "outline"}
          className="flex-col gap-2 p-4 h-auto"
          disabled={disabled || !isSupported}
        >
          <Cpu className="!size-8" />
          <div className="font-semibold">Multi Thread</div>
          <div className="text-xs opacity-70">Faster with supported browsers</div>
        </Button>
      </div>
    </div>
  );
}