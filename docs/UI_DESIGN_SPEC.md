# Video2Gif Demo Page - UI/UX Design Specification

## Design Philosophy
- **Modern & Minimalist**: Clean, uncluttered interface
- **Glassmorphism**: Translucent, layered design elements
- **shadcn/ui Integration**: Professional component library with consistent design
- **Dark Mode First**: Optimized for dark themes with light mode support
- **Accessibility First**: WCAG 2.1 AA compliant
- **Performance Focused**: Smooth animations, efficient rendering
- **Mobile Responsive**: Works seamlessly across all devices
- **TypeScript-First**: Fully typed components and interfaces

## Visual Design System

### Color Palette
```css
/* Dark Mode (Default) */
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-tertiary: #252525;
--surface-primary: rgba(255, 255, 255, 0.05);
--surface-secondary: rgba(255, 255, 255, 0.08);
--surface-hover: rgba(255, 255, 255, 0.12);
--border-primary: rgba(255, 255, 255, 0.1);
--border-secondary: rgba(255, 255, 255, 0.06);
--text-primary: #ffffff;
--text-secondary: #b3b3b3;
--text-tertiary: #808080;
--accent-primary: #3b82f6;
--accent-secondary: #60a5fa;
--accent-success: #10b981;
--accent-warning: #f59e0b;
--accent-error: #ef4444;

/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
--surface-primary: rgba(0, 0, 0, 0.04);
--surface-secondary: rgba(0, 0, 0, 0.06);
--surface-hover: rgba(0, 0, 0, 0.08);
--border-primary: rgba(0, 0, 0, 0.1);
--border-secondary: rgba(0, 0, 0, 0.06);
--text-primary: #0f172a;
--text-secondary: #475569;
--text-tertiary: #64748b;
```

### Typography
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing & Layout
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* Border Radius */
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.37);
--shadow-glass-border: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
```

### Animations
```css
/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;

/* Keyframe Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

## Component Specifications

### 1. Upload Area
```typescript
interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  isDragging?: boolean;
}
```

**Visual Design:**
- Large dashed border with rounded corners
- Gradient background on drag over
- Animated icon that changes on hover/drag
- Clear file format and size indicators
- Accessibility-friendly file input

**States:**
- Default: Subtle border, muted colors
- Hover: Brighter border, scale transform
- Drag Over: Animated border, color change
- Loading: Pulsing animation
- Error: Red border with error message

### 2. Video Player
```typescript
interface VideoPlayerProps {
  src: string;
  width: number;
  height: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (metadata: VideoMetadata) => void;
}
```

**Features:**
- Custom controls with modern design
- Timeline scrubber with thumbnail preview
- Time display (current/total)
- Volume control
- Fullscreen toggle
- Keyboard shortcuts

**Visual Elements:**
- Rounded container with glass effect
- Subtle controls that appear on hover
- Smooth scrubber with position indicator
- Responsive sizing

### 3. Timeline Controls
```typescript
interface TimelineControlsProps {
  videoFile: VideoFile;
  onOptionsChange: (options: Partial<ConversionOptions>) => void;
  disabled?: boolean;
}
```

**Interactive Elements:**
- Start Time slider with range input
- Duration slider with range input
- Timeline Preview with visual feedback
- Time display with current values
- Responsive 3-column layout on desktop

**Visual Design:**
- Clean, minimal design without card wrappers
- Consistent spacing and typography
- shadcn/ui Button components for interactions
- Real-time visual timeline with markers
- Color-coded segments (selected vs total)
- Smooth animations during dragging

### 4. Parameter Controls
```typescript
interface ParameterControlsProps {
  onOptionsChange: (options: Partial<ConversionOptions>) => void;
  disabled?: boolean;
}
```

**Control Types:**
- FPS: Preset buttons (8, 10, 12, 15, 20, 24, 30)
- Scale: Preset buttons (240p, 360p, 480p, 720p, 1080p, Original)
- Quality presets combining FPS and scale
- Real-time parameter adjustment

**Visual Features:**
- Grouped control panels with glass backgrounds
- shadcn/ui Button components with variants
- Hover states and active indicators
- Clean, minimal design with consistent spacing

### 5. Progress Display
```typescript
interface ProgressDisplayProps {
  stage: ConversionStage;
  percent: number;
  estimatedTime?: number;
  framesProcessed?: number;
  totalFrames?: number;
  conversionTime?: number;
}
```

**Visual Elements:**
- Animated progress bar with gradient fill
- Stage indicator with icons
- Time remaining estimate
- Frame processing counter
- Performance metrics display

**Animation Details:**
- Smooth progress transitions
- Stage change animations
- Success/completion celebration
- Error state with retry option

### 6. Output Display
```typescript
interface OutputDisplayProps {
  gifBlob: Blob;
  originalSize: number;
  convertedSize: number;
  dimensions: { width: number; height: number };
  onDownload: () => void;
  onCopy: () => void;
}
```

**Features:**
- GIF preview with zoom controls
- Size comparison visualization
- Download button with format options
- Copy to clipboard functionality
- Share functionality (optional)

## Layout Structure

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo, Title, GitHub Link, Theme Toggle            │
├─────────────────────────────────────────────────────────────┤
│  Main Content Area                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Upload Area (Full Width)                            │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌──────────────────────┬────────────────────────────────┐ │
│  │  Video Player        │  Timeline Controls           │ │
│  │  (60% width)        │  (40% width)                 │ │
│  └──────────────────────┴────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Parameter Controls (Full Width)                    │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌──────────────────────┬────────────────────────────────┐ │
│  │  Progress Display    │  Output Display              │ │
│  │  (50% width)        │  (50% width)                 │ │
│  └──────────────────────┴────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Code Snippet (Full Width)                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)
```
┌─────────────────────┐
│  Header             │
├─────────────────────┤
│  Upload Area        │
├─────────────────────┤
│  Video Player       │
├─────────────────────┤
│  Timeline Controls  │
├─────────────────────┤
│  Parameter Controls │
├─────────────────────┤
│  Progress Display   │
├─────────────────────┤
│  Output Display     │
├─────────────────────┤
│  Code Snippet       │
└─────────────────────┘
```

## Interactive Behaviors

### Drag and Drop
1. **Enter**: Border highlight, background fade
2. **Over**: Scale transform, color intensify
3. **Leave**: Reset to default state
4. **Drop**: Loading animation, file processing

### Real-time Updates
- Parameter changes update preview instantly
- Timeline scrubbing shows frame preview
- Progress updates smooth and frequent
- File size estimates update live

### Keyboard Navigation
- Tab navigation through all controls
- Space/Enter for buttons
- Arrow keys for sliders
- Escape for modals/cancellation

## Accessibility Features

### WCAG 2.1 AA Compliance
- Color contrast ratios ≥ 4.5:1
- Focus indicators visible
- Screen reader support
- Keyboard navigation
- Error message announcements

### ARIA Implementation
- Proper labeling for all controls
- Live regions for updates
- Role definitions
- State announcements

### Responsive Design
- Fluid typography
- Flexible layouts
- Touch-friendly controls
- Optimized images

## Performance Considerations

### Animation Optimization
- CSS transforms for positioning
- GPU acceleration
- RequestAnimationFrame for smooth updates
- Reduced motion support

### Loading Strategy
- Progressive enhancement
- Lazy loading for heavy components
- Code splitting for demo vs library
- Efficient asset delivery

This design specification ensures a beautiful, functional, and accessible user interface that showcases the video2gif library's capabilities while providing an excellent developer experience.