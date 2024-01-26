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
import "./App.css";

function App() {
  const [copyTextValue, setCopyTextValue] = useState<string[]>([]);
  const [monitorRunning, setMonitorRunning] = useState<boolean>(false);

  async function copy() {
      const updatedCopyTextValue = copyTextValue ? [...copyTextValue] : []; 
      updatedCopyTextValue.push(await readText());
      updatedCopyTextValue;
      setCopyTextValue(updatedCopyTextValue);
  }

  onClipboardUpdate(async() => {
    console.log("onClipboardUpdate");
    const updatedCopyTextValue = copyTextValue ? [...copyTextValue ] : []; 
    updatedCopyTextValue.push(await readText());
    setCopyTextValue(updatedCopyTextValue);
  })

  


  useEffect(() => {
    copy();
    if(!monitorRunning){
      startListening();
      listenToMonitorStatusUpdate((running) => {
        console.log(running);
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
        copyTextValue?.map((text, index) => (
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
