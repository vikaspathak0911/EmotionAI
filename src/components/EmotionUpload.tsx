import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface EmotionUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export const EmotionUpload: React.FC<EmotionUploadProps> = ({ onUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Emotion AI
          </h1>
          <Sparkles className="w-8 h-8 text-primary-glow animate-float" />
        </div>
        <p className="text-lg text-muted-foreground">
          Upload a face image and discover the emotions within
        </p>
      </div>

      <Card className="p-8 bg-gradient-card border-border/50 shadow-upload">
        {!selectedImage ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-gradient-hero'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept="image/*"
              disabled={isAnalyzing}
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 rounded-full bg-gradient-primary/10 border border-primary/20">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload Face Image</h3>
                <p className="text-muted-foreground">
                  Drag and drop an image or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WebP • Max 10MB
                </p>
              </div>
              
              <Button variant="upload" size="lg" disabled={isAnalyzing}>
                <ImageIcon className="w-5 h-5" />
                Choose Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected face"
                className="w-full max-h-96 object-contain rounded-lg border border-border/50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                onClick={clearSelection}
                disabled={isAnalyzing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={clearSelection}
                disabled={isAnalyzing}
              >
                Choose Different Image
              </Button>
              <Button
                variant="glow"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="min-w-32"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Analyze Emotions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};