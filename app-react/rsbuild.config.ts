import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindcss(),
  ],

  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },

  output: {
    assetPrefix: '/',
  },

  server: {
    proxy: {
      '/rpc': {
        target: 'http://192.168.2.1:5015',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});