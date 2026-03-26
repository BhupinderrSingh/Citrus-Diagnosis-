import os
import json
import gdown
from dotenv import load_dotenv
import numpy as np
from flask import Flask, request, jsonify, render_template, redirect, session
from flask_cors import CORS

# --- FIXED AI IMPORTS ---
import tensorflow as tf
import keras
from keras.models import load_model as tf_load_model
from keras.applications.inception_v3 import preprocess_input as inception_preprocess
from keras.preprocessing import image  # Direct import to avoid the 'tensorflow.keras' error
# -------------------------

from werkzeug.utils import secure_filename
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Load environment variables before any startup configuration uses them.
load_dotenv()


# --- Start of Google Drive Download Block ---
MOBILENET_FILENAME = os.getenv('MOBILENET_MODEL_FILE', 'citriscan_model.h5')
MOBILENET_ID = os.getenv('MOBILENET_MODEL_DRIVE_ID', '1u-t6P0alrQ4O0C-qyTj5nYBFRa1ebsPY')

INCEPTION_FILENAME = os.getenv('INCEPTION_MODEL_FILE', 'citriscan_inception_model.h5')
INCEPTION_ID = os.getenv('INCEPTION_MODEL_DRIVE_ID', '1aW_tVF77TIHy-nFYn-NLblspwvZca_4I')
INCEPTION_FALLBACK_FILENAME = 'inception_model.h5'

# Download MobileNet if it isn't already on the server
if not os.path.exists(MOBILENET_FILENAME) and MOBILENET_ID:
    print(f"Downloading {MOBILENET_FILENAME} from Google Drive...")
    gdown.download(id=MOBILENET_ID, output=MOBILENET_FILENAME, quiet=False)

# Download InceptionV3 if it isn't already on the server
if not os.path.exists(INCEPTION_FILENAME) and not os.path.exists(INCEPTION_FALLBACK_FILENAME) and INCEPTION_ID:
    print(f"Downloading {INCEPTION_FILENAME} from Google Drive...")
    gdown.download(id=INCEPTION_ID, output=INCEPTION_FILENAME, quiet=False)
# --- End of Google Drive Download Block ---

# Initialize Firebase Admin safely for cloud deployment
firebase_enabled = False
firebase_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
firebase_credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')

try:
    if not firebase_admin._apps:
        if firebase_json:
            cred = credentials.Certificate(json.loads(firebase_json))
            firebase_admin.initialize_app(cred)
        elif os.path.exists(firebase_credentials_path):
            cred = credentials.Certificate(firebase_credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            print('Firebase credentials not found. Auth verification is disabled.')
    firebase_enabled = bool(firebase_admin._apps)
except Exception as e:
    print(f'Firebase initialization failed: {e}')
    firebase_enabled = False

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'change-me-in-production')
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')


def frontend_redirect(path=''):
    if path:
        return redirect(f"{FRONTEND_URL}/{path.lstrip('/')}")
    return redirect(FRONTEND_URL)

@app.route('/verify')
def verify_token():
    if not firebase_enabled:
        return frontend_redirect()

    token = request.args.get('token')
    if not token:
        return frontend_redirect()

    try:
        # Verify the token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        # Store user info in Flask session
        session['user'] = decoded_token['uid']
        return redirect('/') # Go to the actual home page
    except Exception:
        return frontend_redirect()

@app.route('/')
def home():
    # SECURE GATEKEEPER: Check if user session exists
    if 'user' not in session:
        return frontend_redirect()
    
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('user_id', None)
    return frontend_redirect('?action=logout')

# 1. THE API KEY
# Note: Ensure your .env file actually uses "API_KEY=..." and not "GEMINI_API_KEY=..." based on this!
api_key = os.getenv('API_KEY')
chat_model = None
if api_key:
    genai.configure(api_key=api_key)  # type: ignore
    chat_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    print('API_KEY is missing. Chat endpoint will return a configuration error.')

# 2. THE SYSTEM PROMPT
SYSTEM_PROMPT = """You are the CitriScan Assistant, an expert agronomist specializing in citrus plant health.
Your rules:
1. You MUST ONLY answer questions related to agriculture, plants, farming, and specifically citrus diseases (Canker, Black spot, Greening, Melanose, etc.).
2. If a user asks about coding, movies, general trivia, or anything outside of agriculture, you must politely decline and remind them you are an agricultural assistant.
3. Provide actionable, practical treatment advice for diseases.
4. Keep your answers concise, professional, and easy for a farmer to read.
"""

# 3. THE CONTEXT MEMORY
# This variable remembers the last scanned leaf so the chatbot knows about it!
current_diagnosis = "No leaf has been scanned yet."


# 4. LOAD BOTH DEEP LEARNING MODELS

CLASSES = {0: 'Black spot', 1: 'Canker', 2: 'Greening', 3: 'Healthy', 4: 'Melanose'}

print("Loading MobileNetV2...")
mobilenet_model = None
try:
    mobilenet_model = tf_load_model(MOBILENET_FILENAME, compile=False)
except Exception as e:
    print(f"MobileNet model load failed: {e}")

print("Loading InceptionV3...")
inception_model = None
inception_path_to_load = INCEPTION_FILENAME if os.path.exists(INCEPTION_FILENAME) else INCEPTION_FALLBACK_FILENAME
try:
    inception_model = tf_load_model(inception_path_to_load, compile=False)
except Exception as e:
    print(f"Inception model load failed: {e}")


def predict_image_dual(img_path):
    if mobilenet_model is None or inception_model is None:
        raise RuntimeError('Models are not loaded on this server instance.')

    # --- MobileNetV2 Pipeline (224x224 & Rescale 1./255) ---
    img_224 = image.load_img(img_path, target_size=(224, 224))
    img_array_224 = image.img_to_array(img_224)
    img_array_224 = np.expand_dims(img_array_224, axis=0)
    img_array_224_scaled = img_array_224 / 255.0  # Manual rescale to match train.py

    mn_preds = mobilenet_model.predict(img_array_224_scaled)
    mn_class_idx = np.argmax(mn_preds[0])
    mn_conf = float(mn_preds[0][mn_class_idx])
    
    # --- InceptionV3 Pipeline (299x299 & Inception Preprocessing) ---
    img_299 = image.load_img(img_path, target_size=(299, 299))
    img_array_299 = image.img_to_array(img_299)
    img_array_299 = np.expand_dims(img_array_299, axis=0)
    # Use the official InceptionV3 scaling (-1 to 1) to match train_inception.py
    img_array_299_preprocessed = inception_preprocess(img_array_299) 

    inv3_preds = inception_model.predict(img_array_299_preprocessed)
    inv3_class_idx = np.argmax(inv3_preds[0])
    inv3_conf = float(inv3_preds[0][inv3_class_idx])
    
    # --- THE SHOWDOWN ---
    if inv3_conf > mn_conf:
        return CLASSES[inv3_class_idx], inv3_conf, "InceptionV3"
    else:
        return CLASSES[mn_class_idx], mn_conf, "MobileNetV2"

# --- Routes ---

@app.route('/predict', methods=['POST'])
def predict():
    global current_diagnosis # Access the global memory variable

    if mobilenet_model is None or inception_model is None:
        return jsonify({'error': 'Model files are missing or failed to load on server startup'}), 503
    
    if 'file' not in request.files:
        return jsonify({'error': 'No image uploaded'})
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'})
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Call the CORRECT dual-prediction function!
        try:
            disease, confidence, winning_model = predict_image_dual(filepath)
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Prediction failed: {e}'}), 500
        
        # UPDATE THE MEMORY FOR THE CHATBOT!
        current_diagnosis = f"{disease} (Confidence: {confidence*100:.1f}% using {winning_model})"
        
        os.remove(filepath)
        
        # Send everything back to the frontend, including the winning model
        return jsonify({
            'disease': disease,
            'confidence': confidence,
            'model_used': winning_model
        })

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')

    if chat_model is None:
        return jsonify({'response': 'Chat is not configured. Set API_KEY on the server environment.'}), 503
    
    # WE COMBINE EVERYTHING HERE: System Prompt + Image Context + User Message
    full_prompt = f"""
    {SYSTEM_PROMPT}
    
    Context: The user just uploaded a photo of a citrus leaf. Your dual-model AI system diagnosed it as: {current_diagnosis}. 
    Use this context to inform your answer if the user asks about "my leaf" or "this disease".
    
    User says: {user_message}
    """
    
    try:
        # Send the massive prompt to the LLM
        response = chat_model.generate_content(full_prompt)
        bot_reply = response.text
    except Exception as e:
        bot_reply = "I'm having trouble connecting to my AI brain right now. Please check your API key!"
        print(e)
        
    return jsonify({'response': bot_reply})

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=False)