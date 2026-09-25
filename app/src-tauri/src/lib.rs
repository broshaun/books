mod net;
mod std;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            net::http::http_get,
            net::http::http_post,
            net::http::http_upload,
            std::file::select_folder,
        ])
        .plugin(tauri_plugin_device_info::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
