const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create directories
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Routes
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoInfo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    };

    res.json({
      success: true,
      video: videoInfo,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/generate-reels', async (req, res) => {
  try {
    const { videoFilename, captions } = req.body;
    
    if (!videoFilename || !captions || captions.length === 0) {
      return res.status(400).json({ error: 'Video filename and captions are required' });
    }

    const inputPath = path.join(uploadsDir, videoFilename);
    
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const results = [];
    const batchId = uuidv4();

    // Process each caption as a separate reel
    for (let i = 0; i < captions.length; i++) {
      const caption = captions[i];
      const outputFilename = `reel_${batchId}_${i + 1}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);

      try {
        await processVideoWithCaption(inputPath, outputPath, caption);
        results.push({
          reelNumber: i + 1,
          filename: outputFilename,
          caption: caption.text,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error processing reel ${i + 1}:`, error);
        results.push({
          reelNumber: i + 1,
          caption: caption.text,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      batchId,
      results,
      downloadUrl: `/api/download-batch/${batchId}`
    });

  } catch (error) {
    console.error('Generate reels error:', error);
    res.status(500).json({ error: 'Failed to generate reels' });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filePath);
});

app.get('/api/download-batch/:batchId', async (req, res) => {
  const batchId = req.params.batchId;
  const archiver = require('archiver');
  
  try {
    const archive = archiver('zip');
    res.attachment(`reels_batch_${batchId}.zip`);
    
    archive.pipe(res);
    
    // Add all files for this batch
    const files = fs.readdirSync(outputDir).filter(file => file.includes(batchId));
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      archive.file(filePath, { name: file });
    });
    
    archive.finalize();
  } catch (error) {
    console.error('Download batch error:', error);
    res.status(500).json({ error: 'Failed to create batch download' });
  }
});

// Helper function to process video with caption
function processVideoWithCaption(inputPath, outputPath, caption) {
  return new Promise((resolve, reject) => {
    // Convert percentage positions to pixel positions (assuming 1080x1920)
    const x = Math.round((caption.x / 100) * 1080);
    const y = Math.round((caption.y / 100) * 1920);
    
    // Escape text for ffmpeg
    const escapedText = caption.text.replace(/'/g, "\\'").replace(/:/g, "\\:");
    
    // Build ffmpeg command
    ffmpeg(inputPath)
      .videoFilters([
        {
          filter: 'drawtext',
          options: {
            text: escapedText,
            fontsize: caption.fontSize,
            fontcolor: caption.color,
            x: x,
            y: y,
            enable: `between(t,${caption.startTime},${caption.endTime})`,
            box: '1',
            boxcolor: caption.backgroundColor,
            boxborderw: '10'
          }
        },
        {
          filter: 'scale',
          options: '1080:1920:force_original_aspect_ratio=increase'
        },
        {
          filter: 'crop',
          options: '1080:1920'
        }
      ])
      .outputOptions([
        '-c:a copy',
        '-preset fast',
        '-crf 23'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Processing finished successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Reel Captioner Backend running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
});