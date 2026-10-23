# Books App开发


## Solid1项目创建
```sh

## 创建项目
    pnpm create rsbuild@latest
    cd xxx
    pnpm install

## TanStack Router
    pnpm add @tanstack/solid-router @tanstack/solid-router-devtools @tanstack/router-plugin -D

## 开发常用库
    pnpm add localforage clsx tailwind-merge @tabler/icons-solidjs corvu @solid-primitives/scheduled vconsole

## 业务库
    pnpm add epubjs
```


## Tauri项目
```sh
## 创建与初始化
    pnpm add -D @tauri-apps/cli
    pnpm tauri init

## 工具库
    pnpm add @tauri-apps/api
    pnpm tauri add device-info
    pnpm tauri add dialog
    pnpm tauri add fs
```


### 添加tsconfig.json配置
```json
 "compilerOptions": {
  ...
  "paths": {
    "@/*": [
      "./src/mod/*",
      "./src/*",
    ],
  }
}
```

### rsbuild.config.ts
```js
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';


export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginTailwindcss(),
  ],
  html: { template: './public/index.html' },

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

  output: {
    assetPrefix: "/",
  },

});

```
### 在项目主目录下创建
config
- .env.development
- .env.production

### 修改package.json执行参数 
```json
  "scripts": {
    "dev": "rsbuild dev --env-dir config",
    "build": "rsbuild build --env-dir config",
    "check": "biome check --write",
    "format": "biome format --write",
    "preview": "rsbuild preview"
  }
```

### 创建routes文件夹
routes 
  - __root.tsx


```sh
    pnpm tauri dev
    pnpm tauri build
    pnpm tauri build --debug
```



```ts 网络
const isOnline = navigator.onLine;
console.log("当前网络状态：", isOnline ? "在线" : "离线");

// 监听网络连接/断开事件
window.addEventListener('online', () => {
  console.log("网络已连接");
});
window.addEventListener('offline', () => {
  console.log("网络已断开");
});
```