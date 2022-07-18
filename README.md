# modified-google-photos-exif

This tool is useful for [Google Photos Takeout](https://takeout.google.com), which has the following functions:

1.  Populating missing `DateTimeOriginal` of the EXIF metadata of the media files (.jpeg, .jpg, .heic) using 
`photoTimeTaken` of JSON metadata.
2. Updating the last modified date of the media files (.jpeg, .jpg, .heic, .gif, .mp4, .png, .avi, .mov) with `photoTimeTaken` of JSON metadata.

This tool is a modified version of [google-photos-exif](https://github.com/mattwilson1024/google-photos-exif) provided under the MIT. 

## Quick Start

Assume that the takeout directory extracted from .zip has the following directory structure:

```
~/Takeout/
  Google Photos/
    Photos from 2021/
      IMG1001.jpg
      IMG1001(1).jpg
      IMG1001.jpg.json
    Photos from 2022/
      IMG1002.jpg
      IMG1002.json
    SomeAlbumName/
      IMG1003.jpg
      IMG1003.JPG(1).json
      IMG1004.jpg
      IMG1004..json
```

Then, this tool can be run with some arguments as follows:

```
cd modified-google-photos-exif
yarn
yarn start \
    --inputDir  "~/Takeout/Google Photos" \
    --outputDir "~/Takeout/Google Photos with EXIF" \ 
    --errorDir  "~/Takeout/Google Photos with EXIF/Error" \
    --json-required --exif-with-jst
```

As a result, the expected output is as follows:


```
~/Takeout/
  Google Photos with EXIF/
    Photos from 2021/
      IMG1001.jpg
    Photos from 2022/
      IMG1002.jpg
    SomeAlbumName/
      IMG1003.jpg
      IMG1004.jpg
    Error/
```

## Changes from the [original version](https://github.com/mattwilson1024/google-photos-exif)
- [Creating output subdirectories](#creating-output-subdirectories)
- [Allowing non-empty output directories](#allowing-non-empty-output-directories)
- [Supporting more JSON filenames](#supporting-more-json-filenames)
- [Processing only the media files with JSON](#processing-only-the-media-files-with-json)
- [Updating the EXIF date with JST](#updating-the-exif-date-with-JST)

## Creating output subdirectories

As described in [Quick Start](#quick-start), "Takeuout/Google Photo" directory has some subdirectories such as "Photo from XXXX" and "AlbumName". This tool creates the same subdirectories as input subdirectories.

## Allowing non-empty output directories
This tool can be run even if the output directory is not empty. If the media file already exists in the output directory, its copy and EXIF-update process will be skipped.

## Supporting more JSON filenames
This tool supports the following patterns of JSON filenames. These have been found heuristically.  There is a possibility that these will change in the future.

```
┌───────────┬────────────────┐
│.jpg       │.json           │
├───────────┼────────────────┤
│foo.jpg    │foo.json        │
│foo.jpg    │foo.jpg.json    │
│foo.jpg    │foo.JPG.json    │
│foo.jpg    │foo..json       │
│foo.jpg    │foo.j.json      │
│foo.jpg    │foo.jp.json     │
│foo.jpg    │fo.json         │
│foo(1).jpg │foo.jpg(1).json │
│foo(1).jpg │foo.JPG(1).json │
│foo(1).jpg │fo(1).json      │
└───────────┴────────────────┘
```

## Processing only the media files with JSON
This is provided by the option `--json-required`. If the photo (e.g. IMG1001.jpg) is edited, such as cropped, on the Google Photo application, the edited photo file will appear to be saved in the takeout directory as a new file (e.g. IMG1001(1).jpg). Then, note that the json file exists only for the original file, not for the new file, as described in [Quick Start](#quick-start). If this option is enabled, the media files without json will be skipped during processing. As a result, the output directory contains only the original files, not the edited file.

## Updating the EXIF date with JST
This is provided by the option ` --exif-with-jst`. If this option is enabled, `DateTimeOriginal` of the EXIF metadata will be updated in JST(+9:00).
