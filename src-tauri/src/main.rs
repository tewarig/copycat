// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_positioner::{Position, WindowExt};

// use tauri_plugin_clipboard::ManagerExt;
pub struct CopyClipState {
    pub clip_board_data: Vec<String>,
    pub clip_board_files: Vec<String>,
}
impl CopyClipState {
    pub fn reset(&mut self) {
        // clear state
        self.clip_board_data = Vec::new();
        self.clip_board_files = Vec::new();
    }
}

pub struct AppState(pub Mutex<CopyClipState>);

#[tauri::command]
fn get_clipboard_data(state: tauri::State<'_, AppState>) -> Vec<String> {
    let state = state.0.lock().unwrap();
    return state.clip_board_data.clone();
}

#[tauri::command]
fn get_clipboard_files(state: tauri::State<'_, AppState>) -> Vec<String> {
    let state = state.0.lock().unwrap();
    return state.clip_board_files.clone();
}

#[tauri::command]
fn add_clipboard_data(state: tauri::State<'_, AppState>, data: String) -> Vec<String> {
    println!("data: {}", data);
    let mut state = state.0.lock().unwrap();
    //check if already present in state if present delete that copy and append at last in state
    let index = state.clip_board_data.iter().position(|x: &String| *x == data);
    if let Some(i) = index {
        state.clip_board_data.remove(i);
    }
    state.clip_board_data.push(data.clone());
    return state.clip_board_data.clone();
}

#[tauri::command]
fn add_clipboard_files(state: tauri::State<'_, AppState>, data: String) -> Vec<String> {
    println!("data: {}", data);
    let mut state = state.0.lock().unwrap();
    //check if already present in state if present delete that copy and append at last in state
    let index = state.clip_board_files.iter().position(|x: &String| *x == data);
    if let Some(i) = index {
        state.clip_board_files.remove(i);
    }
    state.clip_board_files.push(data.clone());
    print!("files: {:?}", state.clip_board_files);
    return state.clip_board_files.clone();
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
    let system_tray_menu: SystemTrayMenu = SystemTrayMenu::new();
    

    tauri::Builder::default()
        .manage(AppState(Mutex::new(CopyClipState {
            clip_board_data: Vec::new(),
            clip_board_files: Vec::new(),
        })))
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.move_window(Position::TrayCenter);

                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::RightClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    println!("system tray received a right click");
                }
                SystemTrayEvent::DoubleClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    println!("system tray received a double click");
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::Focused(is_focused) => {
                // detect click outside of the focused window and hide the app
                if !is_focused {
                    event.window().hide().unwrap();
                }
            }
            _ => {}
        })
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();
            // let clipboard: tauri::State<'_, tauri_plugin_clipboard::ClipboardManager> = handle.state::<tauri_plugin_clipboard::ClipboardManager>();
            // clipboard.write_text("macbook air".to_string()).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_clipboard_data,add_clipboard_data,get_clipboard_files,add_clipboard_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}