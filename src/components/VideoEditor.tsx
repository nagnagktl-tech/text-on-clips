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

      // Call backend API to generate actual MP4 files
      const response = await fetch('http://localhost:3001/api/generate-reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoFilename: selectedVideo.name,
          captions: captions.map(caption => ({
            text: caption.text,
            startTime: caption.startTime,
            endTime: caption.endTime,
            x: caption.x,
            y: caption.y,
            fontSize: caption.fontSize,
            color: caption.color,
            backgroundColor: caption.backgroundColor,
            fontWeight: caption.fontWeight,
            textAlign: caption.textAlign,
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Download the batch ZIP file containing all MP4 reels
        const downloadUrl = `http://localhost:3001${result.downloadUrl}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `reels_batch_${result.batchId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Reels Generated Successfully!",
          description: `${captions.length} MP4 reels generated and downloaded as ZIP file.`,
        });

        console.log("Reel generation completed:", result);
      } else {
        throw new Error('Backend processing failed');
      }
      
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