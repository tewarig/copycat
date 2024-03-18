import { getFileNameFromUrl } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FileNameViewer = (props: FileNameViewerProps) => {
  const { files } = props;
  const filesAreMoreThanOne = files.length > 1;
  return (
    <div>
      {filesAreMoreThanOne ? (
        <div >
          <Popover>
            <PopoverTrigger>
              {" "}
              <div className="truncate flex">
                {getFileNameFromUrl(files[0])} &nbsp;
                <div className="font-semibold hover:cursor-pointer">
                  + {files.length - 1} more{" "}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent>
              {files.map((file) => (
                <div className="truncate" key={file}>
                  {getFileNameFromUrl(file)}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="truncate">{getFileNameFromUrl(files[0])}</div>
      )}
    </div>
  );
};

interface FileNameViewerProps {
  files: string[];
}

export { FileNameViewer };
