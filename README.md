# Emotion AI - Face Emotion Detection Flask App

A Flask-based web application that analyzes facial emotions from uploaded images using machine learning.

## Features

- **Image Upload**: Drag & drop or browse to upload face images
- **Emotion Detection**: AI-powered analysis of 7 emotion categories
- **Real-time Results**: Interactive display of emotion confidence scores
- **Responsive Design**: Beautiful UI that works on all devices
- **File Validation**: Secure image upload with size and type validation

## Supported Emotions

- Happy 😊
- Sad 😢
- Angry 😠
- Surprised 😲
- Neutral 😐
- Fear 😨
- Disgust 🤢

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd emotion-ai-flask
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create upload directory**
   ```bash
   mkdir -p static/uploads
   ```

## Usage

1. **Start the Flask server**
   ```bash
   python app.py
   ```

2. **Open your browser**
   Navigate to `http://localhost:5000`

3. **Upload an image**
   - Drag and drop a face image onto the upload area
   - Or click "Choose Image" to browse files
   - Supported formats: JPG, PNG, WebP (max 10MB)

4. **Analyze emotions**
   - Click "Analyze Emotions" button
   - View the AI-generated emotion analysis results

## Integrating Your ML Model

Currently, the app uses mock data for emotion detection. To integrate your actual machine learning model:

1. **Replace the mock service** in `emotion_service.py`:
   ```python
   # Add your model imports
   import tensorflow as tf
   import numpy as np
   
   # Load your trained model (do this once at startup)
   model = tf.keras.models.load_model('models/your_emotion_model.h5')
   
   @staticmethod
   def analyze_emotion_with_model(file_storage):
       # Preprocess image for your model
       image = Image.open(file_storage.stream)
       image = image.resize((224, 224))  # Adjust to your model's input size
       image_array = np.array(image) / 255.0
       image_array = np.expand_dims(image_array, axis=0)
       
       # Make prediction
       predictions = model.predict(image_array)
       
       # Convert to results format
       results = []
       for i, confidence in enumerate(predictions[0]):
           if confidence > 0.05:  # Only include if confidence > 5%
               results.append({
                   'emotion': EmotionDetectionService.emotions[i],
                   'confidence': float(confidence),
                   'description': EmotionDetectionService.emotion_descriptions[EmotionDetectionService.emotions[i]]
               })
       
       return sorted(results, key=lambda x: x['confidence'], reverse=True)
   ```

2. **Update the analyze_emotion method** in `emotion_service.py` to call your model:
   ```python
   return EmotionDetectionService.analyze_emotion_with_model(file_storage)
   ```

3. **Add your model file** to a `models/` directory:
   ```bash
   mkdir models
   # Copy your trained model file (e.g., emotion_model.h5) to models/
   ```

## File Structure

```
emotion-ai-flask/
├── app.py                 # Flask application
├── emotion_service.py     # Emotion detection service
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main page template
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   ├── js/
│   │   └── app.js        # Frontend JavaScript
│   └── uploads/          # Uploaded images directory
└── models/               # Place your ML model files here
```

## Configuration

Edit `app.py` to modify:
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 10MB)
- `SECRET_KEY`: Change this for production use
- `debug`: Set to `False` for production

## Deployment

For production deployment:

1. **Set production configuration**:
   ```python
   app.run(debug=False, host='0.0.0.0', port=5000)
   ```

2. **Use a production WSGI server** like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Set up reverse proxy** with Nginx for better performance

## Security Considerations

- File upload validation is implemented
- File size limits are enforced
- Only image files are accepted
- Consider adding rate limiting for production use
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
