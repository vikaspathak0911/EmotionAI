from flask import Flask, request, render_template, jsonify, redirect, url_for
import os
from werkzeug.utils import secure_filename
from emotion_service import EmotionDetectionService, validate_image_file
import json

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Preload the emotion detection model
def load_model():
    """Preload the emotion detection model"""
    try:
        EmotionDetectionService.load_model()
        print("Emotion detection model loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load emotion detection model: {e}")
        print("The app will use fallback mock data for emotion detection")

# Load model when app starts
load_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Validate file
    validation = validate_image_file(file)
    if not validation['is_valid']:
        return jsonify({'error': validation['error']}), 400
    
    try:
        # Analyze emotion
        results = EmotionDetectionService.analyze_emotion(file)
        
        # Save file for display (optional)
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.seek(0)  # Reset file pointer after analysis
        file.save(file_path)
        
        return jsonify({
            'success': True,
            'results': results,
            'image_path': f'static/uploads/{filename}'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)