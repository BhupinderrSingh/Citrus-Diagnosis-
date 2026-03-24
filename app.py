import os
import gdown
from dotenv import load_dotenv
import numpy as np
from flask import Flask, request, jsonify, render_template, redirect, session
from flask_cors import CORS
from keras.models import load_model
from tensorflow.keras.applications.inception_v3 import preprocess_input as inception_preprocess
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth


# --- Start of Google Drive Download Block ---
mobilenet_filename = 'citriscan_model.h5' # Change this if your file is named differently
mobilenet_id = '1u-t6P0alrQ4O0C-qyTj5nYBFRa1ebsPY'

inception_filename = 'inception_model.h5' # Change this if your file is named differently
inception_id = '1aW_tVF77TIHy-nFYn-NLblspwvZca_4I'

# Download MobileNet if it isn't already on the server
if not os.path.exists(mobilenet_filename):
    print(f"Downloading {mobilenet_filename} from Google Drive...")
    gdown.download(id=mobilenet_id, output=mobilenet_filename, quiet=False)

# Download InceptionV3 if it isn't already on the server
if not os.path.exists(inception_filename):
    print(f"Downloading {inception_filename} from Google Drive...")
    gdown.download(id=inception_id, output=inception_filename, quiet=False)
# --- End of Google Drive Download Block ---

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)
app.secret_key = "some_very_secret_key" # Needed for sessions
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/verify')
def verify_token():
    token = request.args.get('token')
    if not token:
        return redirect("http://localhost:5173") # Back to React login

    try:
        # Verify the token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        # Store user info in Flask session
        session['user'] = decoded_token['uid']
        return redirect('/') # Go to the actual home page
    except:
        return redirect("http://localhost:5173") # Token invalid

@app.route('/')
def home():
    # SECURE GATEKEEPER: Check if user session exists
    if 'user' not in session:
        return redirect("http://localhost:5173") 
    
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect("http://localhost:5173/?action=logout")

# Load the variables from your .env file
load_dotenv()

# 1. THE API KEY
# Note: Ensure your .env file actually uses "API_KEY=..." and not "GEMINI_API_KEY=..." based on this!
genai.configure(api_key=os.getenv("API_KEY")) # type: ignore

# Set up the Generative AI Model
chat_model = genai.GenerativeModel('gemini-2.5-flash')

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
mobilenet_model = load_model('citriscan_model.h5')

print("Loading InceptionV3...")
inception_model = load_model('citriscan_inception_model.h5')


def predict_image_dual(img_path):
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
        disease, confidence, winning_model = predict_image_dual(filepath)
        
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
    app.run(debug=True, port=5000)