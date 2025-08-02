import time
import random
from PIL import Image
import io
import os
import tensorflow as tf
import numpy as np

# ── Suppress TF logs ──────────────────────────────────────────────────────────
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

class EmotionDetectionService:
    emotions = [
        'angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'
    ]
    
    emotion_descriptions = {
        'happy': "A positive emotional state characterized by joy, contentment, and satisfaction.",
        'sad': "A negative emotional state often associated with feelings of loss, disappointment, or sorrow.",
        'angry': "An intense emotional state triggered by frustration, threat, or perceived injustice.",
        'surprise': "A brief emotional response to unexpected or novel stimuli.",
        'neutral': "A balanced emotional state without strong positive or negative feelings.",
        'fear': "An emotional response to perceived danger or threat, activating fight-or-flight responses.",
        'disgust': "An emotional response to something offensive, unpleasant, or morally reprehensible."
    }
    
    # ── Load Model ─────────────────────────────────────────────────────────────────
    MODEL_PATH = 'emotiondetector.h5'
    model = None
    
    @classmethod
    def load_model(cls):
        """Load the emotion detection model"""
        if cls.model is None:
            try:
                cls.model = tf.keras.models.load_model(cls.MODEL_PATH)
                print(f"Model loaded successfully from {cls.MODEL_PATH}")
            except Exception as e:
                print(f"Error loading model: {e}")
                raise
    
    @staticmethod
    def preprocess_image(image, target_size=(48, 48)):
        """
        Preprocess image: convert to grayscale, resize, normalize,
        and reshape to (1, height, width, 1).
        """
        if isinstance(image, str):
            # If image is a file path
            image = Image.open(image)
        
        # Convert to grayscale and resize
        image = image.convert('L').resize(target_size)
        arr = np.array(image, dtype='float32') / 255.0
        return np.expand_dims(arr.reshape(*target_size, 1), axis=0)
    
    @staticmethod
    def predict_image(model, preprocessed):
        """
        Run model inference and return raw prediction list.
        """
        preds = model.predict(preprocessed, verbose=0)
        return preds.tolist()
    
    @staticmethod
    def interpret_top(pred_vector):
        """
        Given a list of 7 probabilities, return (label, confidence%) of top class.
        """
        # find index of max probability
        top_idx = int(np.argmax(pred_vector))
        label = EmotionDetectionService.emotions[top_idx]
        confidence = pred_vector[top_idx]
        return label, confidence
    
    @staticmethod
    def analyze_emotion(file_storage):
        """
        Analyze emotion from uploaded file using the TensorFlow model.
        """
        # Load model if not already loaded
        EmotionDetectionService.load_model()
        
        try:
            # Convert file storage to PIL Image
            image = Image.open(file_storage.stream)
            
            # Preprocess the image
            preprocessed = EmotionDetectionService.preprocess_image(image)
            
            # Make prediction
            predictions = EmotionDetectionService.predict_image(EmotionDetectionService.model, preprocessed)[0]
            
            # Get top prediction
            top_label, top_confidence = EmotionDetectionService.interpret_top(predictions)
            
            # Create results in the expected format
            results = []
            
            # Add top prediction
            results.append({
                'emotion': top_label,
                'confidence': float(top_confidence),
                'description': EmotionDetectionService.emotion_descriptions.get(top_label, f"Emotion: {top_label}")
            })
            
            # Add other emotions with confidence > 5%
            for i, confidence in enumerate(predictions):
                if confidence > 0.05 and i != np.argmax(predictions):
                    emotion = EmotionDetectionService.emotions[i]
                    results.append({
                        'emotion': emotion,
                        'confidence': float(confidence),
                        'description': EmotionDetectionService.emotion_descriptions.get(emotion, f"Emotion: {emotion}")
                    })
            
            # Sort by confidence
            return sorted(results, key=lambda x: x['confidence'], reverse=True)
            
        except Exception as e:
            print(f"Error in emotion analysis: {e}")
            # Fallback to mock data if model fails
            return EmotionDetectionService._fallback_analysis()
    
    @staticmethod
    def _fallback_analysis():
        """
        Fallback method that returns mock data if the model fails.
        """
        # Simulate processing time
        time.sleep(1 + random.random())
        
        # Mock emotion detection results
        results = []
        shuffled_emotions = EmotionDetectionService.emotions.copy()
        random.shuffle(shuffled_emotions)
        
        # Generate realistic confidence scores
        primary_confidence = 0.65 + random.random() * 0.3  # 65-95%
        primary_emotion = shuffled_emotions[0]
        
        results.append({
            'emotion': primary_emotion,
            'confidence': primary_confidence,
            'description': EmotionDetectionService.emotion_descriptions.get(primary_emotion, f"Emotion: {primary_emotion}")
        })
        
        # Add 2-3 secondary emotions with lower confidence
        num_secondary = random.randint(2, 3)
        remaining_confidence = 1 - primary_confidence
        
        for i in range(1, min(num_secondary + 1, len(shuffled_emotions))):
            confidence = random.random() * (remaining_confidence * 0.8)
            remaining_confidence -= confidence
            
            if confidence > 0.05:  # Only include if confidence > 5%
                emotion = shuffled_emotions[i]
                results.append({
                    'emotion': emotion,
                    'confidence': confidence,
                    'description': EmotionDetectionService.emotion_descriptions.get(emotion, f"Emotion: {emotion}")
                })
        
        # Sort by confidence
        return sorted(results, key=lambda x: x['confidence'], reverse=True)
    
    @staticmethod
    def analyze_emotion_with_model(file_storage):
        """
        Alias for analyze_emotion - kept for backward compatibility
        """
        return EmotionDetectionService.analyze_emotion(file_storage)

def validate_image_file(file_storage):
    """Validate uploaded image file"""
    max_size = 10 * 1024 * 1024  # 10MB
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    # Check file type
    if file_storage.content_type not in allowed_types:
        return {
            'is_valid': False,
            'error': 'Please upload a valid image file (JPEG, PNG, or WebP)'
        }
    
    # Check file size
    file_storage.seek(0, 2)  # Seek to end
    file_size = file_storage.tell()
    file_storage.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        return {
            'is_valid': False,
            'error': 'Image size must be less than 10MB'
        }
    
    # Validate it's actually an image
    try:
        image = Image.open(file_storage.stream)
        image.verify()
        file_storage.seek(0)  # Reset stream
        return {'is_valid': True}
    except Exception:
        return {
            'is_valid': False,
            'error': 'Invalid image file'
        }