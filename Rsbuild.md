# Books App开发

## React项目创建

```sh
    pnpm create rsbuild@latest
    cd xxx
    pnpm install

  ## TanStack Router
    pnpm add @tanstack/react-router @tanstack/router-plugin @tanstack/router-devtools
    pnpm add localforage ahooks zustand
    pnpm add @mantine/core @mantine/hooks @tabler/icons-react
    pnpm add epubjs

  ## 自定义组件库
    pnpm install
    pnpm run dev 

    pnpm add -D @tauri-apps/cli
    pnpm tauri init
```

`先进入Cargo.toml配置更高项目名称`
```sh
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

### 创建routers文件夹
routers 
  - __root.tsx

### 生成路由文件
- pnpm run dev 

```sh 
  pnpm tauri dev
  pnpm tauri build
  pnpm tauri build --debug
```


