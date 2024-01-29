import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { FaCopy } from "react-icons/fa";






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
    <div className="flex-col justify-center items-center p-4">
      <div className="arrow"></div>
      <Tabs defaultValue="text" className="w-[400px] mt-4">
  <TabsList>
    <TabsTrigger value="text">Text</TabsTrigger>
    <TabsTrigger value="files">Files</TabsTrigger>
  </TabsList>
  <TabsContent value="text"><ScrollArea className="h-[300px] w-[400px] rounded-md border p-4">
  {
        localStore?.map((text, index) => (
          <div className="p-2">
          <div key={index} className="flex justify-between items-center m-2">
            <div>{text.substring(0,70)}</div>
            <Button onClick={() => writeText(text)}><FaCopy /></Button>
          </div>
          <Separator />
          </div>

        ))
      }
   
</ScrollArea>
</TabsContent>
  <TabsContent value="files">Change your password here.</TabsContent>
</Tabs>

    {/* <div className="content">
      {
        localStore?.map((text, index) => (
          <div key={index}>
            <p>{text}</p>
            <button onClick={() => writeText(text)}>Copy</button>
          </div>
        ))
      }
    </div> */}
    </div>
  );
}

export default App;
