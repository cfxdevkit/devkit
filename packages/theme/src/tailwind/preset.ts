/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @cfxdevkit/theme — Tailwind CSS v3 preset
 *
 * Provides the shared Conflux design tokens used by all @cfxdevkit apps:
 *   - `conflux` color palette (50–900)
 *   - `font-sans` → Outfit · `font-mono` → JetBrains Mono
 *   - Custom keyframes + animations: slide-in-right, modal-in, shimmer
 *
 * Usage in tailwind.config.ts:
 *   import preset from '@cfxdevkit/theme/preset'
 *   export default { presets: [preset], content: ['./src/**'] }
 */

import type { Config } from 'tailwindcss';

const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        conflux: {
          50: '#e8f4fd',
          100: '#c5e2f9',
          200: '#9fd0f5',
          300: '#71baf0',
          400: '#4da9ed',
          500: '#2599ea',
          600: '#1e88d8',
          700: '#1472ba',
          800: '#0b5c9c',
          900: '#00345a',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-outfit)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'modal-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'modal-in': 'modal-in 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};

export default preset;
