// Emotion AI JavaScript functionality

let selectedFile = null;

// DOM elements
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const browseBtn = document.getElementById('browse-btn');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const clearBtn = document.getElementById('clear-btn');
const changeImageBtn = document.getElementById('change-image-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeText = document.getElementById('analyze-text');
const resultsSection = document.getElementById('results-section');
const resultsContainer = document.getElementById('results-container');
const loadingOverlay = document.getElementById('loading-overlay');
const toastContainer = document.getElementById('toast-container');

// Event listeners
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
clearBtn.addEventListener('click', clearSelection);
changeImageBtn.addEventListener('click', () => fileInput.click());
analyzeBtn.addEventListener('click', analyzeImage);

// Drag and drop functionality
uploadArea.addEventListener('dragenter', handleDragEnter);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Image size should be less than 10MB', 'error');
        return;
    }
    
    selectedFile = file;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewSection.classList.remove('hidden');
        previewSection.classList.add('animate-slide-up');
        resultsSection.classList.add('hidden');
    };
    reader.readAsDataURL(file);
    
    showToast('Image uploaded successfully!', 'success');
}

function clearSelection() {
    selectedFile = null;
    previewSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    fileInput.value = '';
}

async function analyzeImage() {
    if (!selectedFile) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    // Show loading state
    loadingOverlay.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeText.textContent = 'Analyzing...';
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.results);
            const primaryEmotion = data.results[0];
            showToast(
                `Analysis complete! Primary emotion: ${primaryEmotion.emotion} (${(primaryEmotion.confidence * 100).toFixed(1)}%)`,
                'success'
            );
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (error) {
        showToast('Failed to analyze image. Please try again.', 'error');
    } finally {
        // Hide loading state
        loadingOverlay.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeText.textContent = 'Analyze Emotions';
    }
}

function displayResults(results) {
    resultsContainer.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultCard = createResultCard(result, index);
        resultsContainer.appendChild(resultCard);
    });
    
    resultsSection.classList.remove('hidden');
    resultsSection.classList.add('animate-slide-up');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createResultCard(result, index) {
    const card = document.createElement('div');
    card.className = 'emotion-card bg-white rounded-xl p-6 border border-gray-200 shadow-sm';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const confidencePercent = (result.confidence * 100).toFixed(1);
    const isTopResult = index === 0;
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full ${getEmotionColor(result.emotion)} flex items-center justify-center">
                    <span class="text-2xl">${getEmotionEmoji(result.emotion)}</span>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 capitalize">${result.emotion}</h3>
                    <p class="text-sm text-gray-500">${confidencePercent}% confidence</p>
                </div>
            </div>
            ${isTopResult ? '<span class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm rounded-full font-medium">Primary</span>' : ''}
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Confidence</span>
                <span>${confidencePercent}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="progress-bar h-2 rounded-full ${getEmotionGradient(result.emotion)}" 
                     style="width: ${confidencePercent}%"></div>
            </div>
        </div>
        
        <p class="text-gray-600 text-sm leading-relaxed">${result.description}</p>
    `;
    
    return card;
}

function getEmotionColor(emotion) {
    const colors = {
        happy: 'bg-yellow-100',
        sad: 'bg-blue-100',
        angry: 'bg-red-100',
        surprised: 'bg-orange-100',
        neutral: 'bg-gray-100',
        fear: 'bg-purple-100',
        disgust: 'bg-green-100'
    };
    return colors[emotion] || 'bg-gray-100';
}

function getEmotionGradient(emotion) {
    const gradients = {
        happy: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        sad: 'bg-gradient-to-r from-blue-400 to-blue-600',
        angry: 'bg-gradient-to-r from-red-400 to-red-600',
        surprised: 'bg-gradient-to-r from-orange-400 to-orange-600',
        neutral: 'bg-gradient-to-r from-gray-400 to-gray-600',
        fear: 'bg-gradient-to-r from-purple-400 to-purple-600',
        disgust: 'bg-gradient-to-r from-green-400 to-green-600'
    };
    return gradients[emotion] || 'bg-gradient-to-r from-gray-400 to-gray-600';
}

function getEmotionEmoji(emotion) {
    const emojis = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😲',
        neutral: '😐',
        fear: '😨',
        disgust: '🤢'
    };
    return emojis[emotion] || '😐';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-4 rounded-lg text-white font-medium shadow-lg ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}