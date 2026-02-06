import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isAnalyze = mode === 'analyze'
  const isBuild = command === 'build'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'logo.png', 'robots.txt'],
        manifest: {
          short_name: "Trickcal Viewer",
          name: "Trickcal Viewer",
          description: "유사 트릭컬 사도 면접",
          lang: "ko",
          start_url: "/",
          scope: "/",
          display: "standalone",
          display_override: ["standalone", "window-controls-overlay"],
          theme_color: "#eef7d6",
          background_color: "#eef7d6",
          icons: [
            { src: "logo32.png", sizes: "32x32", type: "image/png" },
            { src: "logo96.png", sizes: "96x96", type: "image/png" },
            { src: "logo192.png", sizes: "192x192", type: "image/png" },
            { src: "logo256.png", sizes: "256x256", type: "image/png" },
            { src: "logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ],
          shortcuts: [
            {
              name: "뷰어 열기",
              url: "/",
              description: "사도 뷰어 바로 열기",
              icons: [
                { src: "logo192.png", sizes: "192x192", type: "image/png" }
              ]
            }
          ]
        },
        workbox: {
          mode: isBuild ? 'production' : 'development',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,txt}'],
          maximumFileSizeToCacheInBytes: 6000000,
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigateFallback: null,
          runtimeCaching: [
            {
              // Local Images & Fonts (CacheFirst)
              urlPattern: ({ url }) => {
                return url.pathname.startsWith('/image/') || url.pathname.startsWith('/font/');
              },
              handler: 'CacheFirst',
              options: {
                cacheName: 'local-assets',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Data JSONs (StaleWhileRevalidate)
              urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'local-data',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            }
          ]
        }
      }),
      ...(isAnalyze
          ? [
            visualizer({
              filename: './dist/stats.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            })
          ]
          : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("i18next")) return "i18next";
              if (id.includes("lucide-react")) return "lucide-react";
              if (id.includes("tailwind-merge")) return "tailwind-merge";
              if (id.includes("sonner")) return "sonner";
              if (id.includes("react-router")) return "router";
              if (id.includes("@ffmpeg")) return "ffmpeg";
              return "vendor";
            }
          },
        },
      },
    },
  }
})
