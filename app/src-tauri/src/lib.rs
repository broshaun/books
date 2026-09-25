mod net;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            net::http::http_get,
            net::http::http_post,
            net::http::http_upload,
        ])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_device_info::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
