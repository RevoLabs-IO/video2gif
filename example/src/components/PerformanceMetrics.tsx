import { Clock, Cpu, Zap, TrendingUp, Rocket, Snail, Timer, Monitor, Scissors, HardDrive, Globe } from 'lucide-react';
import { ConversionResult } from '../types';

interface PerformanceMetricsProps {
  result: ConversionResult;
  conversionTime: number;
}

export function PerformanceMetrics({ result, conversionTime }: PerformanceMetricsProps) {
  const calculateFps = () => {
    return Math.round(result.frameCount / result.duration);
  };

  const calculateSpeed = () => {
    return (result.duration / (conversionTime / 1000)).toFixed(2);
  };

  const calculateEfficiency = () => {
    // Frames per second of processing speed
    return (result.frameCount / (conversionTime / 1000)).toFixed(1);
  };

  const getPerformanceRating = () => {
    const speed = parseFloat(calculateSpeed());
    if (speed >= 2.0) return { rating: 'Excellent', color: 'text-accent-success', icon: <Rocket className="w-5 h-5" /> };
    if (speed >= 1.0) return { rating: 'Good', color: 'text-accent-primary', icon: <Zap className="w-5 h-5" /> };
    if (speed >= 0.5) return { rating: 'Fair', color: 'text-accent-warning', icon: <Snail className="w-5 h-5" /> };
    return { rating: 'Slow', color: 'text-accent-error', icon: <Timer className="w-5 h-5" /> };
  };

  const performance = getPerformanceRating();

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-lg text-center">
          <Clock className="w-6 h-6 text-accent-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">
            {(conversionTime / 1000).toFixed(2)}s
          </div>
          <div className="text-sm text-text-secondary">Conversion Time</div>
        </div>
        
        <div className="glass p-4 rounded-lg text-center">
          <Cpu className="w-6 h-6 text-accent-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary flex items-center justify-center gap-2">
            {performance.icon}
            {performance.rating}
          </div>
          <div className="text-sm text-text-secondary">Performance</div>
        </div>
        
        <div className="glass p-4 rounded-lg text-center">
          <Zap className="w-6 h-6 text-accent-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">
            {calculateEfficiency()} fps/s
          </div>
          <div className="text-sm text-text-secondary">Processing Speed</div>
        </div>
        
        <div className="glass p-4 rounded-lg text-center">
          <TrendingUp className="w-6 h-6 text-accent-warning mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">
            {calculateSpeed()}×
          </div>
          <div className="text-sm text-text-secondary">Real-time Factor</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Details */}
        <div className="glass p-6 rounded-lg">
          <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Conversion Details
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Input Duration:</span>
              <span className="text-text-primary">{result.duration.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Output Duration:</span>
              <span className="text-text-primary">{result.duration.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Frame Count:</span>
              <span className="text-text-primary">{result.frameCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Output FPS:</span>
              <span className="text-text-primary">{calculateFps()} fps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Resolution:</span>
              <span className="text-text-primary">{result.width}×{result.height}</span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="glass p-6 rounded-lg">
          <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            System Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Threading Mode:</span>
              <span className={`${
                result.statistics.threadingMode === 'multi' 
                  ? 'text-accent-success' 
                  : 'text-text-secondary'
              }`}>
                {result.statistics.threadingMode === 'multi' ? 'Multi-threaded' : 'Single-threaded'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Processing Speed:</span>
              <span className="text-text-primary">{calculateEfficiency()} frames/second</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Real-time Factor:</span>
              <span className="text-text-primary">{calculateSpeed()}× real-time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Memory Usage:</span>
              <span className="text-text-primary">~{(result.statistics.memoryUsed / 1024 / 1024).toFixed(0)} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="glass p-6 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-4">Performance Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Use lower FPS (8-12) for faster processing
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Monitor className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Smaller resolutions process faster
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Scissors className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Shorter clips convert quicker
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Multi-threading available in supported browsers
              </span>
            </div>
            <div className="flex items-start gap-2">
              <HardDrive className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Close other browser tabs to free up memory
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-accent-primary mt-0.5" />
              <span className="text-text-secondary">
                Stable internet connection for FFmpeg WASM loading
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with Other Tools */}
      <div className="glass p-6 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-4">Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-2 text-text-primary">Metric</th>
                <th className="text-left py-2 text-text-primary">This Conversion</th>
                <th className="text-left py-2 text-text-primary">Typical Range</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-secondary">
                <td className="py-2 text-text-secondary">Conversion Speed</td>
                <td className="py-2 text-text-primary">{calculateSpeed()}× real-time</td>
                <td className="py-2 text-text-secondary">0.5-3.0× real-time</td>
              </tr>
              <tr className="border-b border-border-secondary">
                <td className="py-2 text-text-secondary">Processing Efficiency</td>
                <td className="py-2 text-text-primary">{calculateEfficiency()} fps/s</td>
                <td className="py-2 text-text-secondary">5-50 fps/s</td>
              </tr>
              <tr>
                <td className="py-2 text-text-secondary">Threading Performance</td>
                <td className="py-2 text-text-primary">
                  {result.statistics.threadingMode === 'multi' ? 'Multi-threaded' : 'Single-threaded'}
                </td>
                <td className="py-2 text-text-secondary">Varies by browser</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}