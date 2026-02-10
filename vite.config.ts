import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // زۆر گرنگە بۆ GitHub Pages
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});