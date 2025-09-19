import { Github, Film, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-2 mx-auto max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="flex gap-3 items-center">
              <div className="hidden justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl sm:flex from-primary to-primary/80">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">video2gif</h1>
                <p className="text-sm text-muted-foreground">Convert videos to GIFs in your browser</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="hidden gap-4 items-center text-sm md:flex text-muted-foreground">
              <div className="flex gap-2 items-center">
                <Zap className="w-4 h-4 text-primary" />
                <span>Browser-Based</span>
              </div>
              <div className="flex gap-2 items-center">
                <Settings className="w-4 h-4 text-primary/80" />
                <span>Privacy-Focused</span>
              </div>
            </div>

            <Button asChild variant="outline">
              <a
                href="https://github.com/RevoLabs-IO/video2gif"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </div>
    </header>
  );
}