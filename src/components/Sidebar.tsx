import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, FileText, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { VideoFile, Caption } from "./VideoEditor";
import { CSVImportModal } from "./CSVImportModal";

interface SidebarProps {
  selectedVideo: VideoFile | null;
  setSelectedVideo: (video: VideoFile | null) => void;
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  onAddCaption: () => void;
  selectedCaption: string | null;
  setSelectedCaption: (id: string | null) => void;
  onDeleteCaption: (id: string) => void;
  onGenerateReels: () => void;
  isGenerating: boolean;
}

export const Sidebar = ({
  selectedVideo,
  setSelectedVideo,
  captions,
  setCaptions,
  onAddCaption,
  selectedCaption,
  setSelectedCaption,
  onDeleteCaption,
  onGenerateReels,
  isGenerating,
}: SidebarProps) => {
  const [showCSVModal, setShowCSVModal] = useState(false);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const video: VideoFile = {
        file,
        url,
        duration: 0, // Will be set when video loads
        name: file.name,
      };
      setSelectedVideo(video);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <div>
            <label htmlFor="video-upload" className="cursor-pointer">
              <div className="video-panel p-6 text-center hover:bg-secondary/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Upload Video</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI</p>
              </div>
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
          
          {selectedVideo && (
            <div className="video-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm font-medium text-foreground truncate">
                  {selectedVideo.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Ready for editing</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Captions</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCSVModal(true)}
              className="gap-1 text-xs"
            >
              <FileText className="w-3 h-3" />
              CSV
            </Button>
            <Button size="sm" onClick={onAddCaption} className="gap-1 text-xs">
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {captions.map((caption, index) => (
              <div
                key={caption.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCaption === caption.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30 hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedCaption(caption.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">
                    Caption {index + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCaption(caption.id);
                    }}
                    className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {caption.text}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(caption.startTime)}</span>
                  <span>{formatTime(caption.endTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 flex-1">
        <h3 className="text-sm font-semibold text-foreground mb-3">Bulk Generation</h3>
        <div className="space-y-3">
          <div className="video-panel p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {captions.length}
              </div>
              <p className="text-xs text-muted-foreground">Captions Ready</p>
            </div>
          </div>
          
          <Button 
            onClick={onGenerateReels}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              "Generate All Reels"
            )}
          </Button>
        </div>
      </div>

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={(importedCaptions) => {
          setCaptions([...captions, ...importedCaptions]);
        }}
      />
    </aside>
  );
};