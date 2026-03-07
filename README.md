# 🍃 CitriScan: AI-Powered Agritech Diagnostic System

CitriScan is a progressive web application designed to bring advanced machine learning diagnostics directly to the field. By combining a comparative dual-model computer vision architecture with a conversational AI assistant, it provides farmers and agronomists with an accessible, real-time tool for identifying and treating citrus plant diseases.

### 🚀 Key Features

* **Dual-Model Edge Diagnostics:** Utilizes two independently trained Convolutional Neural Networks (MobileNetV2 and InceptionV3). The backend simultaneously feeds image data to both, comparing their confidence scores to return the most accurate classification.
* **Context-Aware AI Assistant:** Integrates the Google Gemini 2.5 Flash LLM via an interactive chat interface. The bot is strictly prompt-engineered for agricultural support and reads the CNN's output to provide contextual treatment advice.
* **Responsive UI:** A custom frontend built with HTML5, CSS3, and JavaScript that seamlessly handles local file uploads and real-time AI API streaming.
* **Future Scope (In Progress):** Transitioning to a decentralized architecture to issue blockchain-powered "Digital Passports" for verified crop health tracking.

---

## 🛠️ Tech Stack

* **Deep Learning:** TensorFlow, Keras, MobileNetV2, InceptionV3
* **Backend:** Python, Flask, Werkzeug
* **Generative AI:** Google GenAI SDK (Gemini 2.5 Flash)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

---

## 👨‍💻 Note for Project Reviewers: Local Setup & Model Generation

> **⚠️ CRITICAL NOTE:** Due to GitHub's 100MB file size limit, the trained deep learning models (`citriscan_model.h5` and `citriscan_inception_model.h5`) are **not** included in this repository. You must generate them locally using the provided training scripts before launching the application.

Follow these steps to replicate the environment, process the dataset, and launch the application.

### Step 1: Clone the Repository

```bash
git clone [https://github.com/BhupinderrSingh/Citrus-Diagnosis-.git](https://github.com/BhupinderrSingh/Citrus-Diagnosis-.git)
cd Citrus-Diagnosis-
```
### Step 2: Install Dependencies
Ensure you have Python 3.8+ installed. Install the required libraries:

```bash
pip install tensorflow flask werkzeug split-folders google-generativeai python-dotenv numpy scikit-learn matplotlib seaborn
```

### Step 3: Configure the Environment Variables
Create a file named .env in the root directory of the project. Add your Google Gemini API key to power the chatbot:

```bash
API_KEY=your_gemini_api_key_here
```

### Step 4: Prepare the Dataset & Train the Models
1. The Dataset: Ensure the raw images are located in a folder named Citrus_Leaves_Raw/Citrus Leaf Disease Image in the root directory.

2. Train MobileNetV2: Run the standard training script. This will use splitfolders to automatically organize your dataset into Train/Val/Test splits and train the first network.

```bash
python train.py
```
3. Train InceptionV3: Run the secondary training script to train the heavier architecture.

```bash
python train_inception.py
```
### Step 5: Launch the Application
Once both .h5 files are present in your root directory, launch the Flask server:

```bash
python app.py
```
Open your web browser and navigate to http://127.0.0.1:5000.

---
### 🧪 How to Test the System
Open the web interface and upload a test image from the Citrus_Leaves_Split/test/ directory.

The backend will route the image through both MobileNetV2 and InceptionV3 pipelines, automatically applying the correct mathematical preprocessing for each.

Observe the UI: It will display the diagnosed disease, the confidence percentage, and explicitly state which neural network won the accuracy showdown.

Type a question into the chatbot (e.g., "How do I treat this?" or "What causes this?"). The Gemini AI will factor the winning CNN's diagnosis into its contextual response.
---


