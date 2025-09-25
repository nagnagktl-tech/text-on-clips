import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { VideoPreview } from "./VideoPreview";
import { CaptionEditor } from "./CaptionEditor";
import { Header } from "./Header";

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

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
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