import { existsSync } from 'fs';
import { basename, extname, resolve, dirname} from 'path';
import { CONFIG } from '../config';
import { MediaFileInfo } from '../models/media-file-info';
import { doesFileSupportExif } from './does-file-support-exif';
import { findFilesWithExtensionRecursively } from './find-files-with-extension-recursively';
import { generateUniqueOutputFileName } from './generate-unique-output-file-name';
import { getCompanionJsonPathForMediaFile } from './get-companion-json-path-for-media-file';
import { Directories } from '../models/directories'

export async function findSupportedMediaFiles(directories: Directories, jsonRequired: boolean): Promise<MediaFileInfo[]> {
  const supportedMediaFileExtensions = CONFIG.supportedMediaFileTypes.map(fileType => fileType.extension);
  const mediaFilePaths = await findFilesWithExtensionRecursively(directories.input, supportedMediaFileExtensions);

  const mediaFiles: MediaFileInfo[] = [];
  const allUsedOutputFilesLowerCased: string[] = [];

  for (const mediaFilePath of mediaFilePaths) {
    const mediaFileName = basename(mediaFilePath);
    const mediaFileExtension = extname(mediaFilePath);
    const supportsExif = doesFileSupportExif(mediaFilePath);

    const jsonFilePath = getCompanionJsonPathForMediaFile(mediaFilePath);
    const jsonFileName = jsonFilePath ? basename(jsonFilePath) : null;
    const jsonFileExists = jsonFilePath ? existsSync(jsonFilePath) : false;

    // if json file doesn't exist, skip the media file
    if (jsonRequired) {
      if (!jsonFileExists) {
        continue;
      }
    }

    const outputFileName = generateUniqueOutputFileName(directories.input, mediaFilePath, allUsedOutputFilesLowerCased);
    const outputFilePath = resolve(directories.output, outputFileName);

    const errorMediaFilePath = resolve(directories.error, outputFileName);
    const errorJsonFilePath = jsonFileName ? resolve(directories.error, dirname(outputFileName) + "/" + jsonFileName) : null;

    mediaFiles.push({
      mediaFilePath,
      mediaFileName, // e.g. "foo.jpg"
      mediaFileExtension,
      supportsExif,
      jsonFilePath,
      jsonFileName,
      jsonFileExists,
      outputFileName, // including the parent directory e.g. "Photo from 2022/foo.jpg"
      outputFilePath, // e.g. "/XXX/Photo from 2022/Photo from 2022/foo.jpg"
      errorMediaFilePath,  // e.g. "/XXX/Error/Photo from 2022/Photo from 2022/foo.jpg"
      errorJsonFilePath, // e.g. "/XXX/Error/Photo from 2022/Photo from 2022/foo.json"
    });
    allUsedOutputFilesLowerCased.push(outputFileName.toLowerCase());
  }

  return mediaFiles;
}
