import preset from '@cfxdevkit/theme/preset';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
