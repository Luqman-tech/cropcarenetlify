"""
Configuration file for Crop Disease Detection Model
"""

import os
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
RESULTS_DIR = PROJECT_ROOT / "results"

# Create directories if they don't exist
for dir_path in [DATA_DIR, MODELS_DIR, RESULTS_DIR]:
    dir_path.mkdir(exist_ok=True)

# Dataset configuration
DATASET_CONFIG = {
    "name": "PlantVillage",
    "kaggle_dataset": "abdallahalidev/plantvillage-dataset",
    "local_path": DATA_DIR / "plantvillage",
    "image_size": (224, 224),
    "batch_size": 32,
    "validation_split": 0.2,
    "test_split": 0.1,
    "random_seed": 42
}

# Model configuration
MODEL_CONFIG = {
    "architecture": "mobilenet_v2",  # Lightweight for mobile deployment
    "input_shape": (224, 224, 3),
    "learning_rate": 0.001,
    "epochs": 50,
    "early_stopping_patience": 10,
    "reduce_lr_patience": 5,
    "class_names": [
        "Apple___Apple_scab",
        "Apple___Black_rot", 
        "Apple___Cedar_apple_rust",
        "Apple___healthy",
        "Cherry___healthy",
        "Cherry___Powdery_mildew",
        "Corn___Cercospora_leaf_spot Gray_leaf_spot",
        "Corn___Common_rust",
        "Corn___healthy",
        "Corn___Northern_Leaf_Blight",
        "Grape___Black_rot",
        "Grape___Esca_(Black_Measles)",
        "Grape___healthy",
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
        "Peach___Bacterial_spot",
        "Peach___healthy",
        "Pepper_bell___Bacterial_spot",
        "Pepper_bell___healthy",
        "Potato___Early_blight",
        "Potato___healthy",
        "Potato___Late_blight",
        "Strawberry___healthy",
        "Strawberry___Leaf_scorch",
        "Tomato___Bacterial_spot",
        "Tomato___Early_blight",
        "Tomato___healthy",
        "Tomato___Late_blight",
        "Tomato___Leaf_Mold",
        "Tomato___Septoria_leaf_spot",
        "Tomato___Spider_mites Two-spotted_spider_mite",
        "Tomato___Target_Spot",
        "Tomato___Tomato_mosaic_virus",
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "Not_a_Plant"
    ]
}

# Data augmentation configuration
AUGMENTATION_CONFIG = {
    "rotation_range": 20,
    "width_shift_range": 0.2,
    "height_shift_range": 0.2,
    "shear_range": 0.2,
    "zoom_range": 0.2,
    "horizontal_flip": True,
    "fill_mode": "nearest"
}

# Export configuration
EXPORT_CONFIG = {
    "tflite_model_path": MODELS_DIR / "crop_disease_model.tflite",
    "onnx_model_path": MODELS_DIR / "crop_disease_model.onnx",
    "model_info_path": MODELS_DIR / "model_info.json",
    "disease_info_path": MODELS_DIR / "disease_info_complete.json",
    "quantized_tflite_path": MODELS_DIR / "crop_disease_model_quantized.tflite",
    "optimized_tflite_path": MODELS_DIR / "crop_disease_model_optimized.tflite"
}

# Disease information for offline use
DISEASE_INFO = {
    "Apple___Apple_scab": {
        "symptoms": "Dark, olive-green to brown spots on leaves and fruit",
        "treatment": "Apply fungicides, remove infected leaves, improve air circulation",
        "prevention": "Plant resistant varieties, maintain tree health, proper spacing"
    },
    "Apple___Black_rot": {
        "symptoms": "Black, sunken lesions on fruit and leaves",
        "treatment": "Remove infected parts, apply fungicides, sanitize tools",
        "prevention": "Prune properly, avoid overhead irrigation, clean orchard floor"
    },
    "Apple___Cedar_apple_rust": {
        "symptoms": "Bright orange spots on leaves, yellow-orange spots on fruit",
        "treatment": "Remove cedar trees nearby, apply fungicides during bloom",
        "prevention": "Plant resistant varieties, maintain distance from cedar trees"
    },
    "Apple___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Cherry___healthy": {
        "symptoms": "No visible disease symptoms", 
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Cherry___Powdery_mildew": {
        "symptoms": "White powdery spots on leaves and fruit",
        "treatment": "Apply fungicides, improve air circulation, remove infected parts",
        "prevention": "Plant resistant varieties, avoid overhead irrigation"
    },
    "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
        "symptoms": "Gray to tan lesions with dark borders on leaves",
        "treatment": "Apply fungicides, rotate crops, remove crop debris",
        "prevention": "Plant resistant hybrids, proper spacing, balanced fertilization"
    },
    "Corn___Common_rust": {
        "symptoms": "Reddish-brown pustules on leaves and stalks",
        "treatment": "Apply fungicides early, remove infected plants",
        "prevention": "Plant resistant hybrids, avoid late planting"
    },
    "Corn___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices", 
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Corn___Northern_Leaf_Blight": {
        "symptoms": "Long, elliptical gray-green lesions on leaves",
        "treatment": "Apply fungicides, rotate crops, till soil",
        "prevention": "Plant resistant hybrids, proper crop rotation"
    },
    "Grape___Black_rot": {
        "symptoms": "Black, circular spots on leaves and fruit",
        "treatment": "Apply fungicides, remove infected parts, improve air flow",
        "prevention": "Prune properly, avoid overhead irrigation, clean vineyard"
    },
    "Grape___Esca_(Black_Measles)": {
        "symptoms": "Dark spots on leaves, wood decay in older vines",
        "treatment": "Remove infected vines, apply fungicides to wounds",
        "prevention": "Proper pruning, avoid mechanical damage, use clean tools"
    },
    "Grape___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "symptoms": "Brown spots with dark borders on leaves",
        "treatment": "Apply fungicides, remove infected leaves",
        "prevention": "Improve air circulation, avoid overhead irrigation"
    },
    "Peach___Bacterial_spot": {
        "symptoms": "Small, dark spots on leaves and fruit",
        "treatment": "Apply copper-based bactericides, remove infected parts",
        "prevention": "Plant resistant varieties, avoid overhead irrigation"
    },
    "Peach___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Pepper_bell___Bacterial_spot": {
        "symptoms": "Small, dark spots with yellow halos on leaves",
        "treatment": "Apply copper-based bactericides, remove infected plants",
        "prevention": "Use disease-free seeds, avoid overhead irrigation"
    },
    "Pepper_bell___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Potato___Early_blight": {
        "symptoms": "Dark brown spots with concentric rings on leaves",
        "treatment": "Apply fungicides, remove infected leaves, improve air flow",
        "prevention": "Plant resistant varieties, proper spacing, balanced fertilization"
    },
    "Potato___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Potato___Late_blight": {
        "symptoms": "Dark, water-soaked lesions on leaves and stems",
        "treatment": "Apply fungicides immediately, remove infected plants",
        "prevention": "Plant resistant varieties, avoid overhead irrigation"
    },
    "Strawberry___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Strawberry___Leaf_scorch": {
        "symptoms": "Dark brown spots on leaves, leaf edges turn brown",
        "treatment": "Apply fungicides, remove infected leaves",
        "prevention": "Improve air circulation, avoid overhead irrigation"
    },
    "Tomato___Bacterial_spot": {
        "symptoms": "Small, dark spots with yellow halos on leaves and fruit",
        "treatment": "Apply copper-based bactericides, remove infected plants",
        "prevention": "Use disease-free seeds, avoid overhead irrigation"
    },
    "Tomato___Early_blight": {
        "symptoms": "Dark brown spots with concentric rings on lower leaves",
        "treatment": "Apply fungicides, remove infected leaves, improve air flow",
        "prevention": "Plant resistant varieties, proper spacing, mulch soil"
    },
    "Tomato___healthy": {
        "symptoms": "No visible disease symptoms",
        "treatment": "Continue current care practices",
        "prevention": "Maintain good cultural practices, regular monitoring"
    },
    "Tomato___Late_blight": {
        "symptoms": "Dark, water-soaked lesions on leaves and stems",
        "treatment": "Apply fungicides immediately, remove infected plants",
        "prevention": "Plant resistant varieties, avoid overhead irrigation"
    },
    "Tomato___Leaf_Mold": {
        "symptoms": "Yellow spots on upper leaf surface, olive-green mold underneath",
        "treatment": "Apply fungicides, improve air circulation, reduce humidity",
        "prevention": "Proper spacing, avoid overhead irrigation, maintain ventilation"
    },
    "Tomato___Septoria_leaf_spot": {
        "symptoms": "Small, circular spots with gray centers and dark borders",
        "treatment": "Apply fungicides, remove infected leaves",
        "prevention": "Avoid overhead irrigation, remove crop debris"
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "symptoms": "Yellow stippling on leaves, fine webbing, leaf drop",
        "treatment": "Apply miticides, increase humidity, remove heavily infested leaves",
        "prevention": "Regular monitoring, maintain plant health, avoid drought stress"
    },
    "Tomato___Target_Spot": {
        "symptoms": "Dark brown spots with concentric rings, similar to early blight",
        "treatment": "Apply fungicides, remove infected leaves, improve air flow",
        "prevention": "Plant resistant varieties, proper spacing, avoid overhead irrigation"
    },
    "Tomato___Tomato_mosaic_virus": {
        "symptoms": "Mottled yellow and green leaves, stunted growth",
        "treatment": "Remove infected plants, control aphids, sanitize tools",
        "prevention": "Use virus-free seeds, control insect vectors, avoid tobacco use"
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "symptoms": "Yellow, curled leaves, stunted growth, reduced fruit set",
        "treatment": "Remove infected plants, control whiteflies",
        "prevention": "Use resistant varieties, control whitefly populations, use row covers"
    }
} 