import React, { useState } from 'react';
import { EmotionUpload } from '@/components/EmotionUpload';
import { EmotionResults, EmotionResult } from '@/components/EmotionResults';
import { EmotionDetectionService, validateImageFile } from '@/services/emotionService';
import { toast } from 'sonner';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<EmotionResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleImageUpload = async (file: File) => {
    // Validate the uploaded file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);
    setResults([]);

    try {
      toast.success('Image uploaded successfully! Analyzing emotions...');
      
      // Analyze the emotion in the uploaded image
      const emotionResults = await EmotionDetectionService.analyzeEmotionWithModel(file);
      
      setResults(emotionResults);
      setShowResults(true);
      
      const primaryEmotion = emotionResults[0];
      toast.success(
        `Analysis complete! Primary emotion detected: ${primaryEmotion.emotion} (${(primaryEmotion.confidence * 100).toFixed(1)}% confidence)`
      );
    } catch (error) {
      toast.error('Failed to analyze emotion. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-hero opacity-50 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Upload Section */}
          <EmotionUpload 
            onUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
          />

          {/* Results Section */}
          <EmotionResults 
            results={results}
            isVisible={showResults}
          />


        </div>
      </div>
    </div>
  );
};

export default Index;
