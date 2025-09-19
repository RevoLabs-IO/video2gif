/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy colors for backward compatibility
        'bg-primary': '#0f0f0f',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#252525',
        'surface-primary': 'rgba(255, 255, 255, 0.05)',
        'surface-secondary': 'rgba(255, 255, 255, 0.08)',
        'surface-hover': 'rgba(255, 255, 255, 0.12)',
        'border-primary': 'rgba(255, 255, 255, 0.1)',
        'border-secondary': 'rgba(255, 255, 255, 0.06)',
        'text-primary': '#ffffff',
        'text-secondary': '#b3b3b3',
        'text-tertiary': '#808080',
        'accent-primary': '#3b82f6',
        'accent-secondary': '#60a5fa',
        'accent-success': '#10b981',
        'accent-warning': '#f59e0b',
        'accent-error': '#ef4444',

        // Light mode colors
        'light-bg-primary': '#ffffff',
        'light-bg-secondary': '#f8fafc',
        'light-bg-tertiary': '#f1f5f9',
        'light-surface-primary': 'rgba(0, 0, 0, 0.04)',
        'light-surface-secondary': 'rgba(0, 0, 0, 0.06)',
        'light-surface-hover': 'rgba(0, 0, 0, 0.08)',
        'light-border-primary': 'rgba(0, 0, 0, 0.1)',
        'light-border-secondary': 'rgba(0, 0, 0, 0.06)',
        'light-text-primary': '#0f172a',
        'light-text-secondary': '#475569',
        'light-text-tertiary': '#64748b',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glass-border': 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode with class strategy
}