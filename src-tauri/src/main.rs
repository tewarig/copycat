// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::sync::Mutex;

// use tauri_plugin_clipboard::ManagerExt;
pub struct CopyClipState {
    pub clip_board_data: Vec<String>,
}
impl CopyClipState {
    pub fn reset(&mut self) {
        // clear state
        self.clip_board_data = Vec::new();
    }
}

pub struct AppState(pub Mutex<CopyClipState>);

#[tauri::command]
fn get_clipboard_data(state: tauri::State<'_, AppState>) -> Vec<String> {
    let state = state.0.lock().unwrap();
    return state.clip_board_data.clone();
}

#[tauri::command]
fn add_clipboard_data(state: tauri::State<'_, AppState>, data: String) -> Vec<String> {
    let mut state = state.0.lock().unwrap();
    //check if already present in state if present delete that copy and append at last in state
    let index = state.clip_board_data.iter().position(|x: &String| *x == data);
    if let Some(i) = index {
        state.clip_board_data.remove(i);
    }
    state.clip_board_data.push(data.clone());
    return state.clip_board_data.clone();
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[derive(Default,Deserialize)]
// struct AppState {
//   clip_board_data: Vec<String>,
// }

// #[tauri::command]
// fn get_clipboard_data(state: tauri::State<'_, AppState>) -> Vec<String> {
//    return state.clip_board_data.clone() ;
// }

// #[tauri::command]
// fn add_clipboard_data(state: tauri::State<'_, AppState>, data: String) -> Vec<String> {
//     state.clip_board_data.push(data);
//     return state.clip_board_data.clone();
// }

#[tauri::command]

fn main() {
    tauri::Builder::default()
        .manage(AppState(Mutex::new(CopyClipState {
            clip_board_data: Vec::new(),
        })))
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();
            // let clipboard: tauri::State<'_, tauri_plugin_clipboard::ClipboardManager> = handle.state::<tauri_plugin_clipboard::ClipboardManager>();
            // clipboard.write_text("macbook air".to_string()).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_clipboard_data,add_clipboard_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}