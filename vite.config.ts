import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ضروري جداً لعمل الموقع بشكل صحيح على GitHub Pages
  define: {
    // تمرير مفتاح الـ API بشكل آمن (إذا لم يكن موجوداً، سيضع نصاً فارغاً كي لا ينهار الموقع)
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});