import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/synara/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],

      manifest: {
        name: 'SYNARA',
        short_name: 'SYNARA',

        description:
          'Registro y seguimiento integral de episodios de migraña.',

        theme_color: '#f7f8fa',
        background_color: '#f7f8fa',

        display: 'standalone',

        orientation: 'portrait',

        start_url: '/synara/',
        scope: '/synara/',

        lang: 'es-AR',

        categories: [
          'health',
          'medical',
          'lifestyle',
        ],

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}',
        ],

        navigateFallback:
          '/synara/index.html',

        cleanupOutdatedCaches: true,

        clientsClaim: true,

        skipWaiting: true,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});
