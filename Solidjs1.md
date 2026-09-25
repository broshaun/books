# Books App开发


## Solid项目创建
```sh

## 创建项目
    pnpm create rsbuild@latest
    cd xxx
    pnpm install

## TanStack Router
    pnpm add @tanstack/solid-router @tanstack/solid-router-devtools @tanstack/router-plugin -D
    pnpm add corvu
    pnpm add localforage @tabler/icons-solidjs clsx tailwind-merge

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
  "paths": {
    "@/*": [
      "./src/mod/*",
      "./src/*",
    ],
  }
}
```

### rsbuild.config.ts
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

```sh
    pnpm tauri dev
    pnpm tauri build
    pnpm tauri build --debug
```