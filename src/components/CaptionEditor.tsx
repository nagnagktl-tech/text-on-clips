import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Caption } from "./VideoEditor";
import { Type, Palette, Clock, AlignCenter, AlignLeft, AlignRight } from "lucide-react";

interface CaptionEditorProps {
  captions: Caption[];
  selectedCaption: string | null;
  onUpdateCaption: (id: string, updates: Partial<Caption>) => void;
  currentTime: number;
}

export const CaptionEditor = ({
  captions,
  selectedCaption,
  onUpdateCaption,
  currentTime,
}: CaptionEditorProps) => {
  const selectedCaptionData = captions.find(cap => cap.id === selectedCaption);

  if (!selectedCaptionData) {
    return (
      <aside className="w-80 bg-card border-l border-border p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary/50 rounded-2xl flex items-center justify-center">
            <Type className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Caption Selected</h3>
          <p className="text-muted-foreground text-sm">Select a caption to edit its properties</p>
        </div>
      </aside>
    );
  }

  const updateCaption = (updates: Partial<Caption>) => {
    onUpdateCaption(selectedCaptionData.id, updates);
  };

  return (
    <aside className="w-80 bg-card border-l border-border overflow-y-auto">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Caption Editor</h3>
        </div>
        
        <Badge variant="secondary" className="mb-4">
          Active at {Math.floor(currentTime)}s
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="caption-text" className="text-sm font-medium">Text Content</Label>
          <Textarea
            id="caption-text"
            value={selectedCaptionData.text}
            onChange={(e) => updateCaption({ text: e.target.value })}
            placeholder="Enter caption text..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Timing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Timing</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time" className="text-xs text-muted-foreground">Start (s)</Label>
              <Input
                id="start-time"
                type="number"
                value={selectedCaptionData.startTime}
                onChange={(e) => updateCaption({ startTime: parseFloat(e.target.value) || 0 })}
                step={0.1}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="end-time" className="text-xs text-muted-foreground">End (s)</Label>
              <Input
                id="end-time"
                type="number"
                value={selectedCaptionData.endTime}
                onChange={(e) => updateCaption({ endTime: parseFloat(e.target.value) || 0 })}
                step={0.1}
                min={selectedCaptionData.startTime}
              />
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateCaption({ startTime: currentTime })}
            className="w-full text-xs"
          >
            Set Start to Current Time
          </Button>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Typography</Label>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="font-size" className="text-xs text-muted-foreground">Font Size</Label>
              <Slider
                value={[selectedCaptionData.fontSize]}
                onValueChange={(value) => updateCaption({ fontSize: value[0] })}
                min={12}
                max={48}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">
                {selectedCaptionData.fontSize}px
              </div>
            </div>
            
            <div>
              <Label htmlFor="font-weight" className="text-xs text-muted-foreground">Font Weight</Label>
              <Select
                value={selectedCaptionData.fontWeight}
                onValueChange={(value) => updateCaption({ fontWeight: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light</SelectItem>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semi Bold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                  <SelectItem value="800">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Text Alignment</Label>
              <div className="flex gap-1 mt-1">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={selectedCaptionData.textAlign === value ? "default" : "outline"}
                    onClick={() => updateCaption({ textAlign: value as 'left' | 'center' | 'right' })}
                    className="flex-1"
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Colors</Label>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="text-color" className="text-xs text-muted-foreground">Text Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="text-color"
                  type="color"
                  value={selectedCaptionData.color}
                  onChange={(e) => updateCaption({ color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={selectedCaptionData.color}
                  onChange={(e) => updateCaption({ color: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bg-color" className="text-xs text-muted-foreground">Background Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bg-color"
                  type="color"
                  value={selectedCaptionData.backgroundColor}
                  onChange={(e) => updateCaption({ backgroundColor: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={selectedCaptionData.backgroundColor}
                  onChange={(e) => updateCaption({ backgroundColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Position</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="x-position" className="text-xs text-muted-foreground">X Position (%)</Label>
              <Input
                id="x-position"
                type="number"
                value={Math.round(selectedCaptionData.x)}
                onChange={(e) => updateCaption({ x: parseFloat(e.target.value) || 0 })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label htmlFor="y-position" className="text-xs text-muted-foreground">Y Position (%)</Label>
              <Input
                id="y-position"
                type="number"
                value={Math.round(selectedCaptionData.y)}
                onChange={(e) => updateCaption({ y: parseFloat(e.target.value) || 0 })}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};