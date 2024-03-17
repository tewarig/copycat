import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFileNameFromUrl = (fileName: string): string => {
  //since filename is a url like something/desktop/file.png we split by /
  const fileNameArray = fileName.split("/");
  return fileNameArray[fileNameArray.length - 1].substring(0, 70);
};
