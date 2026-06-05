import os
import json
from dotenv import load_dotenv
import numpy as np
from flask import Flask, request, jsonify, render_template, redirect, session
from flask_cors import CORS
from flask_talisman import Talisman

import tensorflow as tf
from tensorflow import keras
from keras.models import load_model as tf_load_model
from keras.applications.inception_v3 import preprocess_input as inception_preprocess
from keras.utils import load_img, img_to_array

from werkzeug.utils import secure_filename
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from config import config_by_name

# ==========================================
# App Initialization
# ==========================================
app = Flask(__name__)
env_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config_by_name[env_name])

load_dotenv()

# ==========================================
# Security: CSP via Flask-Talisman
# ==========================================
csp = {
    'default-src': ["'self'"],
    'connect-src': [
        "'self'",
        'http://localhost:5000',
        'http://localhost:5173',
        'https://*.firebaseapp.com',
        'https://*.googleapis.com',
        'https://identitytoolkit.googleapis.com',
    ],
    'img-src': ["'self'", 'data:', 'blob:'],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],  # needed for React inline styles
}

Talisman(
    app,
    content_security_policy=csp,
    force_https=False  # Set True in production/OCI deployment
)

# ==========================================
# Model Loading
# ==========================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

MOBILENET_FILENAME = os.path.join(MODEL_DIR, 'citriscan_model.h5')
INCEPTION_FILENAME = os.path.join(MODEL_DIR, 'citriscan_inception_model.h5')

print(f"DEBUG: Internal App Path is {BASE_DIR}")
print(f"DEBUG: Searching for models in {MODEL_DIR}")

mobilenet_model = None
if os.path.exists(MOBILENET_FILENAME):
    try:
        mobilenet_model = tf_load_model(MOBILENET_FILENAME, compile=False)
        print("✅ MobileNetV2 loaded successfully.")
    except Exception as e:
        print(f"❌ MobileNet load failed: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"❌ ERROR: File NOT found at {MOBILENET_FILENAME}")

inception_model = None
if os.path.exists(INCEPTION_FILENAME):
    try:
        inception_model = tf_load_model(INCEPTION_FILENAME, compile=False)
        print("✅ InceptionV3 loaded successfully.")
    except Exception as e:
        print(f"❌ Inception load failed: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"❌ ERROR: File NOT found at {INCEPTION_FILENAME}")

# ==========================================
# Firebase Initialization
# ==========================================
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

# ==========================================
# App Config
# ==========================================
CORS(app)
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.getenv('SECRET_KEY', 'change-me-in-production'))
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')

# ==========================================
# Gemini AI Setup
# ==========================================
api_key = os.getenv('API_KEY')
chat_model = None
if api_key:
    genai.configure(api_key=api_key)
    chat_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    print('API_KEY is missing. Chat endpoint will return a configuration error.')

SYSTEM_PROMPT = """You are the CitriScan Assistant, an expert agronomist specializing in citrus plant health.
Your rules:
1. You MUST ONLY answer questions related to agriculture, plants, farming, and specifically citrus diseases (Canker, Black spot, Greening, Melanose, etc.).
2. If a user asks about coding, movies, general trivia, or anything outside of agriculture, you must politely decline and remind them you are an agricultural assistant.
3. Provide actionable, practical treatment advice for diseases.
4. Keep your answers concise, professional, and easy for a farmer to read.
"""

# ==========================================
# Classes & Prediction Logic
# ==========================================
CLASSES = {0: 'Black spot', 1: 'Canker', 2: 'Greening', 3: 'Healthy', 4: 'Melanose'}

def allowed_file(filename):
    """Check if uploaded file has an allowed extension."""
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']
    )

def predict_image_dual(img_path):
    """Run dual-model prediction and return the winner."""
    if mobilenet_model is None or inception_model is None:
        raise RuntimeError('Models are not loaded on this server instance.')

    # MobileNetV2 Pipeline (224x224, scale 0-1)
    img_224 = load_img(img_path, target_size=(224, 224))
    img_array_224 = img_to_array(img_224)
    img_array_224 = np.expand_dims(img_array_224, axis=0)
    img_array_224_scaled = img_array_224 / 255.0

    mn_preds = mobilenet_model.predict(img_array_224_scaled)
    mn_class_idx = np.argmax(mn_preds[0])
    mn_conf = float(mn_preds[0][mn_class_idx])

    # InceptionV3 Pipeline (299x299, scale -1 to 1)
    img_299 = load_img(img_path, target_size=(299, 299))
    img_array_299 = img_to_array(img_299)
    img_array_299 = np.expand_dims(img_array_299, axis=0)
    img_array_299_preprocessed = inception_preprocess(img_array_299)

    inv3_preds = inception_model.predict(img_array_299_preprocessed)
    inv3_class_idx = np.argmax(inv3_preds[0])
    inv3_conf = float(inv3_preds[0][inv3_class_idx])

    # The Showdown: higher confidence wins
    if inv3_conf > mn_conf:
        return CLASSES[inv3_class_idx], inv3_conf, "InceptionV3"
    else:
        return CLASSES[mn_class_idx], mn_conf, "MobileNetV2"

# ==========================================
# Helper
# ==========================================
def frontend_redirect(path=''):
    if path:
        return redirect(f"{FRONTEND_URL}/{path.lstrip('/')}")
    return redirect(FRONTEND_URL)

# ==========================================
# Routes
# ==========================================
@app.route('/verify')
def verify_token():
    if not firebase_enabled:
        return frontend_redirect()

    token = request.args.get('token')
    if not token:
        return frontend_redirect()

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        session['user'] = decoded_token['uid']
        return redirect('/')
    except Exception:
        return frontend_redirect()


@app.route('/')
def home():
    if firebase_enabled and 'user' not in session:
        return frontend_redirect()
    return render_template('index.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('user_id', None)
    return frontend_redirect('?action=logout')


@app.route('/predict', methods=['POST'])
def predict():
    if mobilenet_model is None or inception_model is None:
        return jsonify({'error': 'Models are missing or failed to load on server startup'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Security: validate extension BEFORE secure_filename
    if not allowed_file(file.filename):
        return jsonify({
            'error': f'Invalid file type. Allowed: {app.config["ALLOWED_EXTENSIONS"]}'
        }), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        disease, confidence, winning_model = predict_image_dual(filepath)
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': f'Prediction failed: {e}'}), 500
    finally:
        # Always clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

    session['current_diagnosis'] = (
        f"{disease} (Confidence: {confidence*100:.1f}% using {winning_model})"
    )
    session['diagnosis_file'] = filename

    return jsonify({
        'disease': disease,
        'confidence': confidence,
        'model_used': winning_model
    })


@app.route('/chat', methods=['POST'])
def chat():
    if chat_model is None:
        return jsonify({
            'response': 'Chat is not configured. Set API_KEY on the server environment.'
        }), 503

    # Security: safe JSON parsing + input validation
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    user_message = data.get('message', '').strip()

    if not user_message or len(user_message) > 1000:
        return jsonify({'error': 'Invalid input. Message must be 1-1000 characters.'}), 400

    user_diagnosis = session.get('current_diagnosis', 'No leaf has been scanned yet.')

    full_prompt = f"""
    {SYSTEM_PROMPT}

    Context: The user just uploaded a photo of a citrus leaf. Your dual-model AI system diagnosed it as: {user_diagnosis}.
    Use this context to inform your answer if the user asks about "my leaf" or "this disease".

    User says: {user_message}
    """

    try:
        response = chat_model.generate_content(full_prompt)
        bot_reply = response.text
    except Exception as e:
        print(f"!!! CRITICAL CHAT ERROR: {e}")
        import traceback
        traceback.print_exc()
        bot_reply = "I'm having trouble connecting to my AI brain right now. Please check your API key!"

    return jsonify({'response': bot_reply})


# ==========================================
# Entry Point
# ==========================================
if __name__ == '__main__':
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=False)