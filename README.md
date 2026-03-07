### ⚙️ Local Setup & Model Generation

Due to GitHub's strict 100MB file size limits, the trained deep learning models (`citriscan_model.h5` and `citriscan_inception_model.h5`) are not tracked in this repository. You must generate them locally before launching the Flask backend.

**Step-by-Step Setup:**
1. **Prepare the Data:** Ensure your dataset is located in the `Citrus_Leaves_Raw/` directory.
2. **Train MobileNetV2:** Run `python train.py` in your terminal. Wait for the epochs to finish to generate the first model.
3. **Train InceptionV3:** Run `python train_inception.py` to generate the heavier second model. 
4. **Launch the AI System:** Once both `.h5` files appear in your root directory, run `python app.py` to start the dual-model comparison and the Gemini chatbot.
