import { EmotionResult } from '@/components/EmotionResults';

// Mock emotion detection service - replace with your actual ML model integration
export class EmotionDetectionService {
  private static emotions = [
    'happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust'
  ];

  private static emotionDescriptions = {
    happy: "A positive emotional state characterized by joy, contentment, and satisfaction.",
    sad: "A negative emotional state often associated with feelings of loss, disappointment, or sorrow.",
    angry: "An intense emotional state triggered by frustration, threat, or perceived injustice.",
    surprised: "A brief emotional response to unexpected or novel stimuli.",
    neutral: "A balanced emotional state without strong positive or negative feelings.",
    fear: "An emotional response to perceived danger or threat, activating fight-or-flight responses.",
    disgust: "An emotional response to something offensive, unpleasant, or morally reprehensible."
  };

  static async analyzeEmotion(imageFile: File): Promise<EmotionResult[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    // Mock emotion detection results
    const results: EmotionResult[] = [];
    const shuffledEmotions = [...this.emotions].sort(() => Math.random() - 0.5);
    
    // Generate realistic confidence scores
    const primaryConfidence = 0.65 + Math.random() * 0.3; // 65-95%
    const primaryEmotion = shuffledEmotions[0];
    
    results.push({
      emotion: primaryEmotion,
      confidence: primaryConfidence,
      description: this.emotionDescriptions[primaryEmotion as keyof typeof this.emotionDescriptions]
    });

    // Add 2-3 secondary emotions with lower confidence
    const numSecondary = Math.floor(Math.random() * 2) + 2; // 2-3 emotions
    let remainingConfidence = 1 - primaryConfidence;
    
    for (let i = 1; i < Math.min(numSecondary + 1, shuffledEmotions.length); i++) {
      const confidence = Math.random() * (remainingConfidence * 0.8);
      remainingConfidence -= confidence;
      
      if (confidence > 0.05) { // Only include if confidence > 5%
        results.push({
          emotion: shuffledEmotions[i],
          confidence: confidence,
          description: this.emotionDescriptions[shuffledEmotions[i] as keyof typeof this.emotionDescriptions]
        });
      }
    }

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // Future: Replace with your actual ML model integration
  static async analyzeEmotionWithModel(imageFile: File): Promise<EmotionResult[]> {
    // This is where you would integrate your TensorFlow/PyTorch model
    // For now, we'll use the mock service
    
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      // Example integration with your backend API
      // const response = await fetch('/api/analyze-emotion', {
      //   method: 'POST',
      //   body: formData,
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to analyze emotion');
      // }
      // 
      // const data = await response.json();
      // return data.emotions;

      // For demo purposes, use mock data
      return this.analyzeEmotion(imageFile);
    } catch (error) {
      throw new Error('Failed to analyze emotion. Please try again.');
    }
  }
}

// Utility function to validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  return { isValid: true };
};