import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { VideoFile, Caption } from "./VideoEditor";

interface VideoPreviewProps {
  video: VideoFile | null;
  captions: Caption[];
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedCaption: string | null;
  onUpdateCaption: (id: string, updates: Partial<Caption>) => void;
}

export const VideoPreview = ({
  video,
  captions,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  selectedCaption,
  onUpdateCaption,
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(videoElement.duration);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [setCurrentTime, isDragging]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVisibleCaptions = () => {
    return captions.filter(
      caption => currentTime >= caption.startTime && currentTime <= caption.endTime
    );
  };

  const handleCaptionMouseDown = (caption: Caption, event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const captionElement = event.currentTarget as HTMLElement;
      const captionRect = captionElement.getBoundingClientRect();
      setDragOffset({
        x: event.clientX - captionRect.left,
        y: event.clientY - captionRect.top,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !selectedCaption || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    onUpdateCaption(selectedCaption, {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  console.log("VideoPreview render - video:", video);

  if (!video) {
    console.log("No video selected, showing placeholder");
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary/20">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-secondary/50 rounded-2xl flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Video Selected</h3>
          <p className="text-muted-foreground">Upload a video to start adding captions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-secondary/10">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative">
          <div
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
            style={{ aspectRatio: '9/16', height: '70vh' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full object-cover"
              onClick={togglePlayPause}
            />
            
            {/* Caption Overlays */}
            {getVisibleCaptions().map((caption) => (
              <div
                key={caption.id}
                className={`caption-overlay ${selectedCaption === caption.id ? 'ring-2 ring-primary' : ''}`}
                style={{
                  left: `${caption.x}%`,
                  top: `${caption.y}%`,
                  fontSize: `${caption.fontSize}px`,
                  color: caption.color,
                  backgroundColor: caption.backgroundColor + '80',
                  fontWeight: caption.fontWeight,
                  textAlign: caption.textAlign,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleCaptionMouseDown(caption, e)}
              >
                {caption.text}
                {selectedCaption === caption.id && (
                  <div className="drag-handle" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="p-6 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSeek([Math.max(0, currentTime - 10)])}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSeek([Math.min(duration, currentTime + 10)])}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 flex items-center gap-4">
              <span className="text-sm text-muted-foreground min-w-12">
                {formatTime(currentTime)}
              </span>
              
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              
              <span className="text-sm text-muted-foreground min-w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};