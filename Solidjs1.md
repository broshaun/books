# Books App开发


## Solid项目创建
```sh

## 创建项目
    pnpm create rsbuild@latest
    cd xxx
    pnpm install

## TanStack Router
    pnpm add @tanstack/solid-router @tanstack/solid-router-devtools @tanstack/router-plugin -D
    pnpm add @tabler/icons-react localforage 

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