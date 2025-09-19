import { useState } from 'react';
import { Image, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversionOptions } from '../types';

interface ParameterControlsProps {
  onOptionsChange: (options: Partial<ConversionOptions>) => void;
  disabled?: boolean;
}

export function ParameterControls({ onOptionsChange, disabled }: ParameterControlsProps) {
  const [fps, setFps] = useState(10);
  const [scale, setScale] = useState(1280); // Default to Original

  const fpsPresets = [4, 8, 10, 12, 16, 20, 24, 30];
  const scalePresets = [
    { label: '240p', value: 426 },
    { label: '360p', value: 640 },
    { label: '480p', value: 854 },
    { label: '720p', value: 1280 },
    { label: '1080p', value: 1920 },
    { label: 'Original', value: 0 }
  ];

  const handleFpsChange = (value: number) => {
    setFps(value);
    onOptionsChange({ fps: value });
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
    onOptionsChange({ scale: value === 0 ? undefined : value });
  };



  return (
    <div className="space-y-6">
      {/* Quality Presets */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Quality Presets</label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => {
              handleFpsChange(8);
              handleScaleChange(426);
            }}
            variant={fps === 8 && scale === 426 ? "default" : "outline"}
            size="sm"
            disabled={disabled}
          >
            Small
          </Button>
          <Button
            onClick={() => {
              handleFpsChange(10);
              handleScaleChange(1280);
            }}
            variant={fps === 10 && scale === 1280 ? "default" : "outline"}
            size="sm"
            disabled={disabled}
          >
            Medium
          </Button>
          <Button
            onClick={() => {
              handleFpsChange(12);
              handleScaleChange(1280);
            }}
            variant={fps === 12 && scale === 1280 ? "default" : "outline"}
            size="sm"
            disabled={disabled}
          >
            Large
          </Button>
          <Button
            onClick={() => {
              handleFpsChange(15);
              handleScaleChange(1920);
            }}
            variant={fps === 15 && scale === 1920 ? "default" : "outline"}
            size="sm"
            disabled={disabled}
          >
            HD
          </Button>
        </div>
      </div>

      {/* FPS Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex gap-2 items-center text-sm font-medium text-foreground">
            <Zap className="w-4 h-4" />
            Frames Per Second (FPS)
          </label>
          <span className="text-sm text-muted-foreground">{fps} fps</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {fpsPresets.map((preset) => (
            <Button
              key={preset}
              onClick={() => handleFpsChange(preset)}
              variant={fps === preset ? "default" : "outline"}
              size="sm"
              disabled={disabled}
            >
              {preset}
            </Button>
          ))}
        </div>

      </div>

      {/* Scale Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex gap-2 items-center text-sm font-medium text-foreground">
            <Image className="w-4 h-4" />
            Output Width
          </label>
          <span className="text-sm text-muted-foreground">
            {scale === 0 ? 'Original' : `${scale}px`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {scalePresets.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => handleScaleChange(preset.value)}
              variant={scale === preset.value ? "default" : "outline"}
              size="sm"
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>

      </div>

    </div>
  );
}