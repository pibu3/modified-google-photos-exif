import { exiftool } from 'exiftool-vendored';
import { doesFileSupportExif } from './does-file-support-exif';
import { existsSync, promises as fspromises } from 'fs';
import { MediaFileInfo } from '../models/media-file-info';
import { resolve } from 'path';

const { unlink, copyFile } = fspromises;

export async function updateExifMetadata(fileInfo: MediaFileInfo, timeTaken: string, errorDir: string, jstExif: boolean): Promise<void> {
  if (!doesFileSupportExif(fileInfo.outputFilePath)) {
    return;
  }

  let timeTakenStringDate = timeTaken;

  if (jstExif) {
    // convert to JST
    const timeTakenMsec = Date.parse(timeTaken);
    const timeTakenDate = new Date(timeTakenMsec);
    timeTakenDate.setHours(timeTakenDate.getHours() + 9);

    const yyyy = timeTakenDate.getUTCFullYear();
    const MM = ('0' + (timeTakenDate.getUTCMonth() + 1)).slice(-2);
    const dd = ('0' + timeTakenDate.getUTCDate()).slice(-2);
    const hh = ('0' + timeTakenDate.getUTCHours()).slice(-2);
    const mm = ('0' + timeTakenDate.getUTCMinutes()).slice(-2);
    const ss = ('0' + timeTakenDate.getUTCSeconds()).slice(-2);
    timeTakenStringDate = yyyy + ':' + MM + ':' + dd + ' ' + hh + ':' + mm + ':' + ss + '+09:00';
  }

  try {
    await exiftool.write(fileInfo.outputFilePath, {
      DateTimeOriginal: timeTakenStringDate,
    });

    await unlink(`${fileInfo.outputFilePath}_original`); // exiftool will rename the old file to {filename}_original, we can delete that

  } catch (error) {
    if (existsSync(`${fileInfo.outputFilePath}_original`)) {
      await unlink(`${fileInfo.outputFilePath}_original`); // exiftool will rename the old file to {filename}_original, we can delete that
    }

    await copyFile(fileInfo.mediaFilePath,  resolve(errorDir, fileInfo.mediaFileName));
    if (fileInfo.jsonFileExists && fileInfo.jsonFileName && fileInfo.jsonFilePath) {
      await copyFile(fileInfo.jsonFilePath, resolve(errorDir, fileInfo.jsonFileName));
    }
  }
}
