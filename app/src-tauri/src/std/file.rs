// src-tauri/src/main.rs
#[tauri::command]
pub fn select_folder() -> Option<String> {
    // 使用 rfd 库打开系统文件夹选择器
    rfd::FileDialog::new().pick_folder().map(|p| p.to_string_lossy().into_owned())
}