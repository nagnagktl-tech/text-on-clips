import { Button } from "@/components/ui/button";
import { Play, Download, Upload, FileText, Loader2 } from "lucide-react";

interface HeaderProps {
  onGenerateReels: () => void;
  isGenerating: boolean;
}

export const Header = ({ onGenerateReels, isGenerating }: HeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">ReelCaptioner</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Import CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Video
        </Button>
        <Button 
          onClick={onGenerateReels}
          disabled={isGenerating}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGenerating ? "Generating..." : "Generate Reels"}
        </Button>
      </div>
    </header>
  );
};