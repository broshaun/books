import { defineConfig } from '@rsbuild/core';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';


export default defineConfig({
  plugins: [
    pluginSolid(),
    pluginTailwindcss(),
  ],
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: 'solid',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
});
