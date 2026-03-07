<<<<<<< HEAD
// =========================================
// DOM Element Selection
// =========================================

// Scanner Elements
const cameraStream = document.getElementById('camera-stream');
const imagePreview = document.getElementById('image-preview');
const viewfinderPlaceholder = document.getElementById('viewfinder-placeholder');
const laserScanner = document.getElementById('laser-scanner'); // The animation line

// HUD Badge Elements
const hudBadge = document.getElementById('hud-badge');
const statusText = document.getElementById('status-text');
const diseaseNameEl = document.getElementById('disease-name');
const confidenceText = document.getElementById('confidence-text');
const confidenceFill = document.getElementById('confidence-fill');

// Control Buttons
const startCameraBtn = document.getElementById('start-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const fileUpload = document.getElementById('file-upload');
const canvas = document.getElementById('canvas');

// Chat Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

let stream = null; // Stores the media stream

// =========================================
// 1. Camera Logic (Mobile Optimized)
// =========================================

startCameraBtn.addEventListener('click', async () => {
    resetViewfinder();
    statusText.innerText = "Initializing Camera...";
    addChatMessage('bot', "Accessing your device camera...");

    try {
        // Constraints: Specifically request rear camera ('environment')
        const constraints = { 
            video: { 
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStream.srcObject = stream;
        
        // UI Updates
        cameraStream.style.display = 'block';
        viewfinderPlaceholder.style.display = 'none';
        startCameraBtn.style.display = 'none';
        fileUpload.parentElement.style.display = 'none'; // hide upload btn
        captureBtn.style.display = 'flex';
        
    } catch (err) {
        console.error("Camera access error:", err);
        addChatMessage('bot', "Error: Could not access camera. Please ensure permissions are granted or use the upload option.");
        statusText.innerText = "Camera Error";
    }
});

// Capture photo from video stream
captureBtn.addEventListener('click', () => {
    if (!stream) return;

    // Draw current video frame onto hidden canvas
    canvas.width = cameraStream.videoWidth;
    canvas.height = cameraStream.videoHeight;
    canvas.getContext('2d').drawImage(cameraStream, 0, 0);
    
    // Stop camera stream to save power
    stream.getTracks().forEach(track => track.stop());
    cameraStream.style.display = 'none';
    
    // Show static image preview
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    imagePreview.src = imageDataUrl;
    imagePreview.style.display = 'block';
    
    // Reset control buttons
    startCameraBtn.style.display = 'flex';
    fileUpload.parentElement.style.display = 'flex';
    captureBtn.style.display = 'none';

    // Convert canvas data to Blob and send to Flask
    canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        sendForPrediction(file);
    }, 'image/jpeg');
});

// =========================================
// 2. File Upload Logic
// =========================================

fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        
        // Stop camera if it was running
        if(stream) stream.getTracks().forEach(track => track.stop());
        
        resetViewfinder();

        // Show image preview
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
        viewfinderPlaceholder.style.display = 'none';
        
        sendForPrediction(file);
    }
});

// Helper to clear viewfinder state
function resetViewfinder() {
    cameraStream.style.display = 'none';
    imagePreview.style.display = 'none';
    viewfinderPlaceholder.style.display = 'flex';
    imagePreview.src = "";
    hudBadge.classList.add('hidden');
    laserScanner.classList.add('hidden'); // Ensure animation hidden
}

// =========================================
// 3. AI Prediction Logic (Connects to Flask)
// =========================================

function sendForPrediction(file) {
    const formData = new FormData();
    formData.append('file', file);

    // --- Start UI Analysis State ---
    hudBadge.classList.add('hidden'); // Hide old results
    
    // 1. START LASER ANIMATION
    laserScanner.classList.remove('hidden'); 
    
    addChatMessage('bot', "Analyzing leaf spectrum... Connecting to CitriScan AI core.");

    // Call Flask Endpoint
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        
        // --- End UI Analysis State ---
        // 2. STOP LASER ANIMATION
        laserScanner.classList.add('hidden'); 
        
        if(data.error) {
            addChatMessage('bot', "Analysis failed. The image might be blurry or not a citrus leaf. Please try again.");
            return;
        }

        // Process results
        const disease = data.disease;
        const confidence = (data.confidence * 100).toFixed(1);

        // Update HUD text
        diseaseNameEl.innerText = disease;
        confidenceText.innerText = `${confidence}%`;
        
        // Reset HUD state and show it
        hudBadge.className = 'hud-badge'; // remove previous 'danger'
        statusText.innerText = "Analysis Complete";
        hudBadge.classList.remove('hidden');
        
        // Animate confidence bar
        setTimeout(() => {
            confidenceFill.style.width = `${confidence}%`;
        }, 100);

        // --- Handle Diagnosis (Healthy vs Diseased) ---
        if (disease !== 'Healthy') {
            // Diseased State: Set Red UI
            hudBadge.classList.add('danger');
            addChatMessage('bot', `WARNING: High probability (${confidence}%) of ${disease} detected.`);
            addChatMessage('bot', `Would you like me to suggest immediate treatment protocols for ${disease}?`);
        } else {
            // Healthy State: keep Green UI
            addChatMessage('bot', `Great news! With ${confidence}% confidence, this leaf appears HEALTHY.`);
        }
    })
    .catch(error => {
        console.error('Prediction Error:', error);
        laserScanner.classList.add('hidden'); // Stop animation on error
        addChatMessage('bot', "Connection error to analysis server. Please ensure Flask is running.");
    });
}

// =========================================
// 4. Chat Logic
// =========================================

// Add a message bubble to the chat window
function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending user messages
function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message to UI
    addChatMessage('user', text);
    chatInput.value = '';

    // Send to Flask Chat endpoint
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
        // Add bot response to UI
        addChatMessage('bot', data.response);
    })
    .catch(err => {
        console.error("Chat error:", err);
        addChatMessage('bot', "Server communication error.");
    });
}

// Event Listeners for Chat
sendChatBtn.addEventListener('click', handleUserMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
=======
// =========================================
// DOM Element Selection
// =========================================

// Scanner Elements
const cameraStream = document.getElementById('camera-stream');
const imagePreview = document.getElementById('image-preview');
const viewfinderPlaceholder = document.getElementById('viewfinder-placeholder');
const laserScanner = document.getElementById('laser-scanner'); // The animation line

// HUD Badge Elements
const hudBadge = document.getElementById('hud-badge');
const statusText = document.getElementById('status-text');
const diseaseNameEl = document.getElementById('disease-name');
const confidenceText = document.getElementById('confidence-text');
const confidenceFill = document.getElementById('confidence-fill');

// Control Buttons
const startCameraBtn = document.getElementById('start-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const fileUpload = document.getElementById('file-upload');
const canvas = document.getElementById('canvas');

// Chat Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

let stream = null; // Stores the media stream

// =========================================
// 1. Camera Logic (Mobile Optimized)
// =========================================

startCameraBtn.addEventListener('click', async () => {
    resetViewfinder();
    statusText.innerText = "Initializing Camera...";
    addChatMessage('bot', "Accessing your device camera...");

    try {
        // Constraints: Specifically request rear camera ('environment')
        const constraints = { 
            video: { 
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStream.srcObject = stream;
        
        // UI Updates
        cameraStream.style.display = 'block';
        viewfinderPlaceholder.style.display = 'none';
        startCameraBtn.style.display = 'none';
        fileUpload.parentElement.style.display = 'none'; // hide upload btn
        captureBtn.style.display = 'flex';
        
    } catch (err) {
        console.error("Camera access error:", err);
        addChatMessage('bot', "Error: Could not access camera. Please ensure permissions are granted or use the upload option.");
        statusText.innerText = "Camera Error";
    }
});

// Capture photo from video stream
captureBtn.addEventListener('click', () => {
    if (!stream) return;

    // Draw current video frame onto hidden canvas
    canvas.width = cameraStream.videoWidth;
    canvas.height = cameraStream.videoHeight;
    canvas.getContext('2d').drawImage(cameraStream, 0, 0);
    
    // Stop camera stream to save power
    stream.getTracks().forEach(track => track.stop());
    cameraStream.style.display = 'none';
    
    // Show static image preview
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    imagePreview.src = imageDataUrl;
    imagePreview.style.display = 'block';
    
    // Reset control buttons
    startCameraBtn.style.display = 'flex';
    fileUpload.parentElement.style.display = 'flex';
    captureBtn.style.display = 'none';

    // Convert canvas data to Blob and send to Flask
    canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        sendForPrediction(file);
    }, 'image/jpeg');
});

// =========================================
// 2. File Upload Logic
// =========================================

fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        
        // Stop camera if it was running
        if(stream) stream.getTracks().forEach(track => track.stop());
        
        resetViewfinder();

        // Show image preview
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
        viewfinderPlaceholder.style.display = 'none';
        
        sendForPrediction(file);
    }
});

// Helper to clear viewfinder state
function resetViewfinder() {
    cameraStream.style.display = 'none';
    imagePreview.style.display = 'none';
    viewfinderPlaceholder.style.display = 'flex';
    imagePreview.src = "";
    hudBadge.classList.add('hidden');
    laserScanner.classList.add('hidden'); // Ensure animation hidden
}

// =========================================
// 3. AI Prediction Logic (Connects to Flask)
// =========================================

function sendForPrediction(file) {
    const formData = new FormData();
    formData.append('file', file);

    // --- Start UI Analysis State ---
    hudBadge.classList.add('hidden'); // Hide old results
    
    // 1. START LASER ANIMATION
    laserScanner.classList.remove('hidden'); 
    
    addChatMessage('bot', "Analyzing leaf spectrum... Connecting to CitriScan AI core.");

    // Call Flask Endpoint
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        
        // --- End UI Analysis State ---
        // 2. STOP LASER ANIMATION
        laserScanner.classList.add('hidden'); 
        
        if(data.error) {
            addChatMessage('bot', "Analysis failed. The image might be blurry or not a citrus leaf. Please try again.");
            return;
        }

        // Process results
        const disease = data.disease;
        const confidence = (data.confidence * 100).toFixed(1);

        // Update HUD text
        diseaseNameEl.innerText = disease;
        confidenceText.innerText = `${confidence}%`;
        
        // Reset HUD state and show it
        hudBadge.className = 'hud-badge'; // remove previous 'danger'
        statusText.innerText = "Analysis Complete";
        hudBadge.classList.remove('hidden');
        
        // Animate confidence bar
        setTimeout(() => {
            confidenceFill.style.width = `${confidence}%`;
        }, 100);

        // --- Handle Diagnosis (Healthy vs Diseased) ---
        if (disease !== 'Healthy') {
            // Diseased State: Set Red UI
            hudBadge.classList.add('danger');
            addChatMessage('bot', `WARNING: High probability (${confidence}%) of ${disease} detected.`);
            addChatMessage('bot', `Would you like me to suggest immediate treatment protocols for ${disease}?`);
        } else {
            // Healthy State: keep Green UI
            addChatMessage('bot', `Great news! With ${confidence}% confidence, this leaf appears HEALTHY.`);
        }
    })
    .catch(error => {
        console.error('Prediction Error:', error);
        laserScanner.classList.add('hidden'); // Stop animation on error
        addChatMessage('bot', "Connection error to analysis server. Please ensure Flask is running.");
    });
}

// =========================================
// 4. Chat Logic
// =========================================

// Add a message bubble to the chat window
function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending user messages
function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message to UI
    addChatMessage('user', text);
    chatInput.value = '';

    // Send to Flask Chat endpoint
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
        // Add bot response to UI
        addChatMessage('bot', data.response);
    })
    .catch(err => {
        console.error("Chat error:", err);
        addChatMessage('bot', "Server communication error.");
    });
}

// Event Listeners for Chat
sendChatBtn.addEventListener('click', handleUserMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
>>>>>>> d7f97669e11eaaf0b6d782eeb0b524b50cbc220c
});