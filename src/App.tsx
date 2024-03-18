import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileNameViewer } from "@/components/ui/fileNameViewer";
import useThemeDetector from "@/lib/themeDetector";
import { FaCopy } from "react-icons/fa";
import {
  readText,
  readFiles,
  writeText,
  listenToMonitorStatusUpdate,
  startListening,
  onTextUpdate,
  onFilesUpdate,
} from "tauri-plugin-clipboard-api";
import { useTheme } from "@/components/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "./App.css";

function App() {
  const isDarkTheme = useThemeDetector();
  const { setTheme } = useTheme();

  const [monitorRunning, setMonitorRunning] = useState<boolean>(false);
  const [localStore, setLocalStore] = useState<string[]>();
  const [files, setFiles] = useState<string[][] | undefined>();

  onTextUpdate(async () => {
    const result = (await invoke("add_clipboard_data", {
      data: await readText(),
    })) as string[];
    const reversedResult = result.reverse();
    setLocalStore(reversedResult);
  });

  onFilesUpdate(async () => {
    let result: string[][] = [];
    try {
      console.log(await readFiles());
      result = (await invoke("add_clipboard_files", {
        data: await readFiles(),
      })) as string[][];
    } catch (error) {
      console.log(error);
    }
    const reversedResult = result.reverse();
    setFiles(reversedResult);
  });

  const getDataOnMount = async () => {
    const textData = (await invoke("get_clipboard_data")) as string[];
    const fileData = (await invoke("get_clipboard_files")) as string[][];

    const reversedTextData = textData.reverse();
    const reversedFileData = fileData.reverse();

    setLocalStore(reversedTextData);
    setFiles(reversedFileData);
  };

  const writeFile = async (files: string[]) => {
    (await invoke("copy_files_from_paths", { files })) as string;
  };

  useEffect(() => {
    getDataOnMount();
  }, []);

  useEffect(() => {
    if (!monitorRunning) {
      startListening();
      listenToMonitorStatusUpdate((running) => {
        setMonitorRunning(running);
      });
    }
  }, []);

  //for system theme changes
  useEffect(() => {
    if (isDarkTheme) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [isDarkTheme]);

  return (
    <div className="flex-col justify-center items-center p-4">
      <div className="arrow"></div>
      <Tabs defaultValue="text" className="w-[400px] mt-4">
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          {localStore?.map((text, index) => (
            <div className="p-2">
              <div
                key={index}
                className="flex justify-between items-center m-2 gap-8"
              >
                <div>
                  <Popover>
                    <PopoverTrigger>
                      <div className="whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[250px]">
                        {text}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div>{text}</div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={() => writeText(text)}>
                  <FaCopy />
                </Button>
              </div>
              <Separator />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="files">
          {files?.map((copyFiles, index) => (
            <div className="p-2">
              <div
                key={index}
                className="flex justify-between items-center m-2"
              >
                <div>
                  <FileNameViewer files={copyFiles} />
                </div>
                <Button onClick={() => writeFile(copyFiles)}>
                  <FaCopy />
                </Button>
              </div>
              <Separator />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
