# Reel Captioner Backend

Node.js backend with ffmpeg integration for generating Instagram/TikTok reels with burned-in captions.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **FFmpeg** installed on your system
   - Windows: Download from https://ffmpeg.org/download.html
   - macOS: `brew install ffmpeg`
   - Ubuntu/Debian: `sudo apt install ffmpeg`

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Install archiver for batch downloads:
```bash
npm install archiver
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### 1. Upload Video
- **POST** `/api/upload-video`
- Upload a video file (MP4, MOV, AVI, MKV)
- Max file size: 100MB

### 2. Generate Reels
- **POST** `/api/generate-reels`
- Body: `{ videoFilename: string, captions: Caption[] }`
- Generates individual MP4 files for each caption

### 3. Download Single Reel
- **GET** `/api/download/:filename`
- Download a specific generated reel

### 4. Download Batch
- **GET** `/api/download-batch/:batchId`
- Download all reels as a ZIP file

## Directory Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── uploads/           # Uploaded videos
├── output/            # Generated reels
└── README.md         # This file
```

## Integration with Frontend

Update your React frontend to use this backend:

1. Change the video upload to use the backend endpoint
2. Update the generate reels function to call the backend API
3. Handle the response to download the actual MP4 files

## Features

- ✅ Video upload handling
- ✅ Caption text overlay with positioning
- ✅ Vertical format (1080x1920) for reels
- ✅ Batch processing of multiple captions
- ✅ Individual MP4 file generation
- ✅ ZIP batch downloads
- ✅ Progress tracking
- ✅ Error handling

## Troubleshooting

1. **FFmpeg not found**: Make sure ffmpeg is installed and available in PATH
2. **Large file uploads**: Adjust the file size limit in server.js if needed
3. **Processing errors**: Check console logs for detailed ffmpeg error messages