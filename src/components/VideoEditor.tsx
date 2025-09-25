import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { VideoPreview } from "./VideoPreview";
import { CaptionEditor } from "./CaptionEditor";
import { Header } from "./Header";
import { useToast } from "@/hooks/use-toast";

export interface Caption {
  id: string;
  text: string;
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface VideoFile {
  file: File;
  url: string;
  duration: number;
  name: string;
}

export const VideoEditor = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addCaption = () => {
    const newCaption: Caption = {
      id: Math.random().toString(36).substr(2, 9),
      text: "New Caption",
      x: 50,
      y: 80,
      startTime: currentTime,
      endTime: currentTime + 3,
      fontSize: 24,
      color: "#ffffff",
      backgroundColor: "#000000",
      fontWeight: "600",
      textAlign: "center",
    };
    setCaptions([...captions, newCaption]);
    setSelectedCaption(newCaption.id);
  };

  const updateCaption = (id: string, updates: Partial<Caption>) => {
    setCaptions(captions.map(cap => 
      cap.id === id ? { ...cap, ...updates } : cap
    ));
  };

  const deleteCaption = (id: string) => {
    setCaptions(captions.filter(cap => cap.id !== id));
    if (selectedCaption === id) {
      setSelectedCaption(null);
    }
  };

  const generateReels = async () => {
    if (!selectedVideo || captions.length === 0) {
      toast({
        title: "Missing Requirements",
        description: "Please upload a video and add captions before generating reels.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      toast({
        title: "Starting Generation",
        description: `Processing ${captions.length} reels with captions...`,
      });

      // Create downloadable files for each caption
      for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];
        
        // Create reel data for this caption
        const reelData = {
          originalVideo: selectedVideo.name,
          reelNumber: i + 1,
          caption: {
            text: caption.text,
            startTime: caption.startTime,
            endTime: caption.endTime,
            position: { x: caption.x, y: caption.y },
            style: {
              fontSize: caption.fontSize,
              color: caption.color,
              backgroundColor: caption.backgroundColor,
              fontWeight: caption.fontWeight,
              textAlign: caption.textAlign,
            }
          },
          outputSettings: {
            resolution: "1080x1920",
            format: "mp4",
            quality: "high"
          },
          processingInstructions: {
            videoInput: selectedVideo.name,
            captionOverlay: `Text: "${caption.text}" at position (${caption.x}%, ${caption.y}%) from ${caption.startTime}s to ${caption.endTime}s`,
            ffmpegCommand: `ffmpeg -i "${selectedVideo.name}" -vf "drawtext=text='${caption.text}':fontsize=${caption.fontSize}:fontcolor=${caption.color}:x=${caption.x}*w/100:y=${caption.y}*h/100:enable='between(t,${caption.startTime},${caption.endTime})'" -c:a copy "reel_${i + 1}.mp4"`
          }
        };

        // Create and download the reel configuration file
        const blob = new Blob([JSON.stringify(reelData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reel_${i + 1}_config.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Add delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create a master batch file for processing all reels
      const batchInstructions = {
        projectName: "Reel Caption Project",
        totalReels: captions.length,
        originalVideo: selectedVideo.name,
        processingInstructions: "Use the individual reel config files with your ffmpeg backend to generate the actual video files",
        reels: captions.map((caption, i) => ({
          reelNumber: i + 1,
          configFile: `reel_${i + 1}_config.json`,
          outputFile: `reel_${i + 1}.mp4`,
          caption: caption.text
        }))
      };

      const batchBlob = new Blob([JSON.stringify(batchInstructions, null, 2)], { type: 'application/json' });
      const batchUrl = URL.createObjectURL(batchBlob);
      const batchLink = document.createElement('a');
      batchLink.href = batchUrl;
      batchLink.download = 'batch_processing_instructions.json';
      document.body.appendChild(batchLink);
      batchLink.click();
      document.body.removeChild(batchLink);
      URL.revokeObjectURL(batchUrl);

      toast({
        title: "Reels Generated & Downloaded!",
        description: `${captions.length} reel configuration files downloaded to your PC. Use these with your backend to generate the actual videos.`,
      });

      console.log("Reel generation completed - files downloaded");
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your reels. Please try again.",
        variant: "destructive",
      });
      console.error("Reel generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onGenerateReels={generateReels} isGenerating={isGenerating} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
          captions={captions}
          setCaptions={setCaptions}
          onAddCaption={addCaption}
          selectedCaption={selectedCaption}
          setSelectedCaption={setSelectedCaption}
          onDeleteCaption={deleteCaption}
          onGenerateReels={generateReels}
          isGenerating={isGenerating}
        />
        
        <div className="flex-1 flex flex-col">
          <VideoPreview
            video={selectedVideo}
            captions={captions}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedCaption={selectedCaption}
            onUpdateCaption={updateCaption}
          />
        </div>
        
        <CaptionEditor
          captions={captions}
          selectedCaption={selectedCaption}
          onUpdateCaption={updateCaption}
          currentTime={currentTime}
        />
      </div>
    </div>
  );
};