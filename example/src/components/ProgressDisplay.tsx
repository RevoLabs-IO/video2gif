import { Loader2, X, Package, Search, Zap, Sparkles, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressDisplayProps {
  progress: number;
  stage: string;
  onCancel: () => void;
}

export function ProgressDisplay({ progress, stage, onCancel }: ProgressDisplayProps) {

  const getStageIcon = (stage: string) => {
    if (stage.includes('Loading')) return <Package className="w-4 h-4" />;
    if (stage.includes('Analyzing')) return <Search className="w-4 h-4" />;
    if (stage.includes('Converting')) return <Zap className="w-4 h-4" />;
    if (stage.includes('Finalizing')) return <Sparkles className="w-4 h-4" />;
    if (stage.includes('Complete')) return <Check className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Converting Video</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {getStageIcon(stage)}
                <span>{stage}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={onCancel}
            variant="outline"
            size="icon"
            aria-label="Cancel conversion"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="w-full" />

          {/* Progress Stages */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={progress >= 0 ? 'text-primary' : ''}>Loading</span>
            <span className={progress >= 25 ? 'text-primary' : ''}>Analyzing</span>
            <span className={progress >= 50 ? 'text-primary' : ''}>Processing</span>
            <span className={progress >= 75 ? 'text-primary' : ''}>Finalizing</span>
          </div>
        </div>

        {/* Time Estimation */}
        {progress > 0 && progress < 100 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated time remaining</span>
                <span className="text-foreground font-medium">
                  {progress < 25 ? '~30-60s' :
                   progress < 50 ? '~20-40s' :
                   progress < 75 ? '~10-20s' : '~5-10s'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Info */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <Card>
            <CardContent className="p-3">
              <div className="text-lg font-bold text-primary">~{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <Zap className="w-6 h-6 text-primary mx-auto" />
              <div className="text-xs text-muted-foreground">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <Sparkles className="w-6 h-6 text-primary mx-auto" />
              <div className="text-xs text-muted-foreground">Optimizing</div>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}