import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download } from "lucide-react";
import { Caption } from "./VideoEditor";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (captions: Caption[]) => void;
}

export const CSVImportModal = ({ isOpen, onClose, onImport }: CSVImportModalProps) => {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState("");

  const sampleCSV = `text,start_time,end_time,x,y,font_size,color,background_color
"Welcome to our channel!",0,3,50,20,24,#ffffff,#000000
"Don't forget to subscribe",5,8,50,80,20,#ffffff,#000000
"See you next time!",10,13,50,50,22,#ffff00,#000000`;

  const handleImport = () => {
    try {
      setError("");
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const captions: Caption[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < headers.length) continue;
        
        const caption: Caption = {
          id: Math.random().toString(36).substr(2, 9),
          text: values[headers.indexOf('text')] || `Caption ${i}`,
          startTime: parseFloat(values[headers.indexOf('start_time')]) || 0,
          endTime: parseFloat(values[headers.indexOf('end_time')]) || 3,
          x: parseFloat(values[headers.indexOf('x')]) || 50,
          y: parseFloat(values[headers.indexOf('y')]) || 50,
          fontSize: parseFloat(values[headers.indexOf('font_size')]) || 24,
          color: values[headers.indexOf('color')] || '#ffffff',
          backgroundColor: values[headers.indexOf('background_color')] || '#000000',
          fontWeight: '600',
          textAlign: 'center',
        };
        
        captions.push(caption);
      }
      
      if (captions.length === 0) {
        setError("No valid captions found in CSV data");
        return;
      }
      
      onImport(captions);
      onClose();
      setCsvText("");
    } catch (err) {
      setError("Error parsing CSV data. Please check the format.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caption_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Import Captions from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="csv-file" className="cursor-pointer">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Upload CSV File
                  </span>
                </Button>
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            <Button variant="outline" onClick={downloadSample} className="gap-2">
              <Download className="w-4 h-4" />
              Sample CSV
            </Button>
          </div>
          
          <div>
            <Label htmlFor="csv-text">CSV Data</Label>
            <Textarea
              id="csv-text"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your CSV data here or upload a file..."
              rows={10}
              className="mt-2 font-mono text-sm"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <div className="video-panel p-4">
            <h4 className="text-sm font-medium mb-2">CSV Format:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>text</strong> - Caption text content</p>
              <p><strong>start_time</strong> - Start time in seconds</p>
              <p><strong>end_time</strong> - End time in seconds</p>
              <p><strong>x, y</strong> - Position percentage (0-100)</p>
              <p><strong>font_size</strong> - Font size in pixels</p>
              <p><strong>color, background_color</strong> - Hex color codes</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!csvText.trim()}>
            Import Captions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};