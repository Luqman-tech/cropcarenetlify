import streamlit as st
import numpy as np
from PIL import Image
import onnxruntime as ort
from pathlib import Path

st.title("Crop Disease Detection - Streamlit Demo")

st.write("Upload a leaf image to detect crop disease using the AI model.")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

MODEL_PATH = Path("models/crop_disease_model.onnx")
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    # ... (add all class names from your MODEL_CONFIG)
]

@st.cache_resource
def load_model():
    if not MODEL_PATH.exists():
        st.error(f"Model file not found at {MODEL_PATH}")
        return None
    try:
        session = ort.InferenceSession(str(MODEL_PATH), providers=['CPUExecutionProvider'])
        return session
    except Exception as e:
        st.error(f"Failed to load ONNX model: {e}")
        return None

def preprocess_image(image, target_size=(224, 224)):
    img = image.convert("RGB")
    img = img.resize(target_size)
    img = np.array(img).astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)

    st.write("Running inference...")
    session = load_model()
    if session is not None:
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        img = preprocess_image(image)
        output = session.run([output_name], {input_name: img})
        predicted_class = int(np.argmax(output[0][0]))
        confidence = float(np.max(output[0][0]))
        class_name = CLASS_NAMES[predicted_class] if predicted_class < len(CLASS_NAMES) else str(predicted_class)
        st.success(f"Prediction: {class_name}")
        st.info(f"Confidence: {confidence:.2%}") 