

## 创建安卓项目
- cargo tauri android init
1. 强行建立安卓目录结构
- mkdir -p src-tauri/gen/android/app/src/main
2. 直接写入 AndroidManifest.xml 安装设置


### 生成 keystore
```sh
keytool -genkeypair \
  -v \
  -keystore books-release.jks \
  -storetype JKS \
  -alias books \
  -keyalg RSA 
  -keysize 2048 
  -validity 10000
```


验证：
```sh
keytool -list -v \
  -keystore books-release.jks \
  -alias books
```

base64 -i books-release.jks | pbcopy   // 转成 Base64 → 直接复制到你的剪贴板
你的仓库 → Settings → Secrets and variables → Actions → New repository secret


### New Secret：
```sh

Name：
  - ANDROID_KEYSTORE_BASE64
Secret：使用以下命令复制至剪切板 
  - base64 -i books-release.jks | pbcopy 

Name：
  - ANDROID_KEYSTORE_PASSWORD
Secret：
  - 你刚设置的 keystore 密码

Name：
  - ANDROID_KEY_ALIAS
Secret：
  - books

Name：
  - ANDROID_KEY_PASSWORD	
Secret：
  - key 密码

```


正常部署
- git tag android-v0.14
- git push origin android-v0.14

