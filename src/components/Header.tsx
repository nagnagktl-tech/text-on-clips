import { Button } from "@/components/ui/button";
import { Play, Download, Upload, FileText } from "lucide-react";

export const Header = () => {
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
        <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Download className="w-4 h-4" />
          Generate Reels
        </Button>
      </div>
    </header>
  );
};