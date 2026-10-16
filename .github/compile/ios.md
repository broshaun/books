
## 环境配置
- rustup target add aarch64-apple-ios           # 真机 (ARM64)
- rustup target add aarch64-apple-ios-sim       # Apple Silicon 模拟器
- rustup target add x86_64-apple-ios            # Intel 芯片模拟器 (可选)


### 打包
- cargo tauri ios build

## 开发环境
### 初始项目
- cargo tauri ios init
### 查看运行的虚拟机
- xcrun simctl list devices | grep Booted
### 启动一台虚拟机
- open -a Simulator
### 运行并绑定虚拟机
- cargo tauri ios dev 
- pnpm tauri ios dev 


### 1. 查看所有可用模拟器
- xcrun simctl list devices available

### 2. 指定启动设备：
- xcrun simctl boot 2D7C0C5C-DB35-4EC0-9812-9B7A3F77834C

### 打开默认模拟器
- open -a Simulator

### 指定打开模拟器
- open -a Simulator --args -CurrentDeviceUDID 2D7C0C5C-DB35-4EC0-9812-9B7A3F77834C



