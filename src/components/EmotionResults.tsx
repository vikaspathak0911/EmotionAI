import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smile, Frown, Angry, Zap, Meh, Skull, Trash2 } from 'lucide-react';

export interface EmotionResult {
  emotion: string;
  confidence: number;
  description: string;
}

interface EmotionResultsProps {
  results: EmotionResult[];
  isVisible: boolean;
}

const emotionConfig = {
  happy: { 
    icon: Smile, 
    color: 'text-emotion-happy', 
    bgColor: 'bg-emotion-happy/10',
    borderColor: 'border-emotion-happy/30'
  },
  sad: { 
    icon: Frown, 
    color: 'text-emotion-sad', 
    bgColor: 'bg-emotion-sad/10',
    borderColor: 'border-emotion-sad/30'
  },
  angry: { 
    icon: Angry, 
    color: 'text-emotion-angry', 
    bgColor: 'bg-emotion-angry/10',
    borderColor: 'border-emotion-angry/30'
  },
  surprised: { 
    icon: Zap, 
    color: 'text-emotion-surprised', 
    bgColor: 'bg-emotion-surprised/10',
    borderColor: 'border-emotion-surprised/30'
  },
  neutral: { 
    icon: Meh, 
    color: 'text-emotion-neutral', 
    bgColor: 'bg-emotion-neutral/10',
    borderColor: 'border-emotion-neutral/30'
  },
  fear: { 
    icon: Skull, 
    color: 'text-emotion-fear', 
    bgColor: 'bg-emotion-fear/10',
    borderColor: 'border-emotion-fear/30'
  },
  disgust: { 
    icon: Trash2, 
    color: 'text-emotion-disgust', 
    bgColor: 'bg-emotion-disgust/10',
    borderColor: 'border-emotion-disgust/30'
  },
};

export const EmotionResults: React.FC<EmotionResultsProps> = ({ results, isVisible }) => {
  if (!isVisible || results.length === 0) return null;

  const primaryEmotion = results[0];
  const secondaryEmotions = results.slice(1);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
      {/* Primary Emotion */}
      <Card className="p-8 bg-gradient-card border border-border/50 shadow-result">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className={`p-4 rounded-full ${emotionConfig[primaryEmotion.emotion as keyof typeof emotionConfig]?.bgColor} border ${emotionConfig[primaryEmotion.emotion as keyof typeof emotionConfig]?.borderColor}`}>
              {React.createElement(
                emotionConfig[primaryEmotion.emotion as keyof typeof emotionConfig]?.icon || Smile,
                { 
                  className: `w-8 h-8 ${emotionConfig[primaryEmotion.emotion as keyof typeof emotionConfig]?.color}` 
                }
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold capitalize">
                {primaryEmotion.emotion}
              </h2>
              <Badge variant="secondary" className="mt-1">
                {(primaryEmotion.confidence * 100).toFixed(1)}% confident
              </Badge>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {primaryEmotion.description}
          </p>
          
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
              style={{ width: `${primaryEmotion.confidence * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Secondary Emotions */}
      {secondaryEmotions.length > 0 && (
        <Card className="p-6 bg-gradient-card border border-border/50">
          <h3 className="text-lg font-semibold mb-4 text-center">Other Detected Emotions</h3>
          <div className="space-y-3">
            {secondaryEmotions.map((emotion, index) => {
              const config = emotionConfig[emotion.emotion as keyof typeof emotionConfig];
              const IconComponent = config?.icon || Smile;
              
              return (
                <div 
                  key={emotion.emotion}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-border/60 transition-colors"
                  style={{ 
                    animationDelay: `${(index + 1) * 150}ms`,
                    animation: 'fade-in 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config?.bgColor} border ${config?.borderColor}`}>
                      <IconComponent className={`w-4 h-4 ${config?.color}`} />
                    </div>
                    <span className="font-medium capitalize">{emotion.emotion}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-24">
                    <Progress 
                      value={emotion.confidence * 100} 
                      className="w-20 h-2"
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {(emotion.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}


    </div>
  );
};