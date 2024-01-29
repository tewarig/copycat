import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";

import {
  readText,
  readFiles,
  writeText,
  readImage,
  readImageBinary,
  readImageObjectURL,
  writeImage,
  clear,
  onClipboardUpdate,
  listenToMonitorStatusUpdate,
  startListening,
} from "tauri-plugin-clipboard-api";
// import { Store } from "tauri-plugin-store-api";

import "./App.css";

function App() {
  const [monitorRunning, setMonitorRunning] = useState<boolean>(false);
  const [localStore, setLocalStore] = useState<string[]>();


  onClipboardUpdate(async() => {
    console.log("onClipboardUpdate");
   const result = await invoke('add_clipboard_data', { data: await readText()}) as string[];
   const reversedResult = result.reverse();
   setLocalStore(reversedResult);
  })

  const getDataOnMount = async() => {
    const result = await invoke('get_clipboard_data') as string[];
    const reversedResult = result.reverse();
    setLocalStore(reversedResult);
  }

  useEffect(() => {
   getDataOnMount();
  }, [])

  


  useEffect(() => {
    if(!monitorRunning){
      startListening();
      listenToMonitorStatusUpdate((running) => {
        setMonitorRunning(running);
      });
    } 
  },
  []);

  return (
    <div className="container">
      <h1>Welcome to Copy Cat</h1>
      <p> A Simple yet powerful clipboard manager</p>
      {
        localStore?.map((text, index) => (
          <div key={index}>
            <p>{text}</p>
            <button onClick={() => writeText(text)}>Copy</button>
          </div>
        ))
      }
    </div>
  );
}

export default App;
