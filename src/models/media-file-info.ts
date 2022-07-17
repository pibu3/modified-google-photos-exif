import { string } from "@oclif/command/lib/flags";

export interface MediaFileInfo {
  mediaFilePath: string;
  mediaFileName: string;
  mediaFileExtension: string;
  supportsExif: boolean;

  jsonFilePath: string|null;
  jsonFileName: string|null;
  jsonFileExists: boolean;

  outputFileName: string;
  outputFilePath: string;

  errorMediaFilePath: string;
  errorJsonFilePath: string|null;
}
