#[tauri::command]
pub async fn select_folder() -> Result<Option<String>, String> {
    // 🌟 Android 平台直接返回空或错误提示（因为移动端不支持直接选文件夹）
    #[cfg(target_os = "android")]
    {
        // 可以在这里返回错误，或者在前端做降级处理
        Err("Android 暂不支持直接选择文件夹".into())
    }

    // 🌟 桌面端（Windows / macOS / Linux）正常使用 rfd
    #[cfg(not(target_os = "android"))]
    {
        let result = rfd::AsyncFileDialog::new()
            .pick_folder()
            .await;

        Ok(result.map(|path| path.path().to_string_lossy().into_owned()))
    }
}