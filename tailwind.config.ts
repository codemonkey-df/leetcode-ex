import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0f1117',
        'accent-cyan': '#00d4ff',
        'success-green': '#22c55e',
        'error-red': '#ef4444',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
        'ui': ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
